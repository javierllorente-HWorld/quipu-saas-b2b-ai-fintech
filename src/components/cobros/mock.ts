import type { CurrencyCode } from "@/components/inicio/mock";

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
  dueDate: string; // ISO yyyy-mm-dd
  amount: number;
  status: InvoiceStatus;
};

export type RecentCollection = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  amount: number;
  bankAccountName?: string;
  source?: string;
};

export type CobrosDashboardData = {
  kpis: CobrosKpi[];
  aging: {
    total: number;
    items: DebtAgingItem[];
  };
  customers: CustomerReceivable[];
  invoices: PendingInvoice[];
  recentCollections?: RecentCollection[];
  currency: CurrencyCode;
};

const acme: CobrosDashboardData = {
  currency: "ARS",
  kpis: [
    {
      key: "totalPorCobrar",
      label: "Total por cobrar",
      value: 96430200,
      format: "money",
      deltaPct: 5.2,
      hint: "vs. 30 días ant.",
    },
    {
      key: "vencido",
      label: "Monto vencido",
      value: 18540800,
      format: "money",
      deltaPct: 12.7,
      hint: "vs. 30 días ant.",
    },
    {
      key: "facturasPendientes",
      label: "Facturas pendientes",
      value: 58,
      format: "count",
      deltaPct: -3,
      hint: "vs. 30 días ant.",
    },
  ],
  aging: {
    total: 96430200,
    items: [
      { key: "noVencido", label: "No vencido (0-30 días)", amount: 45320600 },
      { key: "vencido31_60", label: "Vencido 31-60 días", amount: 21540300 },
      { key: "vencido61_90", label: "Vencido 61-90 días", amount: 13280900 },
      { key: "vencido90p", label: "Vencido > 90 días", amount: 16288399 },
    ],
  },
  customers: [
    {
      id: "c1",
      name: "Distribuidora del Sur S.A.",
      total: 18950000,
      overdue: 2150000,
    },
    { id: "c2", name: "Factura Fácil S.R.L.", total: 12408000, overdue: 2150000 },
    { id: "c3", name: "Pampa Comercial S.A.", total: 9780000, overdue: 1980000 },
    { id: "c4", name: "Valmart Chile S.A.", total: 7640500, overdue: 0 },
    {
      id: "c5",
      name: "Tecnología & Sistemas S.A.",
      total: 6350800,
      overdue: 1260800,
    },
  ],
  invoices: [
    {
      id: "i1",
      invoice: "A-0002434",
      customer: "Distribuidora del Sur S.A.",
      dueDate: "2026-05-18",
      amount: 2450000,
      status: "Vencida",
    },
    {
      id: "i2",
      invoice: "A-0002481",
      customer: "Factura Fácil S.R.L.",
      dueDate: "2026-05-24",
      amount: 1850000,
      status: "Vencida",
    },
    {
      id: "i3",
      invoice: "A-0002519",
      customer: "Pampa Comercial S.A.",
      dueDate: "2026-05-28",
      amount: 1620000,
      status: "Pendiente",
    },
    {
      id: "i4",
      invoice: "A-0002533",
      customer: "Industrias Patagonia S.R.L.",
      dueDate: "2026-05-31",
      amount: 1380000,
      status: "Por_vencer",
    },
    {
      id: "i5",
      invoice: "A-0002550",
      customer: "Comercial Norte S.R.L.",
      dueDate: "2026-06-03",
      amount: 1250000,
      status: "Por_vencer",
    },
  ],
};

const northwind: CobrosDashboardData = {
  currency: "USD",
  kpis: [
    {
      key: "totalPorCobrar",
      label: "Total por cobrar",
      value: 48250,
      format: "money",
      deltaPct: 2.4,
      hint: "vs. 30 días ant.",
    },
    {
      key: "vencido",
      label: "Monto vencido",
      value: 9850,
      format: "money",
      deltaPct: 8.6,
      hint: "vs. 30 días ant.",
    },
    {
      key: "facturasPendientes",
      label: "Facturas pendientes",
      value: 16,
      format: "count",
      deltaPct: -1,
      hint: "vs. 30 días ant.",
    },
  ],
  aging: {
    total: 48250,
    items: [
      { key: "noVencido", label: "No vencido (0-30 días)", amount: 23600 },
      { key: "vencido31_60", label: "Vencido 31-60 días", amount: 10450 },
      { key: "vencido61_90", label: "Vencido 61-90 días", amount: 7600 },
      { key: "vencido90p", label: "Vencido > 90 días", amount: 6600 },
    ],
  },
  customers: [
    { id: "nc1", name: "Bluebird Retail", total: 15450, overdue: 3200 },
    { id: "nc2", name: "Contoso", total: 12800, overdue: 4100 },
    { id: "nc3", name: "Fabrikam", total: 9200, overdue: 0 },
    { id: "nc4", name: "Tailspin Toys", total: 6800, overdue: 2550 },
  ],
  invoices: [
    {
      id: "ni1",
      invoice: "N-552",
      customer: "Bluebird Retail",
      dueDate: "2026-05-16",
      amount: 3980,
      status: "Vencida",
    },
    {
      id: "ni2",
      invoice: "N-557",
      customer: "Contoso",
      dueDate: "2026-05-27",
      amount: 1550,
      status: "Pendiente",
    },
    {
      id: "ni3",
      invoice: "N-561",
      customer: "Tailspin Toys",
      dueDate: "2026-06-01",
      amount: 2100,
      status: "Por_vencer",
    },
  ],
};

export const mockCobrosByCompanyId: Record<string, CobrosDashboardData> = {
  "acme-ar": acme,
  "north-us": northwind,
};

