export type TesoreriaKpiKey = "posicionConsolidada" | "bancosConectados" | "exposicionPorBanco";

export type TesoreriaKpi = {
  key: TesoreriaKpiKey;
  label: string;
  format: "money" | "count" | "text";
  value: number | string;
  deltaPct?: number;
  hint?: string;
};

export type BankBalanceRow = {
  id: string;
  bank: string;
  account: string;
  available: number;
  status: "Activa" | "Inactiva";
};

export type RecentTransferRow = {
  id: string;
  /** ISO yyyy-mm-dd cuando existe en API; null si no hay fecha. */
  date: string | null;
  account: string;
  description: string;
  amount: number;
};
