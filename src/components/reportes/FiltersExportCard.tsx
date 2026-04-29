"use client";

import * as React from "react";

export type FiltersExportCardProps = {
  title: string;
};

export function FiltersExportCard({ title }: FiltersExportCardProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="text-base font-semibold tracking-tight">{title}</div>
      </div>
      <div className="qp-card-content">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Período</div>
            <input className="qp-input mt-2 h-10" placeholder="01/01/2025 — 30/06/2025" />
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground">Comparar con</div>
            <select className="mt-2 h-10 w-full rounded-2xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm hover:bg-white/70">
              <option>Mismo período del año anterior</option>
              <option>Período anterior</option>
              <option>Sin comparación</option>
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground">Frecuencia</div>
            <select className="mt-2 h-10 w-full rounded-2xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm hover:bg-white/70">
              <option>Mensual</option>
              <option>Semanal</option>
              <option>Diaria</option>
            </select>
          </div>

          <button type="button" className="qp-btn-primary h-10 w-full px-4">
            Exportar reporte
          </button>
          <button type="button" className="qp-btn-secondary h-10 w-full px-4">
            Programar envío
          </button>
        </div>
      </div>
    </div>
  );
}

