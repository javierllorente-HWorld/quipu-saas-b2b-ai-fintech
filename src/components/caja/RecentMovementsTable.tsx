"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { RecentMovement } from "./mock";
import {
  PagosCardPagination,
  PagosCardTableWithFooter,
} from "@/components/pagos/PagosCardPagination";

export type RecentMovementsTableProps = {
  items: RecentMovement[];
  currency: CurrencyCode;
};

const PAGE_SIZE = 3;

export function RecentMovementsTable({ items, currency }: RecentMovementsTableProps) {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageIdx = Math.min(page, totalPages - 1);
  const pagedItems = items.slice(pageIdx * PAGE_SIZE, (pageIdx + 1) * PAGE_SIZE);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Últimos movimientos
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Historial de últimas operaciones registradas.
            </div>
          </div>
        </div>
      </div>

      <div className="qp-card-content">
        <PagosCardTableWithFooter
          table={
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-medium">Fecha</th>
                  <th className="py-3 pr-4 font-medium">Descripción</th>
                  <th className="py-3 pr-4 font-medium">Banco</th>
                  <th className="py-3 pr-4 text-right font-medium">Importe</th>
                  <th className="py-3 pl-2 text-right font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagedItems.map((row) => {
                  const isIngreso = row.amount >= 0;
                  return (
                    <tr key={row.id} className="hover:bg-black/[0.02]">
                      <td className="py-3 pr-4 text-muted-foreground">
                        {formatShortDate(row.date)}
                      </td>
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {row.description}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{row.bank}</td>
                      <td
                        className={[
                          "py-3 pr-4 text-right font-semibold",
                          isIngreso ? "text-emerald-700" : "text-rose-700",
                        ].join(" ")}
                      >
                        {isIngreso ? "+" : "-"}{" "}
                        {formatMoney(Math.abs(row.amount), currency)}
                      </td>
                      <td className="py-3 pl-2 text-right font-semibold text-foreground">
                        {formatMoney(row.balanceAfter, currency)}
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

