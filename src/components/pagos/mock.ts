export type PagosKpiKey = "totalPorPagar" | "venceSemana" | "aprobacionesPendientes";

export type PagosKpi = {
  key: PagosKpiKey;
  label: string;
  value: number;
  format: "money" | "count";
  deltaPct?: number;
  hint?: string;
};

export type CalendarRangeKey = "7d" | "30d" | "90d" | "calendar";

export type PaymentsCalendarPoint = {
  label: string; // e.g. 28 May
  dateIso?: string | null; // ISO yyyy-mm-dd cuando viene de la API
  scheduled: number;
  paid: number;
  overdue: number;
};

export type UpcomingPaymentOrigin = "payment" | "bill";

export type UpcomingPayment = {
  id: string;
  /** ISO yyyy-mm-dd cuando existe en API; null si no hay fecha. */
  date: string | null;
  vendor: string;
  description: string;
  amount: number;
  /** `payment`: fila de `payments` programado; `bill`: factura pendiente usada como fallback. */
  origin: UpcomingPaymentOrigin;
};

export type VendorRow = {
  id: string;
  vendor: string;
  pendingCount: number;
  amount: number;
};

export type PaymentStatus = "Pagado" | "Programado" | "Vencido" | "Sin estado";

export type RecentPayment = {
  id: string;
  /** ISO yyyy-mm-dd cuando existe en API; null si no hay fecha. */
  date: string | null;
  vendor: string;
  method: string;
  amount: number;
  status: PaymentStatus;
};
