export type ReportesKpiKey =
  | "ingresosYtd"
  | "egresosYtd"
  | "margenOperativo"
  | "variacionMensual";

export type ReportesKpi = {
  key: ReportesKpiKey;
  label: string;
  format: "money" | "percent";
  value: number | null;
  deltaPct?: number;
  hint?: string;
};

export type IncomeExpenseRangeKey = "YTD" | "6M" | "12M";

export type IncomeExpensePoint = {
  label: string; // e.g. Ene
  ingresos: number;
  egresos: number;
  proyeccionIngresos?: number;
  proyeccionEgresos?: number;
};

export type IncomeExpenseDataset = {
  key: IncomeExpenseRangeKey;
  points: IncomeExpensePoint[];
};

export type ProfitabilityPoint = {
  label: string;
  margenOperativoPct: number;
  margenNetoPct: number;
};

export type UnitSummaryRow = {
  id: string;
  unidad: string;
  ingresos: number;
  egresos: number;
  margenOperativoPct: number;
  variacionYoYPct: number;
};

export type IndicatorStatus = "ok" | "warn" | "bad";

export type KeyIndicatorRow = {
  id: string;
  indicador: string;
  valorActual: string;
  objetivo: string;
  estado: IndicatorStatus;
};

export type RecentReportFormat = "PDF" | "XLSX";

export type RecentReportRow = {
  id: string;
  nombre: string;
  periodo: string;
  generado: string;
  formato: RecentReportFormat;
};
