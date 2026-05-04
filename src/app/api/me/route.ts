import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/** Demo org — reemplazar por sesión cuando exista auth. */
const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

export async function GET() {
  try {
    const res = await query(
      `SELECT id, full_name, email, role, status
       FROM users
       WHERE organization_id = $1::uuid
         AND (status IS NULL OR LOWER(TRIM(status)) = 'active')
       ORDER BY id ASC
       LIMIT 1`,
      [ORGANIZATION_ID]
    );

    let row = res.rows[0] as
      | {
          id: string;
          full_name: string | null;
          email: string | null;
          role: string | null;
          status: string | null;
        }
      | undefined;

    if (!row) {
      const fallback = await query(
        `SELECT id, full_name, email, role, status
         FROM users
         WHERE organization_id = $1::uuid
         ORDER BY id ASC
         LIMIT 1`,
        [ORGANIZATION_ID]
      );
      row = fallback.rows[0] as typeof row;
    }

    if (!row) {
      return NextResponse.json(
        { ok: false, error: "No user found for organization" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: row.id,
        fullName: (row.full_name ?? "").trim() || "Usuario",
        email: (row.email ?? "").trim(),
        role: (row.role ?? "").trim(),
        status: (row.status ?? "").trim(),
      },
    });
  } catch (error) {
    console.error("Error fetching /api/me:", error);
    return NextResponse.json(
      { ok: false, error: "Error fetching user" },
      { status: 500 }
    );
  }
}
