"use client";

import * as React from "react";

export type GenerateReportModalProps = {
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
};

type FormState = {
  report: string;
  period: string;
};

const REPORT_OPTIONS = [
  "Ingresos vs egresos",
  "Indicadores clave",
] as const;

const PERIOD_OPTIONS = ["Mensual", "Trimestral", "Anual"] as const;

const defaultState: FormState = {
  report: "",
  period: "",
};

function useOnEscape(active: boolean, onEscape: () => void) {
  React.useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onEscape();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onEscape]);
}

export function GenerateReportModal({ open, onClose, onGenerated }: GenerateReportModalProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [form, setForm] = React.useState<FormState>(defaultState);
  const [error, setError] = React.useState<string | null>(null);

  useOnEscape(open, () => {
    onClose();
  });

  const [lastOpen, setLastOpen] = React.useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open && error !== null) setError(null);
  }

  function closeAndReset() {
    setError(null);
    setForm(defaultState);
    onClose();
  }

  function onBackdropPointerDown(e: React.PointerEvent) {
    if (panelRef.current && panelRef.current.contains(e.target as Node)) return;
    closeAndReset();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.report || !form.period) {
      setError("Seleccioná reporte y período.");
      return;
    }

    if (!REPORT_OPTIONS.includes(form.report as (typeof REPORT_OPTIONS)[number])) {
      setError("Seleccioná un reporte válido.");
      return;
    }

    if (!PERIOD_OPTIONS.includes(form.period as (typeof PERIOD_OPTIONS)[number])) {
      setError("Seleccioná un período válido.");
      return;
    }

    onGenerated?.();
    closeAndReset();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Generar reporte"
      onPointerDown={onBackdropPointerDown}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]"
      >
        <div className="px-6 pt-6">
          <div className="text-lg font-semibold tracking-tight text-foreground">
            Generar reporte
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Seleccioná el período y el reporte que querés generar.
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-6 pb-6 pt-5">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="qp-label" htmlFor="gr-report">
                Reporte
              </label>
              <select
                id="gr-report"
                className="h-11 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground"
                value={form.report}
                onChange={(e) => setForm((s) => ({ ...s, report: e.target.value }))}
              >
                <option value="" disabled>
                  Seleccionar…
                </option>
                {REPORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="gr-period">
                Período
              </label>
              <select
                id="gr-period"
                className="h-11 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground"
                value={form.period}
                onChange={(e) => setForm((s) => ({ ...s, period: e.target.value }))}
              >
                <option value="" disabled>
                  Seleccionar…
                </option>
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="qp-btn-secondary h-10 px-4" onClick={closeAndReset}>
              Cancelar
            </button>
            <button type="submit" className="qp-btn-primary h-10 px-4">
              Generar reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
