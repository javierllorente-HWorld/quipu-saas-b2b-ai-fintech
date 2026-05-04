import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/** Demo tenant — reemplazar por sesión / query param cuando exista auth. */
const DEMO_ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
  return null;
}

type UpcomingRow = {
  type: string;
  id: string;
  date: Date | string | null;
  amount: unknown;
  counterparty_name: string;
  document_number: string | null;
  row_status: string;
  computed_status: string;
};

function resolveDocumentNumber(
  eventType: "collection" | "payment",
  rawFromDb: string | null | undefined,
  id: string
): { documentNumber: string; hadExplicitNumber: boolean } {
  const trimmed = (rawFromDb ?? "").trim();
  if (trimmed.length > 0) {
    return { documentNumber: trimmed, hadExplicitNumber: true };
  }
  const compact = id.replace(/-/g, "").toUpperCase();
  if (eventType === "collection") {
    // Alineado con receivables: referencia corta cuando falta invoice_number
    const fallback = id.length >= 8 ? id.slice(0, 8) : "S/N";
    return { documentNumber: fallback, hadExplicitNumber: false };
  }
  const suffix = compact.slice(0, 6) || "SN";
  return { documentNumber: `BILL-${suffix}`, hadExplicitNumber: false };
}

function buildDescription(
  eventType: "collection" | "payment",
  documentNumber: string,
  hadExplicitNumber: boolean
): string {
  if (eventType === "collection") {
    if (hadExplicitNumber) return `Factura ${documentNumber}`;
    return `Factura sin número (${documentNumber})`;
  }
  return `Pago ${documentNumber}`;
}

export async function GET() {
  try {
    const orgResult = await query(
      `SELECT id, name, country, default_currency, timezone
       FROM organizations
       WHERE id = $1::uuid`,
      [DEMO_ORGANIZATION_ID]
    );

    const organization = orgResult.rows[0] ?? null;

    const [balancesRes, flowRes, receivablesRes, payablesRes, upcomingRes] =
      await Promise.all([
        query(
          `SELECT COALESCE(SUM(current_balance), 0) AS total
           FROM bank_accounts
           WHERE organization_id = $1::uuid`,
          [DEMO_ORGANIZATION_ID]
        ),
        query(
          `SELECT
             COALESCE(SUM(CASE WHEN direction = 'in' THEN amount WHEN direction = 'out' THEN -amount ELSE 0 END), 0) AS net_flow,
             COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0) AS income
           FROM cash_movements
           WHERE organization_id = $1::uuid`,
          [DEMO_ORGANIZATION_ID]
        ),
        query(
          `SELECT COALESCE(SUM(amount), 0) AS total
           FROM invoices
           WHERE organization_id = $1::uuid AND status = 'pending'`,
          [DEMO_ORGANIZATION_ID]
        ),
        query(
          `SELECT COALESCE(SUM(amount), 0) AS total
           FROM bills
           WHERE organization_id = $1::uuid AND status = 'pending'`,
          [DEMO_ORGANIZATION_ID]
        ),
        query(
          `SELECT * FROM (
             SELECT
               'collection'::text AS type,
               i.id::text AS id,
               i.due_date AS date,
               i.amount,
               COALESCE(NULLIF(TRIM(c.name), ''), 'Sin cliente') AS counterparty_name,
               COALESCE(NULLIF(TRIM(i.invoice_number::text), ''), '') AS document_number,
               i.status AS row_status,
               CASE
                 WHEN i.due_date IS NOT NULL AND i.due_date::date < CURRENT_DATE THEN 'overdue'
                 ELSE 'upcoming'
               END AS computed_status
             FROM invoices i
             LEFT JOIN customers c
               ON c.id = i.customer_id AND c.organization_id = i.organization_id
             WHERE i.organization_id = $1::uuid AND i.status = 'pending'
             UNION ALL
             SELECT
               'payment'::text,
               b.id::text,
               b.due_date,
               b.amount,
               COALESCE(NULLIF(TRIM(v.name), ''), 'Sin proveedor'),
               COALESCE(NULLIF(TRIM(b.bill_number::text), ''), '') AS document_number,
               b.status,
               CASE
                 WHEN b.due_date IS NOT NULL AND b.due_date::date < CURRENT_DATE THEN 'overdue'
                 ELSE 'upcoming'
               END
             FROM bills b
             LEFT JOIN vendors v
               ON v.id = b.vendor_id AND v.organization_id = b.organization_id
             WHERE b.organization_id = $1::uuid AND b.status = 'pending'
           ) combined
           ORDER BY date ASC NULLS LAST, type ASC, id ASC
           LIMIT 10`,
          [DEMO_ORGANIZATION_ID]
        ),
      ]);

    const flowRow = flowRes.rows[0] as { net_flow?: unknown; income?: unknown } | undefined;

    const kpis = {
      totalAvailable: toNumber(balancesRes.rows[0]?.total),
      netFlow: toNumber(flowRow?.net_flow),
      receivables: toNumber(receivablesRes.rows[0]?.total),
      payables: toNumber(payablesRes.rows[0]?.total),
      income: toNumber(flowRow?.income),
    };

    const upcomingEvents = (upcomingRes.rows as UpcomingRow[]).map((row) => {
      const eventType = row.type === "payment" ? "payment" : "collection";
      const dateStr = toIsoDate(row.date);
      const { documentNumber, hadExplicitNumber } = resolveDocumentNumber(
        eventType,
        row.document_number,
        row.id
      );
      const computedStatus = row.computed_status === "overdue" ? "overdue" : "upcoming";

      return {
        id: row.id,
        type: eventType,
        date: dateStr,
        amount: toNumber(row.amount),
        description: buildDescription(eventType, documentNumber, hadExplicitNumber),
        counterpartyName: row.counterparty_name?.trim() || "—",
        documentNumber,
        computedStatus,
        status: row.row_status,
      };
    });

    return NextResponse.json({
      ok: true,
      organization,
      kpis,
      upcomingEvents,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error fetching dashboard",
      },
      { status: 500 }
    );
  }
}
