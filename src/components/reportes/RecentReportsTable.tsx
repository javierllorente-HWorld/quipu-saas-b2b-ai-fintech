"use client";

import * as React from "react";
import type { RecentReportRow } from "./mock";
import { PagosCardPagination } from "@/components/pagos/PagosCardPagination";

export type RecentReportsTableProps = {
  title: string;
  items: RecentReportRow[];
};

const PAGE_SIZE = 3;

export function RecentReportsTable({ title, items }: RecentReportsTableProps) {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageIdx = Math.min(page, totalPages - 1);
  const pagedItems = items.slice(pageIdx * PAGE_SIZE, (pageIdx + 1) * PAGE_SIZE);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium">Reporte</th>
                <th className="py-3 pr-4 font-medium">Período</th>
                <th className="py-3 pr-4 font-medium">Generado</th>
                <th className="py-3 pr-4 font-medium">Formato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedItems.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
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
