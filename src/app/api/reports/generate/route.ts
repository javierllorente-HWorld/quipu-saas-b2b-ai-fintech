import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

const ALLOWED_REPORT_TYPES = ["Ingresos vs egresos", "Indicadores clave"] as const;
const ALLOWED_PERIODS = ["Mensual", "Trimestral", "Anual"] as const;
const ALLOWED_FORMATS = ["PDF", "Excel", "CSV"] as const;

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
  };
}

function normalizeReportType(reportType: ReportType): string {
  // Normalizado simple por si existe report_type en DB.
  return reportType === "Ingresos vs egresos" ? "income_vs_expenses" : "key_indicators";
}

function normalizeFormat(format: Format): string {
  if (format === "Excel") return "XLSX";
  if (format === "CSV") return "CSV";
  return "PDF";
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

    const title = titleRaw;
    const normalizedType = normalizeReportType(reportType);
    const normalizedFormat = normalizeFormat(format);

    const cols = await detectReportArtifactsColumns();

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

      // Para alinear con lo que muestra /api/reports.
      if (cols.hasGeneratedAt) {
        insertColumns.push("generated_at");
        insertValues.push(new Date().toISOString());
      }

      if (cols.hasFormat) {
        insertColumns.push(`"format"`);
        insertValues.push(normalizedFormat);
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

