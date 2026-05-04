import type { CurrencyCode } from "@/components/inicio/mock";
import type {
  BankBalance,
  CashDistributionItem,
  CashDistributionKey,
  CashKpi,
  RecentMovement,
  UpcomingMovement,
} from "./mock";

export type CashApiSuccessPayload = {
  ok: true;
  organization: {
    id: string;
    name: string;
    default_currency: string | null;
  } | null;
  kpis: {
    immediateAvailable: number;
    totalAvailable: number;
    projected30d: number;
  };
  recentMovements: Array<{
    id: string;
    date: string | null;
    description: string;
    bankAccount: string;
    amount: number;
    direction: string;
    runningBalance: number;
  }>;
  distribution: Array<{
    key: CashDistributionKey;
    label: string;
    amount: number;
    percentage: number;
  }>;
  bankBalances: Array<{
    id: string;
    bank: string;
    balance: number;
    percentage: number;
  }>;
  futureImpacts: Array<{
    type: string;
    id: string;
    date: string | null;
    amount: number;
    description: string;
    counterpartyName?: string;
    documentNumber?: string;
    computedStatus?: string;
  }>;
};

function asDistributionKey(value: string | undefined): CashDistributionKey {
  if (value === "banks" || value === "cash" || value === "investments" || value === "inTransit") {
    return value;
  }
  if (value === "other") return "other";
  return "other";
}

export function mapDefaultCurrency(value: string | null | undefined): CurrencyCode {
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

export function mapCashApiPayload(payload: CashApiSuccessPayload) {
  const currency = mapDefaultCurrency(payload.organization?.default_currency);

  const kpis: CashKpi[] = [
    {
      key: "availableToday",
      label: "Disponible inmediato",
      value: payload.kpis.immediateAvailable,
      hint: "Liquidez inmediata",
    },
    {
      key: "totalAvailable",
      label: "Saldo total disponible",
      value: payload.kpis.totalAvailable,
      hint: "En bancos + caja",
    },
    {
      key: "projection30d",
      label: "Saldo proyectado 30 días",
      value: payload.kpis.projected30d,
      hint: "Saldo esperado",
    },
  ];

  const recent: RecentMovement[] = payload.recentMovements.map((m) => {
    const base = Math.abs(Number(m.amount) || 0);
    const signed = m.direction === "out" ? -base : base;
    return {
      id: m.id,
      date: safeIsoDate(m.date),
      description: m.description || "—",
      bank: m.bankAccount || "—",
      amount: signed,
      balanceAfter: Number.isFinite(m.runningBalance) ? m.runningBalance : 0,
    };
  });

  const distribution: CashDistributionItem[] = payload.distribution.map((d) => ({
    key: asDistributionKey(d.key),
    label: d.label || "Sin etiqueta",
    amount: d.amount,
  }));

  const bankBalances: BankBalance[] = payload.bankBalances.map((b) => ({
    id: b.id,
    bank: b.bank || "—",
    amount: b.balance,
    pct: Math.max(0, Math.min(1, (b.percentage ?? 0) / 100)),
  }));

  const upcoming: UpcomingMovement[] = payload.futureImpacts.map((f) => ({
    id: f.id,
    date: safeIsoDate(f.date),
    description: f.description || "—",
    type: f.type === "payment" ? "Egreso" : "Ingreso",
    amount: Math.abs(Number(f.amount) || 0),
    computedStatus:
      f.computedStatus === "overdue" || f.computedStatus === "upcoming"
        ? f.computedStatus
        : undefined,
  }));

  return {
    currency,
    organization: payload.organization,
    kpis,
    recent,
    distribution,
    bankBalances,
    upcoming,
  };
}
