"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { CashKpi } from "./mock";
import { IconArrowDown, IconArrowUp, IconBank } from "@/components/inicio/icons";

export type CajaKpiRowProps = {
  kpis: CashKpi[];
  currency: CurrencyCode;
};

function formatKpiValue(kpi: CashKpi, currency: CurrencyCode) {
  if (kpi.key === "connectedBanks") {
    return String(kpi.value);
  }
  return formatMoney(kpi.value, currency);
}

export function CajaKpiRow({ kpis, currency }: CajaKpiRowProps) {
  return (
    <div className="qp-kpi-row qp-kpi-row-caja">
      {kpis.map((kpi) => {
        const delta =
          kpi.key === "connectedBanks" ||
          kpi.key === "totalAvailable" ||
          kpi.key === "availableToday"
            ? null
            : kpi.deltaPct;
        const deltaTone =
          delta == null
            ? "text-muted-foreground"
            : delta >= 0
              ? "text-emerald-600"
              : "text-rose-600";

        const rightIcon =
          kpi.key === "connectedBanks" ? (
            <span
              className="inline-flex size-10 items-center justify-center rounded-2xl bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)] ring-1 ring-black/5"
              aria-hidden="true"
            >
              <IconBank className="size-5" />
            </span>
          ) : null;

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
                {rightIcon}
              </div>
            </div>
            <div className="qp-card-content">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  {kpi.key === "connectedBanks" ? null : kpi.hint}
                </div>
                {delta == null ? null : (
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${deltaTone}`}
                    aria-label="Variación porcentual"
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

