"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { mockCobrosByCompanyId } from "@/components/cobros/mock";
import { CobrosKpiRow } from "@/components/cobros/KpiRow";
import { DebtAgingDonut } from "@/components/cobros/DebtAgingDonut";
import { CollectionsEvolutionChart } from "@/components/cobros/CollectionsEvolutionChart";
import { CollectionsAlerts } from "@/components/cobros/CollectionsAlerts";
import { CustomersReceivableTable } from "@/components/cobros/CustomersReceivableTable";
import { InvoicesPendingTable } from "@/components/cobros/InvoicesPendingTable";
import { RecentCollectionsActivity } from "@/components/cobros/RecentCollectionsActivity";

export default function CobrosPage() {
  const [activeCompanyId, setActiveCompanyId] = React.useState(
    mockCompanies[0]?.id ?? "acme-ar",
  );
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const company =
    mockCompanies.find((c) => c.id === activeCompanyId) ?? mockCompanies[0];
  const data =
    mockCobrosByCompanyId[company.id] ?? mockCobrosByCompanyId["acme-ar"];

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="cobros" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="cobros"
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
                      Cobros
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Gestión cuentas por cobrar, facturas pendientes y seguimiento a
                      clientes. Priorizá vencidos y acelerá la cobranza.
                    </p>
                  </div>
                </div>
              </header>

              <section className="space-y-4">
                <CobrosKpiRow kpis={data.kpis} currency={company.currency} />

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <DebtAgingDonut
                        title="Antigüedad de deuda"
                        items={data.aging.items}
                        total={data.aging.total}
                        currency={company.currency}
                      />
                      <CollectionsEvolutionChart
                        points={data.evolution.points}
                        currency={company.currency}
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <CollectionsAlerts
                      title="Alertas de cobranza"
                      items={data.alerts}
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <CustomersReceivableTable
                      title="Clientes por cobrar"
                      items={data.customers}
                      currency={company.currency}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <InvoicesPendingTable
                      title="Facturas pendientes"
                      items={data.invoices}
                      currency={company.currency}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <RecentCollectionsActivity
                      title="Actividad reciente"
                      items={data.activity}
                      currency={company.currency}
                    />
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-muted-foreground">
                  Los datos se actualizan en tiempo real desde tus documentos y
                  cuentas por cobrar.
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

