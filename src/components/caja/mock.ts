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
