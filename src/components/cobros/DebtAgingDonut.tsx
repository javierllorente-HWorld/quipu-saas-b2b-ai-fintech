"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { DebtAgingItem } from "./mock";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, startAngle);
  const endInner = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

const toneByKey: Record<string, { swatch: string; fill: string; ring: string }> =
  {
    noVencido: {
      swatch: "bg-[color:var(--quipu-accent)]",
      fill: "rgba(46,107,255,1)",
      ring: "ring-[color:var(--quipu-border)]",
    },
    vencido31_60: {
      swatch: "bg-[color:var(--quipu-primary)]",
      fill: "rgba(17,78,216,0.92)",
      ring: "ring-[color:var(--quipu-border)]",
    },
    vencido61_90: {
      swatch: "bg-[color:var(--quipu-night)]",
      fill: "rgba(7,27,74,0.70)",
      ring: "ring-[color:var(--quipu-border)]",
    },
    vencido90p: {
      swatch: "bg-rose-500",
      fill: "rgba(244,63,94,0.92)",
      ring: "ring-rose-100",
    },
  };

export type DebtAgingDonutProps = {
  title: string;
  total: number;
  items: DebtAgingItem[];
  currency: CurrencyCode;
};

export function DebtAgingDonut({ title, total, items, currency }: DebtAgingDonutProps) {
  const safeTotal = total <= 0 ? 1 : total;

  const w = 240;
  const h = 240;
  const cx = w / 2;
  const cy = h / 2;
  const rOuter = 98;
  const rInner = 66;

  const segments = items.reduce<
    { item: DebtAgingItem; startAngle: number; endAngle: number }[]
  >((acc, it) => {
    const pct = clamp01(it.amount / safeTotal);
    const sweep = pct * 360;
    const startAngle = acc.length ? acc[acc.length - 1]!.endAngle : 0;
    acc.push({ item: it, startAngle, endAngle: startAngle + sweep });
    return acc;
  }, []);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="text-base font-semibold tracking-tight">{title}</div>
      </div>

      <div className="qp-card-content">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:items-start">
          <div className="mx-auto w-full max-w-[200px]">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
              {segments.map((s) => {
                const tone = toneByKey[s.item.key] ?? toneByKey.noVencido;
                return (
                  <path
                    key={s.item.key}
                    d={arcPath(cx, cy, rOuter, rInner, s.startAngle, s.endAngle)}
                    fill={tone.fill}
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth="1.1"
                  />
                );
              })}
              <circle cx={cx} cy={cy} r={rInner - 2} fill="white" opacity="0.72" />
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                className="fill-[color:var(--foreground)]"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                Total por cobrar
              </text>
              <text
                x={cx}
                y={cy + 18}
                textAnchor="middle"
                className="fill-[color:var(--foreground)]"
                style={{ fontSize: 16, fontWeight: 700 }}
              >
                {formatMoney(total, currency)}
              </text>
            </svg>
          </div>

          <div className="min-w-0 space-y-2">
            {items.map((it) => {
              const tone = toneByKey[it.key] ?? toneByKey.noVencido;
              const pct = total <= 0 ? 0 : (it.amount / total) * 100;
              return (
                <div
                  key={it.key}
                  className="rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
                >
                  <div className="grid min-w-0 grid-cols-[12px_minmax(0,1fr)] items-start gap-x-3 gap-y-1 lg:grid-cols-[12px_minmax(0,1fr)_64px_120px] lg:items-center lg:gap-y-0">
                    <span
                      className={[
                        "size-3 rounded-full ring-2",
                        tone.swatch,
                        tone.ring,
                      ].join(" ")}
                      aria-hidden="true"
                    />

                    <div className="min-w-0">
                      <div className="text-sm font-medium leading-5 text-foreground break-normal whitespace-normal overflow-hidden max-h-10">
                        {it.label}
                      </div>
                    </div>

                    <div className="col-start-2 flex items-center justify-between gap-3 lg:hidden">
                      <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {pct.toFixed(1)}%
                      </div>
                      <div className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                        {formatMoney(it.amount, currency)}
                      </div>
                    </div>

                    <div className="hidden text-right lg:block">
                      <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {pct.toFixed(1)}%
                      </div>
                    </div>

                    <div className="hidden text-right lg:block">
                      <div className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                        {formatMoney(it.amount, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

