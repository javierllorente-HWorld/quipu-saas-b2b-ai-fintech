"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { CajaKpiRow } from "@/components/caja/KpiRow";
import { CashDistribution } from "@/components/caja/CashDistribution";
import { UpcomingMovementsTable } from "@/components/caja/UpcomingMovementsTable";
import { RecentMovementsTable } from "@/components/caja/RecentMovementsTable";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { RegisterMovementModal } from "@/components/shared/RegisterMovementModal";
import { Toast } from "@/components/shared/Toast";
import {
  mapCashApiPayload,
  type CashApiSuccessPayload,
} from "@/components/caja/mapCashApi";

export default function CajaPage() {
  useRequireDemoAuth();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [savedToast, setSavedToast] = React.useState(false);

  const [cashLoading, setCashLoading] = React.useState(true);
  const [cashError, setCashError] = React.useState<string | null>(null);
  const [cashView, setCashView] = React.useState<ReturnType<typeof mapCashApiPayload> | null>(
    null
  );

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  React.useEffect(() => {
    if (!savedToast) return;
    const t = window.setTimeout(() => setSavedToast(false), 2600);
    return () => window.clearTimeout(t);
  }, [savedToast]);

  React.useEffect(() => {
    let cancelled = false;
    setCashLoading(true);
    setCashError(null);

    fetch("/api/cash", { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as CashApiSuccessPayload & {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || body.ok !== true) {
          throw new Error(
            typeof body.error === "string" ? body.error : "No se pudieron cargar los datos de caja."
          );
        }
        if (cancelled) return;
        setCashView(mapCashApiPayload(body as CashApiSuccessPayload));
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

  const topbarCompanies = React.useMemo(() => {
    if (cashView?.organization) {
      return [
        {
          id: cashView.organization.id,
          name: cashView.organization.name,
          currency: cashView.currency,
        },
      ];
    }
    return mockCompanies;
  }, [cashView]);

  const activeCompanyId =
    cashView?.organization?.id ?? mockCompanies[0]?.id ?? "acme-ar";

  const displayCurrency = cashView?.currency ?? mockCompanies[0]?.currency ?? "ARS";

  return (
    <div className="qp-shell">
      <Toast message="Movimiento registrado correctamente" show={savedToast} />
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="caja" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="caja"
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
                      Caja
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Posición de caja en tiempo real
                    </p>
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
                <section className="space-y-4">
                  <CajaKpiRow kpis={cashView.kpis} currency={displayCurrency} />

                  <RecentMovementsTable items={cashView.recent} currency={displayCurrency} />

                  <CashDistribution
                    items={cashView.distribution}
                    currency={displayCurrency}
                    bankBalances={cashView.bankBalances}
                  />

                  <UpcomingMovementsTable
                    items={cashView.upcoming}
                    currency={displayCurrency}
                  />
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      <RegisterMovementModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSaved={() => setSavedToast(true)}
      />
    </div>
  );
}
