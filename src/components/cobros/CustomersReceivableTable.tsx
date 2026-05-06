"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { CustomerReceivable } from "./mock";
import {
  PagosCardPagination,
  PagosCardTableWithFooter,
} from "@/components/pagos/PagosCardPagination";

export type CustomersReceivableTableProps = {
  title: string;
  items: CustomerReceivable[];
  currency: CurrencyCode;
};

const PAGE_SIZE = 3;

export function CustomersReceivableTable({
  title,
  items,
  currency,
}: CustomersReceivableTableProps) {
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
        <PagosCardTableWithFooter
          table={
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
                {pagedItems.map((row) => {
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
          }
          footer={
            <PagosCardPagination
              pageIndex={pageIdx}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            />
          }
        />
      </div>
    </div>
  );
}
