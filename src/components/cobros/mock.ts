import type { CurrencyCode } from "@/components/inicio/mock";

export type CobrosKpiKey =
  | "totalPorCobrar"
  | "vencido"
  | "cobradoMes"
  | "tasaCobranza"
  | "facturasPendientes";

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

export type CollectionsEvolutionPoint = {
  label: string; // e.g. 28 May, 2 Jun, ...
  collected: number;
  goal: number;
};

export type CollectionsAlert = {
  key:
    | "facturasVencidas"
    | "porVencer7"
    | "altaDeuda"
    | "sinMovimiento30"
    | "recordatorios";
  title: string;
  description: string;
  count: number;
  severity: "high" | "medium" | "low";
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

export type CollectionsActivityType =
  | "Pago_recibido"
  | "Recordatorio_enviado"
  | "Link_de_pago"
  | "Factura_vencida";

export type CollectionsActivity = {
  id: string;
  timestamp: string; // ISO
  description: string;
  amount?: number;
  type: CollectionsActivityType;
};

export type CobrosDashboardData = {
  kpis: CobrosKpi[];
  aging: {
    total: number;
    items: DebtAgingItem[];
  };
  evolution: {
    points: CollectionsEvolutionPoint[];
  };
  alerts: CollectionsAlert[];
  customers: CustomerReceivable[];
  invoices: PendingInvoice[];
  activity: CollectionsActivity[];
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
      label: "Vencido",
      value: 18540800,
      format: "money",
      deltaPct: 12.7,
      hint: "vs. 30 días ant.",
    },
    {
      key: "cobradoMes",
      label: "Cobrado este mes",
      value: 24250600,
      format: "money",
      deltaPct: 18.4,
      hint: "vs. mismo mes ant.",
    },
    {
      key: "tasaCobranza",
      label: "Tasa de cobranza",
      value: 78.4,
      format: "percent",
      deltaPct: 6.1,
      hint: "pp vs. 30 días ant.",
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
  evolution: {
    points: [
      { label: "28 May", collected: 820000, goal: 900000 },
      { label: "2 Jun", collected: 1120000, goal: 980000 },
      { label: "7 Jun", collected: 980000, goal: 1030000 },
      { label: "12 Jun", collected: 1240000, goal: 1120000 },
      { label: "17 Jun", collected: 1010000, goal: 1180000 },
      { label: "22 Jun", collected: 1320000, goal: 1230000 },
      { label: "27 Jun", collected: 1290000, goal: 1280000 },
    ],
  },
  alerts: [
    {
      key: "facturasVencidas",
      title: "Facturas vencidas",
      description: "18 facturas por $ 18.540.800",
      count: 18,
      severity: "high",
    },
    {
      key: "porVencer7",
      title: "Por vencer en 7 días",
      description: "12 facturas por $ 9.250.000",
      count: 12,
      severity: "medium",
    },
    {
      key: "altaDeuda",
      title: "Clientes con alta deuda",
      description: "5 clientes por $ 12.800.300",
      count: 5,
      severity: "medium",
    },
    {
      key: "sinMovimiento30",
      title: "Sin movimiento > 30 días",
      description: "7 clientes",
      count: 7,
      severity: "low",
    },
    {
      key: "recordatorios",
      title: "Recordatorios programados",
      description: "24 recordatorios pendientes",
      count: 24,
      severity: "low",
    },
  ],
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
  activity: [
    {
      id: "a1",
      timestamp: "2026-04-29T12:35:00Z",
      type: "Pago_recibido",
      description: "Pago recibido de Factura Fácil S.R.L.",
      amount: 2450000,
    },
    {
      id: "a2",
      timestamp: "2026-04-29T09:18:00Z",
      type: "Recordatorio_enviado",
      description: "Recordatorio enviado a Distribuidora del Sur S.A.",
    },
    {
      id: "a3",
      timestamp: "2026-04-28T17:42:00Z",
      type: "Pago_recibido",
      description: "Pago recibido de Pampa Comercial S.A.",
      amount: 1380000,
    },
    {
      id: "a4",
      timestamp: "2026-04-28T08:21:00Z",
      type: "Factura_vencida",
      description: "Factura vencida: A-0002481 a Distribuidora del Sur S.A.",
    },
    {
      id: "a5",
      timestamp: "2026-04-27T14:11:00Z",
      type: "Link_de_pago",
      description: "Link de pago creado para Valmart Chile S.A.",
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
      label: "Vencido",
      value: 9850,
      format: "money",
      deltaPct: 8.6,
      hint: "vs. 30 días ant.",
    },
    {
      key: "cobradoMes",
      label: "Cobrado este mes",
      value: 17640,
      format: "money",
      deltaPct: 5.1,
      hint: "vs. mismo mes ant.",
    },
    {
      key: "tasaCobranza",
      label: "Tasa de cobranza",
      value: 82.1,
      format: "percent",
      deltaPct: 1.7,
      hint: "pp vs. 30 días ant.",
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
  evolution: {
    points: [
      { label: "28 May", collected: 480, goal: 520 },
      { label: "2 Jun", collected: 610, goal: 560 },
      { label: "7 Jun", collected: 540, goal: 590 },
      { label: "12 Jun", collected: 680, goal: 630 },
      { label: "17 Jun", collected: 590, goal: 650 },
      { label: "22 Jun", collected: 720, goal: 690 },
      { label: "27 Jun", collected: 740, goal: 720 },
    ],
  },
  alerts: [
    {
      key: "facturasVencidas",
      title: "Facturas vencidas",
      description: "4 invoices totaling $ 9,850",
      count: 4,
      severity: "high",
    },
    {
      key: "porVencer7",
      title: "Por vencer en 7 días",
      description: "3 invoices totaling $ 4,120",
      count: 3,
      severity: "medium",
    },
    {
      key: "altaDeuda",
      title: "Clientes con alta deuda",
      description: "2 customers totaling $ 6,300",
      count: 2,
      severity: "medium",
    },
    {
      key: "sinMovimiento30",
      title: "Sin movimiento > 30 días",
      description: "2 customers",
      count: 2,
      severity: "low",
    },
    {
      key: "recordatorios",
      title: "Recordatorios programados",
      description: "8 reminders pending",
      count: 8,
      severity: "low",
    },
  ],
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
  activity: [
    {
      id: "na1",
      timestamp: "2026-04-29T10:05:00Z",
      type: "Pago_recibido",
      description: "Payment received — Bluebird Retail",
      amount: 1980,
    },
    {
      id: "na2",
      timestamp: "2026-04-29T08:14:00Z",
      type: "Recordatorio_enviado",
      description: "Reminder sent — Contoso",
    },
    {
      id: "na3",
      timestamp: "2026-04-28T17:40:00Z",
      type: "Link_de_pago",
      description: "Payment link created — Tailspin Toys",
    },
    {
      id: "na4",
      timestamp: "2026-04-28T08:10:00Z",
      type: "Factura_vencida",
      description: "Invoice overdue — N-552",
    },
  ],
};

export const mockCobrosByCompanyId: Record<string, CobrosDashboardData> = {
  "acme-ar": acme,
  "north-us": northwind,
};

