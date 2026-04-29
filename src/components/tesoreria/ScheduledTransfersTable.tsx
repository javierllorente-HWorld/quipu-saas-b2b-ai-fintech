"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { ScheduledTransferRow } from "./mock";

export type ScheduledTransfersTableProps = {
  title: string;
  items: ScheduledTransferRow[];
  currency: CurrencyCode;
};

function StatusPill({ status }: { status: ScheduledTransferRow["status"] }) {
  const tone =
    status === "Pendiente"
      ? "bg-amber-50 text-amber-800 ring-amber-100"
      : status === "Programada"
        ? "bg-slate-50 text-slate-700 ring-slate-100"
        : "bg-rose-50 text-rose-700 ring-rose-100";
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

export function ScheduledTransfersTable({
  title,
  items,
  currency,
}: ScheduledTransfersTableProps) {
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
            Ver calendario →
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Beneficiario</th>
                <th className="py-3 pr-4 font-medium">Concepto</th>
                <th className="py-3 pr-4 font-medium">Importe</th>
                <th className="py-3 pl-2 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => {
                const tone = row.amount < 0 ? "text-rose-700" : "text-emerald-700";
                return (
                  <tr key={row.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatShortDate(row.date)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.beneficiary}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {row.concept}
                    </td>
                    <td className={`py-3 pr-4 font-semibold ${tone}`}>
                      {row.amount < 0 ? "-" : "+"} {formatMoney(Math.abs(row.amount), currency)}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 text-center text-xs">
          <button type="button" className="text-[color:var(--primary)] hover:underline">
            Ver todas las transferencias →
          </button>
        </div>
      </div>
    </div>
  );
}

