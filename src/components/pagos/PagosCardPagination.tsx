"use client";

import type { ReactNode } from "react";

export type PagosCardTableWithFooterProps = {
  table: ReactNode;
  footer: ReactNode;
};

/**
 * Mantiene la paginación al pie de la card (derecha) con espacio flexible si hay pocas filas.
 */
export function PagosCardTableWithFooter({ table, footer }: PagosCardTableWithFooterProps) {
  return (
    <div className="flex min-h-[10.5rem] flex-col sm:min-h-[12.5rem] md:min-h-[14rem]">
      <div className="min-h-0 flex-1 overflow-x-auto">{table}</div>
      <div className="mt-auto w-full shrink-0">{footer}</div>
    </div>
  );
}

export type PagosCardPaginationProps = {
  pageIndex: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export function PagosCardPagination({
  pageIndex,
  totalPages,
  onPrev,
  onNext,
}: PagosCardPaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const current = Math.min(pageIndex, safeTotal - 1) + 1;
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < safeTotal - 1;

  return (
    <div className="flex items-center justify-end gap-3 pt-3">
      <span className="text-xs text-muted-foreground tabular-nums">
        {current} de {safeTotal}
      </span>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={!canPrev}
          onClick={onPrev}
          className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium leading-none text-foreground transition hover:bg-white/80 disabled:pointer-events-none disabled:opacity-40"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Página siguiente"
          disabled={!canNext}
          onClick={onNext}
          className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium leading-none text-foreground transition hover:bg-white/80 disabled:pointer-events-none disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}
