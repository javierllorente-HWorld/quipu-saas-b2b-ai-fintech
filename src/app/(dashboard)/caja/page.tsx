"use client";

import * as React from "react";
import { CajaKpiRow } from "@/components/caja/KpiRow";
import { CashDistribution } from "@/components/caja/CashDistribution";
import { UpcomingMovementsTable } from "@/components/caja/UpcomingMovementsTable";
import { RecentMovementsTable } from "@/components/caja/RecentMovementsTable";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { RegisterMovementModal } from "@/components/shared/RegisterMovementModal";
import { Toast } from "@/components/shared/Toast";
import {
  mapCashApiPayload,
  type CashApiSuccessPayload,
} from "@/components/caja/mapCashApi";

async function fetchCashView(): Promise<ReturnType<typeof mapCashApiPayload>> {
  const res = await fetch("/api/cash", { cache: "no-store" });
  const body = (await res.json()) as CashApiSuccessPayload & {
    ok?: boolean;
    error?: string;
  };
  if (!res.ok || body.ok !== true) {
    throw new Error(
      typeof body.error === "string" ? body.error : "No se pudieron cargar los datos de caja."
    );
  }
  return mapCashApiPayload(body as CashApiSuccessPayload);
}

export default function CajaPage() {
  useRequireDemoAuth();

  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [savedToast, setSavedToast] = React.useState(false);

  const [cashLoading, setCashLoading] = React.useState(true);
  const [cashError, setCashError] = React.useState<string | null>(null);
  const [cashView, setCashView] = React.useState<ReturnType<typeof mapCashApiPayload> | null>(
    null
  );

  const refetchCash = React.useCallback(async () => {
    const view = await fetchCashView();
    setCashView(view);
    setCashError(null);
  }, []);

  const handleMovementSaved = React.useCallback(async () => {
    await refetchCash();
    setSavedToast(true);
  }, [refetchCash]);

  React.useEffect(() => {
    if (!savedToast) return;
    const t = window.setTimeout(() => setSavedToast(false), 2600);
    return () => window.clearTimeout(t);
  }, [savedToast]);

  React.useEffect(() => {
    let cancelled = false;
    setCashLoading(true);
    setCashError(null);

    fetchCashView()
      .then((view) => {
        if (cancelled) return;
        setCashView(view);
        setCashError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setCashView(null);
        setCashError(e instanceof Error ? e.message : "Error al cargar caja.");
      })
      .finally(() => {
        if (!cancelled) setCashLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayCurrency = cashView?.currency ?? "ARS";

  const bankAccountOptions = React.useMemo(() => {
    if (!cashView?.bankBalances?.length) return [];
    const fmt = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: displayCurrency === "USD" ? "USD" : "ARS",
    });
    return cashView.bankBalances.map((b) => ({
      id: b.id,
      label: `${b.bank} — ${fmt.format(b.amount)}`,
    }));
  }, [cashView, displayCurrency]);

  return (
    <>
      <Toast message="Movimiento registrado correctamente" show={savedToast} />

      <header className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Caja</h1>
            <p className="mt-1 text-sm text-muted-foreground">Posición de caja en tiempo real</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {cashLoading
                ? "Cargando datos…"
                : cashError
                  ? "No se pudo actualizar"
                  : "Datos desde servidor"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white transition hover:opacity-95 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setRegisterOpen(true)}
              disabled={cashLoading}
            >
              Registrar movimiento
            </button>
          </div>
        </div>
      </header>

      {cashError ? (
        <div
          className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {cashError}
        </div>
      ) : null}

      {cashLoading ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Cargando datos de caja…
        </div>
      ) : cashView ? (
        <section className="space-y-3">
          <CajaKpiRow kpis={cashView.kpis} currency={displayCurrency} />

          <RecentMovementsTable items={cashView.recent} currency={displayCurrency} />

          <CashDistribution
            items={cashView.distribution}
            currency={displayCurrency}
            bankBalances={cashView.bankBalances}
          />

          <UpcomingMovementsTable items={cashView.upcoming} currency={displayCurrency} />
        </section>
      ) : null}

      <RegisterMovementModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        bankAccounts={bankAccountOptions}
        onSaved={handleMovementSaved}
      />
    </>
  );
}
