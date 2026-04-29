"use client";

import * as React from "react";
import type { PaymentsAlert } from "./mock";

export type AlertsApprovalsProps = {
  title: string;
  items: PaymentsAlert[];
};

const toneBySeverity: Record<
  PaymentsAlert["severity"],
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

function RowIcon({ kind }: { kind: PaymentsAlert["key"] }) {
  const common = "size-4";
  switch (kind) {
    case "porVencer":
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
    case "aprobaciones":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l2 2 4-4" />
          <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" />
        </svg>
      );
    case "vencidos":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6v6l4 2" />
          <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" />
        </svg>
      );
    case "comprobantes":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h10v18l-2-1-3 1-3-1-2 1V3Z" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
        </svg>
      );
    case "descuentos":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
          <path d="M16 3h5v5" />
          <path d="M21 3l-9 9" />
        </svg>
      );
  }
}

export function AlertsApprovals({ title, items }: AlertsApprovalsProps) {
  const totalCount = items.reduce((acc, x) => acc + x.count, 0);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Alertas clave para priorizar vencimientos y aprobaciones.
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
        <div className="space-y-2">
          {items.map((a) => {
            const tone = toneBySeverity[a.severity];
            return (
              <button
                key={a.key}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3 text-left hover:bg-white/80"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={[
                      "inline-flex size-9 items-center justify-center rounded-2xl ring-1 ring-black/5",
                      tone.iconBg,
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <RowIcon kind={a.key} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {a.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {a.description}
                    </div>
                  </div>
                </div>

                <span
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.pill}`}
                >
                  <span className={`size-2 rounded-full ${tone.dot}`} />
                  {a.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

