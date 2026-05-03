import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/** Demo tenant — reemplazar por sesión / query param cuando exista auth. */
const DEMO_ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
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
               'collection'::text AS event_type,
               i.id::text AS id,
               i.due_date AS date,
               i.amount
             FROM invoices i
             WHERE i.organization_id = $1::uuid AND i.status = 'pending'
             UNION ALL
             SELECT
               'payment'::text,
               b.id::text,
               b.due_date,
               b.amount
             FROM bills b
             WHERE b.organization_id = $1::uuid AND b.status = 'pending'
           ) combined
           ORDER BY date ASC NULLS LAST
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

    const upcomingEvents = upcomingRes.rows.map(
      (row: { event_type: string; id: string; date: Date | string | null; amount: unknown }) => {
        const d = row.date;
        const dateStr =
          d instanceof Date
            ? d.toISOString().slice(0, 10)
            : typeof d === "string"
              ? d.slice(0, 10)
              : null;

        return {
          type: row.event_type,
          id: row.id,
          date: dateStr,
          amount: toNumber(row.amount),
          description:
            row.event_type === "collection"
              ? "Cobro pendiente (factura)"
              : "Pago pendiente (bill / proveedor)",
        };
      }
    );

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
