"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { mockCashByCompanyId } from "@/components/caja/mock";
import { CajaKpiRow } from "@/components/caja/KpiRow";
import { CashEvolutionChart } from "@/components/caja/CashEvolutionChart";
import { CashDistribution } from "@/components/caja/CashDistribution";
import { BankBalancesTable } from "@/components/caja/BankBalancesTable";
import { UpcomingMovementsTable } from "@/components/caja/UpcomingMovementsTable";
import { RecentMovementsTable } from "@/components/caja/RecentMovementsTable";

export default function CajaPage() {
  const router = useRouter();
  const [activeCompanyId, setActiveCompanyId] = React.useState(
    mockCompanies[0]?.id ?? "acme-ar",
  );
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const company =
    mockCompanies.find((c) => c.id === activeCompanyId) ?? mockCompanies[0];
  const data = mockCashByCompanyId[company.id] ?? mockCashByCompanyId["acme-ar"];

  const onNavigate = React.useCallback(
    (key: string) => {
      if (key === "inicio") {
        router.push("/inicio");
        setSidebarOpen(false);
        return;
      }
      if (key === "caja") {
        router.push("/caja");
        setSidebarOpen(false);
        return;
      }
    },
    [router],
  );

  return (
    <div className="qp-shell">
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
            companies={mockCompanies}
            activeCompanyId={activeCompanyId}
            onCompanyChange={(id) => setActiveCompanyId(id)}
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
                      Posición de caja en tiempo real — {company.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="qp-btn-secondary h-10 px-4">
                      Exportar
                    </button>
                    <button type="button" className="qp-btn-primary h-10 px-4">
                      Registrar movimiento
                    </button>
                  </div>
                </div>
              </header>

              <section className="space-y-4">
                <CajaKpiRow kpis={data.kpis} currency={company.currency} />

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <CashEvolutionChart points={data.evolution} currency={company.currency} />
                  </div>
                  <div className="lg:col-span-1">
                    <CashDistribution items={data.distribution} currency={company.currency} />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <BankBalancesTable
                      items={data.bankBalances}
                      currency={company.currency}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <UpcomingMovementsTable
                      items={data.upcoming}
                      currency={company.currency}
                    />
                  </div>
                </div>

                <RecentMovementsTable items={data.recent} currency={company.currency} />

                <div className="pt-2 text-center text-xs text-muted-foreground">
                  Los datos se actualizan en tiempo real desde tus bancos conectados.
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

