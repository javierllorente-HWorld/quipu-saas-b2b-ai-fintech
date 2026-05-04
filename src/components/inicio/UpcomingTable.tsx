"use client";

import * as React from "react";
import type { CurrencyCode, UpcomingItem } from "./mock";
import { formatMoney, formatShortDate } from "./format";

export type UpcomingTableProps = {
  items: UpcomingItem[];
  currency: CurrencyCode;
};

export function UpcomingTable({ items, currency }: UpcomingTableProps) {
  const pageSize = 5;
  const [page, setPage] = React.useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const safeTotalPages = Math.max(1, totalPages);
  const maxPageIdx = safeTotalPages - 1;
  const clampedPage = Math.min(page, maxPageIdx);
  if (clampedPage !== page) {
    setPage(clampedPage);
  }
  const pageItems = items.slice(clampedPage * pageSize, (clampedPage + 1) * pageSize);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Próximos cobros y pagos
            </div>
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Tipo</th>
                <th className="py-3 pr-4 font-medium">Descripción</th>
                <th className="py-3 pr-4 font-medium">Contraparte</th>
                <th className="py-3 pl-2 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((row) => {
                const isCobro = row.type === "Cobro";
                const signedAmount = isCobro ? row.amount : -row.amount;
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
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          isCobro
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : "bg-rose-50 text-rose-700 ring-rose-100",
                        ].join(" ")}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.description}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {row.counterparty}
                    </td>
                    <td className="py-3 pl-2 text-right font-semibold text-foreground">
                      {formatMoney(signedAmount, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {clampedPage + 1} de {safeTotalPages}
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium leading-none text-foreground transition hover:bg-white/80 disabled:pointer-events-none disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(0, Math.min(maxPageIdx, p - 1)))}
              disabled={clampedPage === 0}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Página siguiente"
              className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium leading-none text-foreground transition hover:bg-white/80 disabled:pointer-events-none disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(0, Math.min(maxPageIdx, p + 1)))}
              disabled={clampedPage >= maxPageIdx}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

