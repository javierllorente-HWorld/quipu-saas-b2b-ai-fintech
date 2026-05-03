import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toInt(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function pctOf(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

export async function GET() {
  try {
    const [orgRes, kpiRes, agingRes, customersRes, invoicesRes] = await Promise.all([
      query(
        `SELECT id, name, default_currency
         FROM organizations
         WHERE id = $1::uuid`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           COALESCE(SUM(amount), 0) AS total_receivable,
           COALESCE(SUM(CASE WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) AS overdue_amount,
           COUNT(*)::int AS pending_invoices_count
         FROM invoices
         WHERE organization_id = $1::uuid AND status = 'pending'`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           COALESCE(SUM(CASE
             WHEN due_date IS NULL OR due_date >= CURRENT_DATE - INTERVAL '30 days' THEN amount
             ELSE 0
           END), 0) AS not_due,
           COALESCE(SUM(CASE
             WHEN due_date IS NOT NULL
               AND due_date < CURRENT_DATE - INTERVAL '30 days'
               AND due_date >= CURRENT_DATE - INTERVAL '60 days'
             THEN amount ELSE 0
           END), 0) AS overdue_31_60,
           COALESCE(SUM(CASE
             WHEN due_date IS NOT NULL
               AND due_date < CURRENT_DATE - INTERVAL '60 days'
               AND due_date >= CURRENT_DATE - INTERVAL '90 days'
             THEN amount ELSE 0
           END), 0) AS overdue_61_90,
           COALESCE(SUM(CASE
             WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE - INTERVAL '90 days' THEN amount ELSE 0
           END), 0) AS overdue_over_90
         FROM invoices
         WHERE organization_id = $1::uuid AND status = 'pending'`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           c.id AS customer_id,
           c.name AS customer_name,
           COALESCE(SUM(i.amount), 0) AS total_receivable,
           COALESCE(SUM(CASE WHEN i.due_date IS NOT NULL AND i.due_date < CURRENT_DATE THEN i.amount ELSE 0 END), 0) AS overdue_amount
         FROM customers c
         INNER JOIN invoices i ON i.customer_id = c.id AND i.organization_id = c.organization_id
         WHERE c.organization_id = $1::uuid AND i.status = 'pending'
         GROUP BY c.id, c.name
         ORDER BY overdue_amount DESC NULLS LAST, total_receivable DESC NULLS LAST
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           i.id,
           COALESCE(NULLIF(TRIM(i.invoice_number::text), ''), LEFT(i.id::text, 8)) AS invoice_number,
           COALESCE(NULLIF(TRIM(c.name), ''), 'Sin cliente') AS customer_name,
           i.due_date,
           i.amount,
           i.status,
           CASE
             WHEN i.due_date IS NOT NULL AND i.due_date::date < CURRENT_DATE THEN 'Vencida'
             ELSE 'Pendiente'
           END AS computed_status
         FROM invoices i
         LEFT JOIN customers c ON c.id = i.customer_id AND c.organization_id = i.organization_id
         WHERE i.organization_id = $1::uuid AND i.status = 'pending'
         ORDER BY i.due_date ASC NULLS LAST, i.id ASC
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
    ]);

    const orgRow = orgRes.rows[0] as
      | { id: string; name: string; default_currency: string | null }
      | undefined;

    const organization = orgRow
      ? {
          id: orgRow.id,
          name: orgRow.name,
          default_currency: orgRow.default_currency,
        }
      : null;

    const kpiRow = kpiRes.rows[0] as
      | {
          total_receivable?: unknown;
          overdue_amount?: unknown;
          pending_invoices_count?: unknown;
        }
      | undefined;

    const totalReceivable = toNumber(kpiRow?.total_receivable);
    const overdueAmount = toNumber(kpiRow?.overdue_amount);
    const pendingInvoicesCount = toInt(kpiRow?.pending_invoices_count);

    const agingRow = agingRes.rows[0] as
      | {
          not_due?: unknown;
          overdue_31_60?: unknown;
          overdue_61_90?: unknown;
          overdue_over_90?: unknown;
        }
      | undefined;

    const notDue = toNumber(agingRow?.not_due);
    const overdue31to60 = toNumber(agingRow?.overdue_31_60);
    const overdue61to90 = toNumber(agingRow?.overdue_61_90);
    const overdueOver90 = toNumber(agingRow?.overdue_over_90);
    const agingTotal = notDue + overdue31to60 + overdue61to90 + overdueOver90;

    const aging = [
      {
        label: "Al corriente y mora hasta 30 días",
        amount: notDue,
        percentage: pctOf(notDue, agingTotal),
      },
      {
        label: "Mora 31 a 60 días",
        amount: overdue31to60,
        percentage: pctOf(overdue31to60, agingTotal),
      },
      {
        label: "Mora 61 a 90 días",
        amount: overdue61to90,
        percentage: pctOf(overdue61to90, agingTotal),
      },
      {
        label: "Mora más de 90 días",
        amount: overdueOver90,
        percentage: pctOf(overdueOver90, agingTotal),
      },
    ];

    const customers = (customersRes.rows as {
      customer_id: string;
      customer_name: string;
      total_receivable: unknown;
      overdue_amount: unknown;
    }[]).map((row) => {
      const total = toNumber(row.total_receivable);
      const overdue = toNumber(row.overdue_amount);
      return {
        customerId: row.customer_id,
        customerName: row.customer_name,
        totalReceivable: total,
        overdueAmount: overdue,
        overduePercentage: pctOf(overdue, total),
      };
    });

    const invoices = (invoicesRes.rows as {
      id: string;
      invoice_number: string;
      customer_name: string;
      due_date: Date | string | null;
      amount: unknown;
      status: string;
      computed_status: string;
    }[]).map((row) => {
      let dueDate: string | null = null;
      if (row.due_date instanceof Date) {
        dueDate = row.due_date.toISOString().slice(0, 10);
      } else if (typeof row.due_date === "string") {
        dueDate = row.due_date.slice(0, 10);
      }

      return {
        id: row.id,
        invoiceNumber: row.invoice_number,
        customerName: row.customer_name,
        dueDate,
        amount: toNumber(row.amount),
        status: row.status,
        computedStatus: row.computed_status === "Vencida" ? "Vencida" : "Pendiente",
      };
    });

    return NextResponse.json({
      ok: true,
      organization,
      kpis: {
        totalReceivable,
        overdueAmount,
        pendingInvoicesCount,
      },
      aging,
      customers,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching receivables:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error fetching receivables",
      },
      { status: 500 }
    );
  }
}
