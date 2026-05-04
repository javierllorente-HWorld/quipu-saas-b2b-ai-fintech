import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return null;
}

/** Categoría estable para agrupar saldos por tipo de cuenta (etiqueta en español). */
type DistributionCategory = "banks" | "cash" | "investments" | "inTransit" | "other";

function distributionCategory(accountType: string | null | undefined): DistributionCategory {
  const key = (accountType ?? "").toLowerCase().trim();
  switch (key) {
    case "bank":
    case "banks":
      return "banks";
    case "wallet":
    case "cash":
      return "cash";
    case "investment":
    case "investments":
      return "investments";
    case "in_transit":
      return "inTransit";
    default:
      return "other";
  }
}

const DISTRIBUTION_LABEL: Record<DistributionCategory, string> = {
  banks: "Bancos",
  cash: "Efectivo / billeteras",
  investments: "Inversiones",
  inTransit: "En tránsito / otros",
  other: "Otros",
};

const DISTRIBUTION_ORDER: DistributionCategory[] = [
  "banks",
  "cash",
  "investments",
  "inTransit",
  "other",
];

type FutureImpactRow = {
  impact_type: string;
  id: string;
  impact_date: Date | string | null;
  amount: unknown;
  counterparty_name: string;
  document_number: string | null;
  computed_status: string;
};

function resolveDocumentNumber(
  eventType: "collection" | "payment",
  rawFromDb: string | null | undefined,
  id: string
): { documentNumber: string; hadExplicitNumber: boolean } {
  const trimmed = (rawFromDb ?? "").trim();
  if (trimmed.length > 0) {
    return { documentNumber: trimmed, hadExplicitNumber: true };
  }
  const compact = id.replace(/-/g, "").toUpperCase();
  if (eventType === "collection") {
    const fallback = id.length >= 8 ? id.slice(0, 8) : "S/N";
    return { documentNumber: fallback, hadExplicitNumber: false };
  }
  const suffix = compact.slice(0, 6) || "SN";
  return { documentNumber: `BILL-${suffix}`, hadExplicitNumber: false };
}

function buildFutureImpactDescription(
  eventType: "collection" | "payment",
  documentNumber: string,
  hadExplicitNumber: boolean,
  counterpartyRaw: string
): string {
  const cp = (counterpartyRaw ?? "").trim() || "Sin contraparte";
  let docLine: string;
  if (eventType === "collection") {
    docLine = hadExplicitNumber
      ? `Factura ${documentNumber}`
      : `Factura sin número (${documentNumber})`;
  } else {
    docLine = `Pago ${documentNumber}`;
  }
  return `${docLine} — ${cp}`;
}

export async function GET() {
  try {
    const [
      orgRes,
      balancesRes,
      invoices30Res,
      bills30Res,
      distributionRes,
      banksRes,
      movementsRes,
      futureRes,
    ] = await Promise.all([
      query(
        `SELECT id, name, default_currency
         FROM organizations
         WHERE id = $1::uuid`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT COALESCE(SUM(current_balance), 0) AS total
         FROM bank_accounts
         WHERE organization_id = $1::uuid
           AND status = 'active'`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM invoices
         WHERE organization_id = $1::uuid
           AND status = 'pending'
           AND due_date IS NOT NULL
           AND due_date >= CURRENT_DATE
           AND due_date < CURRENT_DATE + INTERVAL '30 days'`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM bills
         WHERE organization_id = $1::uuid
           AND status = 'pending'
           AND due_date IS NOT NULL
           AND due_date >= CURRENT_DATE
           AND due_date < CURRENT_DATE + INTERVAL '30 days'`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT account_type, COALESCE(SUM(current_balance), 0) AS amount
         FROM bank_accounts
         WHERE organization_id = $1::uuid
           AND status = 'active'
         GROUP BY account_type`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT id,
                COALESCE(NULLIF(TRIM(bank_name), ''), NULLIF(TRIM(name), ''), 'Cuenta') AS bank_label,
                current_balance
         FROM bank_accounts
         WHERE organization_id = $1::uuid
           AND status = 'active'
         ORDER BY current_balance DESC NULLS LAST, bank_label ASC`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           cm.id,
           cm.movement_date AS movement_at,
           cm.description,
           COALESCE(NULLIF(TRIM(ba.bank_name), ''), NULLIF(TRIM(ba.name), ''), 'Cuenta') AS bank_account,
           cm.amount,
           cm.direction,
           ba.current_balance AS account_current_balance
         FROM cash_movements cm
         LEFT JOIN bank_accounts ba ON ba.id = cm.bank_account_id
         WHERE cm.organization_id = $1::uuid
         ORDER BY cm.movement_date DESC NULLS LAST, cm.created_at DESC
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT * FROM (
           SELECT
             'collection'::text AS impact_type,
             i.id::text AS id,
             i.due_date AS impact_date,
             i.amount,
             COALESCE(NULLIF(TRIM(c.name), ''), 'Sin cliente') AS counterparty_name,
             COALESCE(NULLIF(TRIM(i.invoice_number::text), ''), '') AS document_number,
             CASE
               WHEN i.due_date IS NOT NULL AND i.due_date::date < CURRENT_DATE THEN 'overdue'
               ELSE 'upcoming'
             END AS computed_status
           FROM invoices i
           LEFT JOIN customers c
             ON c.id = i.customer_id AND c.organization_id = i.organization_id
           WHERE i.organization_id = $1::uuid AND i.status = 'pending'
           UNION ALL
           SELECT
             'payment'::text,
             b.id::text,
             b.due_date,
             b.amount,
             COALESCE(NULLIF(TRIM(v.name), ''), 'Sin proveedor'),
             COALESCE(NULLIF(TRIM(b.bill_number::text), ''), ''),
             CASE
               WHEN b.due_date IS NOT NULL AND b.due_date::date < CURRENT_DATE THEN 'overdue'
               ELSE 'upcoming'
             END
           FROM bills b
           LEFT JOIN vendors v
             ON v.id = b.vendor_id AND v.organization_id = b.organization_id
           WHERE b.organization_id = $1::uuid AND b.status = 'pending'
         ) u
         ORDER BY impact_date ASC NULLS LAST, impact_type ASC, id ASC
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
    ]);

    const orgRow = orgRes.rows[0] as
      | { id: string; name: string; default_currency: string | null }
      | undefined;

    const organization = orgRow
      ? {
          id: orgRow.id,
          name: orgRow.name,
          default_currency: orgRow.default_currency,
        }
      : null;

    const totalAvailable = toNumber(balancesRes.rows[0]?.total);
    const invoices30 = toNumber(invoices30Res.rows[0]?.total);
    const bills30 = toNumber(bills30Res.rows[0]?.total);

    // Saldo actual + cobros pendientes con vencimiento en los próximos 30 días
    // − pagos pendientes con vencimiento en los próximos 30 días (consultas invoices30 / bills30).
    const kpis = {
      immediateAvailable: totalAvailable,
      totalAvailable,
      projected30d: totalAvailable + invoices30 - bills30,
    };

    const mergedByCategory = new Map<DistributionCategory, number>();
    for (const row of distributionRes.rows as { account_type?: string | null; amount?: unknown }[]) {
      const cat = distributionCategory(row.account_type);
      mergedByCategory.set(cat, (mergedByCategory.get(cat) ?? 0) + toNumber(row.amount));
    }

    const distTotal = DISTRIBUTION_ORDER.reduce((acc, cat) => acc + (mergedByCategory.get(cat) ?? 0), 0);

    const distribution = DISTRIBUTION_ORDER.filter((cat) => (mergedByCategory.get(cat) ?? 0) > 0).map(
      (cat) => {
        const amount = mergedByCategory.get(cat) ?? 0;
        const pct = distTotal > 0 ? (amount / distTotal) * 100 : 0;
        return {
          key: cat,
          label: DISTRIBUTION_LABEL[cat],
          amount,
          percentage: pct,
        };
      }
    );

    const bankRows = banksRes.rows as {
      id: string;
      bank_label: string;
      current_balance: unknown;
    }[];

    const banksTotal = bankRows.reduce((acc, r) => acc + toNumber(r.current_balance), 0);

    const bankBalances = bankRows.map((row) => {
      const balance = toNumber(row.current_balance);
      const pct = banksTotal > 0 ? (balance / banksTotal) * 100 : 0;
      return {
        id: row.id,
        bank: row.bank_label,
        balance,
        percentage: pct,
      };
    });

    const recentMovements = movementsRes.rows.map(
      (row: {
        id: string;
        movement_at: Date | string | null;
        description: string | null;
        bank_account: string | null;
        amount: unknown;
        direction: string | null;
        account_current_balance: unknown;
      }) => ({
        id: row.id,
        date: toIsoDate(row.movement_at),
        description: row.description ?? "",
        bankAccount: row.bank_account ?? "",
        amount: toNumber(row.amount),
        direction: row.direction === "out" ? "out" : "in",
        runningBalance: toNumber(row.account_current_balance),
      })
    );

    const futureImpacts = (futureRes.rows as FutureImpactRow[]).map((row) => {
      const eventType = row.impact_type === "payment" ? "payment" : "collection";
      const { documentNumber, hadExplicitNumber } = resolveDocumentNumber(
        eventType,
        row.document_number,
        row.id
      );
      const computedStatus = row.computed_status === "overdue" ? "overdue" : "upcoming";
      return {
        id: row.id,
        type: eventType,
        date: toIsoDate(row.impact_date),
        amount: toNumber(row.amount),
        description: buildFutureImpactDescription(
          eventType,
          documentNumber,
          hadExplicitNumber,
          row.counterparty_name
        ),
        counterpartyName: (row.counterparty_name ?? "").trim() || "Sin contraparte",
        documentNumber,
        computedStatus,
      };
    });

    return NextResponse.json({
      ok: true,
      organization,
      kpis,
      recentMovements,
      distribution,
      bankBalances,
      futureImpacts,
    });
  } catch (error) {
    console.error("Error fetching cash:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error fetching cash",
      },
      { status: 500 }
    );
  }
}
