"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { IconX } from "@/components/inicio/icons";
import { topbarCompanyNeutral } from "@/components/shell/topbarCompanyPlaceholders";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";

const SIDEBAR_KEYS = new Set([
  "inicio",
  "caja",
  "cobros",
  "pagos",
  "tesoreria",
  "reportes",
  "ia",
]);

export function sidebarActiveKeyFromPathname(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  return SIDEBAR_KEYS.has(first) ? first : "inicio";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const activeKey = sidebarActiveKeyFromPathname(pathname);
  const isIa = pathname === "/ia" || pathname.startsWith("/ia/");

  const openSidebar = React.useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = React.useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const sidebarNavigateOptions = React.useMemo(
    () => ({ onAfterNavigate: closeSidebar }),
    [closeSidebar],
  );

  const onNavigate = useSidebarNavigate(sidebarNavigateOptions);

  const topbarCompanies = React.useMemo(() => [topbarCompanyNeutral], []);

  const noopCompanyChange = React.useCallback((_companyId: string) => {}, []);

  const mobileSidebarFooter = React.useMemo(
    () => (
      <button
        type="button"
        className="mb-2 inline-flex w-full items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm text-white/85 ring-1 ring-white/10"
        onClick={closeSidebar}
        aria-label="Cerrar menú"
      >
        <span className="font-medium">Cerrar</span>
        <IconX className="size-5" />
      </button>
    ),
    [closeSidebar],
  );

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey={activeKey} onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/35" onClick={closeSidebar} />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey={activeKey}
                onNavigate={onNavigate}
                forceExpanded
                footerCta={mobileSidebarFooter}
              />
            </div>
          </div>
        ) : null}

        <div
          className={
            isIa
              ? "flex min-h-screen min-w-0 flex-1 flex-col md:h-screen md:min-h-0"
              : "min-w-0 flex-1"
          }
        >
          <Topbar
            companies={topbarCompanies}
            activeCompanyId={topbarCompanyNeutral.id}
            onCompanyChange={noopCompanyChange}
            onOpenSidebar={openSidebar}
          />

          <main
            className={
              isIa
                ? "flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6"
                : "px-4 py-4 sm:px-6"
            }
          >
            {isIa ? (
              <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
                {children}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
