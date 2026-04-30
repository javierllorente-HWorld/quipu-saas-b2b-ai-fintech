"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { IncomeExpenseDataset, IncomeExpenseRangeKey } from "./mock";

export type IncomeExpenseChartProps = {
  title: string;
  datasets: IncomeExpenseDataset[];
  currency: CurrencyCode;
};

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

function extent(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
}

function scaleY(value: number, min: number, max: number, height: number) {
  if (max === min) return height / 2;
  const t = (value - min) / (max - min);
  return height - t * height;
}

function linePath(values: number[], min: number, max: number, w: number, h: number, padX: number) {
  const usableW = w - padX * 2;
  const step = values.length <= 1 ? usableW : usableW / (values.length - 1);
  return values
    .map((v, i) => {
      const x = padX + i * step;
      const y = scaleY(v, min, max, h);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function LegendDot({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={[
          "inline-flex h-2.5 w-7 items-center justify-center rounded-full",
          dashed ? "bg-transparent" : color,
          dashed ? "ring-1 ring-black/15" : "",
        ].join(" ")}
      >
        {dashed ? <span className={`h-1 w-full ${color} opacity-70`} /> : null}
      </span>
      <span>{label}</span>
    </span>
  );
}

export function IncomeExpenseChart({ title, datasets, currency }: IncomeExpenseChartProps) {
  const [range, setRange] = React.useState<IncomeExpenseRangeKey>("YTD");

  const dataset = React.useMemo(
    () => datasets.find((d) => d.key === range) ?? datasets[0],
    [datasets, range],
  );

  const points = dataset?.points ?? [];

  const w = 860;
  const h = 240;
  const padX = 34;
  const padY = 18;
  const chartH = h - padY * 2;

  const values = points.flatMap((p) => [
    p.ingresos,
    p.egresos,
    p.proyeccionIngresos,
    p.proyeccionEgresos,
  ]);
  const { min, max } = extent(values.length ? values : [0, 1]);
  const minY = Math.min(0, min);
  const maxY = Math.max(1, max);

  const barW =
    points.length === 0 ? 0 : (w - padX * 2) / Math.max(1, points.length);
  const barInnerW = Math.max(10, Math.min(18, barW * 0.48));

  const ingresosLine = linePath(
    points.map((p) => p.proyeccionIngresos),
    minY,
    maxY,
    w,
    chartH,
    padX,
  );
  const egresosLine = linePath(
    points.map((p) => p.proyeccionEgresos),
    minY,
    maxY,
    w,
    chartH,
    padX,
  );

  const last = points.at(-1);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Evolución y proyección de ingresos/egresos.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Segment label="YTD" active={range === "YTD"} onClick={() => setRange("YTD")} />
            <Segment label="6M" active={range === "6M"} onClick={() => setRange("6M")} />
            <Segment label="12M" active={range === "12M"} onClick={() => setRange("12M")} />
            <Segment
              label="Mensual"
              active={range === "Mensual"}
              onClick={() => setRange("Mensual")}
            />
          </div>
        </div>
      </div>

      <div className="qp-card-content">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-[240px] w-full" role="img">
              <g transform={`translate(0, ${padY})`}>
                <path
                  d={`M${padX},${scaleY(0, minY, maxY, chartH).toFixed(2)} H${w - padX}`}
                  stroke="rgba(7,27,74,0.14)"
                  strokeWidth="1"
                />

                {points.map((p, i) => {
                  const xCenter = padX + i * barW + Math.max(10, barW / 2);
                  const xIngresos = xCenter - barInnerW - 2;
                  const xEgresos = xCenter + 2;

                  const hIngresos = (p.ingresos / maxY) * chartH;
                  const hEgresos = (p.egresos / maxY) * chartH;
                  const yBase = chartH;

                  return (
                    <g key={`${p.label}-${i}`}>
                      <rect
                        x={xIngresos}
                        y={yBase - hIngresos}
                        width={barInnerW}
                        height={hIngresos}
                        rx="6"
                        fill="rgba(46,107,255,0.90)"
                      />
                      <rect
                        x={xEgresos}
                        y={yBase - hEgresos}
                        width={barInnerW}
                        height={hEgresos}
                        rx="6"
                        fill="rgba(7,27,74,0.70)"
                        opacity="0.70"
                      />
                    </g>
                  );
                })}

                <path
                  d={ingresosLine}
                  stroke="rgba(46,107,255,0.95)"
                  strokeWidth="2.2"
                  fill="none"
                  strokeDasharray="6 6"
                />
                <path
                  d={egresosLine}
                  stroke="rgba(7,27,74,0.55)"
                  strokeWidth="2.2"
                  fill="none"
                  strokeDasharray="6 6"
                />
              </g>
            </svg>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <LegendDot color="bg-[color:var(--quipu-accent)]" label="Ingresos" />
              <LegendDot color="bg-[color:var(--quipu-night)]" label="Egresos" />
              <LegendDot
                color="bg-[color:var(--quipu-accent)]"
                label="Proyección ingresos"
                dashed
              />
              <LegendDot
                color="bg-[color:var(--quipu-night)]"
                label="Proyección egresos"
                dashed
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{points[0]?.label ?? ""}</span>
              <span>{points.at(-1)?.label ?? ""}</span>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-border bg-white/60 px-4 py-3 text-right lg:block">
            <div className="text-xs text-muted-foreground">Último período</div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {last ? last.label : "-"}
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>Ingresos</span>
                <span className="font-semibold text-foreground">
                  {last ? formatMoney(last.ingresos, currency) : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Egresos</span>
                <span className="font-semibold text-foreground">
                  {last ? formatMoney(last.egresos, currency) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

