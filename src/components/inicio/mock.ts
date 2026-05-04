export type CurrencyCode = "ARS" | "USD";

export type Company = {
  id: string;
  name: string;
  currency: CurrencyCode;
};

export type KpiKey =
  | "availableBalance"
  | "netFlow"
  | "accountsReceivable"
  | "accountsPayable"
  | "income";

export type Kpi = {
  key: KpiKey;
  label: string;
  value: number;
  deltaPct?: number; // positive/negative percentage vs previous period
  hint?: string;
};

export type CashflowPoint = {
  label: string;
  income: number;
  expenses: number;
  balance: number; // accumulated
};

export type AlertSeverity = "high" | "medium" | "low" | "ai";

export type AlertItem = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  ctaLabel: string;
};

export type UpcomingItemType = "Cobro" | "Pago";

export type UpcomingComputedStatus = "overdue" | "upcoming";

export type UpcomingItem = {
  id: string;
  type: UpcomingItemType;
  description: string;
  date: string; // ISO yyyy-mm-dd
  counterparty: string; // cliente/proveedor
  amount: number;
  computedStatus?: UpcomingComputedStatus;
};

export type ActivityItem = {
  id: string;
  timestamp: string; // ISO
  description: string;
  amount: number;
  type: "Ingreso" | "Egreso";
};

export const mockAcmeCompany: Company = {
  id: "acme-ar",
  name: "ACME PyME S.A.",
  currency: "ARS",
};

export const mockCompanies: Company[] = [mockAcmeCompany];

type DashboardData = {
  kpis: Kpi[];
  cashflow: CashflowPoint[];
  alerts: AlertItem[];
  upcoming: UpcomingItem[];
  activity: ActivityItem[];
  copilotSuggestions: string[];
};

const baseSuggestions = [
  "¿Cuánto puedo pagar esta semana sin quedarme sin caja?",
  "Mostrame los clientes con mayor mora.",
  "¿Qué pago puedo reprogramar para mejorar el flujo?",
  "¿Cuáles son los principales riesgos para los próximos 30 días?",
];

export const mockDashboardByCompanyId: Record<string, DashboardData> = {
  "acme-ar": {
    kpis: [
      {
        key: "availableBalance",
        label: "Saldo total disponible",
        value: 28458750,
        deltaPct: 12.4,
        hint: "En bancos + caja",
      },
      {
        key: "netFlow",
        label: "Flujo neto",
        value: 1850000,
        deltaPct: 12.1,
        hint: "Últimos 30 días",
      },
      {
        key: "accountsReceivable",
        label: "Cuentas por cobrar",
        value: 6420000,
        deltaPct: -2.4,
        hint: "Clientes",
      },
      {
        key: "accountsPayable",
        label: "Cuentas por pagar",
        value: 3980000,
        deltaPct: 5.2,
        hint: "Proveedores",
      },
      {
        key: "income",
        label: "Ingresos",
        value: 12430000,
        deltaPct: 7.6,
        hint: "Últimos 30 días",
      },
    ],
    cashflow: [
      { label: "Ene", income: 3200000, expenses: 2600000, balance: 7400000 },
      { label: "Feb", income: 2950000, expenses: 2780000, balance: 7570000 },
      { label: "Mar", income: 3550000, expenses: 3010000, balance: 8110000 },
      { label: "Abr", income: 4100000, expenses: 3290000, balance: 8920000 },
      { label: "May", income: 3850000, expenses: 3180000, balance: 9590000 },
      { label: "Jun", income: 4400000, expenses: 3450000, balance: 10540000 },
      { label: "Jul", income: 4680000, expenses: 3565000, balance: 11655000 },
    ],
    alerts: [
      {
        id: "a1",
        title: "Pagos por vencer (48h)",
        description: "3 pagos próximos por ARS 1.240.000.",
        severity: "high",
        ctaLabel: "Ver pagos",
      },
      {
        id: "a2",
        title: "Clientes por cobrar",
        description: "2 facturas vencidas por ARS 780.000.",
        severity: "medium",
        ctaLabel: "Gestionar cobros",
      },
      {
        id: "a3",
        title: "Desvío de caja",
        description: "Egresos 9% arriba del promedio semanal.",
        severity: "low",
        ctaLabel: "Analizar",
      },
      {
        id: "a4",
        title: "Aprobaciones pendientes",
        description: "1 pago requiere aprobación (ARS 420.000).",
        severity: "medium",
        ctaLabel: "Revisar",
      },
      {
        id: "a5",
        title: "Recomendación IA",
        description:
          "Sugerencia: reprogramar un pago no crítico para mejorar el saldo a 7 días.",
        severity: "ai",
        ctaLabel: "Abrir Copiloto",
      },
    ],
    upcoming: [
      {
        id: "u1",
        type: "Cobro",
        description: "Factura #1842",
        date: "2026-05-02",
        counterparty: "Cliente: Ferretería San Juan",
        amount: 560000,
      },
      {
        id: "u2",
        type: "Pago",
        description: "Servicios cloud (abril)",
        date: "2026-05-03",
        counterparty: "Proveedor: NimbusCloud",
        amount: 320000,
      },
      {
        id: "u3",
        type: "Pago",
        description: "Alquiler oficina",
        date: "2026-05-05",
        counterparty: "Proveedor: Inmobiliaria Delta",
        amount: 420000,
      },
      {
        id: "u4",
        type: "Cobro",
        description: "Suscripción mensual",
        date: "2026-05-06",
        counterparty: "Cliente: Estudio Contable Ríos",
        amount: 180000,
      },
      {
        id: "u5",
        type: "Pago",
        description: "Internet corporativo",
        date: "2026-05-07",
        counterparty: "Proveedor: FibraNet",
        amount: 95000,
      },
      {
        id: "u6",
        type: "Cobro",
        description: "Factura #1843",
        date: "2026-05-08",
        counterparty: "Cliente: Distribuidora Norte",
        amount: 740000,
      },
      {
        id: "u7",
        type: "Pago",
        description: "Software contable",
        date: "2026-06-09",
        counterparty: "Proveedor: ContaCloud",
        amount: 180000,
      },
      {
        id: "u8",
        type: "Cobro",
        description: "Servicio mensual",
        date: "2026-06-10",
        counterparty: "Cliente: Clínica San Martín",
        amount: 320000,
      },
      {
        id: "u9",
        type: "Pago",
        description: "Honorarios legales",
        date: "2026-06-11",
        counterparty: "Proveedor: Estudio Jurídico López",
        amount: 260000,
      },
    ],
    activity: [
      {
        id: "m1",
        timestamp: "2026-04-28T10:12:00Z",
        description: "Cobro recibido — Transferencia",
        amount: 245000,
        type: "Ingreso",
      },
      {
        id: "m2",
        timestamp: "2026-04-28T09:41:00Z",
        description: "Pago proveedor — Insumos",
        amount: 98000,
        type: "Egreso",
      },
      {
        id: "m3",
        timestamp: "2026-04-27T19:03:00Z",
        description: "Cobro recibido — Tarjeta",
        amount: 156000,
        type: "Ingreso",
      },
      {
        id: "m4",
        timestamp: "2026-04-27T16:22:00Z",
        description: "Pago impuestos — IVA",
        amount: 310000,
        type: "Egreso",
      },
    ],
    copilotSuggestions: baseSuggestions,
  },
  "north-us": {
    kpis: [
      {
        key: "availableBalance",
        label: "Saldo disponible",
        value: 84250,
        deltaPct: 2.2,
        hint: "Across accounts",
      },
      {
        key: "netFlow",
        label: "Flujo neto",
        value: 12400,
        deltaPct: -1.4,
        hint: "Last 30 days",
      },
      {
        key: "accountsReceivable",
        label: "Cuentas por cobrar",
        value: 28900,
        deltaPct: 3.9,
        hint: "Customers",
      },
      {
        key: "accountsPayable",
        label: "Cuentas por pagar",
        value: 17350,
        deltaPct: 1.1,
        hint: "Vendors",
      },
      {
        key: "income",
        label: "Ingresos",
        value: 96500,
        deltaPct: 5.3,
        hint: "Last 30 days",
      },
    ],
    cashflow: [
      { label: "Jan", income: 21000, expenses: 17600, balance: 53500 },
      { label: "Feb", income: 19800, expenses: 18250, balance: 55050 },
      { label: "Mar", income: 22600, expenses: 18900, balance: 58750 },
      { label: "Apr", income: 24400, expenses: 20350, balance: 62800 },
      { label: "May", income: 23100, expenses: 19700, balance: 66200 },
      { label: "Jun", income: 25500, expenses: 20500, balance: 71200 },
      { label: "Jul", income: 26900, expenses: 21450, balance: 76650 },
    ],
    alerts: [
      {
        id: "b1",
        title: "Pagos por vencer (48h)",
        description: "2 vendor payments totaling USD 4,120.",
        severity: "high",
        ctaLabel: "Ver pagos",
      },
      {
        id: "b2",
        title: "Clientes por cobrar",
        description: "1 invoice overdue (USD 1,980).",
        severity: "medium",
        ctaLabel: "Gestionar cobros",
      },
      {
        id: "b3",
        title: "Recomendación IA",
        description: "Tip: pull forward a receivable to reduce week-2 dip.",
        severity: "ai",
        ctaLabel: "Abrir Copiloto",
      },
      {
        id: "b4",
        title: "Aprobaciones pendientes",
        description: "1 approval needed (USD 1,200).",
        severity: "low",
        ctaLabel: "Revisar",
      },
      {
        id: "b5",
        title: "Desvío de caja",
        description: "Expenses 6% above trailing average.",
        severity: "low",
        ctaLabel: "Analizar",
      },
    ],
    upcoming: [
      {
        id: "v1",
        type: "Cobro",
        description: "Invoice #N-552",
        date: "2026-05-01",
        counterparty: "Cliente: Bluebird Retail",
        amount: 3980,
      },
      {
        id: "v2",
        type: "Pago",
        description: "Payroll",
        date: "2026-05-02",
        counterparty: "Proveedor: Payroll Co.",
        amount: 4120,
      },
      {
        id: "v3",
        type: "Pago",
        description: "Office rent",
        date: "2026-05-05",
        counterparty: "Proveedor: Downtown Properties",
        amount: 2200,
      },
      {
        id: "v4",
        type: "Cobro",
        description: "Subscription renewal",
        date: "2026-05-07",
        counterparty: "Cliente: Contoso",
        amount: 1550,
      },
    ],
    activity: [
      {
        id: "x1",
        timestamp: "2026-04-28T10:00:00Z",
        description: "Payment sent — Vendor",
        amount: 690,
        type: "Egreso",
      },
      {
        id: "x2",
        timestamp: "2026-04-28T08:15:00Z",
        description: "Deposit received — ACH",
        amount: 1980,
        type: "Ingreso",
      },
      {
        id: "x3",
        timestamp: "2026-04-27T18:30:00Z",
        description: "Payment sent — SaaS tools",
        amount: 240,
        type: "Egreso",
      },
      {
        id: "x4",
        timestamp: "2026-04-27T15:05:00Z",
        description: "Deposit received — Card",
        amount: 760,
        type: "Ingreso",
      },
    ],
    copilotSuggestions: baseSuggestions,
  },
};

