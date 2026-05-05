import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";

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

function parsePaymentDate(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw.trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function orgCurrencyFromRow(row: { default_currency?: unknown } | undefined): string {
  const raw = row?.default_currency;
  if (typeof raw !== "string") return "ARS";
  const c = raw.trim().toUpperCase();
  return c.length > 0 ? c : "ARS";
}

function buildPaymentDescription(vendorName: string | undefined, description: string): string {
  const desc = description.trim();
  const vendor = (vendorName ?? "").trim();
  if (!vendor) return desc;
  return `Pago programado ${vendor} — ${desc}`;
}

type Body = {
  paymentDate?: unknown;
  amount?: unknown;
  vendorName?: unknown;
  description?: unknown;
  bankAccountId?: unknown;
  category?: unknown;
};

type PaymentsColumns = {
  hasCurrency: boolean;
  hasStatus: boolean;
  hasSource: boolean;
  hasCategory: boolean;
  hasBankAccountId: boolean;
  hasVendorId: boolean;
  notesColumn: "notes" | "description" | null;
};

async function detectPaymentsColumns(client: { query: (t: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }) {
  const res = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'payments'`,
  );
  const names = new Set(
    (res.rows as { column_name?: unknown }[])
      .map((r) => (typeof r.column_name === "string" ? r.column_name : ""))
      .filter(Boolean),
  );

  const notesColumn: PaymentsColumns["notesColumn"] = names.has("notes")
    ? "notes"
    : names.has("description")
      ? "description"
      : null;

  return {
    hasCurrency: names.has("currency"),
    hasStatus: names.has("status"),
    hasSource: names.has("source"),
    hasCategory: names.has("category"),
    hasBankAccountId: names.has("bank_account_id"),
    hasVendorId: names.has("vendor_id"),
    notesColumn,
  } satisfies PaymentsColumns;
}

async function resolveVendorId(
  client: { query: (t: string, p?: unknown[]) => Promise<{ rows: unknown[] }> },
  vendorName: string,
): Promise<string | null> {
  const trimmed = vendorName.trim();
  if (!trimmed) return null;

  const exactRes = await client.query(
    `SELECT id
     FROM vendors
     WHERE organization_id = $1::uuid
       AND LOWER(TRIM(name)) = LOWER(TRIM($2))
     LIMIT 1`,
    [ORGANIZATION_ID, trimmed],
  );
  const exactId =
    typeof (exactRes.rows as { id?: unknown }[])[0]?.id === "string"
      ? String((exactRes.rows as { id?: unknown }[])[0]?.id)
      : null;
  if (exactId) return exactId;

  const ilikeRes = await client.query(
    `SELECT id
     FROM vendors
     WHERE organization_id = $1::uuid
       AND TRIM(name) ILIKE '%' || TRIM($2) || '%'
     ORDER BY LENGTH(TRIM(name)) ASC, id ASC
     LIMIT 1`,
    [ORGANIZATION_ID, trimmed],
  );
  const id =
    typeof (ilikeRes.rows as { id?: unknown }[])[0]?.id === "string"
      ? String((ilikeRes.rows as { id?: unknown }[])[0]?.id)
      : null;
  return id || null;
}

export async function POST(request: Request) {
  try {
    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ ok: false, error: "Cuerpo JSON inválido." }, { status: 400 });
    }

    const paymentDate = parsePaymentDate(body.paymentDate);
    if (!paymentDate) {
      return NextResponse.json(
        { ok: false, error: "La fecha de pago (paymentDate) es obligatoria." },
        { status: 400 },
      );
    }

    const amountRaw = toNumber(body.amount);
    if (!(amountRaw > 0)) {
      return NextResponse.json({ ok: false, error: "El monto debe ser mayor a 0." }, { status: 400 });
    }
    const amount = Math.abs(amountRaw);

    const descriptionRaw =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!descriptionRaw) {
      return NextResponse.json({ ok: false, error: "description es obligatoria." }, { status: 400 });
    }

    const vendorName =
      typeof body.vendorName === "string" && body.vendorName.trim()
        ? body.vendorName.trim()
        : undefined;

    const bankAccountId =
      typeof body.bankAccountId === "string" && body.bankAccountId.trim()
        ? body.bankAccountId.trim()
        : undefined;
    if (bankAccountId && !isUuid(bankAccountId)) {
      return NextResponse.json({ ok: false, error: "Identificador de cuenta inválido." }, { status: 400 });
    }

    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "Proveedores";

    const finalDescription = buildPaymentDescription(vendorName, descriptionRaw);

    const cols = await detectPaymentsColumns({ query });

    const created = await withTransaction(async (client) => {
      const orgRes = await client.query(
        `SELECT default_currency
         FROM organizations
         WHERE id = $1::uuid`,
        [ORGANIZATION_ID],
      );
      const orgRow = orgRes.rows[0] as { default_currency?: unknown } | undefined;
      const paymentCurrency = orgCurrencyFromRow(orgRow);

      const vendorId = vendorName && cols.hasVendorId ? await resolveVendorId(client, vendorName) : null;

      const insertColumns: string[] = ["organization_id", "payment_date", "amount"];
      const insertValues: unknown[] = [ORGANIZATION_ID, paymentDate, amount];

      if (cols.notesColumn) {
        insertColumns.push(cols.notesColumn);
        insertValues.push(finalDescription);
      }

      if (cols.hasCurrency) {
        insertColumns.push("currency");
        insertValues.push(paymentCurrency);
      }

      if (cols.hasStatus) {
        insertColumns.push("status");
        insertValues.push("scheduled");
      }

      if (cols.hasSource) {
        insertColumns.push("source");
        insertValues.push("manual");
      }

      if (cols.hasCategory) {
        insertColumns.push("category");
        insertValues.push(category);
      }

      if (cols.hasBankAccountId && bankAccountId) {
        insertColumns.push("bank_account_id");
        insertValues.push(bankAccountId);
      }

      if (cols.hasVendorId && vendorId) {
        insertColumns.push("vendor_id");
        insertValues.push(vendorId);
      }

      const placeholders = insertValues.map((_, i) => `$${i + 1}`).join(", ");
      const sql = `INSERT INTO payments (${insertColumns.join(", ")})
                   VALUES (${placeholders})
                   RETURNING id`;

      const insertRes = await client.query(sql, insertValues);
      const id = String((insertRes.rows as { id?: unknown }[])[0]?.id ?? "");
      if (!id) throw new Error("INSERT_FAILED");

      return { id, columnsUsed: insertColumns };
    });

    return NextResponse.json({
      ok: true,
      payment: {
        id: created.id,
        amount,
        paymentDate,
        description: finalDescription,
        vendorName: vendorName ?? undefined,
        bankAccountId: bankAccountId ?? undefined,
        category,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/payables/payments:", error);

    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (pgCode === "42703" || pgCode === "42P01") {
      return NextResponse.json(
        {
          ok: false,
          error: "Esquema incompatible: verificá columnas/tablas (payments, vendors).",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: false, error: "No se pudo programar el pago." }, { status: 500 });
  }
}

