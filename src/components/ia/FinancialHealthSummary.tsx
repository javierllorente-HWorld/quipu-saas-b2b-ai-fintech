"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { HealthMetric } from "./mock";

export type FinancialHealthSummaryProps = {
  title: string;
  items: HealthMetric[];
  currency: CurrencyCode;
};

function formatMetric(metric: HealthMetric, currency: CurrencyCode) {
  if (metric.format === "money") return formatMoney(metric.value, currency);
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(metric.value);
}

export function FinancialHealthSummary({
  title,
  items,
  currency,
}: FinancialHealthSummaryProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="text-base font-semibold tracking-tight">{title}</div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {items.map((m) => {
            const delta = m.deltaPct;
            const deltaTone =
              delta == null
                ? "text-muted-foreground"
                : delta >= 0
                  ? "text-emerald-600"
                  : "text-rose-600";
            return (
              <div
                key={m.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-muted-foreground">
                    {m.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground tabular-nums">
                    {formatMetric(m, currency)}
                  </div>
                </div>
                {delta == null ? null : (
                  <div className={`text-xs font-semibold ${deltaTone}`}>
                    {delta >= 0 ? "+" : "-"}
                    {Math.abs(delta).toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 text-center text-xs text-muted-foreground">
          Datos simulados para vista previa.
        </div>
      </div>
    </div>
  );
}

