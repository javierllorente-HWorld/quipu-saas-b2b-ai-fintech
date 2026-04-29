"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatTimeAgo } from "@/components/inicio/format";
import type { TreasuryMovementRow } from "./mock";

export type TreasuryMovementsTableProps = {
  title: string;
  items: TreasuryMovementRow[];
  currency: CurrencyCode;
};

export function TreasuryMovementsTable({
  title,
  items,
  currency,
}: TreasuryMovementsTableProps) {
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
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Descripción</th>
                <th className="py-3 pr-4 font-medium">Banco</th>
                <th className="py-3 pr-4 font-medium">Importe</th>
                <th className="py-3 pl-2 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => {
                const isIncome = row.amount >= 0;
                return (
                  <tr key={row.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatTimeAgo(row.timestamp)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.description}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.bank}</td>
                    <td
                      className={[
                        "py-3 pr-4 font-semibold tabular-nums whitespace-nowrap",
                        isIncome ? "text-emerald-700" : "text-rose-700",
                      ].join(" ")}
                    >
                      {isIncome ? "+" : "-"} {formatMoney(Math.abs(row.amount), currency)}
                    </td>
                    <td className="py-3 pl-2 text-right font-semibold text-foreground tabular-nums whitespace-nowrap">
                      {formatMoney(row.balance, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 text-center text-xs">
          <button type="button" className="text-[color:var(--primary)] hover:underline">
            Ver todos los movimientos →
          </button>
        </div>
      </div>
    </div>
  );
}

