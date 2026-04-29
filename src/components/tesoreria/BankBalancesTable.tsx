"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { BankBalanceRow } from "./mock";

export type TreasuryBankBalancesTableProps = {
  title: string;
  items: BankBalanceRow[];
  currency: CurrencyCode;
};

function StatusPill({ status }: { status: BankBalanceRow["status"] }) {
  const tone =
    status === "Activa"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-slate-50 text-slate-700 ring-slate-100";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tone,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

export function TreasuryBankBalancesTable({
  title,
  items,
  currency,
}: TreasuryBankBalancesTableProps) {
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
            Ver todos los bancos →
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Banco</th>
                <th className="py-3 pr-4 font-medium">Cuenta</th>
                <th className="py-3 pr-4 font-medium">Saldo disponible</th>
                <th className="py-3 pl-2 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4 font-medium text-foreground">{row.bank}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.account}</td>
                  <td className="py-3 pr-4 font-semibold text-foreground">
                    {formatMoney(row.available, currency)}
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <StatusPill status={row.status} />
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

