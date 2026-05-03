import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function operatingMarginPct(incomeYtd: number, expensesYtd: number): number {
  if (incomeYtd <= 0) return 0;
  return ((incomeYtd - expensesYtd) / incomeYtd) * 100;
}

export async function GET() {
  try {
    const [orgRes, ytdRes, monthlyRes, indicatorsRes] = await Promise.all([
      query(
        `SELECT id, name, default_currency
         FROM organizations
         WHERE id = $1::uuid`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0) AS income_ytd,
           COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) AS expenses_ytd
         FROM cash_movements
         WHERE organization_id = $1::uuid
           AND COALESCE(movement_date::date, created_at::date) >= date_trunc('year', CURRENT_DATE)::date`,
        [ORGANIZATION_ID]
      ),
      query(
        `WITH months AS (
           SELECT generate_series(
             (date_trunc('month', CURRENT_DATE) - interval '11 months')::date,
             date_trunc('month', CURRENT_DATE)::date,
             interval '1 month'
           )::date AS month_start
         ),
         inc AS (
           SELECT
             date_trunc('month', COALESCE(cm.movement_date::timestamp, cm.created_at))::date AS mm,
             COALESCE(SUM(cm.amount), 0) AS total_in
           FROM cash_movements cm
           WHERE cm.organization_id = $1::uuid AND cm.direction = 'in'
           GROUP BY 1
         ),
         outm AS (
           SELECT
             date_trunc('month', COALESCE(cm.movement_date::timestamp, cm.created_at))::date AS mm,
             COALESCE(SUM(cm.amount), 0) AS total_out
           FROM cash_movements cm
           WHERE cm.organization_id = $1::uuid AND cm.direction = 'out'
           GROUP BY 1
         )
         SELECT
           to_char(ms.month_start, 'YYYY-MM') AS month,
           COALESCE(inc.total_in, 0) AS income,
           COALESCE(outm.total_out, 0) AS expenses
         FROM months ms
         LEFT JOIN inc ON inc.mm = ms.month_start
         LEFT JOIN outm ON outm.mm = ms.month_start
         ORDER BY ms.month_start ASC`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           (SELECT COALESCE(SUM(current_balance), 0)
            FROM bank_accounts
            WHERE organization_id = $1::uuid AND status = 'active') AS liquidity,
           (SELECT COALESCE(SUM(amount), 0)
            FROM invoices
            WHERE organization_id = $1::uuid AND status = 'pending') AS receivables,
           (SELECT COALESCE(SUM(amount), 0)
            FROM bills
            WHERE organization_id = $1::uuid AND status = 'pending') AS payables`,
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

    const ytdRow = ytdRes.rows[0] as
      | { income_ytd?: unknown; expenses_ytd?: unknown }
      | undefined;

    const incomeYtd = toNumber(ytdRow?.income_ytd);
    const expensesYtd = toNumber(ytdRow?.expenses_ytd);
    const marginPct = operatingMarginPct(incomeYtd, expensesYtd);

    const kpis = {
      incomeYtd,
      expensesYtd,
      operatingMarginPct: marginPct,
      monthlyVariationPct: 0,
    };

    const incomeExpense = (monthlyRes.rows as {
      month: string;
      income: unknown;
      expenses: unknown;
    }[]).map((row) => ({
      month: row.month,
      income: toNumber(row.income),
      expenses: toNumber(row.expenses),
    }));

    const indRow = indicatorsRes.rows[0] as
      | { liquidity?: unknown; receivables?: unknown; payables?: unknown }
      | undefined;

    const liquidity = toNumber(indRow?.liquidity);
    const receivables = toNumber(indRow?.receivables);
    const payables = toNumber(indRow?.payables);

    const keyIndicators = [
      {
        key: "operatingMargin",
        label: "Margen operativo",
        value: marginPct,
        unit: "percent" as const,
      },
      {
        key: "liquidity",
        label: "Liquidez disponible",
        value: liquidity,
        unit: "currency" as const,
      },
      {
        key: "receivables",
        label: "Cuentas por cobrar",
        value: receivables,
        unit: "currency" as const,
      },
      {
        key: "payables",
        label: "Cuentas por pagar",
        value: payables,
        unit: "currency" as const,
      },
    ];

    return NextResponse.json({
      ok: true,
      organization,
      kpis,
      incomeExpense,
      keyIndicators,
      recentReports: [],
    });
  } catch (error) {
    console.error("Error fetching reports:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error fetching reports",
      },
      { status: 500 }
    );
  }
}
