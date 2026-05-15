import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

type AlertRow = {
  id: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  created_at: Date | string;
};

function toIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function GET() {
  try {
    const res = await query(
      `SELECT id, title, message, severity, status, created_at
       FROM public.alerts
       WHERE organization_id = $1::uuid AND status = 'open'
       ORDER BY created_at DESC
       LIMIT 5`,
      [ORGANIZATION_ID],
    );

    const alerts = (res.rows as AlertRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      severity: row.severity,
      status: row.status,
      created_at: toIsoTimestamp(row.created_at),
    }));

    return NextResponse.json({ ok: true, alerts });
  } catch (error) {
    console.error("GET /api/alerts:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudieron cargar las alertas." },
      { status: 500 },
    );
  }
}
