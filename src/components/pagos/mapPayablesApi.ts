import type { CurrencyCode } from "@/components/inicio/mock";
import type {
  PagosKpi,
  PaymentsCalendarPoint,
  RecentPayment,
  UpcomingPayment,
  VendorRow,
} from "./mock";

export type PayablesApiSuccessPayload = {
  ok: true;
  organization: {
    id: string;
    name: string;
    default_currency: string | null;
  } | null;
  kpis: {
    totalPayable: number;
    dueThisWeek: number;
    pendingApprovalAmount: number;
    pendingApprovalCount: number;
  };
  calendar: Array<{
    date: string | null;
    scheduledAmount: number;
    paidAmount: number;
    overdueAmount: number;
  }>;
  upcomingPayments: Array<{
    id: string;
    date: string | null;
    vendorName: string;
    description: string;
    amount: number;
    status: string;
  }>;
  vendors: Array<{
    vendorId: string | null;
    vendorName: string;
    pendingBillsCount: number;
    openAmount: number;
  }>;
  recentPayments: Array<{
    id: string;
    date: string | null;
    vendorName: string;
    method: string;
    amount: number;
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

function calendarPointLabel(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return "—";
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d
    .toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    .replace(/\./g, "")
    .trim();
}

function approvalHint(count: number): string {
  if (count <= 0) return "Sin pagos en aprobación";
  if (count === 1) return "1 pago pendiente de aprobación";
  return `${count} pagos pendientes de aprobación`;
}

function mapPaymentStatus(apiStatus: string): RecentPayment["status"] {
  const s = (apiStatus ?? "").toLowerCase();
  if (s === "paid" || s === "pagado") return "Pagado";
  if (s === "scheduled" || s === "programado") return "Programado";
  if (s === "overdue" || s === "vencido") return "Vencido";
  return "Pagado";
}

export function mapPayablesApiPayload(payload: PayablesApiSuccessPayload) {
  const currency = mapDefaultCurrency(payload.organization?.default_currency);

  const kpis: PagosKpi[] = [
    {
      key: "totalPorPagar",
      label: "Total por pagar",
      value: payload.kpis.totalPayable,
      format: "money",
    },
    {
      key: "venceSemana",
      label: "Por vencer esta semana",
      value: payload.kpis.dueThisWeek,
      format: "money",
    },
    {
      key: "aprobacionesPendientes",
      label: "Aprobaciones pendientes",
      value: payload.kpis.pendingApprovalAmount,
      format: "money",
      hint: approvalHint(payload.kpis.pendingApprovalCount),
    },
  ];

  const calendarPoints: PaymentsCalendarPoint[] = payload.calendar.map((row, idx) => {
    const iso = row.date && /^\d{4}-\d{2}-\d{2}/.test(row.date) ? row.date.slice(0, 10) : "";
    return {
      dateIso: iso || null,
      label: iso ? calendarPointLabel(iso) : `Día ${idx + 1}`,
      scheduled: row.scheduledAmount,
      paid: row.paidAmount,
      overdue: row.overdueAmount,
    };
  });

  const upcoming: UpcomingPayment[] = payload.upcomingPayments.map((u) => ({
    id: u.id,
    date: safeIsoDate(u.date),
    vendor: u.vendorName || "—",
    description: u.description || "—",
    amount: u.amount,
  }));

  const vendors: VendorRow[] = payload.vendors.map((v, idx) => ({
    id: v.vendorId ?? `sin-proveedor-${idx}`,
    vendor: v.vendorName || "—",
    pendingCount: v.pendingBillsCount,
    amount: v.openAmount,
  }));

  const recent: RecentPayment[] = payload.recentPayments.map((p) => ({
    id: p.id,
    date: safeIsoDate(p.date),
    vendor: p.vendorName || "—",
    method: p.method || "—",
    amount: p.amount,
    status: mapPaymentStatus(p.status),
  }));

  return {
    currency,
    organization: payload.organization,
    kpis,
    calendar: { points: calendarPoints },
    upcoming,
    vendors,
    recent,
  };
}
