export type CobrosKpiKey = "totalPorCobrar" | "vencido" | "facturasPendientes";

export type CobrosKpi = {
  key: CobrosKpiKey;
  label: string;
  value: number;
  format: "money" | "percent" | "count";
  deltaPct?: number;
  hint?: string;
};

export type DebtAgingBucketKey = "noVencido" | "vencido31_60" | "vencido61_90" | "vencido90p";

export type DebtAgingItem = {
  key: DebtAgingBucketKey;
  label: string;
  amount: number;
};

export type CustomerReceivable = {
  id: string;
  name: string;
  total: number;
  overdue: number;
};

export type InvoiceStatus = "Vencida" | "Por_vencer" | "Pendiente";

export type PendingInvoice = {
  id: string;
  invoice: string;
  customer: string;
  /** ISO yyyy-mm-dd cuando existe en API; null si no hay vencimiento. */
  dueDate: string | null;
  amount: number;
  status: InvoiceStatus;
};

export type RecentCollection = {
  id: string;
  /** ISO yyyy-mm-dd cuando existe en API; null si no hay fecha. */
  date: string | null;
  description: string;
  amount: number;
  bankAccountName?: string;
  source?: string;
};
