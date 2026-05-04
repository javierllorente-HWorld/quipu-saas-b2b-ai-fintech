export type CashKpiKey =
  | "totalAvailable"
  | "availableToday"
  | "projection30d"
  | "connectedBanks";

export type CashKpi = {
  key: CashKpiKey;
  label: string;
  value: number;
  deltaPct?: number;
  hint?: string;
};

export type CashEvolutionPoint = {
  date: string; // ISO yyyy-mm-dd
  actual: number;
  projected: number;
};

export type CashDistributionKey =
  | "banks"
  | "cash"
  | "investments"
  | "inTransit"
  | "other";

export type CashDistributionItem = {
  key: CashDistributionKey;
  label: string;
  amount: number;
};

export type BankBalance = {
  id: string;
  bank: string;
  amount: number;
  pct: number; // 0..1
};

export type MovementType = "Ingreso" | "Egreso";

export type UpcomingComputedStatus = "overdue" | "upcoming";

export type UpcomingMovement = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  type: MovementType;
  amount: number;
  computedStatus?: UpcomingComputedStatus;
};

export type RecentMovement = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  bank: string;
  amount: number;
  balanceAfter: number;
};

export type CashPageData = {
  kpis: CashKpi[];
  evolution: CashEvolutionPoint[];
  distribution: CashDistributionItem[];
  bankBalances: BankBalance[];
  upcoming: UpcomingMovement[];
  recent: RecentMovement[];
};

function isoDateFromNow(daysFromToday: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildEvolution({
  startBalance,
  dailyChanges,
  projectedDailyChange,
}: {
  startBalance: number;
  dailyChanges: number[];
  projectedDailyChange: number;
}): CashEvolutionPoint[] {
  let bal = startBalance;
  const points: CashEvolutionPoint[] = [];
  for (let i = 0; i < dailyChanges.length; i++) {
    bal += dailyChanges[i] ?? 0;
    const projected = bal + projectedDailyChange * 7;
    points.push({
      date: isoDateFromNow(-(dailyChanges.length - 1 - i)),
      actual: bal,
      projected,
    });
  }
  return points;
}

export const mockCashByCompanyId: Record<string, CashPageData> = {
  "acme-ar": {
    kpis: [
      {
        key: "availableToday",
        label: "Disponible inmediato",
        value: 18975300,
        deltaPct: 8.7,
        hint: "Liquidez inmediata",
      },
      {
        key: "totalAvailable",
        label: "Saldo total disponible",
        value: 28458750,
        deltaPct: 12.4,
        hint: "En bancos + caja",
      },
      {
        key: "projection30d",
        label: "Saldo proyectado 30 días",
        value: 36210000,
        deltaPct: 9.6,
        hint: "Saldo esperado",
      },
    ],
    evolution: buildEvolution({
      startBalance: 23200000,
      dailyChanges: [
        220000, -145000, 180000, 95000, -210000, 140000, 175000, -80000,
        110000, 120000, -160000, 90000, 135000, -70000, 125000, 85000,
        -90000, 115000, 98000, -120000, 140000, 110000, -95000, 160000,
        105000, -115000, 175000, 120000, -85000, 140000,
      ],
      projectedDailyChange: 65000,
    }),
    distribution: [
      { key: "banks", label: "Disponible en bancos", amount: 18975300 },
      { key: "cash", label: "Efectivo en caja", amount: 1995000 },
      { key: "investments", label: "Inversiones a corto plazo", amount: 6380000 },
      { key: "inTransit", label: "En tránsito / otros", amount: 1108450 },
    ],
    bankBalances: [
      { id: "bbva", bank: "BBVA Argentina", amount: 11250300, pct: 0.395 },
      { id: "galicia", bank: "Banco Galicia", amount: 5780000, pct: 0.203 },
      { id: "santander", bank: "Banco Santander", amount: 3945000, pct: 0.139 },
      { id: "macro", bank: "Banco Macro", amount: 2450000, pct: 0.086 },
      { id: "mp", bank: "Mercado Pago", amount: 1550000, pct: 0.054 },
    ],
    upcoming: [
      {
        id: "up-1",
        date: isoDateFromNow(1),
        description: "Cobro — Factura A-00214",
        type: "Ingreso",
        amount: 1850000,
      },
      {
        id: "up-2",
        date: isoDateFromNow(2),
        description: "Pago a proveedor — Acero",
        type: "Egreso",
        amount: 2450000,
      },
      {
        id: "up-3",
        date: isoDateFromNow(3),
        description: "Pago sueldos",
        type: "Egreso",
        amount: 6200000,
      },
      {
        id: "up-4",
        date: isoDateFromNow(4),
        description: "Cobro — Suscripción mensual",
        type: "Ingreso",
        amount: 1980000,
      },
      {
        id: "up-5",
        date: isoDateFromNow(5),
        description: "Pago — API/Cloud",
        type: "Egreso",
        amount: 1120000,
      },
    ],
    recent: [
      {
        id: "rc-1",
        date: isoDateFromNow(0),
        description: "Cobro recibido — Transferencia",
        bank: "BBVA",
        amount: 235000,
        balanceAfter: 28458750,
      },
      {
        id: "rc-2",
        date: isoDateFromNow(0),
        description: "Pago a proveedor — Materiales",
        bank: "Galicia",
        amount: -112000,
        balanceAfter: 28223750,
      },
      {
        id: "rc-3",
        date: isoDateFromNow(-1),
        description: "Transferencia recibida",
        bank: "Santander",
        amount: 450000,
        balanceAfter: 28335750,
      },
      {
        id: "rc-4",
        date: isoDateFromNow(-1),
        description: "Pago servicios",
        bank: "Macro",
        amount: -320000,
        balanceAfter: 27885750,
      },
      {
        id: "rc-5",
        date: isoDateFromNow(-2),
        description: "Cobro por tarjeta",
        bank: "Mercado Pago",
        amount: 115000,
        balanceAfter: 28205750,
      },
    ],
  },
  "north-us": {
    kpis: [
      {
        key: "availableToday",
        label: "Disponible inmediato",
        value: 84250,
        deltaPct: 2.0,
        hint: "Immediate liquidity",
      },
      {
        key: "totalAvailable",
        label: "Saldo total disponible",
        value: 126430,
        deltaPct: 4.1,
        hint: "Across accounts",
      },
      {
        key: "projection30d",
        label: "Saldo proyectado 30 días",
        value: 143100,
        deltaPct: 3.7,
        hint: "Expected balance",
      },
    ],
    evolution: buildEvolution({
      startBalance: 72000,
      dailyChanges: [
        420, -180, 260, -120, 310, 205, -90, 145, 210, -160, 240, 180, -75,
        130, 220, -110, 260, 195, -140, 200, 175, -85, 240, 190, -95, 260,
        205, -120, 230, 210,
      ],
      projectedDailyChange: 160,
    }),
    distribution: [
      { key: "banks", label: "Disponible en bancos", amount: 84250 },
      { key: "cash", label: "Efectivo en caja", amount: 3200 },
      { key: "investments", label: "Inversiones a corto plazo", amount: 36100 },
      { key: "inTransit", label: "En tránsito / otros", amount: 2930 },
    ],
    bankBalances: [
      { id: "boa", bank: "Bank of America", amount: 48200, pct: 0.382 },
      { id: "chase", bank: "Chase", amount: 29750, pct: 0.235 },
      { id: "stripe", bank: "Stripe Balance", amount: 22300, pct: 0.176 },
    ],
    upcoming: [
      {
        id: "up-us-1",
        date: isoDateFromNow(1),
        description: "Deposit received — ACH",
        type: "Ingreso",
        amount: 3980,
      },
      {
        id: "up-us-2",
        date: isoDateFromNow(2),
        description: "Vendor payment — Payroll",
        type: "Egreso",
        amount: 4120,
      },
      {
        id: "up-us-3",
        date: isoDateFromNow(4),
        description: "Office rent",
        type: "Egreso",
        amount: 2200,
      },
    ],
    recent: [
      {
        id: "rc-us-1",
        date: isoDateFromNow(0),
        description: "Payment sent — Vendor",
        bank: "Chase",
        amount: -690,
        balanceAfter: 126430,
      },
      {
        id: "rc-us-2",
        date: isoDateFromNow(0),
        description: "Deposit received — Card",
        bank: "Stripe",
        amount: 760,
        balanceAfter: 127120,
      },
      {
        id: "rc-us-3",
        date: isoDateFromNow(-1),
        description: "Deposit received — ACH",
        bank: "Bank of America",
        amount: 1980,
        balanceAfter: 126360,
      },
    ],
  },
};

