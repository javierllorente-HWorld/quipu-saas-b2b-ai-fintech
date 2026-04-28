"use client";

import * as React from "react";
import type { ActivityItem, CurrencyCode } from "./mock";
import { formatMoney, formatTimeAgo } from "./format";

export type RecentActivityProps = {
  items: ActivityItem[];
  currency: CurrencyCode;
};

export function RecentActivity({ items, currency }: RecentActivityProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Actividad reciente
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Movimientos financieros recientes (mock).
            </div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver más
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {items.map((m) => {
            const isIncome = m.type === "Ingreso";
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {m.description}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatTimeAgo(m.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={[
                      "text-sm font-semibold",
                      isIncome ? "text-emerald-700" : "text-rose-700",
                    ].join(" ")}
                  >
                    {isIncome ? "+" : "-"} {formatMoney(m.amount, currency)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {m.type}
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

