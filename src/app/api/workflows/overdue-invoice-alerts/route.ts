import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

const ALERT_TYPE = "invoice_overdue" as const;

function toInt(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export async function POST() {
  try {
    const sql = `
      WITH overdue_invoices AS (
        SELECT
          i.id AS invoice_id,
          i.organization_id,
          COALESCE(NULLIF(TRIM(i.invoice_number::text), ''), LEFT(i.id::text, 8)) AS display_number,
          COALESCE(NULLIF(TRIM(c.name), ''), 'Sin cliente') AS customer_name,
          i.amount,
          i.due_date
        FROM public.invoices i
        LEFT JOIN public.customers c
          ON c.id = i.customer_id AND c.organization_id = i.organization_id
        WHERE i.organization_id = $1::uuid
          AND i.status = 'pending'
          AND i.due_date IS NOT NULL
          AND i.due_date::date < CURRENT_DATE
      ),
      inserted AS (
        INSERT INTO public.alerts (
          organization_id,
          invoice_id,
          alert_type,
          title,
          message,
          severity,
          status
        )
        SELECT
          oi.organization_id,
          oi.invoice_id,
          $2::text,
          'Factura vencida',
          'La factura ' || oi.display_number
            || ' (' || oi.customer_name || ') venció el '
            || to_char(oi.due_date::date, 'YYYY-MM-DD')
            || '. Monto pendiente: '
            || trim(to_char(oi.amount::numeric, 'FM999999999999990.00'))
            || '.',
          'warning',
          'open'
        FROM overdue_invoices oi
        ON CONFLICT (organization_id, invoice_id, alert_type) DO NOTHING
        RETURNING id
      )
      SELECT
        (SELECT COUNT(*)::int FROM overdue_invoices) AS overdue_invoice_count,
        (SELECT COUNT(*)::int FROM inserted) AS created_count
    `;

    const res = await query(sql, [ORGANIZATION_ID, ALERT_TYPE]);
    const row = res.rows[0] as
      | { overdue_invoice_count?: unknown; created_count?: unknown }
      | undefined;

    const overdueInvoiceCount = toInt(row?.overdue_invoice_count);
    const created = toInt(row?.created_count);
    const alreadyExisted = Math.max(0, overdueInvoiceCount - created);

    return NextResponse.json({
      ok: true,
      alertType: ALERT_TYPE,
      organizationId: ORGANIZATION_ID,
      overdueInvoiceCount,
      created,
      alreadyExisted,
    });
  } catch (error) {
    console.error("POST /api/workflows/overdue-invoice-alerts:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo generar alertas de facturas vencidas." },
      { status: 500 },
    );
  }
}
