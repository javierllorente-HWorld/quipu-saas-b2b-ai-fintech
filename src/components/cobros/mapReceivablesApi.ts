import type { CurrencyCode } from "@/components/inicio/mock";
import type {
  CobrosKpi,
  CustomerReceivable,
  DebtAgingBucketKey,
  DebtAgingItem,
  InvoiceStatus,
  PendingInvoice,
} from "./mock";

export type ReceivablesApiSuccessPayload = {
  ok: true;
  organization: {
    id: string;
    name: string;
    default_currency: string | null;
  } | null;
  kpis: {
    totalReceivable: number;
    overdueAmount: number;
    pendingInvoicesCount: number;
  };
  aging: Array<{
    label: string;
    amount: number;
    percentage: number;
  }>;
  customers: Array<{
    customerId: string;
    customerName: string;
    totalReceivable: number;
    overdueAmount: number;
    overduePercentage: number;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    dueDate: string | null;
    amount: number;
    status: string;
    computedStatus: string;
  }>;
};

const AGING_KEYS: DebtAgingBucketKey[] = [
  "noVencido",
  "vencido31_60",
  "vencido61_90",
  "vencido90p",
];

function mapDefaultCurrency(value: string | null | undefined): CurrencyCode {
  const u = (value ?? "").trim().toUpperCase();
  if (u === "USD") return "USD";
  return "ARS";
}

function safeDueDate(value: string | null | undefined): string {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const t = new Date();
  t.setHours(12, 0, 0, 0);
  return t.toISOString().slice(0, 10);
}

function invoiceUiStatus(computedStatus: string, dueDateIso: string): InvoiceStatus {
  const norm = (computedStatus ?? "").trim().toLowerCase();
  if (norm === "vencida") return "Vencida";
  if (norm === "por vencer" || norm === "por_vencer") return "Por_vencer";
  if (norm === "pendiente") return "Pendiente";

  const today = new Date().toISOString().slice(0, 10);
  if (dueDateIso < today) return "Vencida";
  if (dueDateIso >= today) return "Por_vencer";
  return "Pendiente";
}

export function mapReceivablesApiPayload(payload: ReceivablesApiSuccessPayload) {
  const currency = mapDefaultCurrency(payload.organization?.default_currency);

  const kpis: CobrosKpi[] = [
    {
      key: "totalPorCobrar",
      label: "Total por cobrar",
      value: payload.kpis.totalReceivable,
      format: "money",
      hint: "Cartera pendiente",
    },
    {
      key: "vencido",
      label: "Monto vencido",
      value: payload.kpis.overdueAmount,
      format: "money",
      hint: "Con vencimiento pasado",
    },
    {
      key: "facturasPendientes",
      label: "Facturas pendientes",
      value: payload.kpis.pendingInvoicesCount,
      format: "count",
      hint: "Cantidad de facturas",
    },
  ];

  const agingItems: DebtAgingItem[] = payload.aging.map((row, i) => ({
    key: AGING_KEYS[i % AGING_KEYS.length]!,
    label: row.label || "—",
    amount: row.amount,
  }));

  const agingTotal = payload.kpis.totalReceivable;

  const customers: CustomerReceivable[] = payload.customers.map((c) => ({
    id: c.customerId,
    name: c.customerName || "—",
    total: c.totalReceivable,
    overdue: c.overdueAmount,
  }));

  const invoices: PendingInvoice[] = payload.invoices.map((inv) => {
    const dueDate = safeDueDate(inv.dueDate);
    return {
      id: inv.id,
      invoice: inv.invoiceNumber || "—",
      customer: inv.customerName || "—",
      dueDate,
      amount: inv.amount,
      status: invoiceUiStatus(inv.computedStatus, dueDate),
    };
  });

  return {
    currency,
    organization: payload.organization,
    kpis,
    aging: {
      total: agingTotal,
      items: agingItems,
    },
    customers,
    invoices,
  };
}
