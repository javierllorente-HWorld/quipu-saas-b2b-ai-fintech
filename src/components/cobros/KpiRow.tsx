"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { CobrosKpi } from "./mock";

export type CobrosKpiRowProps = {
  kpis: CobrosKpi[];
  currency: CurrencyCode;
};

function formatKpiValue(kpi: CobrosKpi, currency: CurrencyCode) {
  switch (kpi.format) {
    case "money":
      return formatMoney(kpi.value, currency);
    case "count":
      return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(
        kpi.value,
      );
    case "percent":
      return `${kpi.value.toFixed(1)}%`;
  }
}

export function CobrosKpiRow({ kpis, currency }: CobrosKpiRowProps) {
  return (
    <div className="qp-kpi-row qp-kpi-row-cobros">
      {kpis.map((kpi) => (
        <div key={kpi.key} className="qp-card min-w-0">
          <div className="qp-card-header pb-5 xl:pb-4">
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
        </div>
      ))}
    </div>
  );
}
