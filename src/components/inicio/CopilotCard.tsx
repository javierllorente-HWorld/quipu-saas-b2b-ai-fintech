"use client";

import * as React from "react";
import { IconSparkles } from "./icons";

export type CopilotCardProps = {
  suggestions: string[];
};

export function CopilotCard({ suggestions }: CopilotCardProps) {
  const [value, setValue] = React.useState("");

  return (
    <div className="rounded-[var(--radius-lg)] border border-white/10 bg-[color:var(--quipu-night)] text-white shadow-[0_18px_40px_rgba(7,27,74,0.22)]">
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
              <IconSparkles className="size-4" />
              Copiloto Quipu
            </div>
            <div className="mt-3 text-xl font-semibold tracking-tight">
              Preguntale a tu caja.
            </div>
            <div className="mt-1 text-sm text-white/70">
              Consultas inteligentes para decidir mejor (UI mock).
            </div>
          </div>
          <div className="hidden rounded-2xl bg-[color:var(--quipu-accent)]/15 px-3 py-2 text-xs text-white/80 ring-1 ring-white/10 sm:block">
            IA financiera
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.slice(0, 4).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setValue(q)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/15"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Escribí tu consulta…"
                className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/55 outline-none focus:ring-4 focus:ring-white/10"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--quipu-accent)] px-5 text-sm font-medium text-white hover:opacity-95 active:translate-y-px"
            >
              <IconSparkles className="size-4" />
              Consultar
            </button>
          </div>
          <div className="mt-3 text-xs text-white/55">
            Ejemplo: “Proyectá mi saldo a 30 días y marcá la semana de mayor riesgo”.
          </div>
        </div>
      </div>
    </div>
  );
}

