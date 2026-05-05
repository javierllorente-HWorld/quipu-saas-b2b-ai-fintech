"use client";

import * as React from "react";

type MovementType = "Cobro" | "Pago" | "Transferencia" | "Ajuste";

export type BankAccountOption = {
  id: string;
  label: string;
};

export type RegisterMovementModalProps = {
  open: boolean;
  onClose: () => void;
  /** Cuentas desde /api/cash (bankBalances). */
  bankAccounts: BankAccountOption[];
  /** Tras guardar OK en el servidor y refrescar caja (puede ser async). */
  onSaved?: () => void | Promise<void>;
};

type FormState = {
  type: MovementType | "";
  date: string;
  amount: string;
  bankAccountId: string;
  counterparty: string;
  description: string;
};

const defaultState: FormState = {
  type: "",
  date: "",
  amount: "",
  bankAccountId: "",
  counterparty: "",
  description: "",
};

const UNAVAILABLE_TYPE_MSG = "Tipo de movimiento no disponible en esta versión";

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

export function RegisterMovementModal({
  open,
  onClose,
  bankAccounts,
  onSaved,
}: RegisterMovementModalProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [form, setForm] = React.useState<FormState>(defaultState);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const closeAndReset = React.useCallback(() => {
    setError(null);
    setSaving(false);
    setForm(defaultState);
    onClose();
  }, [onClose]);

  useOnEscape(open, closeAndReset);

  React.useEffect(() => {
    if (!open) return;
    setForm({
      ...defaultState,
      date: new Date().toISOString().slice(0, 10),
    });
    setError(null);
    setSaving(false);
  }, [open]);

  function onBackdropPointerDown(e: React.PointerEvent) {
    if (panelRef.current && panelRef.current.contains(e.target as Node)) return;
    if (!saving) closeAndReset();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.type) {
      setError("Seleccioná el tipo de movimiento.");
      return;
    }

    if (form.type === "Transferencia" || form.type === "Ajuste") {
      setError(UNAVAILABLE_TYPE_MSG);
      return;
    }

    if (!form.date.trim()) {
      setError("La fecha es obligatoria.");
      return;
    }

    const amountNum = Number(String(form.amount).replace(",", "."));
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }

    if (!form.bankAccountId.trim()) {
      setError("Seleccioná una cuenta.");
      return;
    }

    if (!form.description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }

    if (bankAccounts.length === 0) {
      setError("No hay cuentas disponibles. Verificá los datos de caja.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/cash/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          movementDate: form.date.trim(),
          amount: amountNum,
          bankAccountId: form.bankAccountId.trim(),
          ...(form.counterparty.trim()
            ? { counterparty: form.counterparty.trim() }
            : {}),
          description: form.description.trim(),
        }),
      });

      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || json.ok !== true) {
        setError(typeof json.error === "string" ? json.error : "No se pudo guardar el movimiento.");
        return;
      }

      try {
        await onSaved?.();
      } catch {
        setError("El movimiento se guardó pero no se pudieron actualizar los datos en pantalla.");
        return;
      }

      closeAndReset();
    } catch {
      setError("No se pudo conectar con el servidor.");
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
            Completá los datos del movimiento.
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
                disabled={saving}
                onChange={(e) =>
                  setForm((s) => ({ ...s, type: e.target.value as MovementType | "" }))
                }
              >
                <option value="" disabled>
                  Seleccionar…
                </option>
                <option value="Cobro">Cobro</option>
                <option value="Pago">Pago</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Ajuste">Ajuste</option>
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
                disabled={saving}
                value={form.date}
                onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
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
                min={0}
                step="0.01"
                className="qp-input"
                placeholder="0"
                disabled={saving}
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="qp-label" htmlFor="rm-account">
                Cuenta
              </label>
              <select
                id="rm-account"
                className="h-11 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground"
                value={form.bankAccountId}
                disabled={saving || bankAccounts.length === 0}
                onChange={(e) => setForm((s) => ({ ...s, bankAccountId: e.target.value }))}
              >
                <option value="">
                  {bankAccounts.length === 0 ? "Sin cuentas disponibles" : "Seleccionar cuenta…"}
                </option>
                {bankAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="qp-label" htmlFor="rm-counterparty">
                Contraparte{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <input
                id="rm-counterparty"
                type="text"
                className="qp-input"
                placeholder="Cliente o proveedor"
                disabled={saving}
                value={form.counterparty}
                onChange={(e) => setForm((s) => ({ ...s, counterparty: e.target.value }))}
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
                disabled={saving}
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
            <button
              type="button"
              className="qp-btn-secondary h-10 px-4"
              onClick={closeAndReset}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="qp-btn-primary h-10 px-4" disabled={saving}>
              {saving ? "Guardando…" : "Guardar movimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
