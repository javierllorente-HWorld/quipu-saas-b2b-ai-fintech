"use client";

import * as React from "react";

export type NuevaTransferenciaModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

type FormState = {
  date: string;
  amount: string;
  sourceAccount: string;
  destinationAccount: string;
  description: string;
};

const defaultState: FormState = {
  date: "",
  amount: "",
  sourceAccount: "",
  destinationAccount: "",
  description: "",
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

export function NuevaTransferenciaModal({
  open,
  onClose,
  onSaved,
}: NuevaTransferenciaModalProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [form, setForm] = React.useState<FormState>(defaultState);
  const [error, setError] = React.useState<string | null>(null);

  const closeAndReset = React.useCallback(() => {
    setError(null);
    setForm(defaultState);
    onClose();
  }, [onClose]);

  useOnEscape(open, closeAndReset);

  const [lastOpen, setLastOpen] = React.useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open && error !== null) setError(null);
  }

  function onBackdropPointerDown(e: React.PointerEvent) {
    if (panelRef.current && panelRef.current.contains(e.target as Node)) return;
    closeAndReset();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const missing =
      !form.date.trim() ||
      !form.amount.trim() ||
      !form.sourceAccount.trim() ||
      !form.destinationAccount.trim() ||
      !form.description.trim();

    if (missing) {
      setError("Completá todos los campos.");
      return;
    }

    onSaved?.();
    closeAndReset();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Nueva transferencia"
      onPointerDown={onBackdropPointerDown}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]"
      >
        <div className="px-6 pt-6">
          <div className="text-lg font-semibold tracking-tight text-foreground">
            Nueva transferencia
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Completá los datos de la transferencia.
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-6 pb-6 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="qp-label" htmlFor="nt-date">
                Fecha
              </label>
              <input
                id="nt-date"
                type="date"
                className="qp-input"
                value={form.date}
                onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="nt-amount">
                Monto
              </label>
              <input
                id="nt-amount"
                type="number"
                inputMode="decimal"
                className="qp-input"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="nt-source">
                Cuenta origen
              </label>
              <input
                id="nt-source"
                type="text"
                className="qp-input"
                value={form.sourceAccount}
                onChange={(e) => setForm((s) => ({ ...s, sourceAccount: e.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="nt-dest">
                Cuenta destino
              </label>
              <input
                id="nt-dest"
                type="text"
                className="qp-input"
                value={form.destinationAccount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, destinationAccount: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="nt-desc">
                Descripción
              </label>
              <input
                id="nt-desc"
                type="text"
                className="qp-input"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
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
              Guardar transferencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
