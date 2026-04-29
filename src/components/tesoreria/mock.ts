import type { CurrencyCode } from "@/components/inicio/mock";

export type TesoreriaKpiKey =
  | "posicionConsolidada"
  | "liquidez7d"
  | "bancosConectados"
  | "transferenciasHoy"
  | "exposicionPorBanco";

export type TesoreriaKpi = {
  key: TesoreriaKpiKey;
  label: string;
  format: "money" | "count" | "text";
  value: number | string;
  deltaPct?: number;
  hint?: string;
};

export type PositionPoint = {
  label: string; // e.g. 28 May
  consolidated: number;
  projection7d: number;
  expectedMin: number;
  expectedMax: number;
};

export type BankDistributionItem = {
  id: string;
  bank: string;
  pct: number; // 0..1
  amount: number;
};

export type BankBalanceRow = {
  id: string;
  bank: string;
  account: string;
  available: number;
  status: "Activa" | "Inactiva";
};

export type ScheduledTransferStatus = "Pendiente" | "Programada" | "Rechazada";

export type ScheduledTransferRow = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  beneficiary: string;
  concept: string;
  amount: number;
  status: ScheduledTransferStatus;
};

export type TreasuryMovementRow = {
  id: string;
  timestamp: string; // ISO
  description: string;
  bank: string;
  amount: number; // +/- movement
  balance: number;
};

export type TesoreriaDashboardData = {
  currency: CurrencyCode;
  kpis: TesoreriaKpi[];
  position: {
    series: PositionPoint[];
  };
  bankDistribution: {
    total: number;
    items: BankDistributionItem[];
  };
  bankBalances: BankBalanceRow[];
  scheduledTransfers: ScheduledTransferRow[];
  movements: TreasuryMovementRow[];
};

const acme: TesoreriaDashboardData = {
  currency: "ARS",
  kpis: [
    {
      key: "posicionConsolidada",
      label: "Posición consolidada",
      format: "money",
      value: 28458750,
      deltaPct: 12.4,
      hint: "vs. ayer",
    },
    {
      key: "liquidez7d",
      label: "Liquidez 7 días",
      format: "money",
      value: 18975300,
      deltaPct: 8.7,
      hint: "vs. mismo período ant.",
    },
    {
      key: "bancosConectados",
      label: "Bancos conectados",
      format: "count",
      value: 5,
      hint: "Actualizado hace 5 min",
    },
    {
      key: "transferenciasHoy",
      label: "Transferencias hoy",
      format: "money",
      value: 3245000,
      deltaPct: 15.2,
      hint: "vs. ayer",
    },
    {
      key: "exposicionPorBanco",
      label: "Exposición por banco",
      format: "text",
      value: "BBVA 36,6%",
      hint: "Mayor concentración",
    },
  ],
  position: {
    series: [
      {
        label: "28 May",
        consolidated: 20500000,
        projection7d: 21500000,
        expectedMin: 19500000,
        expectedMax: 23500000,
      },
      {
        label: "29 May",
        consolidated: 22800000,
        projection7d: 23200000,
        expectedMin: 21000000,
        expectedMax: 25000000,
      },
      {
        label: "30 May",
        consolidated: 21450000,
        projection7d: 22600000,
        expectedMin: 20500000,
        expectedMax: 24800000,
      },
      {
        label: "31 May",
        consolidated: 23600000,
        projection7d: 24200000,
        expectedMin: 22200000,
        expectedMax: 26200000,
      },
      {
        label: "1 Jun",
        consolidated: 19800000,
        projection7d: 26000000,
        expectedMin: 18800000,
        expectedMax: 26800000,
      },
      {
        label: "2 Jun",
        consolidated: 21400000,
        projection7d: 28400000,
        expectedMin: 20200000,
        expectedMax: 30000000,
      },
      {
        label: "3 Jun",
        consolidated: 20800000,
        projection7d: 27200000,
        expectedMin: 19800000,
        expectedMax: 29200000,
      },
      {
        label: "4 Jun",
        consolidated: 21600000,
        projection7d: 28800000,
        expectedMin: 20500000,
        expectedMax: 30500000,
      },
    ],
  },
  bankDistribution: {
    total: 28458750,
    items: [
      { id: "b1", bank: "BBVA Argentina", pct: 0.366, amount: 10408750 },
      { id: "b2", bank: "Banco Galicia", pct: 0.233, amount: 6618750 },
      { id: "b3", bank: "Banco Santander", pct: 0.186, amount: 5291250 },
      { id: "b4", bank: "Banco Macro", pct: 0.121, amount: 3443750 },
      { id: "b5", bank: "Mercado Pago", pct: 0.094, amount: 2696250 },
    ],
  },
  bankBalances: [
    {
      id: "bbva",
      bank: "BBVA Argentina",
      account: "Cuenta Corriente",
      available: 11250300,
      status: "Activa",
    },
    {
      id: "galicia",
      bank: "Banco Galicia",
      account: "Cuenta Corriente",
      available: 5780000,
      status: "Activa",
    },
    {
      id: "santander",
      bank: "Banco Santander",
      account: "Cuenta Corriente",
      available: 3945000,
      status: "Activa",
    },
    {
      id: "macro",
      bank: "Banco Macro",
      account: "Cuenta Corriente",
      available: 2450000,
      status: "Activa",
    },
    {
      id: "mp",
      bank: "Mercado Pago",
      account: "Cuenta Digital",
      available: 1550000,
      status: "Activa",
    },
  ],
  scheduledTransfers: [
    {
      id: "t1",
      date: "2026-05-22",
      beneficiary: "Proveedores del Sur S.A.",
      concept: "Pago a proveedores",
      amount: -2540000,
      status: "Pendiente",
    },
    {
      id: "t2",
      date: "2026-05-23",
      beneficiary: "Distribuidora del Norte",
      concept: "Pago a proveedores",
      amount: -1860000,
      status: "Pendiente",
    },
    {
      id: "t3",
      date: "2026-05-24",
      beneficiary: "Servicios Cloud S.R.L.",
      concept: "Servicios IT",
      amount: -680000,
      status: "Programada",
    },
    {
      id: "t4",
      date: "2026-05-26",
      beneficiary: "Aseguradora SegurAr",
      concept: "Póliza mensual",
      amount: -320000,
      status: "Programada",
    },
    {
      id: "t5",
      date: "2026-05-27",
      beneficiary: "AFIP - IVA",
      concept: "Impuestos",
      amount: -1120000,
      status: "Programada",
    },
  ],
  movements: [
    {
      id: "m1",
      timestamp: "2026-05-21T14:32:00Z",
      description: "Transferencia recibida",
      bank: "BBVA",
      amount: 2350000,
      balance: 28458750,
    },
    {
      id: "m2",
      timestamp: "2026-05-21T11:05:00Z",
      description: "Cobro — Factura A-002345",
      bank: "Galicia",
      amount: 1950000,
      balance: 26108750,
    },
    {
      id: "m3",
      timestamp: "2026-05-21T07:22:00Z",
      description: "Pago a proveedores",
      bank: "Santander",
      amount: -2450000,
      balance: 24158750,
    },
    {
      id: "m4",
      timestamp: "2026-05-20T18:10:00Z",
      description: "Pago servicios",
      bank: "Macro",
      amount: -320000,
      balance: 26608750,
    },
    {
      id: "m5",
      timestamp: "2026-05-19T16:45:00Z",
      description: "Cobro — Nota de crédito",
      bank: "BBVA",
      amount: 1150000,
      balance: 26928750,
    },
  ],
};

const northwind: TesoreriaDashboardData = {
  currency: "USD",
  kpis: [
    {
      key: "posicionConsolidada",
      label: "Posición consolidada",
      format: "money",
      value: 84250,
      deltaPct: 4.6,
      hint: "vs. yesterday",
    },
    {
      key: "liquidez7d",
      label: "Liquidez 7 días",
      format: "money",
      value: 56900,
      deltaPct: 2.1,
      hint: "vs. previous period",
    },
    {
      key: "bancosConectados",
      label: "Bancos conectados",
      format: "count",
      value: 3,
      hint: "Updated 6 min ago",
    },
    {
      key: "transferenciasHoy",
      label: "Transferencias hoy",
      format: "money",
      value: 1240,
      deltaPct: 7.8,
      hint: "vs. yesterday",
    },
    {
      key: "exposicionPorBanco",
      label: "Exposición por banco",
      format: "text",
      value: "Chase 41,2%",
      hint: "Top concentration",
    },
  ],
  position: {
    series: [
      { label: "28 May", consolidated: 62000, projection7d: 64500, expectedMin: 59000, expectedMax: 69000 },
      { label: "29 May", consolidated: 65500, projection7d: 66800, expectedMin: 62000, expectedMax: 71000 },
      { label: "30 May", consolidated: 63800, projection7d: 66200, expectedMin: 61000, expectedMax: 70000 },
      { label: "31 May", consolidated: 69000, projection7d: 70500, expectedMin: 65000, expectedMax: 75000 },
      { label: "1 Jun", consolidated: 61000, projection7d: 73500, expectedMin: 58500, expectedMax: 76000 },
      { label: "2 Jun", consolidated: 64000, projection7d: 74800, expectedMin: 61000, expectedMax: 78000 },
      { label: "3 Jun", consolidated: 63200, projection7d: 74200, expectedMin: 60500, expectedMax: 77000 },
      { label: "4 Jun", consolidated: 65000, projection7d: 76000, expectedMin: 62000, expectedMax: 79000 },
    ],
  },
  bankDistribution: {
    total: 84250,
    items: [
      { id: "c1", bank: "Chase", pct: 0.412, amount: 34710 },
      { id: "c2", bank: "Bank of America", pct: 0.268, amount: 22579 },
      { id: "c3", bank: "Wells Fargo", pct: 0.198, amount: 16682 },
      { id: "c4", bank: "Stripe", pct: 0.122, amount: 10279 },
    ],
  },
  bankBalances: [
    { id: "cch", bank: "Chase", account: "Operating", available: 34710, status: "Activa" },
    { id: "cboa", bank: "Bank of America", account: "Operating", available: 22579, status: "Activa" },
    { id: "cwf", bank: "Wells Fargo", account: "Payroll", available: 16682, status: "Activa" },
    { id: "cst", bank: "Stripe", account: "Payouts", available: 10279, status: "Activa" },
  ],
  scheduledTransfers: [
    { id: "nt1", date: "2026-05-22", beneficiary: "Payroll Co.", concept: "Payroll batch", amount: -1200, status: "Pendiente" },
    { id: "nt2", date: "2026-05-24", beneficiary: "NimbusCloud", concept: "Cloud services", amount: -680, status: "Programada" },
  ],
  movements: [
    { id: "nm1", timestamp: "2026-05-21T14:32:00Z", description: "Wire received", bank: "Chase", amount: 2350, balance: 84250 },
    { id: "nm2", timestamp: "2026-05-21T11:05:00Z", description: "ACH deposit", bank: "Bank of America", amount: 1950, balance: 81900 },
    { id: "nm3", timestamp: "2026-05-21T07:22:00Z", description: "Vendor payment", bank: "Wells Fargo", amount: -2450, balance: 79950 },
  ],
};

export const mockTesoreriaByCompanyId: Record<string, TesoreriaDashboardData> = {
  "acme-ar": acme,
  "north-us": northwind,
};

