"use client";

import * as React from "react";
import type { KeyIndicatorRow } from "./mock";

export type KeyIndicatorsTableProps = {
  title: string;
  items: KeyIndicatorRow[];
};

function StatusDot({ status }: { status: KeyIndicatorRow["estado"] }) {
  const tone =
    status === "ok" ? "bg-emerald-500" : status === "warn" ? "bg-amber-500" : "bg-rose-500";
  return <span className={["inline-flex size-2.5 rounded-full", tone].join(" ")} />;
}

export function KeyIndicatorsTable({ title, items }: KeyIndicatorsTableProps) {
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
                <th className="py-3 pr-4 font-medium">Indicador</th>
                <th className="py-3 pr-4 font-medium">Valor actual</th>
                <th className="py-3 pr-4 font-medium">Objetivo</th>
                <th className="py-3 pl-2 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {row.indicador}
                  </td>
                  <td className="py-3 pr-4 text-foreground">{row.valorActual}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.objetivo}</td>
                  <td className="py-3 pl-2 text-right">
                    <span className="inline-flex items-center justify-end gap-2">
                      <StatusDot status={row.estado} />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {row.estado === "ok"
                          ? "OK"
                          : row.estado === "warn"
                            ? "Atención"
                            : "Crítico"}
                      </span>
                    </span>
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

