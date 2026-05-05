import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function toNumber(value: unknown): number {
  if (value == null) return NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function parseTransferDate(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw.trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function normalizeCurrencyCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const c = value.trim().toUpperCase();
  return c.length > 0 ? c : null;
}

type Body = {
  transferDate?: unknown;
  amount?: unknown;
  fromBankAccountId?: unknown;
  toBankAccountId?: unknown;
  description?: unknown;
};

export async function POST(request: Request) {
  try {
    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ ok: false, error: "Cuerpo JSON inválido." }, { status: 400 });
    }

    const transferDate = parseTransferDate(body.transferDate);
    if (!transferDate) {
      return NextResponse.json(
        { ok: false, error: "La fecha de transferencia (transferDate) es obligatoria." },
        { status: 400 },
      );
    }

    const amountRaw = toNumber(body.amount);
    if (!(amountRaw > 0)) {
      return NextResponse.json({ ok: false, error: "El monto debe ser mayor a 0." }, { status: 400 });
    }
    const amount = Math.abs(amountRaw);

    const fromBankAccountId =
      typeof body.fromBankAccountId === "string" ? body.fromBankAccountId.trim() : "";
    const toBankAccountId =
      typeof body.toBankAccountId === "string" ? body.toBankAccountId.trim() : "";

    if (!fromBankAccountId) {
      return NextResponse.json({ ok: false, error: "fromBankAccountId es obligatorio." }, { status: 400 });
    }
    if (!toBankAccountId) {
      return NextResponse.json({ ok: false, error: "toBankAccountId es obligatorio." }, { status: 400 });
    }
    if (!isUuid(fromBankAccountId) || !isUuid(toBankAccountId)) {
      return NextResponse.json({ ok: false, error: "Identificador de cuenta inválido." }, { status: 400 });
    }
    if (fromBankAccountId === toBankAccountId) {
      return NextResponse.json(
        { ok: false, error: "La cuenta origen y destino no pueden ser la misma." },
        { status: 400 },
      );
    }

    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!description) {
      return NextResponse.json({ ok: false, error: "description es obligatoria." }, { status: 400 });
    }

    const outMovementDesc = `Transferencia enviada — ${description}`;
    const inMovementDesc = `Transferencia recibida — ${description}`;

    const transfer = await withTransaction(async (client) => {
      // Lock en orden estable para reducir riesgo de deadlocks.
      const [firstId, secondId] =
        fromBankAccountId < toBankAccountId
          ? [fromBankAccountId, toBankAccountId]
          : [toBankAccountId, fromBankAccountId];

      const lockRes = await client.query(
        `SELECT id, current_balance, currency
         FROM bank_accounts
         WHERE organization_id = $1::uuid
           AND status = 'active'
           AND id IN ($2::uuid, $3::uuid)
         ORDER BY id ASC
         FOR UPDATE`,
        [ORGANIZATION_ID, firstId, secondId],
      );

      if (lockRes.rows.length !== 2) {
        throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { code: "ACCOUNT_NOT_FOUND" });
      }

      const rowById = new Map<string, { current_balance: unknown; currency: unknown }>();
      for (const r of lockRes.rows as {
        id: string;
        current_balance: unknown;
        currency: unknown;
      }[]) {
        rowById.set(String(r.id), { current_balance: r.current_balance, currency: r.currency });
      }

      const fromAccountCurrency = normalizeCurrencyCode(
        rowById.get(fromBankAccountId)?.currency,
      );
      let transferCurrency = fromAccountCurrency;
      if (!transferCurrency) {
        const orgRes = await client.query(
          `SELECT default_currency
           FROM organizations
           WHERE id = $1::uuid`,
          [ORGANIZATION_ID],
        );
        const orgRow = orgRes.rows[0] as { default_currency?: unknown } | undefined;
        transferCurrency = normalizeCurrencyCode(orgRow?.default_currency) ?? "ARS";
      }

      const fromBal = toNumber(rowById.get(fromBankAccountId)?.current_balance ?? 0);
      const available = Number.isFinite(fromBal) ? fromBal : 0;
      if (available - amount < 0) {
        throw Object.assign(new Error("INSUFFICIENT_FUNDS"), {
          code: "INSUFFICIENT_FUNDS",
          available,
        });
      }

      const outRes = await client.query(
        `INSERT INTO cash_movements (
           organization_id,
           bank_account_id,
           movement_date,
           description,
           amount,
           currency,
           direction,
           category,
           status,
           source
         )
         VALUES ($1::uuid, $2::uuid, $3::date, $4, $5::numeric, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          ORGANIZATION_ID,
          fromBankAccountId,
          transferDate,
          outMovementDesc,
          amount,
          transferCurrency,
          "out",
          "transfers",
          "confirmed",
          "manual",
        ],
      );

      const inRes = await client.query(
        `INSERT INTO cash_movements (
           organization_id,
           bank_account_id,
           movement_date,
           description,
           amount,
           currency,
           direction,
           category,
           status,
           source
         )
         VALUES ($1::uuid, $2::uuid, $3::date, $4, $5::numeric, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          ORGANIZATION_ID,
          toBankAccountId,
          transferDate,
          inMovementDesc,
          amount,
          transferCurrency,
          "in",
          "transfers",
          "confirmed",
          "manual",
        ],
      );

      const outMovementId = String((outRes.rows as { id?: unknown }[])[0]?.id ?? "");
      const inMovementId = String((inRes.rows as { id?: unknown }[])[0]?.id ?? "");
      if (!outMovementId || !inMovementId) throw new Error("INSERT_FAILED");

      await client.query(
        `UPDATE bank_accounts
         SET current_balance = COALESCE(current_balance, 0) - $1::numeric
         WHERE id = $2::uuid AND organization_id = $3::uuid`,
        [amount, fromBankAccountId, ORGANIZATION_ID],
      );

      await client.query(
        `UPDATE bank_accounts
         SET current_balance = COALESCE(current_balance, 0) + $1::numeric
         WHERE id = $2::uuid AND organization_id = $3::uuid`,
        [amount, toBankAccountId, ORGANIZATION_ID],
      );

      return { outMovementId, inMovementId };
    });

    return NextResponse.json({
      ok: true,
      transfer: {
        amount,
        transferDate,
        fromBankAccountId,
        toBankAccountId,
        description,
        outMovementId: transfer.outMovementId,
        inMovementId: transfer.inMovementId,
      },
    });
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (code === "ACCOUNT_NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "No se encontraron las cuentas para esta organización." },
        { status: 404 },
      );
    }

    if (code === "INSUFFICIENT_FUNDS") {
      const available =
        error && typeof error === "object" && "available" in error
          ? Number((error as { available?: unknown }).available)
          : NaN;

      const hint = Number.isFinite(available)
        ? `Saldo disponible: ${available.toLocaleString("es-AR")}`
        : "Saldo insuficiente.";

      return NextResponse.json(
        { ok: false, error: `Saldo insuficiente en la cuenta origen. ${hint}` },
        { status: 400 },
      );
    }

    console.error("POST /api/treasury/transfers:", error);

    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (pgCode === "42703" || pgCode === "42P01") {
      return NextResponse.json(
        {
          ok: false,
          error: "Esquema incompatible: verificá columnas/tablas (cash_movements, bank_accounts).",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: false, error: "No se pudo registrar la transferencia." }, { status: 500 });
  }
}

