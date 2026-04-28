"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { BankBalance } from "./mock";

export type BankBalancesTableProps = {
  items: BankBalance[];
  currency: CurrencyCode;
};

export function BankBalancesTable({ items, currency }: BankBalancesTableProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Saldos por banco
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Distribución de saldo por cuenta (mock).
            </div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver todos los bancos
          </button>
        </div>
      </div>

      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Banco</th>
                <th className="py-3 pr-4 font-medium">Saldo</th>
                <th className="py-3 pl-2 text-right font-medium">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {row.bank}
                  </td>
                  <td className="py-3 pr-4 text-foreground">
                    <div className="font-semibold">
                      {formatMoney(row.amount, currency)}
                    </div>
                    <div className="mt-1 h-2 w-[180px] max-w-full overflow-hidden rounded-full bg-[color:var(--quipu-ice)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--quipu-accent)]"
                        style={{ width: `${Math.max(0, Math.min(1, row.pct)) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 pl-2 text-right font-semibold text-emerald-700">
                    {(row.pct * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

