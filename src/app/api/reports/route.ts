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

function computeMonthlyVariationPct(
  rows: Array<{ income: number; expenses: number }>,
): number | null {
  if (rows.length < 2) return null;
  const cur = rows[rows.length - 1]!;
  const prev = rows[rows.length - 2]!;
  const netCur = cur.income - cur.expenses;
  const netPrev = prev.income - prev.expenses;
  if (netPrev === 0) return null;
  return ((netCur - netPrev) / Math.abs(netPrev)) * 100;
}

type ArtifactsCols = {
  hasTitle: boolean;
  hasName: boolean;
  hasPeriod: boolean;
  hasPeriodLabel: boolean;
  hasGeneratedAt: boolean;
  hasCreatedAt: boolean;
  hasFormat: boolean;
  hasStorageUrl: boolean;
  hasFileUrl: boolean;
  hasCsvContent: boolean;
  hasPdfContent: boolean;
};

async function detectReportArtifactsColumns(): Promise<ArtifactsCols> {
  const res = await query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'report_artifacts'`,
  );
  const names = new Set(
    (res.rows as { column_name?: unknown }[])
      .map((r) => (typeof r.column_name === "string" ? r.column_name : ""))
      .filter(Boolean),
  );
  return {
    hasTitle: names.has("title"),
    hasName: names.has("name"),
    hasPeriod: names.has("period"),
    hasPeriodLabel: names.has("period_label"),
    hasGeneratedAt: names.has("generated_at"),
    hasCreatedAt: names.has("created_at"),
    hasFormat: names.has("format") || names.has("\"format\""),
    hasStorageUrl: names.has("storage_url"),
    hasFileUrl: names.has("file_url"),
    hasCsvContent: names.has("csv_content"),
    hasPdfContent: names.has("pdf_content"),
  };
}

export async function GET() {
  try {
    const raCols = await detectReportArtifactsColumns();
    const nameExpr = raCols.hasTitle && raCols.hasName
      ? "COALESCE(NULLIF(TRIM(ra.title), ''), NULLIF(TRIM(ra.name), ''), 'Sin nombre') AS name"
      : raCols.hasTitle
        ? "COALESCE(NULLIF(TRIM(ra.title), ''), 'Sin nombre') AS name"
        : raCols.hasName
          ? "COALESCE(NULLIF(TRIM(ra.name), ''), 'Sin nombre') AS name"
          : "'Sin nombre'::text AS name";

    const periodExpr = raCols.hasPeriod && raCols.hasPeriodLabel
      ? "COALESCE(NULLIF(TRIM(ra.period::text), ''), NULLIF(TRIM(ra.period_label), ''), '—') AS period_label"
      : raCols.hasPeriod
        ? "COALESCE(NULLIF(TRIM(ra.period::text), ''), '—') AS period_label"
        : raCols.hasPeriodLabel
          ? "COALESCE(NULLIF(TRIM(ra.period_label), ''), '—') AS period_label"
          : "'—'::text AS period_label";

    const generatedExpr = raCols.hasGeneratedAt && raCols.hasCreatedAt
      ? "COALESCE(ra.generated_at, ra.created_at) AS generated_at"
      : raCols.hasGeneratedAt
        ? "ra.generated_at AS generated_at"
        : raCols.hasCreatedAt
          ? "ra.created_at AS generated_at"
          : "NULL::timestamp AS generated_at";

    const formatExpr = raCols.hasFormat ? `ra."format" AS report_format` : "NULL::text AS report_format";

    const storageExpr = raCols.hasStorageUrl
      ? "COALESCE(ra.storage_url, '') AS storage_url"
      : raCols.hasFileUrl
        ? "COALESCE(ra.file_url, '') AS storage_url"
        : "''::text AS storage_url";

    const csvOk = raCols.hasCsvContent
      ? `(ra.csv_content IS NOT NULL AND TRIM(ra.csv_content) <> '')`
      : `false`;
    const pdfOk = raCols.hasPdfContent
      ? `(ra.pdf_content IS NOT NULL AND octet_length(ra.pdf_content) > 0)`
      : `false`;
    const downloadableExpr = `(${csvOk} OR ${pdfOk}) AS downloadable`;

    const orderExpr = raCols.hasGeneratedAt
      ? "ra.generated_at DESC NULLS LAST, ra.id DESC"
      : raCols.hasCreatedAt
        ? "ra.created_at DESC NULLS LAST, ra.id DESC"
        : "ra.id DESC";

    const [orgRes, ytdRes, monthlyRes, indicatorsRes, artifactsRes] = await Promise.all([
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
      query(
        `SELECT
           ra.id,
           ${nameExpr},
           ${periodExpr},
           ${generatedExpr},
           ${formatExpr},
           ${storageExpr},
           ${downloadableExpr}
         FROM report_artifacts ra
         WHERE ra.organization_id = $1::uuid
         ORDER BY ${orderExpr}
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

    const ytdRow = ytdRes.rows[0] as
      | { income_ytd?: unknown; expenses_ytd?: unknown }
      | undefined;

    const incomeYtd = toNumber(ytdRow?.income_ytd);
    const expensesYtd = toNumber(ytdRow?.expenses_ytd);
    const marginPct = operatingMarginPct(incomeYtd, expensesYtd);

    const incomeExpense = (monthlyRes.rows as {
      month: string;
      income: unknown;
      expenses: unknown;
    }[]).map((row) => ({
      month: row.month,
      income: toNumber(row.income),
      expenses: toNumber(row.expenses),
    }));

    const kpis = {
      incomeYtd,
      expensesYtd,
      operatingMarginPct: marginPct,
      monthlyVariationPct: computeMonthlyVariationPct(incomeExpense),
    };

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

    const recentReports = (
      artifactsRes.rows as {
        id: string;
        name: string | null;
        period_label: string | null;
        generated_at: Date | string | null;
        report_format: string | null;
        storage_url: string | null;
        downloadable: boolean;
      }[]
    ).map((row) => {
      let generatedAt: string | null = null;
      const g = row.generated_at;
      if (g instanceof Date) {
        generatedAt = g.toISOString();
      } else if (typeof g === "string" && g.length > 0) {
        generatedAt = g.includes("T") ? g : `${g.slice(0, 10)}T12:00:00.000Z`;
      }

      return {
        id: row.id,
        name: (row.name ?? "").trim() || "Sin nombre",
        periodLabel: (row.period_label ?? "").trim() || "—",
        generatedAt,
        format: (row.report_format ?? "PDF").trim() || "PDF",
        storageUrl: (row.storage_url ?? "").trim(),
        downloadable: Boolean(row.downloadable),
      };
    });

    return NextResponse.json({
      ok: true,
      organization,
      kpis,
      incomeExpense,
      keyIndicators,
      recentReports,
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
