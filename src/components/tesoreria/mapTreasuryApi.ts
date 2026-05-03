import type { CurrencyCode } from "@/components/inicio/mock";
import type {
  BankBalanceRow,
  ScheduledTransferRow,
  TesoreriaKpi,
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
  scheduledTransfers: Array<{
    id: string;
    executionDate: string | null;
    beneficiaryName: string;
    concept: string;
    amount: number;
    currency: string;
    status: string;
  }>;
};

function mapDefaultCurrency(value: string | null | undefined): CurrencyCode {
  const u = (value ?? "").trim().toUpperCase();
  if (u === "USD") return "USD";
  return "ARS";
}

function safeIsoDate(value: string | null | undefined): string {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const t = new Date();
  t.setHours(12, 0, 0, 0);
  return t.toISOString().slice(0, 10);
}

function mapBankStatus(apiStatus: string): BankBalanceRow["status"] {
  return apiStatus.toLowerCase() === "active" ? "Activa" : "Inactiva";
}

function formatAccountCell(accountName: string, accountType: string): string {
  const name = (accountName ?? "").trim();
  const type = (accountType ?? "").trim();
  if (name && name !== "—") {
    return type && type !== name ? `${name} · ${type}` : name;
  }
  if (type) return type;
  return "—";
}

function mapTransferUiStatus(apiStatus: string): ScheduledTransferRow["status"] {
  const u = (apiStatus ?? "").toLowerCase();
  if (u === "rejected" || u === "rechazada" || u === "failed") return "Rechazada";
  if (u === "pending" || u === "pendiente") return "Pendiente";
  if (u === "scheduled" || u === "programada") return "Programada";
  return "Programada";
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

  const scheduledTransfers: ScheduledTransferRow[] = payload.scheduledTransfers.map((t) => ({
    id: t.id,
    date: safeIsoDate(t.executionDate),
    beneficiary: t.beneficiaryName?.trim() || "—",
    concept: t.concept?.trim() || "—",
    amount: -Math.abs(Number(t.amount) || 0),
    status: mapTransferUiStatus(t.status),
  }));

  return {
    currency,
    organization: payload.organization,
    kpis,
    bankBalances,
    scheduledTransfers,
  };
}
