"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { IconX } from "@/components/inicio/icons";
import {
  topbarCompanyLoading,
  topbarCompanyNeutral,
} from "@/components/shell/topbarCompanyPlaceholders";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
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

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [transferModalOpen, setTransferModalOpen] = React.useState(false);

  const [treasuryLoading, setTreasuryLoading] = React.useState(true);
  const [treasuryError, setTreasuryError] = React.useState<string | null>(null);
  const [treasuryView, setTreasuryView] = React.useState<
    ReturnType<typeof mapTreasuryApiPayload> | null
  >(null);

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

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

  const topbarCompanies = React.useMemo(() => {
    if (treasuryView?.organization) {
      return [
        {
          id: treasuryView.organization.id,
          name: treasuryView.organization.name,
          currency: treasuryView.currency,
        },
      ];
    }
    if (treasuryLoading) return [topbarCompanyLoading];
    return [topbarCompanyNeutral];
  }, [treasuryView, treasuryLoading]);

  const activeCompanyId =
    treasuryView?.organization?.id ??
    (treasuryLoading ? topbarCompanyLoading.id : topbarCompanyNeutral.id);

  const displayCurrency = treasuryView?.currency ?? "ARS";

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="tesoreria" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="tesoreria"
                onNavigate={onNavigate}
                forceExpanded
                footerCta={
                  <button
                    type="button"
                    className="mb-2 inline-flex w-full items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm text-white/85 ring-1 ring-white/10"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Cerrar menú"
                  >
                    <span className="font-medium">Cerrar</span>
                    <IconX className="size-5" />
                  </button>
                }
              />
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <Topbar
            companies={topbarCompanies}
            activeCompanyId={activeCompanyId}
            onCompanyChange={() => {}}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <main className="px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-7xl">
              <header className="mb-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                      Tesorería
                    </h1>
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
                <section className="space-y-4">
                  <TesoreriaKpiRow kpis={treasuryView.kpis} currency={displayCurrency} />

                  <div className="grid gap-4 lg:grid-cols-2">
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
            </div>
          </main>
        </div>
      </div>

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
    </div>
  );
}
