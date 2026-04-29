"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { UpcomingPayment } from "./mock";

export type UpcomingPaymentsTableProps = {
  title: string;
  items: UpcomingPayment[];
  currency: CurrencyCode;
};

export function UpcomingPaymentsTable({
  title,
  items,
  currency,
}: UpcomingPaymentsTableProps) {
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
                <th className="py-3 pr-4 font-medium">Proveedor</th>
                <th className="py-3 pr-4 font-medium">Descripción</th>
                <th className="py-3 pl-2 text-right font-medium">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4 text-muted-foreground">
                    {formatShortDate(row.date)}
                  </td>
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {row.vendor}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {row.description}
                  </td>
                  <td className="py-3 pl-2 text-right font-semibold text-foreground">
                    {formatMoney(row.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 text-center text-xs">
          <button type="button" className="text-[color:var(--primary)] hover:underline">
            Ver todos los próximos →
          </button>
        </div>
      </div>
    </div>
  );
}

