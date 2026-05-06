import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await context.params;
    const id = typeof rawId === "string" ? rawId.trim() : "";

    if (!id || !isValidUuid(id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM report_artifacts
       WHERE id = $1::uuid AND organization_id = $2::uuid`,
      [id, ORGANIZATION_ID],
    );

    const deleted = (result.rowCount ?? 0) > 0;
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Reporte no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { ok: false, error: "Error al eliminar el reporte" },
      { status: 500 },
    );
  }
}
