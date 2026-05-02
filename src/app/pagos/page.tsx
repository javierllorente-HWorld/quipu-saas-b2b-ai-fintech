"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { mockPagosByCompanyId } from "@/components/pagos/mock";
import { PagosKpiRow } from "@/components/pagos/KpiRow";
import { PaymentsCalendarChart } from "@/components/pagos/PaymentsCalendarChart";
import { UpcomingPaymentsTable } from "@/components/pagos/UpcomingPaymentsTable";
import { VendorsTable } from "@/components/pagos/VendorsTable";
import { RecentPaymentsTable } from "@/components/pagos/RecentPaymentsTable";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { ProgramarPagoModal } from "@/components/shared/ProgramarPagoModal";

export default function PagosPage() {
  useRequireDemoAuth();

  const activeCompanyId = mockCompanies[0]?.id ?? "acme-ar";
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [pagoModalOpen, setPagoModalOpen] = React.useState(false);

  const company =
    mockCompanies.find((c) => c.id === activeCompanyId) ?? mockCompanies[0];
  const data =
    mockPagosByCompanyId[company.id] ?? mockPagosByCompanyId["acme-ar"];

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="pagos" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="pagos"
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
            companies={mockCompanies}
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
                      Pagos
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pagos a proveedores, vencimientos y aprobaciones.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white transition hover:opacity-95 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setPagoModalOpen(true)}
                    >
                      Programar pago
                    </button>
                  </div>
                </div>
              </header>

              <section className="space-y-4">
                <PagosKpiRow kpis={data.kpis} currency={company.currency} />

                <PaymentsCalendarChart
                  title="Calendario de pagos"
                  points={data.calendar.points}
                  currency={company.currency}
                />

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <UpcomingPaymentsTable
                      title="Próximos pagos"
                      items={data.upcoming}
                      currency={company.currency}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <VendorsTable
                      title="Proveedores"
                      items={data.vendors}
                      currency={company.currency}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <RecentPaymentsTable
                      title="Pagos recientes"
                      items={data.recent}
                      currency={company.currency}
                    />
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      <ProgramarPagoModal open={pagoModalOpen} onClose={() => setPagoModalOpen(false)} />
    </div>
  );
}

