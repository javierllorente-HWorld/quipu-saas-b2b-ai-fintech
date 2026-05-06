"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatShortDate } from "@/components/inicio/format";
import type { UpcomingPayment } from "./mock";
import { PagosCardPagination, PagosCardTableWithFooter } from "./PagosCardPagination";

export type UpcomingPaymentsTableProps = {
  title: string;
  items: UpcomingPayment[];
  currency: CurrencyCode;
  onRefresh?: () => void;
};

const PAGE_SIZE = 3;

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}

export function UpcomingPaymentsTable({
  title,
  items,
  currency,
  onRefresh,
}: UpcomingPaymentsTableProps) {
  const [page, setPage] = React.useState(0);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [cancelError, setCancelError] = React.useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageIdx = Math.min(page, totalPages - 1);
  const pagedItems = items.slice(pageIdx * PAGE_SIZE, (pageIdx + 1) * PAGE_SIZE);

  React.useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const showCancelColumn = React.useMemo(
    () => items.some((i) => i.origin === "payment"),
    [items],
  );

  const showVendorColumn = React.useMemo(() => {
    if (items.length === 0) return true;
    const useful = items.filter((i) => {
      const v = (i.vendor ?? "").trim();
      return (
        v.length > 0 && v !== "—" && v !== "Proveedor no informado"
      );
    }).length;
    // Si casi todos vienen sin proveedor, ocultamos la columna.
    return useful / items.length >= 0.25;
  }, [items]);

  async function requestCancel(row: UpcomingPayment) {
    const confirmed = window.confirm(
      "¿Querés cancelar este pago programado?\n\nEsta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    setCancelError(null);
    setCancellingId(row.id);

    try {
      const res = await fetch(`/api/payables/payments/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || body.ok !== true) {
        const msg =
          typeof body.error === "string" && body.error.trim()
            ? body.error
            : "No se pudo cancelar el pago.";
        setCancelError(msg);
        return;
      }

      onRefresh?.();
    } catch {
      setCancelError("No se pudo cancelar el pago. Reintentá en unos segundos.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
          {cancelError ? (
            <p className="mt-2 text-sm text-rose-700" role="alert">
              {cancelError}
            </p>
          ) : null}
        </div>
      </div>
      <div className="qp-card-content">
        <PagosCardTableWithFooter
          table={
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-medium">Fecha</th>
                  {showVendorColumn ? (
                    <th className="py-3 pr-4 font-medium">Proveedor</th>
                  ) : null}
                  <th className="py-3 pr-4 font-medium">Descripción</th>
                  <th className="py-3 pl-2 text-right font-medium">Importe</th>
                  {showCancelColumn ? (
                    <th className="py-3 pl-2 text-right font-medium"> </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagedItems.map((row) => {
                  const canCancel = row.origin === "payment";
                  const busy = cancellingId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={[
                        "hover:bg-black/[0.02]",
                        busy ? "opacity-60" : "",
                      ].join(" ")}
                      aria-busy={busy || undefined}
                    >
                      <td className="py-3 pr-4 text-muted-foreground">
                        {row.date ? formatShortDate(row.date) : "Sin fecha"}
                      </td>
                      {showVendorColumn ? (
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {row.vendor === "—" ? "" : row.vendor}
                        </td>
                      ) : null}
                      <td className="py-3 pr-4 text-muted-foreground">
                        {row.description}
                      </td>
                      <td className="py-3 pl-2 text-right font-semibold text-foreground">
                        {formatMoney(row.amount, currency)}
                      </td>
                      {showCancelColumn ? (
                        <td className="py-3 pl-2 text-right">
                          {canCancel ? (
                            <button
                              type="button"
                              disabled={cancellingId !== null}
                              onClick={() => void requestCancel(row)}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-white/80 hover:text-rose-700 disabled:pointer-events-none disabled:opacity-40"
                              aria-label="Cancelar pago programado"
                            >
                              {busy ? (
                                <span
                                  className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
                                  aria-hidden
                                />
                              ) : (
                                <TrashIcon />
                              )}
                            </button>
                          ) : (
                            <span className="inline-block size-8" aria-hidden />
                          )}
                        </td>
                      ) : null}
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
