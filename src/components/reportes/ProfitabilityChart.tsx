"use client";

import * as React from "react";
import type { ProfitabilityPoint } from "./mock";

export type ProfitabilityChartProps = {
  title: string;
  points: ProfitabilityPoint[];
};

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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-flex size-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

export function ProfitabilityChart({ title, points }: ProfitabilityChartProps) {
  const w = 420;
  const h = 220;
  const padX = 24;

  const op = points.map((p) => p.margenOperativoPct);
  const net = points.map((p) => p.margenNetoPct);
  const { min, max } = extent([...op, ...net, 0]);
  const pad = (max - min) * 0.15;
  const minY = Math.min(min - pad, 0);
  const maxY = max + pad;

  const opPath = linePath(op, minY, maxY, w, h, padX);
  const netPath = linePath(net, minY, maxY, w, h, padX);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Márgenes operativos y netos (mock).
            </div>
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full" role="img">
            <path
              d={`M${padX},${scaleY(0, minY, maxY, h).toFixed(2)} H${w - padX}`}
              stroke="rgba(7,27,74,0.14)"
              strokeWidth="1"
            />

            <path
              d={opPath}
              stroke="rgba(46,107,255,1)"
              strokeWidth="2.6"
              fill="none"
            />
            <path
              d={netPath}
              stroke="rgba(7,27,74,0.55)"
              strokeWidth="2.2"
              fill="none"
              strokeDasharray="6 6"
            />

            {points.map((p, i) => {
              const usableW = w - padX * 2;
              const step = points.length <= 1 ? usableW : usableW / (points.length - 1);
              const x = padX + i * step;
              const y = scaleY(p.margenOperativoPct, minY, maxY, h);
              return (
                <g key={`${p.label}-${i}`}>
                  <circle cx={x} cy={y} r="3.2" fill="rgba(46,107,255,1)" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <LegendDot color="bg-[color:var(--quipu-accent)]" label="Margen operativo (%)" />
          <LegendDot color="bg-[color:var(--quipu-night)]" label="Margen neto (%)" />
        </div>

        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>{points[0]?.label ?? ""}</span>
          <span>{points.at(-1)?.label ?? ""}</span>
        </div>
      </div>
    </div>
  );
}

