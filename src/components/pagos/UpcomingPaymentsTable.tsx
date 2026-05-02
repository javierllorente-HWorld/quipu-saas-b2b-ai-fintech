"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { UpcomingPayment } from "./mock";
import { PagosCardPagination } from "./PagosCardPagination";

export type UpcomingPaymentsTableProps = {
  title: string;
  items: UpcomingPayment[];
  currency: CurrencyCode;
};

const PAGE_SIZE = 3;

export function UpcomingPaymentsTable({
  title,
  items,
  currency,
}: UpcomingPaymentsTableProps) {
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
                <th className="py-3 pr-4 font-medium">Proveedor</th>
                <th className="py-3 pr-4 font-medium">Descripción</th>
                <th className="py-3 pl-2 text-right font-medium">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedItems.map((row) => (
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
