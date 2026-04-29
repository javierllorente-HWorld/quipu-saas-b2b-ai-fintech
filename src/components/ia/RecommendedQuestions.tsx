"use client";

import * as React from "react";
import type { RecommendedQuestion } from "./mock";

export type RecommendedQuestionsProps = {
  title: string;
  items: RecommendedQuestion[];
};

export function RecommendedQuestions({ title, items }: RecommendedQuestionsProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Sugerencias para explorar rápido.
            </div>
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-2">
          {items.map((q) => (
            <button
              key={q.id}
              type="button"
              className="w-full rounded-2xl border border-border bg-white/60 px-4 py-3 text-left text-sm text-foreground hover:bg-white/80"
            >
              {q.text}
            </button>
          ))}
        </div>

        <div className="pt-3 text-center text-xs">
          <button type="button" className="text-[color:var(--primary)] hover:underline">
            Ver todas las preguntas →
          </button>
        </div>
      </div>
    </div>
  );
}

