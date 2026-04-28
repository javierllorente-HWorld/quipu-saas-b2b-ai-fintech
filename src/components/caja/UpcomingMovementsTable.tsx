"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { UpcomingMovement } from "./mock";

export type UpcomingMovementsTableProps = {
  items: UpcomingMovement[];
  currency: CurrencyCode;
};

export function UpcomingMovementsTable({
  items,
  currency,
}: UpcomingMovementsTableProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Próximos movimientos
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Lo que impacta tu caja en los próximos días.
            </div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver calendario
          </button>
        </div>
      </div>

      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Descripción</th>
                <th className="py-3 pr-4 font-medium">Tipo</th>
                <th className="py-3 pl-2 text-right font-medium">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => {
                const isIngreso = row.type === "Ingreso";
                return (
                  <tr key={row.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatShortDate(row.date)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.description}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          isIngreso
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : "bg-rose-50 text-rose-700 ring-rose-100",
                        ].join(" ")}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td
                      className={[
                        "py-3 pl-2 text-right font-semibold",
                        isIngreso ? "text-emerald-700" : "text-rose-700",
                      ].join(" ")}
                    >
                      {isIngreso ? "+" : "-"}{" "}
                      {formatMoney(Math.abs(row.amount), currency)}
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

