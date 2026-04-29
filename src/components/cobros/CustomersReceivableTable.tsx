"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { CustomerReceivable } from "./mock";

export type CustomersReceivableTableProps = {
  title: string;
  items: CustomerReceivable[];
  currency: CurrencyCode;
};

export function CustomersReceivableTable({
  title,
  items,
  currency,
}: CustomersReceivableTableProps) {
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
            Ver todos
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Cliente</th>
                <th className="py-3 pr-4 font-medium">Total por cobrar</th>
                <th className="py-3 pr-4 font-medium">Vencido</th>
                <th className="py-3 pl-2 text-right font-medium">% Vencido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => {
                const pct = row.total <= 0 ? 0 : (row.overdue / row.total) * 100;
                const pctTone =
                  pct >= 20 ? "text-rose-600" : pct >= 10 ? "text-amber-700" : "text-emerald-700";
                return (
                  <tr key={row.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.name}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      <div className="font-semibold">{formatMoney(row.total, currency)}</div>
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      <div className="font-semibold">{formatMoney(row.overdue, currency)}</div>
                    </td>
                    <td className={`py-3 pl-2 text-right font-semibold ${pctTone}`}>
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 text-center text-xs">
          <button
            type="button"
            className="text-[color:var(--primary)] hover:underline"
          >
            Ver todos los clientes →
          </button>
        </div>
      </div>
    </div>
  );
}

