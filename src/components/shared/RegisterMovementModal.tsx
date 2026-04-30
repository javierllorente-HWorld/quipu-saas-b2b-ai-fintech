"use client";

import * as React from "react";

type MovementType = "Ingreso" | "Egreso";

export type RegisterMovementModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

type FormState = {
  type: MovementType | "";
  description: string;
  amount: string;
  date: string;
  category: string;
  counterparty: string;
};

const defaultState: FormState = {
  type: "",
  description: "",
  amount: "",
  date: "",
  category: "Ventas",
  counterparty: "",
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

export function RegisterMovementModal({ open, onClose, onSaved }: RegisterMovementModalProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [form, setForm] = React.useState<FormState>(defaultState);
  const [error, setError] = React.useState<string | null>(null);

  useOnEscape(open, () => {
    onClose();
  });

  React.useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

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

    if (!form.type || !form.description.trim() || !form.amount.trim() || !form.date.trim()) {
      setError("Completá tipo, descripción, monto y fecha.");
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
      aria-label="Registrar movimiento"
      onPointerDown={onBackdropPointerDown}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]"
      >
        <div className="px-6 pt-6">
          <div className="text-lg font-semibold tracking-tight text-foreground">
            Registrar movimiento
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Cargá un ingreso o egreso manualmente.
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-6 pb-6 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="qp-label" htmlFor="rm-type">
                Tipo de movimiento
              </label>
              <select
                id="rm-type"
                className="h-11 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground"
                value={form.type}
                onChange={(e) =>
                  setForm((s) => ({ ...s, type: e.target.value as MovementType }))
                }
              >
                <option value="" disabled>
                  Seleccionar…
                </option>
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="rm-date">
                Fecha
              </label>
              <input
                id="rm-date"
                type="date"
                className="qp-input"
                value={form.date}
                onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="rm-desc">
                Descripción
              </label>
              <input
                id="rm-desc"
                type="text"
                className="qp-input"
                placeholder="Ej: Cobro factura #1842"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="rm-amount">
                Monto
              </label>
              <input
                id="rm-amount"
                type="number"
                inputMode="decimal"
                className="qp-input"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="rm-category">
                Categoría
              </label>
              <select
                id="rm-category"
                className="h-11 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground"
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              >
                {["Ventas", "Servicios", "Sueldos", "Impuestos", "Proveedores", "Otros"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="rm-counterparty">
                Contraparte
              </label>
              <input
                id="rm-counterparty"
                type="text"
                className="qp-input"
                placeholder="Cliente o proveedor"
                value={form.counterparty}
                onChange={(e) => setForm((s) => ({ ...s, counterparty: e.target.value }))}
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="qp-btn-secondary h-10 px-4"
              onClick={closeAndReset}
            >
              Cancelar
            </button>
            <button type="submit" className="qp-btn-primary h-10 px-4">
              Guardar movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

