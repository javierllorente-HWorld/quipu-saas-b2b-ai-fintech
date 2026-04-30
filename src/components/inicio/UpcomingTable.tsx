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
  const pageItems = items.slice(page * pageSize, (page + 1) * pageSize);

  React.useEffect(() => {
    if (page <= safeTotalPages - 1) return;
    setPage(Math.max(0, safeTotalPages - 1));
  }, [page, safeTotalPages]);

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
                <th className="py-3 pr-4 font-medium">Cliente/Proveedor</th>
                <th className="py-3 pl-2 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((row) => {
                const isCobro = row.type === "Cobro";
                const signedAmount = isCobro ? row.amount : -row.amount;
                return (
                  <tr key={row.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatShortDate(row.date)}
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

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              className="qp-btn-secondary h-9 px-3 text-xs"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </button>
            <button
              type="button"
              className="qp-btn-secondary h-9 px-3 text-xs"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

