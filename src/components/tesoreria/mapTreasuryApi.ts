import type { CurrencyCode } from "@/components/inicio/mock";
import type {
  BankBalanceRow,
  TesoreriaKpi,
  RecentTransferRow,
} from "./mock";

export type TreasuryApiSuccessPayload = {
  ok: true;
  organization: {
    id: string;
    name: string;
    default_currency: string | null;
  } | null;
  kpis: {
    consolidatedBalance: number;
    connectedBanksCount: number;
    topBankExposureLabel: string;
  };
  bankBalances: Array<{
    id: string;
    bankName: string;
    accountName: string;
    accountType: string;
    availableBalance: number;
    currency: string;
    status: string;
  }>;
  recentTransfers: Array<{
    id: string;
    date: string | null;
    description: string;
    amount: number;
    bankAccountName?: string;
    direction: string;
  }>;
};

function mapDefaultCurrency(value: string | null | undefined): CurrencyCode {
  const u = (value ?? "").trim().toUpperCase();
  if (u === "USD") return "USD";
  return "ARS";
}

function parseIsoDateOrNull(value: string | null | undefined): string | null {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return null;
}

function mapBankStatus(apiStatus: string): BankBalanceRow["status"] {
  return apiStatus.toLowerCase() === "active" ? "Activa" : "Inactiva";
}

function accountTypeLabel(accountType: string | null | undefined): string {
  const key = (accountType ?? "").trim().toLowerCase();
  switch (key) {
    case "bank":
    case "banks":
      return "Banco";
    case "wallet":
      return "Billetera";
    case "cash":
      return "Efectivo";
    case "investment":
    case "investments":
      return "Inversión";
    case "credit":
    case "credit_card":
      return "Crédito";
    case "in_transit":
      return "En tránsito";
    default:
      return "Otra cuenta";
  }
}

function formatAccountCell(accountName: string, accountType: string): string {
  const name = (accountName ?? "").trim();
  const typeLabel = accountTypeLabel(accountType);
  if (name && name !== "—") {
    return typeLabel && typeLabel !== name ? `${name} · ${typeLabel}` : name;
  }
  if (typeLabel) return typeLabel;
  return "—";
}

export function mapTreasuryApiPayload(payload: TreasuryApiSuccessPayload) {
  const currency = mapDefaultCurrency(payload.organization?.default_currency);

  const kpis: TesoreriaKpi[] = [
    {
      key: "posicionConsolidada",
      label: "Posición consolidada",
      format: "money",
      value: payload.kpis.consolidatedBalance,
    },
    {
      key: "bancosConectados",
      label: "Bancos conectados",
      format: "count",
      value: payload.kpis.connectedBanksCount,
      hint: "Cuentas con estado activo",
    },
    {
      key: "exposicionPorBanco",
      label: "Mayor exposición bancaria",
      format: "text",
      value: payload.kpis.topBankExposureLabel || "—",
      hint: "Mayor concentración",
    },
  ];

  const bankBalances: BankBalanceRow[] = payload.bankBalances.map((b) => ({
    id: b.id,
    bank: b.bankName?.trim() || "—",
    account: formatAccountCell(b.accountName, b.accountType),
    available: b.availableBalance,
    status: mapBankStatus(b.status),
  }));

  const recentTransfers: RecentTransferRow[] = payload.recentTransfers.map((t) => ({
    id: t.id,
    date: parseIsoDateOrNull(t.date),
    account: (t.bankAccountName ?? "").trim() || "—",
    description: t.description?.trim() || "—",
    amount: Math.abs(Number(t.amount) || 0),
  }));

  return {
    currency,
    organization: payload.organization,
    kpis,
    bankBalances,
    recentTransfers,
  };
}
