"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { UnitSummaryRow } from "./mock";

export type UnitSummaryTableProps = {
  title: string;
  items: UnitSummaryRow[];
  currency: CurrencyCode;
};

export function UnitSummaryTable({ title, items, currency }: UnitSummaryTableProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver todas las unidades →
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Unidad de negocio</th>
                <th className="py-3 pr-4 font-medium">Ingresos</th>
                <th className="py-3 pr-4 font-medium">Egresos</th>
                <th className="py-3 pr-4 font-medium">Margen op.</th>
                <th className="py-3 pl-2 text-right font-medium">Var. vs. ant.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => {
                const varTone =
                  row.variacionYoYPct >= 0 ? "text-emerald-700" : "text-rose-700";
                return (
                  <tr key={row.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.unidad}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {formatMoney(row.ingresos, currency)}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {formatMoney(row.egresos, currency)}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {row.margenOperativoPct.toFixed(1)}%
                    </td>
                    <td className={`py-3 pl-2 text-right font-semibold ${varTone}`}>
                      {row.variacionYoYPct >= 0 ? "+" : "-"}
                      {Math.abs(row.variacionYoYPct).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

