import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEMO_ORGANIZATION_ID } from "../../demo-org";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

type MsgRow = {
  id: string;
  role: string;
  content: string;
  created_at: Date | string;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : "";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id || !isUuid(id)) {
      return NextResponse.json({ error: "ID de conversación inválido." }, { status: 400 });
    }

    const conv = await query(
      `SELECT id FROM ai_conversations WHERE id = $1::uuid AND organization_id = $2::uuid`,
      [id, DEMO_ORGANIZATION_ID]
    );
    if (!conv.rows[0]) {
      return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
    }

    const msgs = await query(
      `SELECT id, role, content, created_at
       FROM ai_messages
       WHERE conversation_id = $1::uuid
       ORDER BY created_at ASC`,
      [id]
    );

    const messages = (msgs.rows as MsgRow[])
      .filter((r) => r.role === "user" || r.role === "assistant")
      .map((r) => ({
        id: String(r.id),
        role: r.role as "user" | "assistant",
        content: r.content,
        createdAt: toIso(r.created_at),
      }));

    return NextResponse.json({ conversationId: id, messages });
  } catch (error) {
    console.error("GET /api/ia/conversations/[id]:", error);
    return NextResponse.json({ error: "No se pudieron cargar los mensajes." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id || !isUuid(id)) {
      return NextResponse.json({ error: "ID de conversación inválido." }, { status: 400 });
    }

    const deleted = await query(
      `DELETE FROM ai_conversations
       WHERE id = $1::uuid AND organization_id = $2::uuid
       RETURNING id`,
      [id, DEMO_ORGANIZATION_ID]
    );

    if (!deleted.rows[0]) {
      return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("DELETE /api/ia/conversations/[id]:", error);
    return NextResponse.json({ error: "No se pudo eliminar la conversación." }, { status: 500 });
  }
}
