"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { PaymentsCalendarPoint } from "./mock";

export type PaymentsCalendarChartProps = {
  title: string;
  points: PaymentsCalendarPoint[];
  currency: CurrencyCode;
};

type RangeKey = "7d" | "30d" | "90d" | "calendar";

const MAX_ROWS = 10;

function Segment({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-9 rounded-full px-3 text-xs font-semibold transition",
        active
          ? "bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)] ring-1 ring-[color:var(--quipu-border)]"
          : "border border-border bg-card text-muted-foreground hover:bg-white/70",
      ].join(" ")}
      aria-pressed={active ? "true" : "false"}
    >
      {label}
    </button>
  );
}

function formatRowDate(point: PaymentsCalendarPoint): string {
  const iso = point.dateIso;
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d
        .toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/\./g, "")
        .trim();
    }
  }
  return point.label || "—";
}

export function PaymentsCalendarChart({
  title,
  points,
  currency,
}: PaymentsCalendarChartProps) {
  const [range, setRange] = React.useState<RangeKey>("30d");

  const filtered = React.useMemo(() => {
    if (range === "7d") return points.slice(-7);
    if (range === "90d") return points;
    if (range === "calendar") return points;
    return points;
  }, [points, range]);

  const totals = filtered.reduce(
    (acc, p) => {
      acc.scheduled += p.scheduled;
      acc.paid += p.paid;
      acc.overdue += p.overdue;
      return acc;
    },
    { scheduled: 0, paid: 0, overdue: 0 },
  );

  const rows = React.useMemo(() => {
    return filtered
      .filter((p) => p.scheduled + p.paid + p.overdue > 0)
      .slice(0, MAX_ROWS)
      .map((p) => ({
        point: p,
        total: p.scheduled + p.paid + p.overdue,
      }));
  }, [filtered]);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Pagos programados, pagados y vencidos.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Segment label="7 días" active={range === "7d"} onClick={() => setRange("7d")} />
            <Segment
              label="30 días"
              active={range === "30d"}
              onClick={() => setRange("30d")}
            />
            <Segment
              label="90 días"
              active={range === "90d"}
              onClick={() => setRange("90d")}
            />
            <Segment
              label="Calendario"
              active={range === "calendar"}
              onClick={() => setRange("calendar")}
            />
          </div>
        </div>
      </div>

      <div className="qp-card-content">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white/60 px-4 py-10 text-center text-sm text-muted-foreground">
                Sin pagos en el período seleccionado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4 font-medium">Fecha</th>
                      <th className="py-3 pr-4 font-medium">Programado</th>
                      <th className="py-3 pr-4 font-medium">Pagado</th>
                      <th className="py-3 pr-4 font-medium">Vencido</th>
                      <th className="py-3 pl-2 text-right font-medium">
                        Total del día
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map(({ point, total }, idx) => (
                      <tr
                        key={`${point.dateIso ?? point.label}-${idx}`}
                        className="hover:bg-black/[0.02]"
                      >
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {formatRowDate(point)}
                        </td>
                        <td
                          className={[
                            "py-3 pr-4 tabular-nums",
                            point.scheduled > 0
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {formatMoney(point.scheduled, currency)}
                        </td>
                        <td
                          className={[
                            "py-3 pr-4 tabular-nums",
                            point.paid > 0
                              ? "font-semibold text-[color:var(--quipu-accent)]"
                              : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {formatMoney(point.paid, currency)}
                        </td>
                        <td
                          className={[
                            "py-3 pr-4 tabular-nums",
                            point.overdue > 0
                              ? "font-semibold text-rose-600"
                              : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {formatMoney(point.overdue, currency)}
                        </td>
                        <td className="py-3 pl-2 text-right font-semibold tabular-nums text-foreground">
                          {formatMoney(total, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="hidden rounded-2xl border border-border bg-white/60 px-4 py-3 text-right lg:block">
            <div className="text-xs text-muted-foreground">Total (período)</div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {formatMoney(totals.paid + totals.scheduled + totals.overdue, currency)}
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>Pagado</span>
                <span className="font-semibold text-foreground">
                  {formatMoney(totals.paid, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Programado</span>
                <span className="font-semibold text-foreground">
                  {formatMoney(totals.scheduled, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Vencido</span>
                <span className="font-semibold text-foreground">
                  {formatMoney(totals.overdue, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
