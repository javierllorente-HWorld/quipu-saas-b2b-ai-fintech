"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { VendorRow } from "./mock";

export type VendorsTableProps = {
  title: string;
  items: VendorRow[];
  currency: CurrencyCode;
};

function VendorAvatar({ name }: { name: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "P";
  return (
    <span className="inline-flex size-7 items-center justify-center rounded-xl bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)] text-xs font-bold ring-1 ring-[color:var(--quipu-border)]">
      {initial}
    </span>
  );
}

export function VendorsTable({ title, items, currency }: VendorsTableProps) {
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
                <th className="py-3 pr-4 font-medium">Proveedor</th>
                <th className="py-3 pr-4 font-medium">Pagos pendientes</th>
                <th className="py-3 pl-2 text-right font-medium">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <VendorAvatar name={row.vendor} />
                      <div className="font-medium text-foreground">{row.vendor}</div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-black/10">
                      {row.pendingCount}
                    </span>
                  </td>
                  <td className="py-3 pl-2 text-right font-semibold text-foreground">
                    {formatMoney(row.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 text-center text-xs">
          <button type="button" className="text-[color:var(--primary)] hover:underline">
            Ver todos los proveedores →
          </button>
        </div>
      </div>
    </div>
  );
}

