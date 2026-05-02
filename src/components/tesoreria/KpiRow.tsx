"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { TesoreriaKpi } from "./mock";

export type TesoreriaKpiRowProps = {
  kpis: TesoreriaKpi[];
  currency: CurrencyCode;
};

function formatKpiValue(kpi: TesoreriaKpi, currency: CurrencyCode) {
  if (kpi.format === "money") return formatMoney(Number(kpi.value), currency);
  if (kpi.format === "count")
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(
      Number(kpi.value),
    );
  return String(kpi.value);
}

export function TesoreriaKpiRow({ kpis, currency }: TesoreriaKpiRowProps) {
  return (
    <div className="qp-kpi-row qp-kpi-row-tesoreria">
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
