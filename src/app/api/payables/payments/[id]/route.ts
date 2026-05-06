import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

async function paymentsHasColumn(columnName: string): Promise<boolean> {
  const res = await query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'payments'
       AND column_name = $1
     LIMIT 1`,
    [columnName],
  );
  return (res.rowCount ?? 0) > 0;
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

    const sel = await query(
      `SELECT status FROM payments
       WHERE id = $1::uuid AND organization_id = $2::uuid`,
      [id, ORGANIZATION_ID],
    );

    const row = sel.rows[0] as { status?: unknown } | undefined;
    if (!row) {
      return NextResponse.json({ ok: false, error: "Pago no encontrado" }, { status: 404 });
    }

    const status = String(row.status ?? "").toLowerCase();
    if (status !== "scheduled") {
      return NextResponse.json(
        { ok: false, error: "Solo se pueden cancelar pagos programados" },
        { status: 400 },
      );
    }

    const hasUpdatedAt = await paymentsHasColumn("updated_at");
    const updateSql = hasUpdatedAt
      ? `UPDATE payments
         SET status = 'cancelled', updated_at = now()
         WHERE id = $1::uuid AND organization_id = $2::uuid AND status = 'scheduled'`
      : `UPDATE payments
         SET status = 'cancelled'
         WHERE id = $1::uuid AND organization_id = $2::uuid AND status = 'scheduled'`;

    const updated = await query(updateSql, [id, ORGANIZATION_ID]);
    if ((updated.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { ok: false, error: "Solo se pueden cancelar pagos programados" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    return NextResponse.json(
      { ok: false, error: "Error al cancelar el pago" },
      { status: 500 },
    );
  }
}
