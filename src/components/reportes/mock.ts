import type { CurrencyCode } from "@/components/inicio/mock";

export type ReportesKpiKey =
  | "ingresosYtd"
  | "egresosYtd"
  | "margenOperativo"
  | "variacionMensual";

export type ReportesKpi = {
  key: ReportesKpiKey;
  label: string;
  format: "money" | "percent";
  value: number;
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

export type ReportesDashboardData = {
  currency: CurrencyCode;
  kpis: ReportesKpi[];
  incomeExpense: {
    datasets: IncomeExpenseDataset[];
  };
  profitability: {
    points: ProfitabilityPoint[];
  };
  unitSummary: UnitSummaryRow[];
  keyIndicators: KeyIndicatorRow[];
  recentReports: RecentReportRow[];
};

const ytdPointsAr: IncomeExpensePoint[] = [
  { label: "Ene", ingresos: 18200000, egresos: 12400000, proyeccionIngresos: 20000000, proyeccionEgresos: 13200000 },
  { label: "Feb", ingresos: 17650000, egresos: 12150000, proyeccionIngresos: 19500000, proyeccionEgresos: 12900000 },
  { label: "Mar", ingresos: 19100000, egresos: 13020000, proyeccionIngresos: 20600000, proyeccionEgresos: 13800000 },
  { label: "Abr", ingresos: 20450000, egresos: 13870000, proyeccionIngresos: 21400000, proyeccionEgresos: 14500000 },
  { label: "May", ingresos: 21280000, egresos: 14290000, proyeccionIngresos: 22200000, proyeccionEgresos: 15100000 },
  { label: "Jun", ingresos: 22560000, egresos: 14810000, proyeccionIngresos: 23600000, proyeccionEgresos: 15600000 },
  { label: "Jul", ingresos: 23480000, egresos: 15360000, proyeccionIngresos: 24800000, proyeccionEgresos: 16200000 },
];

const sixMonthsAr: IncomeExpensePoint[] = ytdPointsAr.slice(-6);
const twelveMonthsAr: IncomeExpensePoint[] = [
  { label: "Ago", ingresos: 19800000, egresos: 13600000, proyeccionIngresos: 20600000, proyeccionEgresos: 14200000 },
  { label: "Sep", ingresos: 20500000, egresos: 13950000, proyeccionIngresos: 21200000, proyeccionEgresos: 14500000 },
  { label: "Oct", ingresos: 21450000, egresos: 14400000, proyeccionIngresos: 22100000, proyeccionEgresos: 15000000 },
  { label: "Nov", ingresos: 22120000, egresos: 14780000, proyeccionIngresos: 22900000, proyeccionEgresos: 15400000 },
  { label: "Dic", ingresos: 23350000, egresos: 15230000, proyeccionIngresos: 24100000, proyeccionEgresos: 15900000 },
  ...ytdPointsAr.slice(0, 7),
];

const profitabilityAr: ProfitabilityPoint[] = [
  { label: "Ene", margenOperativoPct: 28.4, margenNetoPct: 17.1 },
  { label: "Feb", margenOperativoPct: 27.8, margenNetoPct: 16.7 },
  { label: "Mar", margenOperativoPct: 29.2, margenNetoPct: 17.8 },
  { label: "Abr", margenOperativoPct: 30.1, margenNetoPct: 18.2 },
  { label: "May", margenOperativoPct: 28.9, margenNetoPct: 17.5 },
  { label: "Jun", margenOperativoPct: 29.7, margenNetoPct: 17.9 },
  { label: "Jul", margenOperativoPct: 29.7, margenNetoPct: 17.6 },
];

const acme: ReportesDashboardData = {
  currency: "ARS",
  kpis: [
    {
      key: "ingresosYtd",
      label: "Ingresos YTD",
      format: "money",
      value: 152680900,
      deltaPct: 14.8,
      hint: "vs. mismo período ant.",
    },
    {
      key: "egresosYtd",
      label: "Egresos YTD",
      format: "money",
      value: 107450300,
      deltaPct: -9.2,
      hint: "vs. mismo período ant.",
    },
    {
      key: "margenOperativo",
      label: "Margen operativo",
      format: "percent",
      value: 29.7,
      deltaPct: 3.6,
      hint: "vs. mismo período ant.",
    },
    {
      key: "variacionMensual",
      label: "Variación mensual",
      format: "percent",
      value: 6.3,
      hint: "vs. mes anterior",
    },
  ],
  incomeExpense: {
    datasets: [
      { key: "YTD", points: ytdPointsAr },
      { key: "6M", points: sixMonthsAr },
      { key: "12M", points: twelveMonthsAr },
    ],
  },
  profitability: {
    points: profitabilityAr,
  },
  unitSummary: [
    {
      id: "u1",
      unidad: "Distribuidora del Sur S.A.",
      ingresos: 64250000,
      egresos: 41230000,
      margenOperativoPct: 35.8,
      variacionYoYPct: 16.2,
    },
    {
      id: "u2",
      unidad: "Factura+ S.A.",
      ingresos: 38450000,
      egresos: 28100000,
      margenOperativoPct: 30.5,
      variacionYoYPct: 8.7,
    },
    {
      id: "u3",
      unidad: "Logística Andina",
      ingresos: 28340000,
      egresos: 19650000,
      margenOperativoPct: 30.7,
      variacionYoYPct: 12.1,
    },
    {
      id: "u4",
      unidad: "Servicios Cloud SRL",
      ingresos: 21630000,
      egresos: 13760000,
      margenOperativoPct: 28.8,
      variacionYoYPct: 5.3,
    },
  ],
  keyIndicators: [
    {
      id: "k1",
      indicador: "Margen operativo",
      valorActual: "29,7%",
      objetivo: "> 25%",
      estado: "ok",
    },
    {
      id: "k2",
      indicador: "Rotación de cobro (días)",
      valorActual: "33,5",
      objetivo: "< 40 días",
      estado: "ok",
    },
    {
      id: "k3",
      indicador: "Endeudamiento",
      valorActual: "0,56",
      objetivo: "< 0,70",
      estado: "ok",
    },
    {
      id: "k4",
      indicador: "Liquidez corriente",
      valorActual: "1,68",
      objetivo: "> 1,20",
      estado: "ok",
    },
    {
      id: "k5",
      indicador: "EBITDA / Ventas",
      valorActual: "17,9%",
      objetivo: "> 15%",
      estado: "warn",
    },
  ],
  recentReports: [
    {
      id: "r1",
      nombre: "Reporte ejecutivo mensual",
      periodo: "Jun 2025",
      generado: "Hace 2 horas",
      formato: "PDF",
    },
    {
      id: "r2",
      nombre: "Análisis de rentabilidad",
      periodo: "May 2025",
      generado: "Ayer, 11:23",
      formato: "PDF",
    },
    {
      id: "r3",
      nombre: "Flujo de caja proyectado",
      periodo: "Jun 2025",
      generado: "05 Jun, 15:42",
      formato: "XLSX",
    },
    {
      id: "r4",
      nombre: "P&L por unidad de negocio",
      periodo: "May 2025",
      generado: "30 May, 09:15",
      formato: "PDF",
    },
    {
      id: "r5",
      nombre: "Resumen anual comparativo",
      periodo: "2024",
      generado: "30 May, 16:05",
      formato: "PDF",
    },
  ],
};

const northwind: ReportesDashboardData = {
  currency: "USD",
  kpis: [
    { key: "ingresosYtd", label: "Ingresos YTD", format: "money", value: 965000, deltaPct: 6.2, hint: "vs prev. period" },
    { key: "egresosYtd", label: "Egresos YTD", format: "money", value: 712000, deltaPct: -3.4, hint: "vs prev. period" },
    { key: "margenOperativo", label: "Margen operativo", format: "percent", value: 26.2, deltaPct: 1.1, hint: "vs prev. period" },
    { key: "variacionMensual", label: "Variación mensual", format: "percent", value: 3.9, hint: "vs last month" },
  ],
  incomeExpense: {
    datasets: [
      {
        key: "YTD",
        points: [
          { label: "Jan", ingresos: 92000, egresos: 68000, proyeccionIngresos: 98000, proyeccionEgresos: 72000 },
          { label: "Feb", ingresos: 90500, egresos: 67000, proyeccionIngresos: 96500, proyeccionEgresos: 71000 },
          { label: "Mar", ingresos: 94800, egresos: 70200, proyeccionIngresos: 100000, proyeccionEgresos: 74000 },
          { label: "Apr", ingresos: 97200, egresos: 71500, proyeccionIngresos: 102000, proyeccionEgresos: 76000 },
          { label: "May", ingresos: 98500, egresos: 72800, proyeccionIngresos: 104000, proyeccionEgresos: 78000 },
          { label: "Jun", ingresos: 101200, egresos: 74200, proyeccionIngresos: 106000, proyeccionEgresos: 80000 },
        ],
      },
      {
        key: "6M",
        points: [
          { label: "Jan", ingresos: 92000, egresos: 68000, proyeccionIngresos: 98000, proyeccionEgresos: 72000 },
          { label: "Feb", ingresos: 90500, egresos: 67000, proyeccionIngresos: 96500, proyeccionEgresos: 71000 },
          { label: "Mar", ingresos: 94800, egresos: 70200, proyeccionIngresos: 100000, proyeccionEgresos: 74000 },
          { label: "Apr", ingresos: 97200, egresos: 71500, proyeccionIngresos: 102000, proyeccionEgresos: 76000 },
          { label: "May", ingresos: 98500, egresos: 72800, proyeccionIngresos: 104000, proyeccionEgresos: 78000 },
          { label: "Jun", ingresos: 101200, egresos: 74200, proyeccionIngresos: 106000, proyeccionEgresos: 80000 },
        ],
      },
      {
        key: "12M",
        points: [
          { label: "Jul", ingresos: 96000, egresos: 70000, proyeccionIngresos: 101000, proyeccionEgresos: 74500 },
          { label: "Aug", ingresos: 97200, egresos: 71200, proyeccionIngresos: 102000, proyeccionEgresos: 76000 },
          { label: "Sep", ingresos: 98500, egresos: 72500, proyeccionIngresos: 103500, proyeccionEgresos: 77500 },
          { label: "Oct", ingresos: 101000, egresos: 74200, proyeccionIngresos: 105000, proyeccionEgresos: 79000 },
          { label: "Nov", ingresos: 103200, egresos: 75800, proyeccionIngresos: 107000, proyeccionEgresos: 80500 },
          { label: "Dec", ingresos: 104800, egresos: 76900, proyeccionIngresos: 108000, proyeccionEgresos: 82000 },
          { label: "Jan", ingresos: 92000, egresos: 68000, proyeccionIngresos: 98000, proyeccionEgresos: 72000 },
          { label: "Feb", ingresos: 90500, egresos: 67000, proyeccionIngresos: 96500, proyeccionEgresos: 71000 },
          { label: "Mar", ingresos: 94800, egresos: 70200, proyeccionIngresos: 100000, proyeccionEgresos: 74000 },
          { label: "Apr", ingresos: 97200, egresos: 71500, proyeccionIngresos: 102000, proyeccionEgresos: 76000 },
          { label: "May", ingresos: 98500, egresos: 72800, proyeccionIngresos: 104000, proyeccionEgresos: 78000 },
          { label: "Jun", ingresos: 101200, egresos: 74200, proyeccionIngresos: 106000, proyeccionEgresos: 80000 },
        ],
      },
    ],
  },
  profitability: {
    points: [
      { label: "Jan", margenOperativoPct: 24.5, margenNetoPct: 14.8 },
      { label: "Feb", margenOperativoPct: 25.1, margenNetoPct: 15.2 },
      { label: "Mar", margenOperativoPct: 25.8, margenNetoPct: 15.6 },
      { label: "Apr", margenOperativoPct: 26.4, margenNetoPct: 15.9 },
      { label: "May", margenOperativoPct: 26.2, margenNetoPct: 15.7 },
      { label: "Jun", margenOperativoPct: 26.2, margenNetoPct: 15.5 },
    ],
  },
  unitSummary: [
    { id: "nu1", unidad: "Retail", ingresos: 420000, egresos: 310000, margenOperativoPct: 26.2, variacionYoYPct: 8.1 },
    { id: "nu2", unidad: "Wholesale", ingresos: 315000, egresos: 236000, margenOperativoPct: 25.1, variacionYoYPct: 5.6 },
    { id: "nu3", unidad: "Services", ingresos: 230000, egresos: 166000, margenOperativoPct: 27.8, variacionYoYPct: 9.4 },
  ],
  keyIndicators: [
    { id: "nk1", indicador: "Operating margin", valorActual: "26.2%", objetivo: "> 25%", estado: "ok" },
    { id: "nk2", indicador: "Net margin", valorActual: "15.5%", objetivo: "> 16%", estado: "warn" },
    { id: "nk3", indicador: "Cash conversion (days)", valorActual: "41", objetivo: "< 40", estado: "warn" },
    { id: "nk4", indicador: "Debt ratio", valorActual: "0.62", objetivo: "< 0.70", estado: "ok" },
  ],
  recentReports: [
    { id: "nr1", nombre: "Monthly executive report", periodo: "Jun 2025", generado: "2h ago", formato: "PDF" },
    { id: "nr2", nombre: "Profitability analysis", periodo: "May 2025", generado: "Yesterday", formato: "PDF" },
    { id: "nr3", nombre: "Cashflow projection", periodo: "Jun 2025", generado: "Jun 05", formato: "XLSX" },
  ],
};

export const mockReportesByCompanyId: Record<string, ReportesDashboardData> = {
  "acme-ar": acme,
  "north-us": northwind,
};

