"use client";

import * as React from "react";
import { formatMoney } from "./format";
import { IconHistory } from "./icons";

export type AutomaticAlertItem = {
  id: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  created_at: string;
};

export type AutomaticAlertsCardProps = {
  items: AutomaticAlertItem[];
  /** Si se pasa, se muestra el botón para ejecutar el workflow y refrescar alertas. */
  onRefreshAlerts?: () => Promise<void>;
};

/** dd/mm/yyyy (hora local, solo fecha) */
function formatCreatedAtDisplay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** yyyy-mm-dd → dd/mm/yyyy */
function isoDateToArFull(iso: string): string {
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd || yyyy.length !== 4) return iso;
  return `${dd}/${mm}/${yyyy}`;
}

type InvoiceOverdueParts = {
  invoiceRef: string;
  customer: string;
  dueIso: string;
  amount: number;
  amountRaw: string;
};

/** Template del workflow POST (factura vencida). */
function matchInvoiceOverdueTemplate(message: string): InvoiceOverdueParts | null {
  const m = message.trim().match(
    /^La factura\s+(.+?)\s+\((.+)\)\s+venció el\s+(\d{4}-\d{2}-\d{2})\.\s*Monto pendiente:\s*([\d.\s,]+)\.?$/i,
  );
  if (!m) return null;
  const rawAmount = m[4].replace(/\s/g, "").replace(",", ".");
  const n = Number.parseFloat(rawAmount);
  return {
    invoiceRef: m[1].trim(),
    customer: m[2].trim(),
    dueIso: m[3],
    amount: n,
    amountRaw: m[4].trim(),
  };
}

/**
 * Mensaje compacto en una línea (tooltip / fallback).
 * Ej. "La factura FAC-0002 (Cliente) venció el 2026-05-10. Monto pendiente: 820000.00."
 */
function tryCompactInvoiceOverdueMessage(message: string): string | null {
  const x = matchInvoiceOverdueTemplate(message);
  if (!x) return null;
  const amountFmt = Number.isFinite(x.amount) ? formatMoney(x.amount, "ARS") : x.amountRaw;
  const dateFmt = isoDateToArFull(x.dueIso);
  return `${x.invoiceRef} · ${x.customer} · venció ${dateFmt} · ${amountFmt} pendiente`;
}

/** Ajusta fechas ISO y el monto tras "Monto pendiente:" en el texto guardado por el workflow. */
function formatAlertMessageForDisplay(message: string): string {
  const compact = tryCompactInvoiceOverdueMessage(message);
  if (compact) return compact;

  let out = message.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y: string, mm: string, d: string) =>
    isoDateToArFull(`${y}-${mm}-${d}`),
  );
  out = out.replace(/Monto pendiente:\s*([\d.]+)/gi, (_, raw: string) => {
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) return `Monto pendiente: ${raw}`;
    return `Monto pendiente: ${formatMoney(n, "ARS")}`;
  });
  return out;
}

type AlertRowLines = {
  line1Left: string;
  line2: string;
  tooltip: string;
};

/**
 * Línea 1: factura · cliente. Línea 2: vencimiento · monto.
 * Si no coincide el template, se usa el mensaje formateado en la segunda línea.
 */
function buildAlertRowLines(a: AutomaticAlertItem): AlertRowLines {
  const tooltip = formatAlertMessageForDisplay(a.message);
  const x = matchInvoiceOverdueTemplate(a.message);
  if (x) {
    const amountFmt = Number.isFinite(x.amount) ? formatMoney(x.amount, "ARS") : x.amountRaw;
    const dueFmt = isoDateToArFull(x.dueIso);
    return {
      line1Left: `${x.invoiceRef} · ${x.customer}`,
      line2: `Venció ${dueFmt} · ${amountFmt} pendiente`,
      tooltip,
    };
  }

  const parts = tooltip.split(/\s*·\s*/).map((s) => s.trim());
  if (parts.length === 4 && /^venció\s+/i.test(parts[2])) {
    const dueStr = parts[2].replace(/^venció\s+/i, "").trim();
    return {
      line1Left: `${parts[0]} · ${parts[1]}`,
      line2: `Venció ${dueStr} · ${parts[3]}`,
      tooltip,
    };
  }

  return {
    line1Left: "",
    line2: tooltip,
    tooltip,
  };
}

function openAlertsSummary(count: number): string {
  if (count === 1) return "1 alerta abierta";
  return `${count} alertas abiertas`;
}

function toInt(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export function AutomaticAlertsCard({ items, onRefreshAlerts }: AutomaticAlertsCardProps) {
  const [workflowRunning, setWorkflowRunning] = React.useState(false);
  const [workflowFeedback, setWorkflowFeedback] = React.useState<string | null>(null);

  async function handleRunWorkflow() {
    if (!onRefreshAlerts) return;
    setWorkflowFeedback(null);
    setWorkflowRunning(true);
    try {
      const res = await fetch("/api/workflows/overdue-invoice-alerts", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      const obj = body as { ok?: boolean; created?: unknown; alreadyExisted?: unknown } | null;
      if (!res.ok || !obj || obj.ok !== true) {
        setWorkflowFeedback("No se pudo ejecutar el workflow");
        return;
      }
      const created = toInt(obj.created);
      const alreadyExisted = toInt(obj.alreadyExisted);
      await onRefreshAlerts();
      setWorkflowFeedback(`${created} nuevas · ${alreadyExisted} existentes`);
    } catch {
      setWorkflowFeedback("No se pudo ejecutar el workflow");
    } finally {
      setWorkflowRunning(false);
    }
  }

  return (
    <div className="qp-card [&>.qp-card-header]:px-6 [&>.qp-card-header]:pb-2 [&>.qp-card-header]:pt-6 [&>.qp-card-content]:px-6 [&>.qp-card-content]:pb-6 [&>.qp-card-content]:pt-5">
      <div className="qp-card-header">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold tracking-tight">Alertas automáticas</div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Facturas vencidas detectadas por workflows financieros
            </p>
          </div>
          {onRefreshAlerts ? (
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={workflowRunning}
                  onClick={() => void handleRunWorkflow()}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white hover:opacity-95 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconHistory className="size-4 shrink-0" />
                  <span>{workflowRunning ? "Ejecutando…" : "Ejecutar workflow"}</span>
                </button>
                {items.length > 0 ? (
                  <span className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-amber-700">
                    {openAlertsSummary(items.length)}
                  </span>
                ) : null}
              </div>
              {workflowFeedback ? (
                <p className="max-w-[18rem] text-right text-[11px] leading-snug text-muted-foreground">
                  {workflowFeedback}
                </p>
              ) : null}
            </div>
          ) : items.length > 0 ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-amber-700">
              {openAlertsSummary(items.length)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="qp-card-content">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-white/40 px-4 py-7 text-center text-sm text-muted-foreground">
            No hay alertas automáticas activas
          </p>
        ) : (
          <ul className="divide-y divide-border/80 border-t border-border/60">
            {items.map((a) => {
              const row = buildAlertRowLines(a);
              return (
                <li
                  key={a.id}
                  className="border-l-[3px] border-amber-200/60 py-2.5 pl-2.5 pr-0.5 transition-colors hover:bg-amber-50/40"
                >
                  <div className="flex min-w-0 items-baseline justify-between gap-3">
                    <span
                      className={`min-w-0 flex-1 truncate text-sm leading-snug ${row.line1Left ? "font-medium text-foreground" : "text-muted-foreground"}`}
                    >
                      {row.line1Left || "—"}
                    </span>
                    <time
                      dateTime={a.created_at}
                      className="shrink-0 text-[11px] tabular-nums leading-none text-muted-foreground/75"
                    >
                      {formatCreatedAtDisplay(a.created_at)}
                    </time>
                  </div>
                  <p
                    className="mt-1.5 truncate text-[11px] leading-snug text-muted-foreground"
                    title={row.tooltip}
                  >
                    {row.line2}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
