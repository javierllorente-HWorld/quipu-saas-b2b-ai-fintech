"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { PendingInvoice } from "./mock";
import { PagosCardPagination } from "@/components/pagos/PagosCardPagination";

export type InvoicesPendingTableProps = {
  title: string;
  items: PendingInvoice[];
  currency: CurrencyCode;
};

const PAGE_SIZE = 3;

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
  const [page, setPage] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageIdx = Math.min(page, totalPages - 1);
  const pagedItems = items.slice(pageIdx * PAGE_SIZE, (pageIdx + 1) * PAGE_SIZE);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="text-base font-semibold tracking-tight">{title}</div>
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
              {pagedItems.map((row) => (
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

        <PagosCardPagination
          pageIndex={pageIdx}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      </div>
    </div>
  );
}
