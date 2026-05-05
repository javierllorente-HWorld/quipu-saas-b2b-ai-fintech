import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

const UNAVAILABLE_TYPE_MSG = "Tipo de movimiento no disponible en esta versión";

function toNumber(value: unknown): number {
  if (value == null) return NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function parseMovementDate(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw.trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function buildFinalDescription(
  type: "Cobro" | "Pago",
  description: string,
  counterparty?: string,
): string {
  const desc = description.trim();
  const cp = counterparty?.trim();
  if (!cp) return desc;
  if (type === "Cobro") return `Cobro ${cp} — ${desc}`;
  return `Pago ${cp} — ${desc}`;
}

type Body = {
  type?: unknown;
  movementDate?: unknown;
  amount?: unknown;
  bankAccountId?: unknown;
  counterparty?: unknown;
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

    const typeRaw = typeof body.type === "string" ? body.type.trim() : "";
    if (!typeRaw) {
      return NextResponse.json({ ok: false, error: "El tipo de movimiento es obligatorio." }, { status: 400 });
    }

    if (typeRaw === "Transferencia" || typeRaw === "Ajuste") {
      return NextResponse.json({ ok: false, error: UNAVAILABLE_TYPE_MSG }, { status: 400 });
    }

    if (typeRaw !== "Cobro" && typeRaw !== "Pago") {
      return NextResponse.json(
        { ok: false, error: "El tipo de movimiento debe ser Cobro o Pago." },
        { status: 400 },
      );
    }

    const movementType = typeRaw as "Cobro" | "Pago";
    const movementDate = parseMovementDate(body.movementDate);
    if (!movementDate) {
      return NextResponse.json({ ok: false, error: "La fecha del movimiento es obligatoria." }, { status: 400 });
    }

    const amountRaw = toNumber(body.amount);
    if (!(amountRaw > 0)) {
      return NextResponse.json({ ok: false, error: "El monto debe ser mayor a 0." }, { status: 400 });
    }
    const amount = Math.abs(amountRaw);

    const bankAccountId =
      typeof body.bankAccountId === "string" ? body.bankAccountId.trim() : "";
    if (!bankAccountId) {
      return NextResponse.json({ ok: false, error: "La cuenta bancaria es obligatoria." }, { status: 400 });
    }
    if (!isUuid(bankAccountId)) {
      return NextResponse.json({ ok: false, error: "Identificador de cuenta inválido." }, { status: 400 });
    }

    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!description) {
      return NextResponse.json({ ok: false, error: "La descripción es obligatoria." }, { status: 400 });
    }

    const counterparty =
      typeof body.counterparty === "string" && body.counterparty.trim()
        ? body.counterparty.trim()
        : undefined;

    const direction = movementType === "Cobro" ? "in" : "out";
    const category = movementType === "Cobro" ? "collections" : "payments";
    const finalDescription = buildFinalDescription(movementType, description, counterparty);
    const balanceDelta = movementType === "Cobro" ? amount : -amount;

    const movement = await withTransaction(async (client) => {
      const lockRes = await client.query(
        `SELECT id,
                COALESCE(NULLIF(TRIM(bank_name), ''), NULLIF(TRIM(name), ''), 'Cuenta') AS bank_label,
                current_balance
         FROM bank_accounts
         WHERE id = $1::uuid
           AND organization_id = $2::uuid
           AND status = 'active'
         FOR UPDATE`,
        [bankAccountId, ORGANIZATION_ID],
      );

      if (lockRes.rows.length === 0) {
        throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { code: "ACCOUNT_NOT_FOUND" });
      }

      const insertRes = await client.query(
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
         RETURNING
           id,
           organization_id,
           bank_account_id,
           movement_date,
           description,
           amount,
           currency,
           direction,
           category,
           status,
           source,
           created_at`,
        [
          ORGANIZATION_ID,
          bankAccountId,
          movementDate,
          finalDescription,
          amount,
          "ARS",
          direction,
          category,
          "confirmed",
          "manual",
        ],
      );

      const row = insertRes.rows[0] as Record<string, unknown>;
      if (!row) {
        throw new Error("INSERT_FAILED");
      }

      const updRes = await client.query(
        `UPDATE bank_accounts
         SET current_balance = COALESCE(current_balance, 0) + $1::numeric
         WHERE id = $2::uuid AND organization_id = $3::uuid
         RETURNING current_balance`,
        [balanceDelta, bankAccountId, ORGANIZATION_ID],
      );

      const runningBalance = toNumber(updRes.rows[0]?.current_balance);
      const bankLabel = String(lockRes.rows[0]?.bank_label ?? "Cuenta");

      return {
        id: String(row.id),
        organizationId: String(row.organization_id),
        bankAccountId: String(row.bank_account_id),
        date: toIsoDate(row.movement_date),
        description: String(row.description ?? ""),
        bankAccount: bankLabel,
        amount,
        direction: row.direction === "out" ? "out" : "in",
        currency: String(row.currency ?? "ARS"),
        category: String(row.category ?? category),
        status: String(row.status ?? "confirmed"),
        source: String(row.source ?? "manual"),
        runningBalance,
        createdAt:
          row.created_at instanceof Date
            ? row.created_at.toISOString()
            : row.created_at != null
              ? String(row.created_at)
              : null,
      };
    });

    return NextResponse.json({ ok: true, movement });
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (code === "ACCOUNT_NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "No se encontró la cuenta bancaria para esta organización." },
        { status: 404 },
      );
    }

    console.error("POST /api/cash/movements:", error);

    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (pgCode === "42703" || pgCode === "42P01") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Esquema incompatible: verificá columnas de cash_movements (category, status, source, currency).",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "No se pudo registrar el movimiento." },
      { status: 500 },
    );
  }
}
