import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function extractReportId(request: Request, paramId: unknown): string {
  const raw = Array.isArray(paramId) ? paramId[0] : paramId;
  let s = typeof raw === "string" ? raw.trim() : raw != null ? String(raw).trim() : "";
  if (s) return s;

  try {
    const parts = new URL(request.url).pathname.split("/").filter(Boolean);
    const dl = parts.indexOf("download");
    if (dl > 0) {
      s = decodeURIComponent(parts[dl - 1] ?? "").trim();
    }
  } catch {
    /* ignore */
  }
  return s;
}

function slugifyFilenameBase(name: string): string {
  const t = name.trim().replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_");
  const ascii = t.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return (ascii || "reporte").slice(0, 120);
}

async function loadReportArtifactRow(id: string) {
  const colRes = await query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'report_artifacts'`,
  );
  const names = new Set(
    (colRes.rows as { column_name?: unknown }[])
      .map((r) => (typeof r.column_name === "string" ? r.column_name : ""))
      .filter(Boolean),
  );

  const hasCsv = names.has("csv_content");
  const hasPdf = names.has("pdf_content");
  const hasFmt = names.has("format") || names.has("\"format\"");

  let nameSql = `'reporte'::text AS download_name`;
  if (names.has("title") && names.has("name")) {
    nameSql = `COALESCE(NULLIF(TRIM(ra.title), ''), NULLIF(TRIM(ra.name), ''), 'reporte') AS download_name`;
  } else if (names.has("title")) {
    nameSql = `COALESCE(NULLIF(TRIM(ra.title), ''), 'reporte') AS download_name`;
  } else if (names.has("name")) {
    nameSql = `COALESCE(NULLIF(TRIM(ra.name), ''), 'reporte') AS download_name`;
  }

  const csvSel = hasCsv ? "ra.csv_content" : "NULL::text AS csv_content";
  const pdfSel = hasPdf ? "ra.pdf_content" : "NULL::bytea AS pdf_content";
  const fmtSel = hasFmt ? `ra."format" AS report_format` : "NULL::text AS report_format";

  const res = await query(
    `SELECT ${csvSel}, ${pdfSel}, ${fmtSel}, ${nameSql}
     FROM report_artifacts ra
     WHERE ra.id = $1::uuid AND ra.organization_id = $2::uuid`,
    [id, ORGANIZATION_ID],
  );

  return {
    row: res.rows[0] as
      | {
          csv_content: string | null;
          pdf_content: Buffer | null;
          report_format: string | null;
          download_name: string | null;
        }
      | undefined,
    hasCsv,
    hasPdf,
  };
}

function pdfBufferFromRow(value: unknown): Buffer | null {
  if (Buffer.isBuffer(value) && value.length > 0) return value;
  if (value instanceof Uint8Array && value.length > 0) return Buffer.from(value);
  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const params = await Promise.resolve(context.params);
    const id = extractReportId(request, params?.id);

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "download_404: no se recibió un id válido en la ruta. Revisá que el enlace sea /api/reports/{id}/download.",
          detail: "id_vacío",
          received: params?.id ?? null,
        },
        { status: 404 },
      );
    }

    const { row, hasCsv, hasPdf } = await loadReportArtifactRow(id);

    if (!row) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "download_404: no se encontró el reporte con ese id para esta organización (o el id no es un UUID válido).",
          detail: "reporte_no_encontrado",
          id,
        },
        { status: 404 },
      );
    }

    const baseName = slugifyFilenameBase((row.download_name ?? "").trim() || "reporte");
    const pdfBuf = hasPdf ? pdfBufferFromRow(row.pdf_content) : null;
    const csvRaw = hasCsv && typeof row.csv_content === "string" ? row.csv_content.trim() : "";
    const fmt = (row.report_format ?? "").trim().toUpperCase();

    if (pdfBuf && fmt === "PDF") {
      const filename = `${baseName}.pdf`;
      return new NextResponse(new Uint8Array(pdfBuf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (csvRaw.length > 0 && fmt === "CSV") {
      const filename = `${baseName}.csv`;
      return new NextResponse("\uFEFF" + csvRaw, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (pdfBuf) {
      const filename = `${baseName}.pdf`;
      return new NextResponse(new Uint8Array(pdfBuf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (csvRaw.length > 0) {
      const filename = `${baseName}.csv`;
      return new NextResponse("\uFEFF" + csvRaw, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "download_404: el reporte no tiene contenido descargable (sin CSV ni PDF almacenado).",
        detail: "sin_contenido",
        id,
      },
      { status: 404 },
    );
  } catch (error: unknown) {
    console.error("GET /api/reports/[id]/download:", error);

    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (pgCode === "22P02") {
      return NextResponse.json(
        {
          ok: false,
          error: "download_404: el id no tiene formato UUID válido.",
          detail: "uuid_inválido",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Error al descargar el reporte." },
      { status: 500 },
    );
  }
}
