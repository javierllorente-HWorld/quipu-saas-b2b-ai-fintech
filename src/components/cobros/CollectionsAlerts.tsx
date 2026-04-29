"use client";

import * as React from "react";
import type { CollectionsAlert } from "./mock";

export type CollectionsAlertsProps = {
  title: string;
  items: CollectionsAlert[];
};

const toneBySeverity: Record<
  CollectionsAlert["severity"],
  { pill: string; dot: string; iconBg: string }
> = {
  high: {
    pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    dot: "bg-rose-500",
    iconBg: "bg-rose-100 text-rose-700",
  },
  medium: {
    pill: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
    dot: "bg-amber-500",
    iconBg: "bg-amber-100 text-amber-800",
  },
  low: {
    pill: "bg-slate-50 text-slate-700 ring-1 ring-slate-100",
    dot: "bg-slate-400",
    iconBg: "bg-slate-100 text-slate-700",
  },
};

function AlertIcon({ kind }: { kind: CollectionsAlert["key"] }) {
  // Minimal inline icons (consistent stroke style with existing icon set).
  const common = "size-4";
  switch (kind) {
    case "facturasVencidas":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h10v18l-5-3-5 3V3Z" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
        </svg>
      );
    case "porVencer7":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v3" />
          <path d="M16 2v3" />
          <path d="M4 7h16" />
          <path d="M5 7v14h14V7" />
          <path d="M12 11v4" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "altaDeuda":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="M17 7H9.5a2.5 2.5 0 0 0 0 5H14.5a2.5 2.5 0 0 1 0 5H7" />
        </svg>
      );
    case "sinMovimiento30":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6v6l4 2" />
          <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" />
        </svg>
      );
    case "recordatorios":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
          <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
        </svg>
      );
  }
}

export function CollectionsAlerts({ title, items }: CollectionsAlertsProps) {
  const totalCount = items.reduce((acc, x) => acc + x.count, 0);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Priorizá vencidos, por vencer y clientes de riesgo.
            </div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver todas ({totalCount})
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {items.map((a) => {
            const tone = toneBySeverity[a.severity];
            return (
              <div
                key={a.key}
                className="rounded-2xl border border-border bg-white/60 p-4 hover:bg-white/80"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      "inline-flex size-10 items-center justify-center rounded-2xl ring-1 ring-black/5",
                      tone.iconBg,
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <AlertIcon kind={a.key} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.pill}`}
                      >
                        <span className={`size-2 rounded-full ${tone.dot}`} />
                        {a.count}
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

