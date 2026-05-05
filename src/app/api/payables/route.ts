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

function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return null;
}

type PaymentsCols = {
  hasCreatedAt: boolean;
  hasNotes: boolean;
  hasDescription: boolean;
  hasCategory: boolean;
  hasBankAccountId: boolean;
  hasVendorId: boolean;
};

async function detectPaymentsColumns(): Promise<PaymentsCols> {
  const res = await query(
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
  return {
    hasCreatedAt: names.has("created_at"),
    hasNotes: names.has("notes"),
    hasDescription: names.has("description"),
    hasCategory: names.has("category"),
    hasBankAccountId: names.has("bank_account_id"),
    hasVendorId: names.has("vendor_id"),
  };
}

export async function GET() {
  try {
    const paymentsCols = await detectPaymentsColumns();
    const scheduledOrder = paymentsCols.hasCreatedAt
      ? "p.payment_date ASC NULLS LAST, p.created_at DESC NULLS LAST"
      : "p.payment_date ASC NULLS LAST, p.id DESC";

    const scheduledVendorSelect = paymentsCols.hasVendorId
      ? "COALESCE(NULLIF(TRIM(v.name), ''), NULL) AS vendor_name"
      : "NULL::text AS vendor_name";
    const scheduledVendorJoin = paymentsCols.hasVendorId
      ? "LEFT JOIN vendors v ON v.id = p.vendor_id AND v.organization_id = p.organization_id"
      : "";

    const scheduledBankSelect = paymentsCols.hasBankAccountId
      ? "COALESCE(NULLIF(TRIM(ba.bank_name), ''), NULLIF(TRIM(ba.name), ''), NULL) AS bank_account_name"
      : "NULL::text AS bank_account_name";
    const scheduledBankJoin = paymentsCols.hasBankAccountId
      ? "LEFT JOIN bank_accounts ba ON ba.id = p.bank_account_id AND ba.organization_id = p.organization_id"
      : "";

    const scheduledCategorySelect = paymentsCols.hasCategory
      ? "p.category::text AS category"
      : "NULL::text AS category";

    const scheduledDescriptionExpr = paymentsCols.hasNotes && paymentsCols.hasDescription
      ? "COALESCE(NULLIF(TRIM(p.notes), ''), NULLIF(TRIM(p.description), ''), 'Pago programado')"
      : paymentsCols.hasNotes
        ? "COALESCE(NULLIF(TRIM(p.notes), ''), 'Pago programado')"
        : paymentsCols.hasDescription
          ? "COALESCE(NULLIF(TRIM(p.description), ''), 'Pago programado')"
          : "'Pago programado'";

    const [
      orgRes,
      kpiBillsRes,
      kpiDueWeekRes,
      kpiScheduledRes,
      calendarRes,
      upcomingRes,
      vendorsRes,
      recentRes,
      scheduledRes,
    ] = await Promise.all([
      query(
        `SELECT id, name, default_currency
         FROM organizations
         WHERE id = $1::uuid`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM bills
         WHERE organization_id = $1::uuid AND status = 'pending'`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM bills
         WHERE organization_id = $1::uuid
           AND status = 'pending'
           AND due_date IS NOT NULL
           AND due_date >= CURRENT_DATE
           AND due_date <= CURRENT_DATE + INTERVAL '7 days'`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           COALESCE(SUM(amount), 0) AS total_amount,
           COUNT(*)::int AS total_count
         FROM payments
         WHERE organization_id = $1::uuid AND status = 'scheduled'`,
        [ORGANIZATION_ID]
      ),
      query(
        `WITH bounds AS (
           SELECT
             (CURRENT_DATE - INTERVAL '30 days')::date AS start_dt,
             (CURRENT_DATE + INTERVAL '30 days')::date AS end_dt
         ),
         days AS (
           SELECT generate_series(
             (SELECT start_dt FROM bounds),
             (SELECT end_dt FROM bounds),
             INTERVAL '1 day'
           )::date AS cal_date
         ),
         sched AS (
           SELECT due_date::date AS dt, SUM(amount) AS amt
           FROM bills
           WHERE organization_id = $1::uuid
             AND status = 'pending'
             AND due_date IS NOT NULL
             AND due_date >= CURRENT_DATE
           GROUP BY due_date::date
         ),
         overdue AS (
           SELECT due_date::date AS dt, SUM(amount) AS amt
           FROM bills
           WHERE organization_id = $1::uuid
             AND status = 'pending'
             AND due_date IS NOT NULL
             AND due_date < CURRENT_DATE
           GROUP BY due_date::date
         ),
         paid AS (
           SELECT payment_date::date AS dt, SUM(amount) AS amt
           FROM payments
           WHERE organization_id = $1::uuid
             AND status = 'paid'
             AND payment_date IS NOT NULL
           GROUP BY payment_date::date
         )
         SELECT
           d.cal_date AS date,
           COALESCE(sched.amt, 0) AS scheduled_amount,
           COALESCE(paid.amt, 0) AS paid_amount,
           COALESCE(overdue.amt, 0) AS overdue_amount
         FROM days d
         LEFT JOIN sched ON sched.dt = d.cal_date
         LEFT JOIN paid ON paid.dt = d.cal_date
         LEFT JOIN overdue ON overdue.dt = d.cal_date
         ORDER BY d.cal_date ASC`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           b.id,
           b.due_date AS date,
           COALESCE(NULLIF(TRIM(v.name), ''), 'Proveedor no informado') AS vendor_name,
           COALESCE(TRIM(b.notes), 'Bill pendiente') AS description,
           b.amount,
           b.status
         FROM bills b
         LEFT JOIN vendors v ON v.id = b.vendor_id AND v.organization_id = b.organization_id
         WHERE b.organization_id = $1::uuid AND b.status = 'pending'
         ORDER BY b.due_date ASC NULLS LAST, b.id ASC
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           b.vendor_id,
           COALESCE(NULLIF(TRIM(v.name), ''), 'Proveedor no informado') AS vendor_name,
           COUNT(b.id)::int AS pending_bills_count,
           COALESCE(SUM(b.amount), 0) AS open_amount
         FROM bills b
         LEFT JOIN vendors v ON v.id = b.vendor_id AND v.organization_id = b.organization_id
         WHERE b.organization_id = $1::uuid AND b.status = 'pending'
         GROUP BY b.vendor_id, COALESCE(NULLIF(TRIM(v.name), ''), 'Proveedor no informado')
         ORDER BY open_amount DESC NULLS LAST, pending_bills_count DESC
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           p.id,
           p.payment_date AS date,
           COALESCE(NULLIF(TRIM(v.name), ''), 'Proveedor no informado') AS vendor_name,
           COALESCE(NULLIF(TRIM(p.method), ''), '—') AS method,
           p.amount,
           p.status
         FROM payments p
         LEFT JOIN vendors v ON v.id = p.vendor_id AND v.organization_id = p.organization_id
         WHERE p.organization_id = $1::uuid AND p.status = 'paid'
         ORDER BY p.payment_date DESC NULLS LAST, p.id DESC
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           p.id,
           p.payment_date AS payment_date,
           ${scheduledVendorSelect},
           (${scheduledDescriptionExpr}) AS description,
           p.amount,
           ${scheduledCategorySelect},
           ${scheduledBankSelect},
           p.status
         FROM payments p
         ${scheduledVendorJoin}
         ${scheduledBankJoin}
         WHERE p.organization_id = $1::uuid
           AND p.status = 'scheduled'
         ORDER BY ${scheduledOrder}
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

    const totalPayable = toNumber(kpiBillsRes.rows[0]?.total);
    const dueThisWeek = toNumber(kpiDueWeekRes.rows[0]?.total);
    const schedRow = kpiScheduledRes.rows[0] as
      | { total_amount?: unknown; total_count?: unknown }
      | undefined;
    const pendingApprovalAmount = toNumber(schedRow?.total_amount);
    const pendingApprovalCount = toInt(schedRow?.total_count);

    const calendar = (calendarRes.rows as {
      date: Date | string;
      scheduled_amount: unknown;
      paid_amount: unknown;
      overdue_amount: unknown;
    }[]).map((row) => ({
      date: toIsoDate(row.date),
      scheduledAmount: toNumber(row.scheduled_amount),
      paidAmount: toNumber(row.paid_amount),
      overdueAmount: toNumber(row.overdue_amount),
    }));

    const upcomingPayments = (upcomingRes.rows as {
      id: string;
      date: Date | string | null;
      vendor_name: string;
      description: string;
      amount: unknown;
      status: string;
    }[]).map((row) => ({
      id: row.id,
      date: toIsoDate(row.date),
      vendorName: row.vendor_name,
      description: row.description,
      amount: toNumber(row.amount),
      status: row.status,
    }));

    const vendors = (vendorsRes.rows as {
      vendor_id: string | null;
      vendor_name: string;
      pending_bills_count: number;
      open_amount: unknown;
    }[]).map((row) => ({
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      pendingBillsCount: toInt(row.pending_bills_count),
      openAmount: toNumber(row.open_amount),
    }));

    const recentPayments = (recentRes.rows as {
      id: string;
      date: Date | string | null;
      vendor_name: string;
      method: string;
      amount: unknown;
      status: string;
    }[]).map((row) => ({
      id: row.id,
      date: toIsoDate(row.date),
      vendorName: row.vendor_name,
      method: row.method,
      amount: toNumber(row.amount),
      status: row.status,
    }));

    const scheduledPayments = (scheduledRes.rows as {
      id: string;
      payment_date: Date | string | null;
      vendor_name: string | null;
      description: string | null;
      amount: unknown;
      category: string | null;
      bank_account_name: string | null;
      status: string;
    }[]).map((row) => ({
      id: row.id,
      paymentDate: toIsoDate(row.payment_date),
      vendorName: row.vendor_name ?? undefined,
      description: row.description ?? "",
      amount: toNumber(row.amount),
      category: row.category ?? undefined,
      bankAccountName: row.bank_account_name ?? undefined,
      status: row.status,
    }));

    return NextResponse.json({
      ok: true,
      organization,
      kpis: {
        totalPayable,
        dueThisWeek,
        pendingApprovalAmount,
        pendingApprovalCount,
      },
      calendar,
      upcomingPayments,
      scheduledPayments,
      vendors,
      recentPayments,
    });
  } catch (error) {
    console.error("Error fetching payables:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error fetching payables",
      },
      { status: 500 }
    );
  }
}
