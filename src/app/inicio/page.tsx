"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { KpiRow } from "@/components/inicio/KpiRow";
import { CashflowChart } from "@/components/inicio/CashflowChart";
import { AlertsPanel } from "@/components/inicio/AlertsPanel";
import { UpcomingTable } from "@/components/inicio/UpcomingTable";
import { RecentActivity } from "@/components/inicio/RecentActivity";
import { CopilotCard } from "@/components/inicio/CopilotCard";
import {
  mockCompanies,
  mockDashboardByCompanyId,
} from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";

export default function InicioPage() {
  const [activeCompanyId, setActiveCompanyId] = React.useState(
    mockCompanies[0]?.id ?? "acme-ar",
  );
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const company =
    mockCompanies.find((c) => c.id === activeCompanyId) ?? mockCompanies[0];
  const data = mockDashboardByCompanyId[company.id];

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="inicio" />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="inicio"
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
                      Inicio
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Resumen de salud financiera — {company.name}
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
                <KpiRow kpis={data.kpis} currency={company.currency} />

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <CashflowChart points={data.cashflow} currency={company.currency} />
                  </div>
                  <div className="lg:col-span-1">
                    <AlertsPanel alerts={data.alerts} />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <UpcomingTable items={data.upcoming} currency={company.currency} />
                  </div>
                  <div className="lg:col-span-1">
                    <RecentActivity items={data.activity} currency={company.currency} />
                  </div>
                </div>

                <CopilotCard suggestions={data.copilotSuggestions} />
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

