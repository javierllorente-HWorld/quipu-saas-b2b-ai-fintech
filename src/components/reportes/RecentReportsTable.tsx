"use client";

import * as React from "react";
import type { RecentReportRow } from "./mock";

export type RecentReportsTableProps = {
  title: string;
  items: RecentReportRow[];
};

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v10" />
      <path d="M8 11l4 4 4-4" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function RecentReportsTable({ title, items }: RecentReportsTableProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
          </div>
          <button
            type="button"
            className="qp-btn-ghost h-9 px-4 text-[color:var(--primary)] hover:bg-[color:var(--quipu-ice)]"
          >
            Ver todos
          </button>
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
                <th className="py-3 pl-2 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
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
                  <td className="py-3 pl-2 text-right">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-2xl border border-border bg-card text-foreground hover:bg-white/70"
                      aria-label="Descargar reporte"
                    >
                      <DownloadIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

