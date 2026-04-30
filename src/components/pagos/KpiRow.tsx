"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import { IconArrowDown, IconArrowUp } from "@/components/inicio/icons";
import type { PagosKpi } from "./mock";

export type PagosKpiRowProps = {
  kpis: PagosKpi[];
  currency: CurrencyCode;
};

function formatKpiValue(kpi: PagosKpi, currency: CurrencyCode) {
  switch (kpi.format) {
    case "money":
      return formatMoney(kpi.value, currency);
    case "count":
      return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(
        kpi.value,
      );
  }
}

export function PagosKpiRow({ kpis, currency }: PagosKpiRowProps) {
  return (
    <div className="qp-kpi-row">
      {kpis.map((kpi) => {
        const delta = kpi.deltaPct;
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
                    {formatKpiValue(kpi, currency)}
                  </div>
                </div>
              </div>
            </div>
            <div className="qp-card-content">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  {kpi.hint ?? ""}
                </div>
                {delta == null ? null : (
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${deltaTone}`}
                  >
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

