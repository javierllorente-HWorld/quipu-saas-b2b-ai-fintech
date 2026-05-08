import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEMO_ORGANIZATION_ID } from "../demo-org";

type ConvRow = {
  id: string;
  title: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : "";
}

/** Listado de conversaciones IA para la organización demo (sin filtro por user_id). */
export async function GET() {
  try {
    const res = await query(
      `SELECT id, title, created_at, updated_at
       FROM ai_conversations
       WHERE organization_id = $1::uuid
       ORDER BY updated_at DESC
       LIMIT 25`,
      [DEMO_ORGANIZATION_ID]
    );

    const conversations = (res.rows as ConvRow[]).map((r) => ({
      id: String(r.id),
      title: r.title,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("GET /api/ia/conversations:", error);
    return NextResponse.json({ error: "No se pudo cargar el historial." }, { status: 500 });
  }
}
