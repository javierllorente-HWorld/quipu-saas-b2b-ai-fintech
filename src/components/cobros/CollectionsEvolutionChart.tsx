"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { CollectionsEvolutionPoint } from "./mock";

export type CollectionsEvolutionChartProps = {
  points: CollectionsEvolutionPoint[];
  currency: CurrencyCode;
};

type RangeKey = "30d" | "90d" | "12m" | "1d";

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

export function CollectionsEvolutionChart({ points, currency }: CollectionsEvolutionChartProps) {
  const [range, setRange] = React.useState<RangeKey>("30d");

  const filtered = React.useMemo(() => {
    if (range === "1d") return points.slice(-2);
    if (range === "90d") return points;
    if (range === "12m") return points;
    return points;
  }, [points, range]);

  const w = 820;
  const h = 220;
  const padX = 28;

  const collected = filtered.map((p) => p.collected);
  const goal = filtered.map((p) => p.goal);

  const { min, max } = extent([...collected, ...goal]);
  const pad = (max - min) * 0.08;
  const minY = Math.min(min - pad, 0);
  const maxY = max + pad;

  const collectedPath = linePath(collected, minY, maxY, w, h, padX);
  const goalPath = linePath(goal, minY, maxY, w, h, padX);

  const last = filtered.at(-1);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">Evolución de cobros</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Cobrado vs meta.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Segment label="30 días" active={range === "30d"} onClick={() => setRange("30d")} />
            <Segment label="90 días" active={range === "90d"} onClick={() => setRange("90d")} />
            <Segment label="12 meses" active={range === "12m"} onClick={() => setRange("12m")} />
            <Segment label="Diario" active={range === "1d"} onClick={() => setRange("1d")} />
          </div>
        </div>
      </div>

      <div className="qp-card-content">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full" role="img">
              <defs>
                <linearGradient id="quipuCollectedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(15,76,255,0.14)" />
                  <stop offset="1" stopColor="rgba(15,76,255,0)" />
                </linearGradient>
              </defs>

              <path
                d={`M${padX},${scaleY(0, minY, maxY, h).toFixed(2)} H${w - padX}`}
                stroke="rgba(7,27,74,0.14)"
                strokeWidth="1"
              />

              <path
                d={`${collectedPath} L${w - padX},${h} L${padX},${h} Z`}
                fill="url(#quipuCollectedFill)"
                stroke="none"
              />

              <path
                d={collectedPath}
                stroke="rgba(15,76,255,1)"
                strokeWidth="2.6"
                fill="none"
              />

              <path
                d={goalPath}
                stroke="rgba(7,27,74,0.55)"
                strokeWidth="2.2"
                fill="none"
                strokeDasharray="6 6"
              />

              {filtered.map((p, i) => {
                const usableW = w - padX * 2;
                const step = filtered.length <= 1 ? usableW : usableW / (filtered.length - 1);
                const x = padX + i * step;
                const y = scaleY(p.collected, minY, maxY, h);
                return (
                  <g key={`${p.label}-${i}`}>
                    <circle cx={x} cy={y} r="3.3" fill="rgba(15,76,255,1)" />
                  </g>
                );
              })}
            </svg>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <LegendDot color="bg-[color:var(--quipu-accent)]" label="Cobrado" />
              <LegendDot color="bg-[color:var(--quipu-night)]" label="Meta" dashed />
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{filtered[0]?.label ?? ""}</span>
              <span>{filtered.at(-1)?.label ?? ""}</span>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-border bg-white/60 px-4 py-3 text-right lg:block">
            <div className="text-xs text-muted-foreground">Cobrado (último punto)</div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {last ? formatMoney(last.collected, currency) : "-"}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Meta: {last ? formatMoney(last.goal, currency) : "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

