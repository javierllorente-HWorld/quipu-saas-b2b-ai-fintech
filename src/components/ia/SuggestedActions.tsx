"use client";

import * as React from "react";
import type { SuggestedAction } from "./mock";

export type SuggestedActionsProps = {
  title: string;
  items: SuggestedAction[];
};

export function SuggestedActions({ title, items }: SuggestedActionsProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Próximos pasos sugeridos (mock).
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
          {items.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {a.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {a.description}
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-white/70"
              >
                {a.ctaLabel ?? "Actuar"}
              </button>
            </div>
          ))}
        </div>

        <div className="pt-3 text-center text-xs">
          <button type="button" className="text-[color:var(--primary)] hover:underline">
            Ver todas las acciones →
          </button>
        </div>
      </div>
    </div>
  );
}

