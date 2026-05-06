import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

type Body = { reason?: unknown };

function voidReasonFromBody(body: Body | null): string {
  if (body?.reason == null) return "Anulado manualmente";
  if (typeof body.reason !== "string") return "Anulado manualmente";
  const t = body.reason.trim();
  return t.length > 0 ? t : "Anulado manualmente";
}

type OrigRow = {
  id: string;
  bank_account_id: string | null;
  description: string | null;
  amount: unknown;
  currency: string | null;
  direction: string | null;
  category: string | null;
  status: string | null;
  voided_at: Date | string | null;
  reverses_movement_id: string | null;
  invoice_id: string | null;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let body: Body | null = null;
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text) as Body;
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const { id: rawId } = await context.params;
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!id || !isValidUuid(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido." }, { status: 400 });
  }

  const reason = voidReasonFromBody(body);

  try {
    const result = await withTransaction(async (client) => {
      const origRes = await client.query(
        `SELECT
           id,
           bank_account_id,
           description,
           amount,
           currency,
           direction,
           category,
           status,
           voided_at,
           reverses_movement_id,
           invoice_id
         FROM cash_movements
         WHERE id = $1::uuid
           AND organization_id = $2::uuid
         FOR UPDATE`,
        [id, ORGANIZATION_ID],
      );

      if (origRes.rows.length === 0) {
        throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" as const });
      }

      const o = origRes.rows[0] as OrigRow;

      if (o.voided_at != null) {
        throw Object.assign(new Error("ALREADY_VOIDED"), { code: "ALREADY_VOIDED" as const });
      }
      if (o.reverses_movement_id != null) {
        throw Object.assign(new Error("IS_REVERSAL"), { code: "IS_REVERSAL" as const });
      }
      if (String(o.direction ?? "") !== "in" || String(o.category ?? "") !== "collections") {
        throw Object.assign(new Error("NOT_VOIDABLE"), { code: "NOT_VOIDABLE" as const });
      }
      if (String(o.status ?? "") !== "confirmed") {
        throw Object.assign(new Error("NOT_VOIDABLE"), { code: "NOT_VOIDABLE" as const });
      }

      const dupRes = await client.query(
        `SELECT id
         FROM cash_movements
         WHERE reverses_movement_id = $1::uuid
         LIMIT 1
         FOR UPDATE`,
        [id],
      );
      if (dupRes.rows.length > 0) {
        throw Object.assign(new Error("REVERSAL_EXISTS"), { code: "REVERSAL_EXISTS" as const });
      }

      if (!o.bank_account_id) {
        throw Object.assign(new Error("NO_BANK_ACCOUNT"), { code: "NO_BANK_ACCOUNT" as const });
      }

      const accRes = await client.query(
        `SELECT id
         FROM bank_accounts
         WHERE id = $1::uuid
           AND organization_id = $2::uuid
           AND status = 'active'
         FOR UPDATE`,
        [o.bank_account_id, ORGANIZATION_ID],
      );
      if (accRes.rows.length === 0) {
        throw Object.assign(new Error("ACCOUNT_NOT_FOUND"), { code: "ACCOUNT_NOT_FOUND" as const });
      }

      const origDesc = (o.description ?? "").trim() || "—";
      const revDescription = `Anulación de cobro — ${origDesc}`;
      const amount = Number(o.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw Object.assign(new Error("INVALID_AMOUNT"), { code: "INVALID_AMOUNT" as const });
      }
      const currency = (o.currency ?? "ARS").trim() || "ARS";

      const insertRes = await client.query(
        `INSERT INTO cash_movements (
           organization_id,
           bank_account_id,
           movement_date,
           description,
           amount,
           currency,
           direction,
           category,
           status,
           source,
           reverses_movement_id,
           invoice_id
         )
         VALUES (
           $1::uuid,
           $2::uuid,
           CURRENT_DATE,
           $3,
           $4::numeric,
           $5,
           'out',
           'collections',
           'confirmed',
           'manual',
           $6::uuid,
           $7::uuid
         )
         RETURNING id`,
        [
          ORGANIZATION_ID,
          o.bank_account_id,
          revDescription,
          amount,
          currency,
          id,
          o.invoice_id,
        ],
      );

      const reversalId = String(insertRes.rows[0]?.id ?? "");
      if (!reversalId) {
        throw new Error("INSERT_FAILED");
      }

      await client.query(
        `UPDATE bank_accounts
         SET current_balance = COALESCE(current_balance, 0) - $1::numeric
         WHERE id = $2::uuid
           AND organization_id = $3::uuid`,
        [amount, o.bank_account_id, ORGANIZATION_ID],
      );

      await client.query(
        `UPDATE cash_movements
         SET voided_at = now(),
             void_reason = $1
         WHERE id = $2::uuid
           AND organization_id = $3::uuid`,
        [reason, id, ORGANIZATION_ID],
      );

      if (o.invoice_id) {
        await client.query(
          `UPDATE invoices
           SET status = 'pending'
           WHERE id = $1::uuid
             AND organization_id = $2::uuid
             AND status = 'paid'`,
          [o.invoice_id, ORGANIZATION_ID],
        );
      }

      return { reversalMovementId: reversalId };
    });

    return NextResponse.json({
      ok: true,
      voidedCollection: {
        id,
        reversalMovementId: result.reversalMovementId,
      },
    });
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code?: string }).code
        : "";

    if (code === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "Cobro no encontrado." }, { status: 404 });
    }
    if (code === "ALREADY_VOIDED") {
      return NextResponse.json(
        { ok: false, error: "Este cobro ya fue anulado." },
        { status: 409 },
      );
    }
    if (code === "IS_REVERSAL") {
      return NextResponse.json(
        { ok: false, error: "Este movimiento no es un cobro anulable." },
        { status: 409 },
      );
    }
    if (code === "NOT_VOIDABLE") {
      return NextResponse.json(
        { ok: false, error: "Solo se pueden anular cobros confirmados de cobranzas." },
        { status: 409 },
      );
    }
    if (code === "REVERSAL_EXISTS") {
      return NextResponse.json(
        { ok: false, error: "Este cobro ya tiene una anulación registrada." },
        { status: 409 },
      );
    }
    if (code === "NO_BANK_ACCOUNT" || code === "INVALID_AMOUNT") {
      return NextResponse.json(
        { ok: false, error: "No se puede anular este cobro (datos incompletos)." },
        { status: 400 },
      );
    }
    if (code === "ACCOUNT_NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "La cuenta bancaria asociada no está disponible." },
        { status: 409 },
      );
    }

    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    console.error("POST /api/receivables/collections/[id]/void:", error);

    if (pgCode === "23505") {
      return NextResponse.json(
        { ok: false, error: "Este cobro ya tiene una anulación registrada." },
        { status: 409 },
      );
    }
    if (pgCode === "42703" || pgCode === "42P01") {
      return NextResponse.json(
        {
          ok: false,
          error: "Esquema incompatible: verificá columnas de cash_movements o invoices.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "No se pudo anular el cobro." },
      { status: 500 },
    );
  }
}
