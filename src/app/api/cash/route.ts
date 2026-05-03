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

function accountTypeLabel(accountType: string | null | undefined): string {
  if (!accountType) return "Sin tipo";
  const key = accountType.toLowerCase();
  const map: Record<string, string> = {
    bank: "Banco",
    banks: "Banco",
    checking: "Cuenta corriente",
    savings: "Caja de ahorro",
    cash: "Efectivo / Caja",
    investment: "Inversiones",
    investments: "Inversiones",
    in_transit: "En tránsito",
    other: "Otros",
  };
  return map[key] ?? accountType.replace(/_/g, " ");
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
             i.amount AS amount
           FROM invoices i
           WHERE i.organization_id = $1::uuid AND i.status = 'pending'
           UNION ALL
           SELECT
             'payment'::text,
             b.id::text,
             b.due_date,
             b.amount
           FROM bills b
           WHERE b.organization_id = $1::uuid AND b.status = 'pending'
         ) u
         ORDER BY impact_date ASC NULLS LAST
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

    const kpis = {
      immediateAvailable: totalAvailable,
      totalAvailable,
      projected30d: totalAvailable + invoices30 - bills30,
    };

    const distTotal = distributionRes.rows.reduce(
      (acc, row: { amount?: unknown }) => acc + toNumber(row.amount),
      0
    );

    const distribution = distributionRes.rows.map(
      (row: { account_type?: string | null; amount?: unknown }) => {
        const amount = toNumber(row.amount);
        const pct = distTotal > 0 ? (amount / distTotal) * 100 : 0;
        return {
          label: accountTypeLabel(row.account_type ?? undefined),
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

    const futureImpacts = futureRes.rows.map(
      (row: {
        impact_type: string;
        id: string;
        impact_date: Date | string | null;
        amount: unknown;
      }) => ({
        type: row.impact_type === "payment" ? "payment" : "collection",
        id: row.id,
        date: toIsoDate(row.impact_date),
        amount: toNumber(row.amount),
        description:
          row.impact_type === "collection"
            ? `Cobro pendiente — factura ${row.id.slice(0, 8)}`
            : `Pago pendiente — bill ${row.id.slice(0, 8)}`,
      })
    );

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
