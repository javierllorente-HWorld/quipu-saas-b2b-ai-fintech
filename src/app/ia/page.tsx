"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies, mockDashboardByCompanyId } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { mockCopilotByCompanyId } from "@/components/ia/mock";
import { CopilotCard } from "@/components/inicio/CopilotCard";
import { FinancialHealthSummary } from "@/components/ia/FinancialHealthSummary";
import { OpportunitiesPanel } from "@/components/ia/OpportunitiesPanel";
import { SmartAlerts } from "@/components/ia/SmartAlerts";
import { SuggestedActions } from "@/components/ia/SuggestedActions";
import { ModuleRecommendations } from "@/components/ia/ModuleRecommendations";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";

export default function IaPage() {
  useRequireDemoAuth();

  const activeCompanyId = mockCompanies[0]?.id ?? "acme-ar";
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const company =
    mockCompanies.find((c) => c.id === activeCompanyId) ?? mockCompanies[0];
  const inicioData = mockDashboardByCompanyId[company.id] ?? mockDashboardByCompanyId["acme-ar"];
  const data =
    mockCopilotByCompanyId[company.id] ?? mockCopilotByCompanyId["acme-ar"];

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="ia" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="ia"
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
                      IA
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tu copiloto financiero para entender salud, riesgos y
                      oportunidades.
                    </p>
                  </div>
                </div>
              </header>

              <section className="space-y-4">
                <CopilotCard suggestions={inicioData.copilotSuggestions} />

                <div className="space-y-4">
                  <FinancialHealthSummary
                    title="Resumen financiero (últimos 30 días)"
                    items={data.healthSummary}
                    currency={company.currency}
                  />
                  <OpportunitiesPanel
                    title="Sugerencias / oportunidades"
                    items={data.opportunities}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <SmartAlerts title="Alertas inteligentes" items={data.smartAlerts} />
                  <SuggestedActions title="Acciones sugeridas" items={data.suggestedActions} />
                </div>

                <ModuleRecommendations
                  title="Recomendaciones por módulo"
                  tabs={data.moduleRecommendations}
                />

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

