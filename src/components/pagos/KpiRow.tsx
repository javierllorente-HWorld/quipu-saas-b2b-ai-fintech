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

function KpiGlyph({ kpiKey }: { kpiKey: PagosKpi["key"] }) {
  const bg = (() => {
    switch (kpiKey) {
      case "totalPorPagar":
        return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]";
      case "venceSemana":
        return "bg-rose-50 text-rose-700";
      case "aprobacionesPendientes":
        return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]";
      case "pagadoMes":
        return "bg-emerald-50 text-emerald-700";
      case "ahorroProntoPago":
        return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]";
    }
  })();

  return (
    <span
      className={[
        "inline-flex size-10 items-center justify-center rounded-2xl ring-1 ring-black/5",
        bg,
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="text-sm font-bold">$</span>
    </span>
  );
}

export function PagosKpiRow({ kpis, currency }: PagosKpiRowProps) {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
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
                  <div className="mt-2 whitespace-nowrap text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {formatKpiValue(kpi, currency)}
                  </div>
                </div>
                <KpiGlyph kpiKey={kpi.key} />
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

