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
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
      {kpis.map((kpi) => {
        const delta = kpi.deltaPct;
        const deltaTone =
          delta == null
            ? "text-muted-foreground"
            : delta >= 0
              ? "text-emerald-600"
              : "text-rose-600";

        const pill =
          kpi.key === "connectedBanks" ? (
            <span className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--quipu-ice)] px-2.5 py-1 text-xs font-medium text-[color:var(--quipu-night)]">
              <IconBank className="size-4" />
              Conectados
            </span>
          ) : (
            <span className="rounded-2xl bg-[color:var(--quipu-ice)] px-2.5 py-1 text-xs font-medium text-[color:var(--quipu-night)]">
              Hoy
            </span>
          );

        return (
          <div key={kpi.key} className="qp-card min-w-0">
            <div className="qp-card-header">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </div>
                  <div className="mt-2 whitespace-nowrap text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {formatKpiValue(kpi, currency)}
                  </div>
                </div>
                {pill}
              </div>
            </div>
            <div className="qp-card-content">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">{kpi.hint}</div>
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

