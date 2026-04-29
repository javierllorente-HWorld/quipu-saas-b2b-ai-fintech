"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import { IconArrowDown, IconArrowUp } from "@/components/inicio/icons";
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

function KpiIcon({ kpiKey }: { kpiKey: TesoreriaKpi["key"] }) {
  const bg = (() => {
    switch (kpiKey) {
      case "posicionConsolidada":
        return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]";
      case "liquidez7d":
        return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]";
      case "bancosConectados":
        return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]";
      case "transferenciasHoy":
        return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]";
      case "exposicionPorBanco":
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
      <span className="text-sm font-bold">
        {kpiKey === "bancosConectados" ? "🏦" : "$"}
      </span>
    </span>
  );
}

export function TesoreriaKpiRow({ kpis, currency }: TesoreriaKpiRowProps) {
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
                <KpiIcon kpiKey={kpi.key} />
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

