"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney, formatTimeAgo } from "@/components/inicio/format";
import type { CollectionsActivity } from "./mock";

export type RecentCollectionsActivityProps = {
  title: string;
  items: CollectionsActivity[];
  currency: CurrencyCode;
};

function ActivityIcon({ type }: { type: CollectionsActivity["type"] }) {
  const common = "size-4";
  switch (type) {
    case "Pago_recibido":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="M17 7H9.5a2.5 2.5 0 0 0 0 5H14.5a2.5 2.5 0 0 1 0 5H7" />
        </svg>
      );
    case "Recordatorio_enviado":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16v12H5.5L4 17.5V4Z" />
          <path d="M7 8h10" />
          <path d="M7 12h7" />
        </svg>
      );
    case "Link_de_pago":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
          <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
        </svg>
      );
    case "Factura_vencida":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h10v18l-5-3-5 3V3Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}

function pillForType(type: CollectionsActivity["type"]) {
  switch (type) {
    case "Pago_recibido":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Recordatorio_enviado":
      return "bg-slate-50 text-slate-700 ring-slate-100";
    case "Link_de_pago":
      return "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)] ring-[color:var(--quipu-border)]";
    case "Factura_vencida":
      return "bg-rose-50 text-rose-700 ring-rose-100";
  }
}

export function RecentCollectionsActivity({ title, items, currency }: RecentCollectionsActivityProps) {
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
            Ver todas
          </button>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {items.map((m) => {
            const isIncome = m.type === "Pago_recibido";
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "inline-flex size-8 items-center justify-center rounded-2xl ring-1 ring-black/5",
                        m.type === "Pago_recibido"
                          ? "bg-emerald-100 text-emerald-700"
                          : m.type === "Factura_vencida"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <ActivityIcon type={m.type} />
                    </span>
                    <div className="truncate text-sm font-medium text-foreground">
                      {m.description}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatTimeAgo(m.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  {m.amount != null ? (
                    <div
                      className={[
                        "text-sm font-semibold tabular-nums whitespace-nowrap",
                        isIncome ? "text-emerald-700" : "text-foreground",
                      ].join(" ")}
                    >
                      {isIncome ? "+" : ""} {formatMoney(m.amount, currency)}
                    </div>
                  ) : (
                    <div
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                        pillForType(m.type),
                      ].join(" ")}
                    >
                      {m.type === "Recordatorio_enviado"
                        ? "Recordatorio"
                        : m.type === "Link_de_pago"
                          ? "Link de pago"
                          : "Evento"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 text-center text-xs">
          <button
            type="button"
            className="text-[color:var(--primary)] hover:underline"
          >
            Ver toda la actividad →
          </button>
        </div>
      </div>
    </div>
  );
}

