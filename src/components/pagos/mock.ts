import type { CurrencyCode } from "@/components/inicio/mock";

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

export type UpcomingPayment = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  vendor: string;
  description: string;
  amount: number;
};

export type VendorRow = {
  id: string;
  vendor: string;
  pendingCount: number;
  amount: number;
};

export type PaymentStatus = "Pagado" | "Programado" | "Vencido";

export type RecentPayment = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  vendor: string;
  method: string;
  amount: number;
  status: PaymentStatus;
};

export type PagosDashboardData = {
  currency: CurrencyCode;
  kpis: PagosKpi[];
  calendar: {
    points: PaymentsCalendarPoint[];
  };
  upcoming: UpcomingPayment[];
  vendors: VendorRow[];
  recent: RecentPayment[];
};

const acme: PagosDashboardData = {
  currency: "ARS",
  kpis: [
    {
      key: "totalPorPagar",
      label: "Total por pagar",
      value: 45230600,
      format: "money",
    },
    {
      key: "venceSemana",
      label: "Por vencer esta semana",
      value: 12450000,
      format: "money",
    },
    {
      key: "aprobacionesPendientes",
      label: "Aprobaciones pendientes",
      value: 9850000,
      format: "money",
      hint: "5 pagos pendientes",
    },
  ],
  calendar: {
    points: [
      { label: "28 May", scheduled: 420000, paid: 380000, overdue: 0 },
      { label: "30 May", scheduled: 780000, paid: 520000, overdue: 140000 },
      { label: "2 Jun", scheduled: 920000, paid: 610000, overdue: 0 },
      { label: "5 Jun", scheduled: 640000, paid: 430000, overdue: 0 },
      { label: "7 Jun", scheduled: 1200000, paid: 820000, overdue: 90000 },
      { label: "10 Jun", scheduled: 860000, paid: 720000, overdue: 0 },
      { label: "12 Jun", scheduled: 1450000, paid: 980000, overdue: 210000 },
      { label: "15 Jun", scheduled: 740000, paid: 610000, overdue: 0 },
      { label: "17 Jun", scheduled: 980000, paid: 820000, overdue: 0 },
      { label: "20 Jun", scheduled: 1100000, paid: 760000, overdue: 120000 },
      { label: "22 Jun", scheduled: 880000, paid: 690000, overdue: 0 },
      { label: "24 Jun", scheduled: 1320000, paid: 910000, overdue: 0 },
      { label: "27 Jun", scheduled: 950000, paid: 830000, overdue: 70000 },
    ],
  },
  upcoming: [
    {
      id: "u1",
      date: "2026-05-21",
      vendor: "Distribuidora del Sur S.A.",
      description: "Factura A-0001445",
      amount: 3850600,
    },
    {
      id: "u2",
      date: "2026-05-21",
      vendor: "YPF S.A.",
      description: "Factura B-0000987",
      amount: 2450000,
    },
    {
      id: "u3",
      date: "2026-05-22",
      vendor: "Metrogas S.A.",
      description: "Factura C-001234",
      amount: 1980000,
    },
    {
      id: "u4",
      date: "2026-05-23",
      vendor: "Telecom Argentina",
      description: "Factura F-005678",
      amount: 1650000,
    },
    {
      id: "u5",
      date: "2026-05-24",
      vendor: "Tarjeta Visa Corporativa",
      description: "Resumen 06/2024",
      amount: 1120000,
    },
  ],
  vendors: [
    { id: "v1", vendor: "Distribuidora del Sur S.A.", pendingCount: 2, amount: 8250000 },
    { id: "v2", vendor: "YPF S.A.", pendingCount: 1, amount: 2450000 },
    { id: "v3", vendor: "Telecom Argentina", pendingCount: 1, amount: 2140000 },
    { id: "v4", vendor: "Mercado Libre S.R.L.", pendingCount: 1, amount: 1890000 },
    { id: "v5", vendor: "Sancor Seguros", pendingCount: 1, amount: 1450000 },
  ],
  recent: [
    {
      id: "r1",
      date: "2026-05-21",
      vendor: "Google Cloud",
      method: "Transferencia",
      amount: 1250000,
      status: "Pagado",
    },
    {
      id: "r2",
      date: "2026-05-21",
      vendor: "Microsoft",
      method: "Débito en cuenta",
      amount: 850000,
      status: "Pagado",
    },
    {
      id: "r3",
      date: "2026-05-20",
      vendor: "YPF S.A.",
      method: "Transferencia",
      amount: 2450000,
      status: "Programado",
    },
    {
      id: "r4",
      date: "2026-05-20",
      vendor: "Aysa S.A.",
      method: "Débito en cuenta",
      amount: 680000,
      status: "Pagado",
    },
    {
      id: "r5",
      date: "2026-05-19",
      vendor: "Correo Argentino",
      method: "Transferencia",
      amount: 420000,
      status: "Vencido",
    },
  ],
};

const northwind: PagosDashboardData = {
  currency: "USD",
  kpis: [
    { key: "totalPorPagar", label: "Total por pagar", value: 18240, format: "money" },
    { key: "venceSemana", label: "Por vencer esta semana", value: 5420, format: "money" },
    { key: "aprobacionesPendientes", label: "Aprobaciones pendientes", value: 2100, format: "money", hint: "2 pagos pendientes" },
  ],
  calendar: {
    points: [
      { label: "28 May", scheduled: 120, paid: 90, overdue: 0 },
      { label: "30 May", scheduled: 260, paid: 140, overdue: 40 },
      { label: "2 Jun", scheduled: 300, paid: 180, overdue: 0 },
      { label: "5 Jun", scheduled: 220, paid: 150, overdue: 0 },
      { label: "7 Jun", scheduled: 340, paid: 260, overdue: 20 },
      { label: "10 Jun", scheduled: 280, paid: 240, overdue: 0 },
      { label: "12 Jun", scheduled: 410, paid: 300, overdue: 60 },
      { label: "15 Jun", scheduled: 210, paid: 170, overdue: 0 },
      { label: "17 Jun", scheduled: 320, paid: 260, overdue: 0 },
      { label: "20 Jun", scheduled: 360, paid: 240, overdue: 40 },
      { label: "22 Jun", scheduled: 280, paid: 210, overdue: 0 },
      { label: "24 Jun", scheduled: 390, paid: 290, overdue: 0 },
      { label: "27 Jun", scheduled: 310, paid: 270, overdue: 20 },
    ],
  },
  upcoming: [
    { id: "nu1", date: "2026-05-21", vendor: "NimbusCloud", description: "Cloud services", amount: 980 },
    { id: "nu2", date: "2026-05-22", vendor: "Payroll Co.", description: "Payroll", amount: 2100 },
    { id: "nu3", date: "2026-05-24", vendor: "Downtown Properties", description: "Office rent", amount: 1550 },
  ],
  vendors: [
    { id: "nv1", vendor: "NimbusCloud", pendingCount: 1, amount: 980 },
    { id: "nv2", vendor: "Payroll Co.", pendingCount: 1, amount: 2100 },
    { id: "nv3", vendor: "Downtown Properties", pendingCount: 1, amount: 1550 },
  ],
  recent: [
    { id: "nr1", date: "2026-05-21", vendor: "NimbusCloud", method: "ACH", amount: 980, status: "Pagado" },
    { id: "nr2", date: "2026-05-20", vendor: "Payroll Co.", method: "Wire", amount: 2100, status: "Programado" },
    { id: "nr3", date: "2026-05-19", vendor: "Downtown Properties", method: "ACH", amount: 1550, status: "Vencido" },
  ],
};

export const mockPagosByCompanyId: Record<string, PagosDashboardData> = {
  "acme-ar": acme,
  "north-us": northwind,
};

