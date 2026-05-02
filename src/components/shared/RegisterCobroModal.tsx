"use client";

import * as React from "react";

export type RegisterCobroModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

type FormState = {
  date: string;
  amount: string;
  client: string;
  invoice: string;
  destinationAccount: string;
  description: string;
};

const defaultState: FormState = {
  date: "",
  amount: "",
  client: "",
  invoice: "",
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

export function RegisterCobroModal({ open, onClose, onSaved }: RegisterCobroModalProps) {
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
      !form.client.trim() ||
      !form.invoice.trim() ||
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
      aria-label="Registrar cobro"
      onPointerDown={onBackdropPointerDown}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]"
      >
        <div className="px-6 pt-6">
          <div className="text-lg font-semibold tracking-tight text-foreground">
            Registrar cobro
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Completá los datos del cobro.
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-6 pb-6 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="qp-label" htmlFor="rc-date">
                Fecha
              </label>
              <input
                id="rc-date"
                type="date"
                className="qp-input"
                value={form.date}
                onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="rc-amount">
                Monto
              </label>
              <input
                id="rc-amount"
                type="number"
                inputMode="decimal"
                className="qp-input"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="rc-client">
                Cliente
              </label>
              <input
                id="rc-client"
                type="text"
                className="qp-input"
                value={form.client}
                onChange={(e) => setForm((s) => ({ ...s, client: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="rc-invoice">
                Factura asociada
              </label>
              <input
                id="rc-invoice"
                type="text"
                className="qp-input"
                value={form.invoice}
                onChange={(e) => setForm((s) => ({ ...s, invoice: e.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="rc-account">
                Cuenta destino
              </label>
              <input
                id="rc-account"
                type="text"
                className="qp-input"
                value={form.destinationAccount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, destinationAccount: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="rc-desc">
                Descripción
              </label>
              <input
                id="rc-desc"
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
              Guardar cobro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
