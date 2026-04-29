"use client";

import * as React from "react";
import type { ModuleRecommendationTab } from "./mock";

export type ModuleRecommendationsProps = {
  title: string;
  tabs: ModuleRecommendationTab[];
};

function TabButton({
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

export function ModuleRecommendations({ title, tabs }: ModuleRecommendationsProps) {
  const [activeKey, setActiveKey] = React.useState(tabs[0]?.key ?? "caja");
  const active =
    tabs.find((t) => t.key === activeKey) ?? tabs[0] ?? { key: "caja", label: "Caja", items: [] };

  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Recomendaciones simples por área (mock).
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((t) => (
              <TabButton
                key={t.key}
                label={t.label}
                active={t.key === active.key}
                onClick={() => setActiveKey(t.key)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          {active.items.map((it) => (
            <div
              key={it.id}
              className="rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80"
            >
              <div className="text-sm font-semibold text-foreground">{it.title}</div>
              {it.detail ? (
                <div className="mt-1 text-xs text-muted-foreground">{it.detail}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

