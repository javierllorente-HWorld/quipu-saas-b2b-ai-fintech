"use client";

import * as React from "react";
import type { SmartAlert } from "./mock";

export type SmartAlertsProps = {
  title: string;
  items: SmartAlert[];
};

const toneBySeverity: Record<SmartAlert["severity"], { pill: string; dot: string }> = {
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
};

export function SmartAlerts({ title, items }: SmartAlertsProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Alertas simplificadas.
            </div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver todas
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {items.map((a) => {
            const tone = toneBySeverity[a.severity];
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.pill}`}>
                        <span className={`size-2 rounded-full ${tone.dot}`} />
                        {a.severity === "high"
                          ? "Alta"
                          : a.severity === "medium"
                            ? "Media"
                            : "Baja"}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

