"use client";

import * as React from "react";
import { TesoreriaKpiRow } from "@/components/tesoreria/KpiRow";
import { TreasuryBankBalancesTable } from "@/components/tesoreria/BankBalancesTable";
import { ScheduledTransfersTable } from "@/components/tesoreria/ScheduledTransfersTable";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { NuevaTransferenciaModal } from "@/components/shared/NuevaTransferenciaModal";
import {
  mapTreasuryApiPayload,
  type TreasuryApiSuccessPayload,
} from "@/components/tesoreria/mapTreasuryApi";

export default function TesoreriaPage() {
  useRequireDemoAuth();

  const [transferModalOpen, setTransferModalOpen] = React.useState(false);

  const [treasuryLoading, setTreasuryLoading] = React.useState(true);
  const [treasuryError, setTreasuryError] = React.useState<string | null>(null);
  const [treasuryView, setTreasuryView] = React.useState<
    ReturnType<typeof mapTreasuryApiPayload> | null
  >(null);

  const loadTreasury = React.useCallback(() => {
    let cancelled = false;
    setTreasuryLoading(true);
    setTreasuryError(null);

    fetch("/api/treasury", { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as TreasuryApiSuccessPayload & {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || body.ok !== true) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "No se pudieron cargar los datos de tesorería.",
          );
        }
        if (cancelled) return;
        setTreasuryView(mapTreasuryApiPayload(body as TreasuryApiSuccessPayload));
        setTreasuryError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setTreasuryView(null);
        setTreasuryError(e instanceof Error ? e.message : "Error al cargar tesorería.");
      })
      .finally(() => {
        if (!cancelled) setTreasuryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    return loadTreasury();
  }, [loadTreasury]);

  const displayCurrency = treasuryView?.currency ?? "ARS";

  return (
    <>
      <header className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tesorería</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bancos, liquidez y transferencias en un solo lugar.
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {treasuryLoading
                ? "Cargando datos…"
                : treasuryError
                  ? "No se pudo actualizar"
                  : "Datos desde servidor"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white transition hover:opacity-95 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setTransferModalOpen(true)}
              disabled={treasuryLoading}
            >
              Nueva transferencia
            </button>
          </div>
        </div>
      </header>

      {treasuryError ? (
        <div
          className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {treasuryError}
        </div>
      ) : null}

      {treasuryLoading ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Cargando datos de tesorería…
        </div>
      ) : treasuryView ? (
        <section className="space-y-3">
          <TesoreriaKpiRow kpis={treasuryView.kpis} currency={displayCurrency} />

          <div className="grid gap-3 lg:grid-cols-2">
            <TreasuryBankBalancesTable
              title="Saldos bancarios"
              items={treasuryView.bankBalances}
              currency={displayCurrency}
            />
            {treasuryView.recentTransfers.length > 0 ? (
              <ScheduledTransfersTable
                title="Transferencias recientes"
                items={treasuryView.recentTransfers}
                currency={displayCurrency}
              />
            ) : (
              <div className="qp-card">
                <div className="qp-card-header">
                  <div className="text-base font-semibold tracking-tight">
                    Transferencias recientes
                  </div>
                </div>
                <div className="qp-card-content">
                  <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    Todavía no hay transferencias registradas.
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <NuevaTransferenciaModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        bankAccounts={(treasuryView?.bankBalances ?? []).map((b) => ({
          id: b.id,
          label: `${b.bank}${b.account && b.account !== "—" ? ` — ${b.account}` : ""}`,
        }))}
        onSaved={() => {
          setTransferModalOpen(false);
          loadTreasury();
        }}
      />
    </>
  );
}
