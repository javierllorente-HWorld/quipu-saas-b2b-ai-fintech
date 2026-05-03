import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toInt(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return null;
}

function buildTopBankExposureLabel(
  topLabel: string | null | undefined,
  topBalance: number,
  total: number,
  bankCount: number,
): string {
  if (bankCount <= 0) return "Sin cuentas activas";
  if (total <= 0) return "Saldo consolidado en cero";
  if (topBalance <= 0) return "Sin exposición principal";
  const pct = (topBalance / total) * 100;
  const label = (topLabel ?? "").trim() || "Cuenta";
  return `${label} — ${pct.toFixed(1)}% del total`;
}

export async function GET() {
  try {
    const [
      orgRes,
      kpiRes,
      topExposureRes,
      banksRes,
      transfersRes,
    ] = await Promise.all([
      query(
        `SELECT id, name, default_currency
         FROM organizations
         WHERE id = $1::uuid`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           COALESCE(SUM(current_balance), 0) AS consolidated_balance,
           COUNT(*)::int AS connected_banks_count
         FROM bank_accounts
         WHERE organization_id = $1::uuid AND status = 'active'`,
        [ORGANIZATION_ID]
      ),
      query(
        `WITH totals AS (
           SELECT COALESCE(SUM(current_balance), 0) AS total
           FROM bank_accounts
           WHERE organization_id = $1::uuid AND status = 'active'
         )
         SELECT
           COALESCE(NULLIF(TRIM(ba.bank_name), ''), NULLIF(TRIM(ba.name), ''), 'Cuenta') AS exposure_label,
           COALESCE(ba.current_balance, 0) AS exposure_balance,
           (SELECT total FROM totals) AS total_balance
         FROM bank_accounts ba
         WHERE ba.organization_id = $1::uuid AND ba.status = 'active'
         ORDER BY ba.current_balance DESC NULLS LAST, ba.id ASC
         LIMIT 1`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           ba.id,
           COALESCE(NULLIF(TRIM(ba.bank_name), ''), '—') AS bank_name,
           COALESCE(NULLIF(TRIM(ba.name), ''), '—') AS account_name,
           ba.account_type,
           ba.current_balance AS available_balance,
           ba.currency,
           ba.status
         FROM bank_accounts ba
         WHERE ba.organization_id = $1::uuid AND ba.status = 'active'
         ORDER BY ba.current_balance DESC NULLS LAST, ba.id ASC
         LIMIT 10`,
        [ORGANIZATION_ID]
      ),
      query(
        `SELECT
           p.id,
           p.payment_date AS execution_date,
           COALESCE(NULLIF(TRIM(v.name), ''), 'Proveedor sin nombre') AS beneficiary_name,
           COALESCE(NULLIF(TRIM(p.notes), ''), 'Pago programado') AS concept,
           p.amount,
           COALESCE(
             NULLIF(TRIM(p.currency), ''),
             (SELECT default_currency FROM organizations WHERE id = $1::uuid LIMIT 1)
           ) AS currency,
           p.status
         FROM payments p
         LEFT JOIN vendors v ON v.id = p.vendor_id AND v.organization_id = p.organization_id
         WHERE p.organization_id = $1::uuid AND p.status = 'scheduled'
         ORDER BY p.payment_date ASC NULLS LAST, p.id ASC
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

    const kpiRow = kpiRes.rows[0] as
      | { consolidated_balance?: unknown; connected_banks_count?: unknown }
      | undefined;

    const consolidatedBalance = toNumber(kpiRow?.consolidated_balance);
    const connectedBanksCount = toInt(kpiRow?.connected_banks_count);

    const topRow = topExposureRes.rows[0] as
      | {
          exposure_label?: string | null;
          exposure_balance?: unknown;
          total_balance?: unknown;
        }
      | undefined;

    const topBankExposureLabel = buildTopBankExposureLabel(
      topRow?.exposure_label,
      toNumber(topRow?.exposure_balance),
      consolidatedBalance,
      connectedBanksCount
    );

    const bankBalances = (banksRes.rows as {
      id: string;
      bank_name: string;
      account_name: string;
      account_type: string | null;
      available_balance: unknown;
      currency: string | null;
      status: string;
    }[]).map((row) => ({
      id: row.id,
      bankName: row.bank_name,
      accountName: row.account_name,
      accountType: row.account_type ?? "",
      availableBalance: toNumber(row.available_balance),
      currency: row.currency ?? "",
      status: row.status,
    }));

    const scheduledTransfers = (transfersRes.rows as {
      id: string;
      execution_date: Date | string | null;
      beneficiary_name: string;
      concept: string;
      amount: unknown;
      currency: string | null;
      status: string;
    }[]).map((row) => ({
      id: row.id,
      executionDate: toIsoDate(row.execution_date),
      beneficiaryName: row.beneficiary_name,
      concept: row.concept,
      amount: toNumber(row.amount),
      currency: row.currency ?? "",
      status: row.status,
    }));

    return NextResponse.json({
      ok: true,
      organization,
      kpis: {
        consolidatedBalance,
        connectedBanksCount,
        topBankExposureLabel,
      },
      bankBalances,
      scheduledTransfers,
    });
  } catch (error) {
    console.error("Error fetching treasury:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error fetching treasury",
      },
      { status: 500 }
    );
  }
}
