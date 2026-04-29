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

function extent(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
}

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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-flex size-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
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

  const w = 860;
  const h = 240;
  const padX = 34;
  const padY = 18;

  const maxValue = extent(
    filtered.map((p) => p.scheduled + p.paid + p.overdue),
  ).max;
  const maxY = Math.max(1, maxValue);

  const barW =
    filtered.length === 0 ? 0 : (w - padX * 2) / Math.max(1, filtered.length);
  const barInnerW = Math.max(6, Math.min(18, barW * 0.46));

  const chartH = h - padY * 2;
  const scale = (v: number) => (v / maxY) * chartH;

  const totals = filtered.reduce(
    (acc, p) => {
      acc.scheduled += p.scheduled;
      acc.paid += p.paid;
      acc.overdue += p.overdue;
      return acc;
    },
    { scheduled: 0, paid: 0, overdue: 0 },
  );

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Pagos programados, pagados y vencidos (mock).
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
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-[240px] w-full" role="img">
              <path
                d={`M${padX},${h - padY} H${w - padX}`}
                stroke="rgba(7,27,74,0.14)"
                strokeWidth="1"
              />

              {filtered.map((p, i) => {
                const xCenter =
                  padX + i * barW + Math.max(10, barW / 2);
                const x = xCenter - barInnerW / 2;

                const hPaid = scale(p.paid);
                const hScheduled = scale(p.scheduled);
                const hOverdue = scale(p.overdue);

                const yBase = h - padY;
                const yPaid = yBase - hPaid;
                const yScheduled = yPaid - hScheduled;
                const yOverdue = yScheduled - hOverdue;

                return (
                  <g key={`${p.label}-${i}`}>
                    {/* Paid */}
                    <rect
                      x={x}
                      y={yPaid}
                      width={barInnerW}
                      height={hPaid}
                      rx="6"
                      fill="rgba(46,107,255,0.90)"
                    />
                    {/* Scheduled */}
                    <rect
                      x={x}
                      y={yScheduled}
                      width={barInnerW}
                      height={hScheduled}
                      rx="6"
                      fill="rgba(17,78,216,0.75)"
                      opacity="0.85"
                    />
                    {/* Overdue */}
                    <rect
                      x={x}
                      y={yOverdue}
                      width={barInnerW}
                      height={hOverdue}
                      rx="6"
                      fill="rgba(244,63,94,0.86)"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <LegendDot color="bg-[color:var(--quipu-accent)]" label="Pagado" />
              <LegendDot color="bg-[color:var(--quipu-primary)]" label="Programado" />
              <LegendDot color="bg-rose-500" label="Vencido" />
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{filtered[0]?.label ?? ""}</span>
              <span>{filtered.at(-1)?.label ?? ""}</span>
            </div>
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

