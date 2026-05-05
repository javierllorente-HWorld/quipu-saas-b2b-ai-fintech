"use client";

import * as React from "react";

export type NuevaTransferenciaModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  bankAccounts?: { id: string; label: string }[];
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

export function NuevaTransferenciaModal({
  open,
  onClose,
  onSaved,
  bankAccounts = [],
}: NuevaTransferenciaModalProps) {
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

    const transferDate = parseIsoDate(form.date);
    if (!transferDate) {
      setError("La fecha es obligatoria.");
      return;
    }

    const amount = toPositiveNumber(form.amount);
    if (amount == null) {
      setError("El monto debe ser mayor a 0.");
      return;
    }

    const fromBankAccountId = form.sourceAccount.trim();
    const toBankAccountId = form.destinationAccount.trim();
    if (!fromBankAccountId) {
      setError("Seleccioná una cuenta origen.");
      return;
    }
    if (!toBankAccountId) {
      setError("Seleccioná una cuenta destino.");
      return;
    }
    if (fromBankAccountId === toBankAccountId) {
      setError("La cuenta origen y destino no pueden ser la misma.");
      return;
    }

    const description = form.description.trim();
    if (!description) {
      setError("La descripción es obligatoria.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/treasury/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferDate,
          amount,
          fromBankAccountId,
          toBankAccountId,
          description,
        }),
      });

      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || body.ok !== true) {
        throw new Error(
          typeof body.error === "string" && body.error.trim()
            ? body.error
            : "No se pudo registrar la transferencia.",
        );
      }

      onSaved?.();
      closeAndReset();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la transferencia.");
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
              <select
                id="nt-source"
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
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="nt-dest">
                Cuenta destino
              </label>
              <select
                id="nt-dest"
                className="qp-input"
                value={form.destinationAccount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, destinationAccount: e.target.value }))
                }
                disabled={saving}
              >
                <option value="">Seleccionar…</option>
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.label}
                  </option>
                ))}
              </select>
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
            <button
              type="submit"
              className="qp-btn-primary h-10 px-4 disabled:pointer-events-none disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar transferencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
