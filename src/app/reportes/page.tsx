"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { mockReportesByCompanyId } from "@/components/reportes/mock";
import { ReportesKpiRow } from "@/components/reportes/KpiRow";
import { IncomeExpenseChart } from "@/components/reportes/IncomeExpenseChart";
import { ProfitabilityChart } from "@/components/reportes/ProfitabilityChart";
import { FiltersExportCard } from "@/components/reportes/FiltersExportCard";
import { UnitSummaryTable } from "@/components/reportes/UnitSummaryTable";
import { KeyIndicatorsTable } from "@/components/reportes/KeyIndicatorsTable";
import { RecentReportsTable } from "@/components/reportes/RecentReportsTable";

export default function ReportesPage() {
  const [activeCompanyId, setActiveCompanyId] = React.useState(
    mockCompanies[0]?.id ?? "acme-ar",
  );
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const company =
    mockCompanies.find((c) => c.id === activeCompanyId) ?? mockCompanies[0];
  const data =
    mockReportesByCompanyId[company.id] ?? mockReportesByCompanyId["acme-ar"];

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="reportes" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="reportes"
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
                      Reportes
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Accedé a reportes ejecutivos claros para seguir ingresos,
                      egresos y rentabilidad. Compartí información confiable con
                      socios y mandos medios.
                    </p>
                  </div>
                </div>
              </header>

              <section className="space-y-4">
                <ReportesKpiRow kpis={data.kpis} currency={company.currency} />

                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <IncomeExpenseChart
                      title="Ingresos vs egresos"
                      datasets={data.incomeExpense.datasets}
                      currency={company.currency}
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <ProfitabilityChart
                      title="Rentabilidad"
                      points={data.profitability.points}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <FiltersExportCard title="Filtros y exportación" />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <UnitSummaryTable
                      title="Resumen por unidad"
                      items={data.unitSummary}
                      currency={company.currency}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <KeyIndicatorsTable
                      title="Indicadores clave"
                      items={data.keyIndicators}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <RecentReportsTable
                      title="Reportes recientes"
                      items={data.recentReports}
                    />
                  </div>
                </div>

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

