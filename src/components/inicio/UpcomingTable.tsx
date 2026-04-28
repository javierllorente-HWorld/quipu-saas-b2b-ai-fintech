"use client";

import * as React from "react";
import type { CurrencyCode, UpcomingItem } from "./mock";
import { formatMoney, formatShortDate } from "./format";

export type UpcomingTableProps = {
  items: UpcomingItem[];
  currency: CurrencyCode;
};

export function UpcomingTable({ items, currency }: UpcomingTableProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Próximos cobros y pagos
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Calendario inmediato para anticiparte.
            </div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver todo
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Tipo</th>
                <th className="py-3 pr-4 font-medium">Descripción</th>
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Cliente/Proveedor</th>
                <th className="py-3 pl-2 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => {
                const isCobro = row.type === "Cobro";
                return (
                  <tr key={row.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          isCobro
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : "bg-rose-50 text-rose-700 ring-rose-100",
                        ].join(" ")}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.description}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatShortDate(row.date)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {row.counterparty}
                    </td>
                    <td className="py-3 pl-2 text-right font-semibold text-foreground">
                      {formatMoney(row.amount, currency)}
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

