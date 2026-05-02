import type { CurrencyCode } from "@/components/inicio/mock";

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

export type ScheduledTransferStatus = "Pendiente" | "Programada" | "Rechazada";

export type ScheduledTransferRow = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  beneficiary: string;
  concept: string;
  amount: number;
  status: ScheduledTransferStatus;
};

export type TesoreriaDashboardData = {
  currency: CurrencyCode;
  kpis: TesoreriaKpi[];
  bankBalances: BankBalanceRow[];
  scheduledTransfers: ScheduledTransferRow[];
};

const acme: TesoreriaDashboardData = {
  currency: "ARS",
  kpis: [
    {
      key: "posicionConsolidada",
      label: "Posición consolidada",
      format: "money",
      value: 28458750,
    },
    {
      key: "bancosConectados",
      label: "Bancos conectados",
      format: "count",
      value: 5,
      hint: "Actualizado hace 5 min",
    },
    {
      key: "exposicionPorBanco",
      label: "Mayor exposición bancaria",
      format: "text",
      value: "BBVA 36,6%",
      hint: "Mayor concentración",
    },
  ],
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
};

const northwind: TesoreriaDashboardData = {
  currency: "USD",
  kpis: [
    {
      key: "posicionConsolidada",
      label: "Posición consolidada",
      format: "money",
      value: 84250,
    },
    {
      key: "bancosConectados",
      label: "Bancos conectados",
      format: "count",
      value: 3,
      hint: "Updated 6 min ago",
    },
    {
      key: "exposicionPorBanco",
      label: "Mayor exposición bancaria",
      format: "text",
      value: "Chase 41,2%",
      hint: "Top concentration",
    },
  ],
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
};

export const mockTesoreriaByCompanyId: Record<string, TesoreriaDashboardData> = {
  "acme-ar": acme,
  "north-us": northwind,
};
