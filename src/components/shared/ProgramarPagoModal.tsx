"use client";

import * as React from "react";

export type ProgramarPagoModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  bankAccounts?: { id: string; label: string }[];
};

type FormState = {
  paymentDate: string;
  amount: string;
  vendor: string;
  concept: string;
  sourceAccount: string;
  category: string;
};

const defaultState: FormState = {
  paymentDate: "",
  amount: "",
  vendor: "",
  concept: "",
  sourceAccount: "",
  category: "Proveedores",
};

const categories = ["Proveedores", "Servicios", "Sueldos", "Impuestos", "Otros"];

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

function parseIsoDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function toPositiveNumber(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || !(n > 0)) return null;
  return Math.abs(n);
}

export function ProgramarPagoModal({
  open,
  onClose,
  onSaved,
  bankAccounts = [],
}: ProgramarPagoModalProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [form, setForm] = React.useState<FormState>(defaultState);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const paymentDate = parseIsoDate(form.paymentDate);
    if (!paymentDate) {
      setError("La fecha de pago es obligatoria.");
      return;
    }

    const amount = toPositiveNumber(form.amount);
    if (amount == null) {
      setError("El monto debe ser mayor a 0.");
      return;
    }

    const description = form.concept.trim();
    if (!description) {
      setError("El concepto es obligatorio.");
      return;
    }

    const vendorName = form.vendor.trim() ? form.vendor.trim() : undefined;
    const bankAccountId = form.sourceAccount.trim() ? form.sourceAccount.trim() : undefined;
    const category = form.category.trim() ? form.category.trim() : undefined;

    try {
      setSaving(true);
      const res = await fetch("/api/payables/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentDate,
          amount,
          vendorName,
          description,
          bankAccountId,
          category,
        }),
      });

      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || body.ok !== true) {
        throw new Error(
          typeof body.error === "string" && body.error.trim()
            ? body.error
            : "No se pudo programar el pago.",
        );
      }

      onSaved?.();
      closeAndReset();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo programar el pago.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Programar pago"
      onPointerDown={onBackdropPointerDown}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]"
      >
        <div className="px-6 pt-6">
          <div className="text-lg font-semibold tracking-tight text-foreground">
            Programar pago
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Completá los datos del pago.
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-6 pb-6 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="qp-label" htmlFor="pp-date">
                Fecha de pago
              </label>
              <input
                id="pp-date"
                type="date"
                className="qp-input"
                value={form.paymentDate}
                onChange={(e) => setForm((s) => ({ ...s, paymentDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="pp-amount">
                Monto
              </label>
              <input
                id="pp-amount"
                type="number"
                inputMode="decimal"
                className="qp-input"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="pp-vendor">
                Proveedor
              </label>
              <input
                id="pp-vendor"
                type="text"
                className="qp-input"
                value={form.vendor}
                onChange={(e) => setForm((s) => ({ ...s, vendor: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="pp-concept">
                Concepto
              </label>
              <input
                id="pp-concept"
                type="text"
                className="qp-input"
                value={form.concept}
                onChange={(e) => setForm((s) => ({ ...s, concept: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="pp-source">
                Cuenta origen
              </label>
              {bankAccounts.length > 0 ? (
                <select
                  id="pp-source"
                  className="qp-input"
                  value={form.sourceAccount}
                  onChange={(e) => setForm((s) => ({ ...s, sourceAccount: e.target.value }))}
                  disabled={saving}
                >
                  <option value="">Seleccionar…</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="pp-source"
                  type="text"
                  className="qp-input"
                  value={form.sourceAccount}
                  onChange={(e) => setForm((s) => ({ ...s, sourceAccount: e.target.value }))}
                  placeholder="(opcional)"
                  disabled={saving}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="pp-category">
                Categoría
              </label>
              <select
                id="pp-category"
                className="h-11 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground"
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
            <button
              type="submit"
              className="qp-btn-primary h-10 px-4 disabled:pointer-events-none disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Programando…" : "Programar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
