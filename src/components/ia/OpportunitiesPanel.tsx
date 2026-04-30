"use client";

import * as React from "react";
import type { Opportunity } from "./mock";

export type OpportunitiesPanelProps = {
  title: string;
  items: Opportunity[];
};

export function OpportunitiesPanel({ title, items }: OpportunitiesPanelProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Recomendaciones priorizadas.
            </div>
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
          {items.map((it) => (
            <div
              key={it.id}
              className="rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
            >
              <div className="text-sm font-semibold text-foreground">
                {it.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{it.impact}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

