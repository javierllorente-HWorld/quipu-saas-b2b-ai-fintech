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

function parseCollectionDate(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw.trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function buildMovementDescription(args: {
  customerName?: string;
  invoiceNumber?: string;
  description: string;
}): string {
  const desc = args.description.trim();
  const customer = (args.customerName ?? "").trim();
  const invoice = (args.invoiceNumber ?? "").trim();

  if (customer && invoice) return `Cobro ${customer} — Factura ${invoice} — ${desc}`;
  if (customer) return `Cobro ${customer} — ${desc}`;
  if (invoice) return `Cobro Factura ${invoice} — ${desc}`;
  return desc;
}

type Body = {
  collectionDate?: unknown;
  amount?: unknown;
  customerName?: unknown;
  invoiceNumber?: unknown;
  bankAccountId?: unknown;
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

    const collectionDate = parseCollectionDate(body.collectionDate);
    if (!collectionDate) {
      return NextResponse.json(
        { ok: false, error: "La fecha de cobro (collectionDate) es obligatoria." },
        { status: 400 },
      );
    }

    const amountRaw = toNumber(body.amount);
    if (!(amountRaw > 0)) {
      return NextResponse.json({ ok: false, error: "El monto debe ser mayor a 0." }, { status: 400 });
    }
    const amount = Math.abs(amountRaw);

    const bankAccountId =
      typeof body.bankAccountId === "string" ? body.bankAccountId.trim() : "";
    if (!bankAccountId) {
      return NextResponse.json({ ok: false, error: "bankAccountId es obligatorio." }, { status: 400 });
    }
    if (!isUuid(bankAccountId)) {
      return NextResponse.json({ ok: false, error: "Identificador de cuenta inválido." }, { status: 400 });
    }

    const baseDescription =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!baseDescription) {
      return NextResponse.json({ ok: false, error: "description es obligatoria." }, { status: 400 });
    }

    const customerName =
      typeof body.customerName === "string" && body.customerName.trim()
        ? body.customerName.trim()
        : undefined;
    const invoiceNumber =
      typeof body.invoiceNumber === "string" && body.invoiceNumber.trim()
        ? body.invoiceNumber.trim()
        : undefined;

    const finalDescription = buildMovementDescription({
      customerName,
      invoiceNumber,
      description: baseDescription,
    });

    const result = await withTransaction(async (client) => {
      const lockRes = await client.query(
        `SELECT id
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
         RETURNING id`,
        [
          ORGANIZATION_ID,
          bankAccountId,
          collectionDate,
          finalDescription,
          amount,
          "ARS",
          "in",
          "collections",
          "confirmed",
          "manual",
        ],
      );

      const movementId = String(insertRes.rows[0]?.id ?? "");
      if (!movementId) throw new Error("INSERT_FAILED");

      await client.query(
        `UPDATE bank_accounts
         SET current_balance = COALESCE(current_balance, 0) + $1::numeric
         WHERE id = $2::uuid AND organization_id = $3::uuid`,
        [amount, bankAccountId, ORGANIZATION_ID],
      );

      if (invoiceNumber) {
        const notesColRes = await client.query(
          `SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'invoices'
             AND column_name = 'notes'
           LIMIT 1`,
        );
        const hasNotes = notesColRes.rows.length > 0;

        const invoiceRes = await client.query(
          `SELECT id, amount
           FROM invoices
           WHERE organization_id = $1::uuid
             AND TRIM(invoice_number::text) = TRIM($2)
           LIMIT 1
           FOR UPDATE`,
          [ORGANIZATION_ID, invoiceNumber],
        );

        const invoiceRow = invoiceRes.rows[0] as { id: string; amount: unknown } | undefined;
        if (invoiceRow?.id) {
          const invAmount = toNumber(invoiceRow.amount);
          const nextStatus = Number.isFinite(invAmount) && amount >= invAmount ? "paid" : "pending";

          if (hasNotes) {
            const noteLine = `Cobro ${collectionDate}: ARS ${amount}${customerName ? ` (${customerName})` : ""}`;
            await client.query(
              `UPDATE invoices
               SET status = $1,
                   notes = CASE
                     WHEN notes IS NULL OR TRIM(notes) = '' THEN $2
                     ELSE notes || E'\\n' || $2
                   END
               WHERE id = $3::uuid AND organization_id = $4::uuid`,
              [nextStatus, noteLine, invoiceRow.id, ORGANIZATION_ID],
            );
          } else {
            await client.query(
              `UPDATE invoices
               SET status = $1
               WHERE id = $2::uuid AND organization_id = $3::uuid`,
              [nextStatus, invoiceRow.id, ORGANIZATION_ID],
            );
          }
        }
      }

      return {
        movementId,
      };
    });

    return NextResponse.json({
      ok: true,
      collection: {
        id: result.movementId,
        movementId: result.movementId,
        bankAccountId,
        amount,
        collectionDate,
        description: finalDescription,
        invoiceNumber: invoiceNumber ?? null,
        customerName: customerName ?? null,
      },
    });
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

    console.error("POST /api/receivables/collections:", error);

    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (pgCode === "42703" || pgCode === "42P01") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Esquema incompatible: verificá columnas/tablas (cash_movements, bank_accounts, invoices).",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: false, error: "No se pudo registrar el cobro." }, { status: 500 });
  }
}

