import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { query, withTransaction } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

const ALLOWED_REPORT_TYPES = ["Ingresos vs egresos", "Indicadores clave"] as const;
const ALLOWED_PERIODS = ["Mensual", "Trimestral", "Anual"] as const;
const ALLOWED_FORMATS = ["PDF", "Excel", "CSV"] as const;

const EXCEL_ONLY_MSG = "Por ahora solo están disponibles CSV y PDF.";

type ReportType = (typeof ALLOWED_REPORT_TYPES)[number];
type Period = (typeof ALLOWED_PERIODS)[number];
type Format = (typeof ALLOWED_FORMATS)[number];

type Body = {
  title?: unknown;
  reportType?: unknown;
  period?: unknown;
  format?: unknown;
};

type ArtifactsCols = {
  hasTitle: boolean;
  hasName: boolean;
  hasReportType: boolean;
  hasPeriod: boolean;
  hasPeriodLabel: boolean;
  hasStatus: boolean;
  hasFileUrl: boolean;
  hasStorageUrl: boolean;
  hasGeneratedAt: boolean;
  hasCreatedAt: boolean;
  hasSource: boolean;
  hasFormat: boolean;
  hasCsvContent: boolean;
  hasPdfContent: boolean;
};

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

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvLine(cells: (string | number | null)[]): string {
  return (
    cells
      .map((c) => {
        if (c === null || c === undefined) return "";
        if (typeof c === "number") return Number.isFinite(c) ? String(c) : "";
        return csvEscape(c);
      })
      .join(",") + "\r\n"
  );
}

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
    hasReportType: names.has("report_type"),
    hasPeriod: names.has("period"),
    hasPeriodLabel: names.has("period_label"),
    hasStatus: names.has("status"),
    hasFileUrl: names.has("file_url"),
    hasStorageUrl: names.has("storage_url"),
    hasGeneratedAt: names.has("generated_at"),
    hasCreatedAt: names.has("created_at"),
    hasSource: names.has("source"),
    hasFormat: names.has("format") || names.has("\"format\""),
    hasCsvContent: names.has("csv_content"),
    hasPdfContent: names.has("pdf_content"),
  };
}

function normalizeReportType(reportType: ReportType): string {
  return reportType === "Ingresos vs egresos" ? "income_vs_expenses" : "key_indicators";
}

function normalizeFormat(format: Format): string {
  if (format === "Excel") return "XLSX";
  if (format === "CSV") return "CSV";
  return "PDF";
}

type FinancialSnapshot = {
  orgName: string;
  defaultCurrency: string;
  incomeYtd: number;
  expensesYtd: number;
  operatingMarginPct: number;
  monthlyVariationPct: number | null;
  incomeExpense: Array<{ month: string; income: number; expenses: number }>;
  liquidity: number;
  receivables: number;
  payables: number;
};

async function fetchFinancialSnapshot(): Promise<FinancialSnapshot> {
  const [orgRes, ytdRes, monthlyRes, indicatorsRes] = await Promise.all([
    query(
      `SELECT name, default_currency
       FROM organizations
       WHERE id = $1::uuid`,
      [ORGANIZATION_ID],
    ),
    query(
      `SELECT
         COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0) AS income_ytd,
         COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) AS expenses_ytd
       FROM cash_movements
       WHERE organization_id = $1::uuid
         AND COALESCE(movement_date::date, created_at::date) >= date_trunc('year', CURRENT_DATE)::date`,
      [ORGANIZATION_ID],
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
      [ORGANIZATION_ID],
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
      [ORGANIZATION_ID],
    ),
  ]);

  const orgRow = orgRes.rows[0] as
    | { name?: unknown; default_currency?: unknown }
    | undefined;
  const orgName =
    typeof orgRow?.name === "string" && orgRow.name.trim() ? orgRow.name.trim() : "—";
  const defaultCurrency =
    typeof orgRow?.default_currency === "string" && orgRow.default_currency.trim()
      ? orgRow.default_currency.trim()
      : "ARS";

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

  const indRow = indicatorsRes.rows[0] as
    | { liquidity?: unknown; receivables?: unknown; payables?: unknown }
    | undefined;

  return {
    orgName,
    defaultCurrency,
    incomeYtd,
    expensesYtd,
    operatingMarginPct: marginPct,
    monthlyVariationPct: computeMonthlyVariationPct(incomeExpense),
    incomeExpense,
    liquidity: toNumber(indRow?.liquidity),
    receivables: toNumber(indRow?.receivables),
    payables: toNumber(indRow?.payables),
  };
}

function buildCsvContent(
  title: string,
  reportType: ReportType,
  period: Period,
  snapshot: FinancialSnapshot,
): string {
  const generatedAt = new Date().toISOString();
  let out = "";
  out += csvLine(["campo", "valor"]);
  out += csvLine(["nombre_reporte", title]);
  out += csvLine(["tipo_reporte", reportType]);
  out += csvLine(["periodo_solicitado", period]);
  out += csvLine(["organizacion", snapshot.orgName]);
  out += csvLine(["moneda", snapshot.defaultCurrency]);
  out += csvLine(["generado_en_utc", generatedAt]);
  out += csvLine([]);
  out += csvLine(["seccion", "resumen_ytd"]);
  out += csvLine(["metrica", "valor"]);
  out += csvLine(["ingresos_ytd", snapshot.incomeYtd]);
  out += csvLine(["egresos_ytd", snapshot.expensesYtd]);
  out += csvLine(["margen_operativo_pct", snapshot.operatingMarginPct]);
  out += csvLine([
    "variacion_mensual_flujo_neto_pct",
    snapshot.monthlyVariationPct == null ? "" : snapshot.monthlyVariationPct,
  ]);
  out += csvLine([]);
  out += csvLine(["seccion", "ingresos_vs_egresos_por_mes"]);
  out += csvLine(["mes", "ingresos", "egresos"]);
  for (const row of snapshot.incomeExpense) {
    out += csvLine([row.month, row.income, row.expenses]);
  }
  out += csvLine([]);
  out += csvLine(["seccion", "indicadores_clave"]);
  out += csvLine(["indicador", "valor"]);
  out += csvLine(["liquidez_disponible", snapshot.liquidity]);
  out += csvLine(["cuentas_por_cobrar_pendientes", snapshot.receivables]);
  out += csvLine(["cuentas_por_pagar_pendientes", snapshot.payables]);
  return out;
}

function buildPdfBuffer(
  title: string,
  reportType: ReportType,
  period: Period,
  snapshot: FinancialSnapshot,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const generatedAt = new Date().toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    doc.fontSize(18).text(title, { align: "center" });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Tipo de reporte: ${reportType}`);
    doc.text(`Período: ${period}`);
    doc.text(`Organización: ${snapshot.orgName}`);
    doc.text(`Moneda: ${snapshot.defaultCurrency}`);
    doc.text(`Fecha de generación: ${generatedAt}`);
    doc.moveDown();

    doc.fontSize(14).text("Resumen YTD", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Ingresos YTD: ${snapshot.incomeYtd.toLocaleString("es-AR")}`);
    doc.text(`Egresos YTD: ${snapshot.expensesYtd.toLocaleString("es-AR")}`);
    doc.text(`Margen operativo: ${snapshot.operatingMarginPct.toFixed(1)}%`);
    doc.text(
      `Variación mensual (flujo neto): ${
        snapshot.monthlyVariationPct == null
          ? "—"
          : `${snapshot.monthlyVariationPct.toFixed(1)}%`
      }`,
    );
    doc.moveDown();

    doc.fontSize(14).text("Ingresos vs egresos por mes", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    const col1 = 50;
    const col2 = 200;
    const col3 = 360;
    let y = doc.y;
    doc.text("Mes", col1, y, { width: 120 });
    doc.text("Ingresos", col2, y, { width: 130 });
    doc.text("Egresos", col3, y, { width: 130 });
    y += 22;
    doc.moveTo(50, y - 4).lineTo(540, y - 4).stroke();
    for (const row of snapshot.incomeExpense) {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      doc.text(row.month, col1, y, { width: 120 });
      doc.text(row.income.toLocaleString("es-AR"), col2, y, { width: 130 });
      doc.text(row.expenses.toLocaleString("es-AR"), col3, y, { width: 130 });
      y += 18;
    }

    doc.end();
  });
}

export async function POST(request: Request) {
  try {
    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ ok: false, error: "Cuerpo JSON inválido." }, { status: 400 });
    }

    const titleRaw = typeof body.title === "string" ? body.title.trim() : "";
    if (!titleRaw) {
      return NextResponse.json({ ok: false, error: "title es obligatorio." }, { status: 400 });
    }

    const reportTypeRaw = typeof body.reportType === "string" ? body.reportType.trim() : "";
    if (!reportTypeRaw) {
      return NextResponse.json({ ok: false, error: "reportType es obligatorio." }, { status: 400 });
    }
    if (!ALLOWED_REPORT_TYPES.includes(reportTypeRaw as ReportType)) {
      return NextResponse.json(
        { ok: false, error: "reportType inválido." },
        { status: 400 },
      );
    }
    const reportType = reportTypeRaw as ReportType;

    const periodRaw = typeof body.period === "string" ? body.period.trim() : "";
    if (!periodRaw) {
      return NextResponse.json({ ok: false, error: "period es obligatorio." }, { status: 400 });
    }
    if (!ALLOWED_PERIODS.includes(periodRaw as Period)) {
      return NextResponse.json({ ok: false, error: "period inválido." }, { status: 400 });
    }
    const period = periodRaw as Period;

    const formatRaw = typeof body.format === "string" ? body.format.trim() : "";
    if (!formatRaw) {
      return NextResponse.json({ ok: false, error: "format es obligatorio." }, { status: 400 });
    }
    if (!ALLOWED_FORMATS.includes(formatRaw as Format)) {
      return NextResponse.json({ ok: false, error: "format inválido." }, { status: 400 });
    }
    const format = formatRaw as Format;

    if (format === "Excel") {
      return NextResponse.json({ ok: false, error: EXCEL_ONLY_MSG }, { status: 400 });
    }

    const title = titleRaw;
    const normalizedType = normalizeReportType(reportType);
    const normalizedFormat = normalizeFormat(format);

    const cols = await detectReportArtifactsColumns();
    const snapshot = await fetchFinancialSnapshot();

    let csvPayload: string | null = null;
    let pdfPayload: Buffer | null = null;

    if (format === "CSV") {
      if (!cols.hasCsvContent) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Falta la columna csv_content en report_artifacts. Ejecutá la migración SQL correspondiente.",
          },
          { status: 500 },
        );
      }
      csvPayload = buildCsvContent(title, reportType, period, snapshot);
    } else if (format === "PDF") {
      if (!cols.hasPdfContent) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Falta la columna pdf_content en report_artifacts. Ejecutá la migración SQL correspondiente.",
          },
          { status: 500 },
        );
      }
      pdfPayload = await buildPdfBuffer(title, reportType, period, snapshot);
    }

    const created = await withTransaction(async (client) => {
      const insertColumns: string[] = ["organization_id"];
      const insertValues: unknown[] = [ORGANIZATION_ID];

      if (cols.hasTitle) {
        insertColumns.push("title");
        insertValues.push(title);
      } else if (cols.hasName) {
        insertColumns.push("name");
        insertValues.push(title);
      }

      if (cols.hasReportType) {
        insertColumns.push("report_type");
        insertValues.push(normalizedType);
      }

      if (cols.hasPeriod) {
        insertColumns.push("period");
        insertValues.push(period);
      } else if (cols.hasPeriodLabel) {
        insertColumns.push("period_label");
        insertValues.push(period);
      }

      if (cols.hasStatus) {
        insertColumns.push("status");
        insertValues.push("generated");
      }

      if (cols.hasFileUrl) {
        insertColumns.push("file_url");
        insertValues.push(null);
      } else if (cols.hasStorageUrl) {
        insertColumns.push("storage_url");
        insertValues.push(null);
      }

      if (cols.hasSource) {
        insertColumns.push("source");
        insertValues.push("manual");
      }

      if (cols.hasGeneratedAt) {
        insertColumns.push("generated_at");
        insertValues.push(new Date().toISOString());
      }

      if (cols.hasFormat) {
        insertColumns.push(`"format"`);
        insertValues.push(normalizedFormat);
      }

      if (cols.hasCsvContent) {
        insertColumns.push("csv_content");
        insertValues.push(csvPayload);
      }
      if (cols.hasPdfContent) {
        insertColumns.push("pdf_content");
        insertValues.push(pdfPayload);
      }

      const placeholders = insertValues.map((_, i) => `$${i + 1}`).join(", ");
      const sql = `INSERT INTO report_artifacts (${insertColumns.join(", ")})
                   VALUES (${placeholders})
                   RETURNING id`;

      const res = await client.query(sql, insertValues);
      const id = String((res.rows as { id?: unknown }[])[0]?.id ?? "");
      if (!id) throw new Error("INSERT_FAILED");
      return { id, columnsUsed: insertColumns };
    });

    return NextResponse.json({
      ok: true,
      report: {
        id: created.id,
        title,
        reportType,
        period,
        format,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/reports/generate:", error);

    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (pgCode === "42703" || pgCode === "42P01") {
      return NextResponse.json(
        { ok: false, error: "Esquema incompatible: verificá tabla report_artifacts." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "No se pudo generar el reporte." },
      { status: 500 },
    );
  }
}
