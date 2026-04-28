"use client";

import * as React from "react";
import type { CashflowPoint, CurrencyCode } from "./mock";
import { formatMoney } from "./format";

export type CashflowChartProps = {
  points: CashflowPoint[];
  currency: CurrencyCode;
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

function linePath(
  values: number[],
  min: number,
  max: number,
  w: number,
  h: number,
  padX: number,
) {
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

export function CashflowChart({ points, currency }: CashflowChartProps) {
  const w = 820;
  const h = 220;
  const padX = 28;

  const income = points.map((p) => p.income);
  const expenses = points.map((p) => p.expenses);
  const balance = points.map((p) => p.balance);

  const { min, max } = extent([
    ...income,
    ...expenses.map((x) => -x),
    ...balance,
  ]);
  const minY = Math.min(0, min);
  const maxY = Math.max(max, 1);

  const incomePath = linePath(income, minY, maxY, w, h, padX);
  const expensesPath = linePath(expenses.map((x) => -x), minY, maxY, w, h, padX);
  const balancePath = linePath(balance, minY, maxY, w, h, padX);

  const latest = points.at(-1);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Flujo de caja
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Ingresos, egresos y saldo acumulado (mock).
            </div>
          </div>
          {latest ? (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Saldo actual</div>
              <div className="text-lg font-semibold text-foreground">
                {formatMoney(latest.balance, currency)}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="qp-card-content">
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-[220px] w-full"
            role="img"
            aria-label="Gráfico de flujo de caja"
          >
            <defs>
              <linearGradient id="quipuBalanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(15,76,255,0.18)" />
                <stop offset="1" stopColor="rgba(15,76,255,0)" />
              </linearGradient>
            </defs>

            <path
              d={`M${padX},${scaleY(0, minY, maxY, h).toFixed(2)} H${w - padX}`}
              stroke="rgba(7,27,74,0.14)"
              strokeWidth="1"
            />

            <path
              d={`${balancePath} L${w - padX},${h} L${padX},${h} Z`}
              fill="url(#quipuBalanceFill)"
              stroke="none"
              opacity="1"
            />

            <path
              d={balancePath}
              stroke="rgba(15,76,255,1)"
              strokeWidth="2.4"
              fill="none"
            />

            <path
              d={incomePath}
              stroke="rgba(29,99,232,0.85)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
            />

            <path
              d={expensesPath}
              stroke="rgba(7,44,108,0.55)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 5"
            />

            {points.map((p, i) => {
              const usableW = w - padX * 2;
              const step = points.length <= 1 ? usableW : usableW / (points.length - 1);
              const x = padX + i * step;
              const y = scaleY(p.balance, minY, maxY, h);
              return (
                <g key={p.label}>
                  <circle cx={x} cy={y} r="3.3" fill="rgba(15,76,255,1)" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <LegendDot color="bg-[color:var(--quipu-accent)]" label="Saldo acumulado" />
          <LegendDot color="bg-[color:var(--quipu-primary)]" label="Ingresos" dashed />
          <LegendDot color="bg-[color:var(--quipu-night)]" label="Egresos" dashed />
        </div>

        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>{points[0]?.label}</span>
          <span>{points.at(-1)?.label}</span>
        </div>
      </div>
    </div>
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
        {dashed ? (
          <span className={`h-1 w-full ${color} opacity-70`} />
        ) : null}
      </span>
      <span>{label}</span>
    </span>
  );
}

