"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
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
    <div className="qp-kpi-row qp-kpi-row-pagos">
      {kpis.map((kpi) => {
        const hint = kpi.hint?.trim() ?? "";

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
            <div className="qp-card-content pt-2">
              {hint ? (
                <div className="text-xs text-muted-foreground">{hint}</div>
              ) : (
                <div className="min-h-[1.25rem]" aria-hidden />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
