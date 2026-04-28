"use client";

import * as React from "react";
import type { AlertItem } from "./mock";

export type AlertsPanelProps = {
  alerts: AlertItem[];
  onAction?: (alertId: string) => void;
};

const toneBySeverity: Record<AlertItem["severity"], { pill: string; dot: string }> =
  {
    high: {
      pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
      dot: "bg-rose-500",
    },
    medium: {
      pill: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
      dot: "bg-amber-500",
    },
    low: {
      pill: "bg-slate-50 text-slate-700 ring-1 ring-slate-100",
      dot: "bg-slate-400",
    },
    ai: {
      pill: "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)] ring-1 ring-[color:var(--quipu-border)]",
      dot: "bg-[color:var(--quipu-accent)]",
    },
  };

export function AlertsPanel({ alerts, onAction }: AlertsPanelProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="text-base font-semibold tracking-tight">
          Alertas prioritarias
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Lo más importante para cuidar tu caja hoy.
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {alerts.map((a) => {
            const tone = toneBySeverity[a.severity];
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-border bg-white/60 p-4 hover:bg-white/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.pill}`}>
                        <span className={`size-2 rounded-full ${tone.dot}`} />
                        {labelForSeverity(a.severity)}
                      </span>
                      <div className="truncate text-sm font-semibold text-foreground">
                        {a.title}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {a.description}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
                    onClick={() => onAction?.(a.id)}
                  >
                    {a.ctaLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function labelForSeverity(sev: AlertItem["severity"]) {
  switch (sev) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "low":
      return "Baja";
    case "ai":
      return "IA";
  }
}

