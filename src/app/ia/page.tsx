"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies, mockDashboardByCompanyId } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { CopilotCard } from "@/components/inicio/CopilotCard";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";

export default function IaPage() {
  useRequireDemoAuth();

  const activeCompanyId = mockCompanies[0]?.id ?? "acme-ar";
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const inicioData =
    mockDashboardByCompanyId[activeCompanyId] ?? mockDashboardByCompanyId["acme-ar"];

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

        <div className="flex min-h-screen min-w-0 flex-1 flex-col md:h-screen md:min-h-0">
          <Topbar
            companies={mockCompanies}
            activeCompanyId={activeCompanyId}
            onCompanyChange={() => {}}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <main className="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6">
            <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
              <section className="flex min-h-0 flex-1 flex-col">
                <CopilotCard suggestions={inicioData.copilotSuggestions} />
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

