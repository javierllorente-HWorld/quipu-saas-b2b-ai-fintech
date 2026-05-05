import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type {
  IncomeExpenseDataset,
  IncomeExpensePoint,
  KeyIndicatorRow,
  RecentReportRow,
  ReportesKpi,
} from "./mock";

export type ReportsApiSuccessPayload = {
  ok: true;
  organization: {
    id: string;
    name: string;
    default_currency: string | null;
  } | null;
  kpis: {
    incomeYtd: number;
    expensesYtd: number;
    operatingMarginPct: number;
    monthlyVariationPct: number | null;
  };
  incomeExpense: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  keyIndicators: Array<{
    key: string;
    label: string;
    value: number;
    unit: "percent" | "currency";
  }>;
  recentReports?: Array<{
    id: string;
    name: string;
    periodLabel: string;
    generatedAt: string | null;
    format: string;
    storageUrl: string;
  }>;
};

function mapDefaultCurrency(value: string | null | undefined): CurrencyCode {
  const u = (value ?? "").trim().toUpperCase();
  if (u === "USD") return "USD";
  return "ARS";
}

function monthShortLabel(ym: string): string {
  if (!ym || !/^\d{4}-\d{2}/.test(ym)) return ym || "—";
  const d = new Date(`${ym.slice(0, 7)}-01T12:00:00`);
  if (Number.isNaN(d.getTime())) return ym;
  const s = d.toLocaleDateString("es-AR", { month: "short" });
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/\./g, "");
}

function formatIndicatorValue(value: number, unit: "percent" | "currency", currency: CurrencyCode): string {
  if (unit === "percent") {
    return `${value.toLocaleString("es-AR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
  }
  return formatMoney(value, currency);
}

function mapKeyIndicators(rows: ReportsApiSuccessPayload["keyIndicators"], currency: CurrencyCode): KeyIndicatorRow[] {
  return rows.map((row, i) => ({
    id: row.key || `indicator-${i}`,
    indicador: row.label || "—",
    valorActual: formatIndicatorValue(
      row.value ?? 0,
      row.unit === "percent" ? "percent" : "currency",
      currency
    ),
    objetivo: "—",
    estado: "ok" as const,
  }));
}

function pickString(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function formatReportGenerated(value: unknown): string {
  if (value == null) return "—";
  if (value instanceof Date) {
    return value.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  }
  if (typeof value === "string" && value.length > 0) {
    const d = new Date(value.includes("T") ? value : `${value.slice(0, 10)}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
    }
    return value.slice(0, 16);
  }
  return "—";
}

function mapReportFormat(fmt: unknown): RecentReportRow["formato"] {
  const u = String(fmt ?? "").trim().toUpperCase();
  if (u === "XLSX" || u === "EXCEL") return "XLSX";
  return "PDF";
}

function mapRecentReports(raw: unknown[]): RecentReportRow[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const out: RecentReportRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : String(o.id ?? "");
    const nombre = pickString(o, "nombre", "name") || "Reporte";
    const periodo = pickString(o, "periodo", "periodLabel", "period_label") || "—";
    const generado = formatReportGenerated(o.generado ?? o.generatedAt ?? o.generated_at);
    const formato = mapReportFormat(o.formato ?? o.format);
    if (id) out.push({ id, nombre, periodo, generado, formato });
  }
  return out;
}

export function mapReportsApiPayload(payload: ReportsApiSuccessPayload) {
  const currency = mapDefaultCurrency(payload.organization?.default_currency);

  const kpis: ReportesKpi[] = [
    {
      key: "ingresosYtd",
      label: "Ingresos YTD",
      format: "money",
      value: payload.kpis.incomeYtd,
      hint: "Movimientos de caja (ingresos)",
    },
    {
      key: "egresosYtd",
      label: "Egresos YTD",
      format: "money",
      value: payload.kpis.expensesYtd,
      hint: "Movimientos de caja (egresos)",
    },
    {
      key: "margenOperativo",
      label: "Margen operativo",
      format: "percent",
      value: payload.kpis.operatingMarginPct,
      hint: "Sobre ingresos YTD",
    },
    {
      key: "variacionMensual",
      label: "Variación mensual",
      format: "percent",
      value: payload.kpis.monthlyVariationPct ?? null,
      hint:
        payload.kpis.monthlyVariationPct == null
          ? "Sin datos comparativos suficientes"
          : "Flujo neto vs mes anterior",
    },
  ];

  const rows = payload.incomeExpense ?? [];
  const toPoints = (subset: typeof rows): IncomeExpensePoint[] =>
    subset.map((r) => ({
      label: monthShortLabel(r.month),
      ingresos: r.income,
      egresos: r.expenses,
    }));

  const year = new Date().getFullYear();
  const ytdRows = rows.filter((r) => r.month.startsWith(`${year}-`));
  const points12 = toPoints(rows);
  const points6 = toPoints(rows.slice(-6));
  const pointsYtd = toPoints(ytdRows.length > 0 ? ytdRows : rows.slice(-Math.min(6, rows.length)));

  const emptyChart: IncomeExpensePoint[] = [{ label: "—", ingresos: 0, egresos: 0 }];
  const safe12 = points12.length > 0 ? points12 : emptyChart;
  const safe6 = points6.length > 0 ? points6 : safe12;
  const safeYtd = pointsYtd.length > 0 ? pointsYtd : safe12;

  const datasets: IncomeExpenseDataset[] = [
    { key: "YTD", points: safeYtd },
    { key: "6M", points: safe6 },
    { key: "12M", points: safe12 },
  ];

  const keyIndicators = mapKeyIndicators(payload.keyIndicators ?? [], currency);
  const recentReports = mapRecentReports(payload.recentReports ?? []);

  return {
    currency,
    organization: payload.organization,
    kpis,
    incomeExpense: { datasets },
    keyIndicators,
    recentReports,
  };
}
