"use client";

import * as React from "react";
import type { RecentReportRow } from "./mock";
import {
  PagosCardPagination,
  PagosCardTableWithFooter,
} from "@/components/pagos/PagosCardPagination";

export type RecentReportsTableProps = {
  title: string;
  items: RecentReportRow[];
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

export function RecentReportsTable({ title, items, onRefresh }: RecentReportsTableProps) {
  const [page, setPage] = React.useState(0);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageIdx = Math.min(page, totalPages - 1);
  const pagedItems = items.slice(pageIdx * PAGE_SIZE, (pageIdx + 1) * PAGE_SIZE);

  React.useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  async function requestDelete(row: RecentReportRow) {
    const confirmed = window.confirm(
      "¿Querés eliminar este reporte?\n\nEsta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeletingId(row.id);

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || body.ok !== true) {
        const msg =
          typeof body.error === "string" && body.error.trim()
            ? body.error
            : "No se pudo eliminar el reporte.";
        setDeleteError(msg);
        return;
      }

      onRefresh?.();
    } catch {
      setDeleteError("No se pudo eliminar el reporte. Reintentá en unos segundos.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            {deleteError ? (
              <p className="mt-2 text-sm text-rose-700" role="alert">
                {deleteError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <PagosCardTableWithFooter
          table={
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-medium">Reporte</th>
                  <th className="py-3 pr-4 font-medium">Período</th>
                  <th className="py-3 pr-4 font-medium">Generado</th>
                  <th className="py-3 pr-4 font-medium">Formato</th>
                  <th className="py-3 pl-2 text-right font-medium"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagedItems.map((row) => {
                  const busy = deletingId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={[
                        "hover:bg-black/[0.02]",
                        busy ? "opacity-60" : "",
                      ].join(" ")}
                      aria-busy={busy || undefined}
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {row.nombre}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{row.periodo}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{row.generado}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-black/10">
                          {row.formato}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.downloadable ? (
                            <a
                              href={`/api/reports/${row.id}/download`}
                              className={
                                deletingId !== null
                                  ? "pointer-events-none text-sm font-medium text-muted-foreground opacity-40"
                                  : "text-sm font-medium text-foreground underline-offset-2 hover:underline"
                              }
                              aria-label={`Descargar ${row.nombre}`}
                              aria-disabled={deletingId !== null || undefined}
                            >
                              Descargar
                            </a>
                          ) : null}
                          <button
                            type="button"
                            disabled={deletingId !== null}
                            onClick={() => void requestDelete(row)}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-white/80 hover:text-rose-700 disabled:pointer-events-none disabled:opacity-40"
                            aria-label={`Eliminar reporte ${row.nombre}`}
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
                        </div>
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
