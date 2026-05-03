import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT id, name, country, default_currency, timezone FROM organizations ORDER BY created_at DESC"
    );

    return NextResponse.json({
      ok: true,
      organizations: result.rows,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error fetching organizations",
      },
      { status: 500 }
    );
  }
}
