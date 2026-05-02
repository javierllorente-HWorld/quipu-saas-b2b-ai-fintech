"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { ScheduledTransferRow } from "./mock";
import { PagosCardPagination } from "@/components/pagos/PagosCardPagination";

export type ScheduledTransfersTableProps = {
  title: string;
  items: ScheduledTransferRow[];
  currency: CurrencyCode;
};

const PAGE_SIZE = 3;

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
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Beneficiario</th>
                <th className="py-3 pr-4 font-medium">Concepto</th>
                <th className="py-3 pr-4 font-medium">Importe</th>
                <th className="py-3 pl-2 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedItems.map((row) => {
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
