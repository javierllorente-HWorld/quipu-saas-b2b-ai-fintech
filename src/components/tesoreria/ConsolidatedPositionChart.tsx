"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { PositionPoint } from "./mock";

export type ConsolidatedPositionChartProps = {
  title: string;
  series: PositionPoint[];
  currency: CurrencyCode;
};

type RangeKey = "7d" | "30d" | "90d" | "daily";

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

function rangeAreaPath(
  mins: number[],
  maxs: number[],
  min: number,
  max: number,
  w: number,
  h: number,
  padX: number,
) {
  const usableW = w - padX * 2;
  const step = mins.length <= 1 ? usableW : usableW / (mins.length - 1);
  const top = maxs
    .map((v, i) => {
      const x = padX + i * step;
      const y = scaleY(v, min, max, h);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const bottom = mins
    .slice()
    .reverse()
    .map((v, ri) => {
      const i = mins.length - 1 - ri;
      const x = padX + i * step;
      const y = scaleY(v, min, max, h);
      return `L${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return `${top} ${bottom} Z`;
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

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
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

export function ConsolidatedPositionChart({
  title,
  series,
  currency,
}: ConsolidatedPositionChartProps) {
  const [range, setRange] = React.useState<RangeKey>("7d");

  const filtered = React.useMemo(() => {
    if (range === "daily") return series.slice(-5);
    if (range === "30d") return series;
    if (range === "90d") return series;
    return series;
  }, [series, range]);

  const w = 860;
  const h = 220;
  const padX = 28;

  const consolidated = filtered.map((p) => p.consolidated);
  const projection = filtered.map((p) => p.projection7d);
  const mins = filtered.map((p) => p.expectedMin);
  const maxs = filtered.map((p) => p.expectedMax);

  const { min, max } = extent([...consolidated, ...projection, ...mins, ...maxs]);
  const pad = (max - min) * 0.08;
  const minY = Math.min(min - pad, 0);
  const maxY = max + pad;

  const consolidatedPath = linePath(consolidated, minY, maxY, w, h, padX);
  const projectionPath = linePath(projection, minY, maxY, w, h, padX);
  const rangePath = rangeAreaPath(mins, maxs, minY, maxY, w, h, padX);

  const last = filtered.at(-1);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Liquidez consolidada y visibilidad de corto plazo.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Segment label="7 días" active={range === "7d"} onClick={() => setRange("7d")} />
            <Segment label="30 días" active={range === "30d"} onClick={() => setRange("30d")} />
            <Segment label="90 días" active={range === "90d"} onClick={() => setRange("90d")} />
            <Segment label="Diario" active={range === "daily"} onClick={() => setRange("daily")} />
          </div>
        </div>
      </div>

      <div className="qp-card-content">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full" role="img">
              <path
                d={`M${padX},${scaleY(0, minY, maxY, h).toFixed(2)} H${w - padX}`}
                stroke="rgba(7,27,74,0.14)"
                strokeWidth="1"
              />

              <path d={rangePath} fill="rgba(46,107,255,0.10)" stroke="none" />

              <path
                d={consolidatedPath}
                stroke="rgba(15,76,255,1)"
                strokeWidth="2.6"
                fill="none"
              />

              <path
                d={projectionPath}
                stroke="rgba(7,27,74,0.55)"
                strokeWidth="2.2"
                fill="none"
                strokeDasharray="6 6"
              />

              {filtered.map((p, i) => {
                const usableW = w - padX * 2;
                const step = filtered.length <= 1 ? usableW : usableW / (filtered.length - 1);
                const x = padX + i * step;
                const y = scaleY(p.consolidated, minY, maxY, h);
                return (
                  <g key={`${p.label}-${i}`}>
                    <circle cx={x} cy={y} r="3.3" fill="rgba(15,76,255,1)" />
                  </g>
                );
              })}
            </svg>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <LegendDot color="bg-[color:var(--quipu-accent)]" label="Posición consolidada" />
              <LegendDot color="bg-[color:var(--quipu-night)]" label="Proyección (7 días)" dashed />
              <LegendDot color="bg-[color:var(--quipu-primary)]" label="Rango esperado" />
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{filtered[0]?.label ?? ""}</span>
              <span>{filtered.at(-1)?.label ?? ""}</span>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-border bg-white/60 px-4 py-3 text-right lg:block">
            <div className="text-xs text-muted-foreground">Posición actual</div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {last ? formatMoney(last.consolidated, currency) : "-"}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Proyección 7d: {last ? formatMoney(last.projection7d, currency) : "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

