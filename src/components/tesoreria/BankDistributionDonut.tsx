"use client";

import * as React from "react";
import type { CurrencyCode } from "@/components/inicio/mock";
import { formatMoney } from "@/components/inicio/format";
import type { BankDistributionItem } from "./mock";

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

const palette = [
  { swatch: "bg-[color:var(--quipu-accent)]", fill: "rgba(46,107,255,1)" },
  { swatch: "bg-[color:var(--quipu-primary)]", fill: "rgba(17,78,216,0.92)" },
  { swatch: "bg-[color:var(--quipu-night)]", fill: "rgba(7,27,74,0.70)" },
  { swatch: "bg-slate-400", fill: "rgba(100,116,139,0.55)" },
  { swatch: "bg-emerald-500", fill: "rgba(16,185,129,0.70)" },
];

export type BankDistributionDonutProps = {
  title: string;
  total: number;
  items: BankDistributionItem[];
  currency: CurrencyCode;
};

export function BankDistributionDonut({
  title,
  total,
  items,
  currency,
}: BankDistributionDonutProps) {
  const safeTotal = total <= 0 ? 1 : total;

  const w = 240;
  const h = 240;
  const cx = w / 2;
  const cy = h / 2;
  const rOuter = 98;
  const rInner = 66;

  const segments = items.reduce<
    { item: BankDistributionItem; startAngle: number; endAngle: number; tone: (typeof palette)[number] }[]
  >((acc, it, idx) => {
    const pct = clamp01(it.amount / safeTotal);
    const sweep = pct * 360;
    const startAngle = acc.length ? acc[acc.length - 1]!.endAngle : 0;
    acc.push({
      item: it,
      startAngle,
      endAngle: startAngle + sweep,
      tone: palette[idx % palette.length]!,
    });
    return acc;
  }, []);

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:items-start">
          <div className="mx-auto w-full max-w-[200px]">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
              {segments.map((s) => (
                <path
                  key={s.item.id}
                  d={arcPath(cx, cy, rOuter, rInner, s.startAngle, s.endAngle)}
                  fill={s.tone.fill}
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="1.1"
                />
              ))}
              <circle cx={cx} cy={cy} r={rInner - 2} fill="white" opacity="0.72" />
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                className="fill-[color:var(--foreground)]"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                Total
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
            {items.map((it, idx) => {
              const tone = palette[idx % palette.length]!;
              return (
                <div
                  key={it.id}
                  className="rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
                >
                  <div className="grid min-w-0 grid-cols-[12px_minmax(0,1fr)_64px_120px] items-center gap-3">
                    <span className={["size-3 rounded-full ring-2 ring-[color:var(--quipu-border)]", tone.swatch].join(" ")} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {it.bank}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {(it.pct * 100).toFixed(1)}%
                    </div>
                    <div className="text-right text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                      {formatMoney(it.amount, currency)}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-1 text-center text-xs">
              <button type="button" className="text-[color:var(--primary)] hover:underline">
                Ver detalle de composición →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

