import OpenAI from "openai";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEMO_ORGANIZATION_ID } from "./demo-org";

const SYSTEM_PROMPT = `Sos el Copiloto Financiero de Quipu para PyMEs.
Hablás con dueños, CFOs y administradores: tono profesional, cercano y claro.
Respondé siempre en español, en pocas frases. No inventes datos; si falta información, pedila en concreto.
No des asesoramiento financiero, legal, contable o impositivo definitivo.

Dos modos de respuesta (elegí uno según el mensaje del usuario):

A) Conversación simple (saludos, agradecimientos, despedidas, preguntas generales sin datos ni pedido de análisis):
- Respondé de forma natural, breve y amable.
- No uses el formato Estado / Riesgo / Acciones.
- No fuerces cifras ni listas del contexto si el usuario no las pidió.

B) Análisis o gestión financiera (cuando el usuario pide ver situación, riesgos, priorizar, decidir, o habla de caja, cobros, pagos, mora, vencimientos, proveedores, clientes en deuda, liquidez, flujo, deuda, facturas, cheques, transferencias, etc.):
- Usá el formato obligatorio exacto:
Estado: [1 línea]
Riesgo: [1 línea]
Acciones:
- [acción 1]
- [acción 2]
- [acción 3]
- Máximo 90 palabras en total en este modo.
- Usá saltos de línea; no un solo párrafo largo.
- Estado y Riesgo deben basarse en datos del contexto (caja, montos, fechas, clientes o proveedores listados).
- En Acciones, cada bullet: verbo + qué + cuánto o cuándo o a quién, solo con datos del contexto.
- Prohibido en Acciones: frases genéricas vacías ("mantener liquidez", "revisar futuros problemas", "podría afectar la relación con el proveedor") sin acción concreta.
- Si el contexto no alcanza, pedí un dato puntual en una frase en lugar de "revisar" en abstracto.
- Si el usuario pide clientes con mayor mora (o equivalente), respetá el orden del contexto (mayor monto vencido primero); no reordenes el ranking numerado.

Si el mensaje mezcla saludo y una consulta financiera, priorizá el modo B y respondé al pedido financiero.`;

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
  return null;
}

function formatMoney(n: number, currency: string) {
  const s = n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${s} ${currency}`;
}

function formatCobroPendienteLine(
  clientName: string,
  amount: number,
  dueDateStr: string | null,
  currency: string
) {
  const fecha = dueDateStr ?? "sin fecha";
  return `- Cliente: ${clientName} · Monto: ${formatMoney(amount, currency)} · Vencimiento: ${fecha}`;
}

function moraLabel(days: number) {
  return `${days} ${days === 1 ? "día" : "días"}`;
}

function moraClienteRankHeading(index: number): string {
  switch (index) {
    case 0:
      return "1. Cliente con mayor monto vencido";
    case 1:
      return "2. Segundo mayor monto vencido";
    case 2:
      return "3. Tercer mayor monto vencido";
    default:
      return `${index + 1}. Posición ${index + 1} por monto vencido (orden fijo del listado)`;
  }
}

function formatRankedMoraClienteLine(
  rankIndex: number,
  clientName: string,
  amount: number,
  dueDateStr: string | null,
  daysOverdue: number | null,
  currency: string
) {
  const fecha = dueDateStr ?? "sin fecha";
  const mora =
    daysOverdue != null && daysOverdue > 0 ? ` · Mora: ${moraLabel(daysOverdue)}` : "";
  return `${moraClienteRankHeading(rankIndex)} — Cliente: ${clientName} · Monto vencido: ${formatMoney(amount, currency)} · Vencimiento: ${fecha}${mora}`;
}

function formatPagoVencidoLine(
  vendorName: string,
  amount: number,
  dueDateStr: string | null,
  daysOverdue: number | null,
  currency: string
) {
  const fecha = dueDateStr ?? "sin fecha";
  const mora =
    daysOverdue != null && daysOverdue > 0 ? ` · Mora: ${moraLabel(daysOverdue)}` : "";
  return `- Proveedor: ${vendorName} · Monto vencido: ${formatMoney(amount, currency)} · Vencimiento: ${fecha}${mora}`;
}

function buildCashRiskLines(
  cash: number,
  overduePay: number,
  overdueRecv: number,
  pay7: number,
  recv7: number,
  scheduled: number,
  currency: string
): string[] {
  const lines: string[] = [];
  if (cash <= 0 && (overduePay > 0 || pay7 > 0)) {
    lines.push("Caja disponible nula o negativa con salidas pendientes o a la vista.");
  } else if (overduePay > cash && overduePay > 0 && cash >= 0) {
    lines.push("Total de pagos vencidos supera la caja disponible: brecha de liquidez inmediata.");
  } else if (pay7 > cash && pay7 > 0) {
    lines.push("Salidas con vencimiento en 7 días superan la caja: riesgo si no ingresan cobros.");
  } else if (overduePay > 0 && overdueRecv === 0) {
    lines.push("Hay pagos vencidos y poco o ningún cobro vencido registrado: priorizar salidas y cobranza.");
  } else if (overdueRecv > overduePay && overdueRecv > 0) {
    lines.push("Cobros vencidos superan pagos vencidos en monto: empujar cobranza puede aliviar caja.");
  } else {
    lines.push("Relación caja vs. vencidos y ventana 7 días dentro de parámetros habituales (revisar montos arriba).");
  }
  const net7 = recv7 - pay7;
  lines.push(
    `Ventana 7 días (solo futuros): entradas esperadas ${formatMoney(recv7, currency)}, salidas ${formatMoney(pay7, currency)}, neto aprox. ${formatMoney(net7, currency)}.`
  );
  if (scheduled > 0) {
    lines.push(`Pagos programados (payments, scheduled): ${formatMoney(scheduled, currency)}.`);
  }
  return lines;
}

async function loadFinancialContext(organizationId: string): Promise<string> {
  const [
    orgRes,
    cashRes,
    topCobrosRes,
    topPagosUrgRes,
    overduePayRes,
    overduePayListRes,
    overdueRecvRes,
    overdueRecvListRes,
    next7Res,
    scheduledRes,
  ] = await Promise.all([
    query(
      `SELECT name, default_currency
       FROM organizations
       WHERE id = $1::uuid`,
      [organizationId]
    ),
    query(
      `SELECT COALESCE(SUM(current_balance), 0) AS total
       FROM bank_accounts
       WHERE organization_id = $1::uuid AND status = 'active'`,
      [organizationId]
    ),
    query(
      `SELECT i.amount, i.due_date,
              COALESCE(NULLIF(TRIM(c.name), ''), 'Sin cliente') AS counterparty_name
       FROM invoices i
       LEFT JOIN customers c
         ON c.id = i.customer_id AND c.organization_id = i.organization_id
       WHERE i.organization_id = $1::uuid AND i.status = 'pending'
       ORDER BY i.amount DESC NULLS LAST
       LIMIT 5`,
      [organizationId]
    ),
    query(
      `SELECT b.amount, b.due_date,
              COALESCE(NULLIF(TRIM(v.name), ''), 'Sin proveedor') AS counterparty_name,
              CASE
                WHEN b.due_date IS NOT NULL AND b.due_date::date < CURRENT_DATE THEN 1
                ELSE 0
              END AS is_overdue,
              CASE
                WHEN b.due_date IS NOT NULL AND b.due_date::date < CURRENT_DATE
                THEN (CURRENT_DATE - b.due_date::date)::int
                ELSE NULL
              END AS days_overdue
       FROM bills b
       LEFT JOIN vendors v
         ON v.id = b.vendor_id AND v.organization_id = b.organization_id
       WHERE b.organization_id = $1::uuid AND b.status = 'pending'
       ORDER BY is_overdue DESC, b.due_date ASC NULLS LAST, b.amount DESC
       LIMIT 5`,
      [organizationId]
    ),
    query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*)::int AS cnt
       FROM bills
       WHERE organization_id = $1::uuid
         AND status = 'pending'
         AND due_date IS NOT NULL
         AND due_date::date < CURRENT_DATE`,
      [organizationId]
    ),
    query(
      `SELECT b.amount, b.due_date,
              COALESCE(NULLIF(TRIM(v.name), ''), 'Sin proveedor') AS counterparty_name,
              (CURRENT_DATE - b.due_date::date)::int AS days_overdue
       FROM bills b
       LEFT JOIN vendors v
         ON v.id = b.vendor_id AND v.organization_id = b.organization_id
       WHERE b.organization_id = $1::uuid
         AND b.status = 'pending'
         AND b.due_date IS NOT NULL
         AND b.due_date::date < CURRENT_DATE
       ORDER BY b.amount DESC NULLS LAST, b.due_date ASC
       LIMIT 8`,
      [organizationId]
    ),
    query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*)::int AS cnt
       FROM invoices
       WHERE organization_id = $1::uuid
         AND status = 'pending'
         AND due_date IS NOT NULL
         AND due_date::date < CURRENT_DATE`,
      [organizationId]
    ),
    query(
      `SELECT i.amount, i.due_date,
              COALESCE(NULLIF(TRIM(c.name), ''), 'Sin cliente') AS counterparty_name,
              (CURRENT_DATE - i.due_date::date)::int AS days_overdue
       FROM invoices i
       LEFT JOIN customers c
         ON c.id = i.customer_id AND c.organization_id = i.organization_id
       WHERE i.organization_id = $1::uuid
         AND i.status = 'pending'
         AND i.due_date IS NOT NULL
         AND i.due_date::date < CURRENT_DATE
       ORDER BY i.amount DESC NULLS LAST, i.due_date ASC
       LIMIT 8`,
      [organizationId]
    ),
    query(
      `SELECT * FROM (
         SELECT
           'cobro'::text AS kind,
           i.due_date AS dt,
           i.amount,
           COALESCE(NULLIF(TRIM(c.name), ''), 'Sin cliente') AS counterparty_name
         FROM invoices i
         LEFT JOIN customers c
           ON c.id = i.customer_id AND c.organization_id = i.organization_id
         WHERE i.organization_id = $1::uuid
           AND i.status = 'pending'
           AND i.due_date IS NOT NULL
           AND i.due_date::date >= CURRENT_DATE
           AND i.due_date::date < CURRENT_DATE + INTERVAL '7 days'
         UNION ALL
         SELECT
           'pago'::text,
           b.due_date,
           b.amount,
           COALESCE(NULLIF(TRIM(v.name), ''), 'Sin proveedor')
         FROM bills b
         LEFT JOIN vendors v
           ON v.id = b.vendor_id AND v.organization_id = b.organization_id
         WHERE b.organization_id = $1::uuid
           AND b.status = 'pending'
           AND b.due_date IS NOT NULL
           AND b.due_date::date >= CURRENT_DATE
           AND b.due_date::date < CURRENT_DATE + INTERVAL '7 days'
       ) u
       ORDER BY dt ASC NULLS LAST, kind ASC
       LIMIT 12`,
      [organizationId]
    ),
    query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM payments
       WHERE organization_id = $1::uuid AND status = 'scheduled'`,
      [organizationId]
    ),
  ]);

  const org = orgRes.rows[0] as { name?: unknown; default_currency?: unknown } | undefined;
  const orgName =
    typeof org?.name === "string" && org.name.trim() ? org.name.trim() : "Organización";
  const currency =
    typeof org?.default_currency === "string" && org.default_currency.trim()
      ? org.default_currency.trim()
      : "ARS";

  const cash = toNumber(cashRes.rows[0]?.total);
  const scheduled = toNumber(scheduledRes.rows[0]?.total);

  const overduePayRow = overduePayRes.rows[0] as { total?: unknown; cnt?: unknown } | undefined;
  const overduePayTotal = toNumber(overduePayRow?.total);
  const overduePayCnt = toNumber(overduePayRow?.cnt);

  const overdueRecvRow = overdueRecvRes.rows[0] as { total?: unknown; cnt?: unknown } | undefined;
  const overdueRecvTotal = toNumber(overdueRecvRow?.total);
  const overdueRecvCnt = toNumber(overdueRecvRow?.cnt);

  type RowAmt = { amount: unknown; due_date: unknown; counterparty_name: string };
  type RowMora = RowAmt & { days_overdue: unknown };
  const fmt = (n: number) => formatMoney(n, currency);

  const daysFromDb = (v: unknown): number | null => {
    const n = toNumber(v);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.trunc(n);
  };

  let pay7 = 0;
  let recv7 = 0;
  for (const r of next7Res.rows as { kind: string; amount: unknown }[]) {
    const a = toNumber(r.amount);
    if (r.kind === "pago") pay7 += a;
    else recv7 += a;
  }

  const topCobros = (topCobrosRes.rows as RowAmt[])
    .map((r) =>
      formatCobroPendienteLine(
        r.counterparty_name,
        toNumber(r.amount),
        toIsoDate(r.due_date),
        currency
      )
    )
    .join("\n");

  const topPagosUrg = (topPagosUrgRes.rows as (RowAmt & { is_overdue: number; days_overdue: unknown })[])
    .map((r) => {
      const d = toIsoDate(r.due_date) ?? "sin fecha";
      const tag = r.is_overdue ? "VENCIDO" : "próximo";
      const mora = r.is_overdue ? daysFromDb(r.days_overdue) : null;
      const moraTxt = mora != null ? ` · Mora: ${moraLabel(mora)}` : "";
      return `- Pago (${tag}) · Proveedor: ${r.counterparty_name} · Monto: ${fmt(toNumber(r.amount))} · Vencimiento: ${d}${moraTxt}`;
    })
    .join("\n");

  const overduePayList = (overduePayListRes.rows as RowMora[])
    .map((r) =>
      formatPagoVencidoLine(
        r.counterparty_name,
        toNumber(r.amount),
        toIsoDate(r.due_date),
        daysFromDb(r.days_overdue),
        currency
      )
    )
    .join("\n");

  const overdueRecvList = (overdueRecvListRes.rows as RowMora[])
    .map((r, idx) =>
      formatRankedMoraClienteLine(
        idx,
        r.counterparty_name,
        toNumber(r.amount),
        toIsoDate(r.due_date),
        daysFromDb(r.days_overdue),
        currency
      )
    )
    .join("\n");

  const next7Lines = (next7Res.rows as (RowAmt & { kind: string; dt: unknown })[])
    .map((r) => {
      const d = toIsoDate(r.dt) ?? "—";
      const amt = toNumber(r.amount);
      if (r.kind === "pago") {
        return `- Pago (≤7d): Proveedor: ${r.counterparty_name} · Monto: ${fmt(amt)} · Vencimiento: ${d}`;
      }
      return `- Cobro (≤7d): Cliente: ${r.counterparty_name} · Monto: ${fmt(amt)} · Vencimiento: ${d}`;
    })
    .join("\n");

  const riskLines = buildCashRiskLines(
    cash,
    overduePayTotal,
    overdueRecvTotal,
    pay7,
    recv7,
    scheduled,
    currency
  );

  return [
    `Empresa: ${orgName} (${currency}).`,
    "",
    "1) Caja total disponible (cuentas activas):",
    fmt(cash),
    "",
    "2) Top 5 cobros pendientes por monto (cliente, monto, vencimiento):",
    topCobros || "- Ninguno.",
    "",
    "3) Top 5 pagos pendientes por urgencia (vencidos primero, luego vence antes; días de mora si vencido):",
    topPagosUrg || "- Ninguno.",
    "",
    "4) Pagos vencidos (mayor monto vencido primero; días de mora si aplica):",
    `Total: ${fmt(overduePayTotal)} · Cantidad: ${overduePayCnt}.`,
    overduePayList || "- Sin detalle en extracto.",
    "",
    "5) Cobros vencidos / mora clientes (ORDEN FIJO: ya viene de mayor a menor monto vencido; no reordenar al responder):",
    "Listado numerado — cada fila es la posición exacta en el ranking por monto vencido:",
    `Total mora facturada (suma): ${fmt(overdueRecvTotal)} · Cantidad de facturas vencidas: ${overdueRecvCnt}.`,
    overdueRecvList || "- Sin detalle en extracto.",
    "",
    "6) Próximos vencimientos a 7 días (solo futuros, hoy inclusive hasta +7d):",
    next7Lines || "- Ninguno con fecha en ventana.",
    `Totales en ventana: cobros ${fmt(recv7)} · pagos ${fmt(pay7)}.`,
    "",
    "7) Resumen de riesgo de caja (heurístico, no asesoramiento):",
    ...riskLines.map((l) => `- ${l}`),
  ].join("\n");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message
      : null;

  if (raw === null) {
    return NextResponse.json({ error: "message must be a string" }, { status: 400 });
  }

  const message = raw.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  let requestedConversationId: string | null = null;
  if (typeof body === "object" && body !== null && "conversationId" in body) {
    const cid = (body as { conversationId?: unknown }).conversationId;
    if (cid !== undefined && cid !== null) {
      if (typeof cid !== "string") {
        return NextResponse.json({ error: "conversationId must be a string" }, { status: 400 });
      }
      const trimmed = cid.trim();
      if (trimmed.length > 0) {
        if (!isUuid(trimmed)) {
          return NextResponse.json({ error: "conversationId must be a valid UUID" }, { status: 400 });
        }
        requestedConversationId = trimmed;
      }
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Servicio no configurado." }, { status: 500 });
  }

  let financialContext: string;
  try {
    financialContext = await loadFinancialContext(DEMO_ORGANIZATION_ID);
  } catch (error) {
    console.error("Error fetching financial context for /api/ia:", error);
    const payload: { error: string; detail?: string } = {
      error: "No se pudieron cargar los datos financieros.",
    };
    if (process.env.NODE_ENV !== "production") {
      payload.detail =
        error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
    }
    return NextResponse.json(payload, { status: 500 });
  }

  let conversationId: string;
  try {
    if (requestedConversationId) {
      const existing = await query(
        `SELECT id FROM ai_conversations WHERE id = $1::uuid AND organization_id = $2::uuid`,
        [requestedConversationId, DEMO_ORGANIZATION_ID]
      );
      const row = existing.rows[0] as { id: string } | undefined;
      if (!row) {
        return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
      }
      conversationId = row.id;
    } else {
      const created = await query(
        `INSERT INTO ai_conversations (organization_id, user_id)
         VALUES ($1::uuid, NULL)
         RETURNING id`,
        [DEMO_ORGANIZATION_ID]
      );
      const row = created.rows[0] as { id: string } | undefined;
      if (!row?.id) {
        return NextResponse.json({ error: "No se pudo crear la conversación." }, { status: 500 });
      }
      conversationId = row.id;
    }

    await query(
      `INSERT INTO ai_messages (conversation_id, role, content)
       VALUES ($1::uuid, $2::text, $3::text)`,
      [conversationId, "user", message]
    );
  } catch (error) {
    console.error("Error persisting IA chat (conversation/user message):", error);
    return NextResponse.json({ error: "No se pudo guardar el historial del chat." }, { status: 500 });
  }

  const systemContent = `${SYSTEM_PROMPT}

---
Datos financieros actuales de la organización (Neon). Usá solo estas cifras y fechas cuando hablemos de montos o vencimientos; no inventes números que no figuren aquí:
${financialContext}
---`;

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: message },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const answer = typeof content === "string" ? content.trim() : "";

    if (!answer) {
      return NextResponse.json(
        { error: "No se pudo generar una respuesta.", conversationId },
        { status: 500 }
      );
    }

    try {
      await query(
        `INSERT INTO ai_messages (conversation_id, role, content)
         VALUES ($1::uuid, $2::text, $3::text)`,
        [conversationId, "assistant", answer]
      );
      await query(`UPDATE ai_conversations SET updated_at = now() WHERE id = $1::uuid`, [
        conversationId,
      ]);
    } catch (error) {
      console.error("Error persisting IA assistant message:", error);
      return NextResponse.json(
        { error: "No se pudo guardar la respuesta del asistente.", conversationId },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer, conversationId });
  } catch {
    return NextResponse.json(
      { error: "Error al consultar la IA.", conversationId },
      { status: 500 }
    );
  }
}
