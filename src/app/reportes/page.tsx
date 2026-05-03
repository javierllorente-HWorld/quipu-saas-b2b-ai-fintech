"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { ReportesKpiRow } from "@/components/reportes/KpiRow";
import { IncomeExpenseChart } from "@/components/reportes/IncomeExpenseChart";
import { KeyIndicatorsTable } from "@/components/reportes/KeyIndicatorsTable";
import { RecentReportsTable } from "@/components/reportes/RecentReportsTable";
import { GenerateReportModal } from "@/components/reportes/GenerateReportModal";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { Toast } from "@/components/shared/Toast";
import {
  mapReportsApiPayload,
  type ReportsApiSuccessPayload,
} from "@/components/reportes/mapReportsApi";

export default function ReportesPage() {
  useRequireDemoAuth();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [generateReportOpen, setGenerateReportOpen] = React.useState(false);
  const [savedToast, setSavedToast] = React.useState(false);

  const [reportsLoading, setReportsLoading] = React.useState(true);
  const [reportsError, setReportsError] = React.useState<string | null>(null);
  const [reportsView, setReportsView] = React.useState<
    ReturnType<typeof mapReportsApiPayload> | null
  >(null);

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
    setReportsLoading(true);
    setReportsError(null);

    fetch("/api/reports", { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as ReportsApiSuccessPayload & {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || body.ok !== true) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "No se pudieron cargar los datos de reportes.",
          );
        }
        if (cancelled) return;
        setReportsView(mapReportsApiPayload(body as ReportsApiSuccessPayload));
        setReportsError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setReportsView(null);
        setReportsError(e instanceof Error ? e.message : "Error al cargar reportes.");
      })
      .finally(() => {
        if (!cancelled) setReportsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const topbarCompanies = React.useMemo(() => {
    if (reportsView?.organization) {
      return [
        {
          id: reportsView.organization.id,
          name: reportsView.organization.name,
          currency: reportsView.currency,
        },
      ];
    }
    return mockCompanies;
  }, [reportsView]);

  const activeCompanyId =
    reportsView?.organization?.id ?? mockCompanies[0]?.id ?? "acme-ar";

  const displayCurrency = reportsView?.currency ?? mockCompanies[0]?.currency ?? "ARS";

  return (
    <div className="qp-shell">
      <Toast message="Reporte generado correctamente" show={savedToast} />
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
                      Reportes
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Compartí información confiable con socios y mandos medios.
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {reportsLoading
                        ? "Cargando datos…"
                        : reportsError
                          ? "No se pudo actualizar"
                          : "Datos desde servidor"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white transition hover:opacity-95 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setGenerateReportOpen(true)}
                      disabled={reportsLoading}
                    >
                      Generar reporte
                    </button>
                  </div>
                </div>
              </header>

              {reportsError ? (
                <div
                  className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                  role="alert"
                >
                  {reportsError}
                </div>
              ) : null}

              {reportsLoading ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  Cargando datos de reportes…
                </div>
              ) : reportsView ? (
                <section className="space-y-4">
                  <ReportesKpiRow kpis={reportsView.kpis} currency={displayCurrency} />

                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                      <IncomeExpenseChart
                        title="Ingresos vs egresos"
                        datasets={reportsView.incomeExpense.datasets}
                        currency={displayCurrency}
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <KeyIndicatorsTable
                        title="Indicadores clave"
                        items={reportsView.keyIndicators}
                      />
                    </div>
                    <div className="lg:col-span-12 space-y-2">
                      {reportsView.recentReports.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No hay reportes recientes generados.
                        </p>
                      ) : null}
                      <RecentReportsTable
                        title="Reportes recientes"
                        items={reportsView.recentReports}
                      />
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      <GenerateReportModal
        open={generateReportOpen}
        onClose={() => setGenerateReportOpen(false)}
        onGenerated={() => setSavedToast(true)}
      />
    </div>
  );
}
