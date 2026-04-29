"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { PendingInvoice } from "./mock";

export type InvoicesPendingTableProps = {
  title: string;
  items: PendingInvoice[];
  currency: CurrencyCode;
};

function StatusPill({ status }: { status: PendingInvoice["status"] }) {
  const tone =
    status === "Vencida"
      ? "bg-rose-50 text-rose-700 ring-rose-100"
      : status === "Por_vencer"
        ? "bg-amber-50 text-amber-800 ring-amber-100"
        : "bg-slate-50 text-slate-700 ring-slate-100";
  const label =
    status === "Por_vencer" ? "Por vencer" : status === "Vencida" ? "Vencida" : "Pendiente";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tone,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export function InvoicesPendingTable({ title, items, currency }: InvoicesPendingTableProps) {
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
            Ver todas
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Factura</th>
                <th className="py-3 pr-4 font-medium">Cliente</th>
                <th className="py-3 pr-4 font-medium">Vencimiento</th>
                <th className="py-3 pr-4 font-medium">Importe</th>
                <th className="py-3 pl-2 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4 font-medium text-[color:var(--primary)]">
                    {row.invoice}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.customer}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {formatShortDate(row.dueDate)}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-foreground">
                    {formatMoney(row.amount, currency)}
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 text-center text-xs">
          <button
            type="button"
            className="text-[color:var(--primary)] hover:underline"
          >
            Ver todas las facturas →
          </button>
        </div>
      </div>
    </div>
  );
}

