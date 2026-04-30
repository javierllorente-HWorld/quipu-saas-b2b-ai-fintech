"use client";

import * as React from "react";
import type { CurrencyCode, Kpi } from "./mock";
import { formatMoney } from "./format";
import { IconArrowDown, IconArrowUp } from "./icons";

export type KpiRowProps = {
  kpis: Kpi[];
  currency: CurrencyCode;
};

export function KpiRow({ kpis, currency }: KpiRowProps) {
  const showDeltaForKeys = React.useMemo(() => new Set(["netFlow", "income"]), []);
  return (
    <div className="qp-kpi-row">
      {kpis.map((kpi) => {
        const delta = showDeltaForKeys.has(kpi.key) ? kpi.deltaPct : null;
        const deltaTone =
          delta == null
            ? "text-muted-foreground"
            : delta >= 0
              ? "text-emerald-600"
              : "text-rose-600";

        return (
          <div key={kpi.key} className="qp-card min-w-0">
            <div className="qp-card-header">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </div>
                  <div className="qp-kpi-stat">
                    {formatMoney(kpi.value, currency)}
                  </div>
                </div>
              </div>
            </div>
            <div className="qp-card-content">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">{kpi.hint}</div>
                {delta == null ? null : (
                  <div className={`inline-flex items-center gap-1 text-xs font-semibold ${deltaTone}`}>
                    {delta >= 0 ? (
                      <IconArrowUp className="size-4" />
                    ) : (
                      <IconArrowDown className="size-4" />
                    )}
                    <span>{Math.abs(delta).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

