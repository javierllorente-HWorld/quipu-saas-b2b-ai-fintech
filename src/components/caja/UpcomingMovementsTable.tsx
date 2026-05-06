"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { UpcomingMovement } from "./mock";
import {
  PagosCardPagination,
  PagosCardTableWithFooter,
} from "@/components/pagos/PagosCardPagination";

export type UpcomingMovementsTableProps = {
  items: UpcomingMovement[];
  currency: CurrencyCode;
};

const PAGE_SIZE = 3;

export function UpcomingMovementsTable({
  items,
  currency,
}: UpcomingMovementsTableProps) {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageIdx = Math.min(page, totalPages - 1);
  const pagedItems = items.slice(pageIdx * PAGE_SIZE, (pageIdx + 1) * PAGE_SIZE);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div>
          <div className="text-base font-semibold tracking-tight">
            Impactos futuros en caja
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Cobros y pagos previstos que afectarán tu saldo.
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
                  <th className="py-3 pr-4 font-medium">Tipo</th>
                  <th className="py-3 pl-2 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagedItems.map((row) => {
                  const isIngreso = row.type === "Ingreso";
                  return (
                    <tr key={row.id} className="hover:bg-black/[0.02]">
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                          <span
                            className={
                              row.computedStatus === "overdue"
                                ? "font-medium text-rose-700"
                                : ""
                            }
                          >
                            {formatShortDate(row.date)}
                          </span>
                          {row.computedStatus === "overdue" ? (
                            <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-800 ring-1 ring-rose-100">
                              Vencido
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {row.description}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                            isIngreso
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                              : "bg-rose-50 text-rose-700 ring-rose-100",
                          ].join(" ")}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td
                        className={[
                          "py-3 pl-2 text-right font-semibold",
                          isIngreso ? "text-emerald-700" : "text-rose-700",
                        ].join(" ")}
                      >
                        {isIngreso ? "+" : "-"}{" "}
                        {formatMoney(Math.abs(row.amount), currency)}
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
