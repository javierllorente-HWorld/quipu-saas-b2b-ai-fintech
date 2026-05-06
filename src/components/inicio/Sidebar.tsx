"use client";

import * as React from "react";
import Image from "next/image";
import {
  IconBank,
  IconChart,
  IconHelp,
  IconHome,
  IconSparkles,
  IconArrowDownRight,
  IconArrowUpRight,
  IconWallet,
} from "./icons";

type SidebarItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const SIDEBAR_COLLAPSED_KEY = "quipu_sidebar_collapsed";
const SIDEBAR_COLLAPSED_EVENT = "quipu:sidebar-collapsed";

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  function onStorage(e: StorageEvent) {
    if (e.key === SIDEBAR_COLLAPSED_KEY || e.key === null) onStoreChange();
  }
  function onLocal() {
    onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onLocal);
  };
}

function getSidebarCollapsedSnapshot() {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  if (raw === "false") return false;
  if (raw === "true") return true;
  return true;
}

function getServerSidebarCollapsedSnapshot() {
  return true;
}

export type SidebarProps = {
  activeKey?: string;
  onNavigate?: (key: string) => void;
  footerCta?: React.ReactNode;
  forceExpanded?: boolean;
};

function SidebarInner({
  activeKey = "inicio",
  onNavigate,
  footerCta,
  forceExpanded = false,
}: SidebarProps) {
  const collapsed = React.useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getServerSidebarCollapsedSnapshot,
  );

  const effectiveCollapsed = collapsed && !forceExpanded;

  function toggleCollapsed() {
    const next = !collapsed;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
    }
  }

  return (
    <aside
      className={[
        "relative h-full bg-[color:var(--quipu-night)] text-white overflow-visible",
        "md:sticky md:top-0 md:h-screen md:shrink-0 md:self-start",
        "w-[200px] md:transition-[width] md:duration-200 md:ease-out",
        effectiveCollapsed ? "md:w-[72px]" : "md:w-[200px]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={effectiveCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        className={[
          "hidden md:inline-flex",
          "absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-[40%]",
          "size-8 items-center justify-center rounded-full",
          "bg-[color:var(--quipu-night)]/85 text-white/90",
          "border border-white/15",
          "shadow-sm shadow-black/10",
          "transition-colors duration-200",
          "hover:bg-white/10 hover:text-white active:scale-[0.97]",
        ].join(" ")}
        title={effectiveCollapsed ? "Expandir" : "Colapsar"}
      >
        <svg
          viewBox="0 0 24 24"
          className={[
            "size-3.5 transition-transform duration-200",
            effectiveCollapsed ? "" : "scale-x-[-1]",
          ].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 7l5 5-5 5" />
        </svg>
      </button>

      <div
        className={[
          "flex h-full min-h-0 flex-col py-4",
          effectiveCollapsed ? "px-2" : "px-2.5",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center",
            "justify-center px-1",
          ].join(" ")}
        >
          {effectiveCollapsed ? (
            <Image
              src="/favicon-quipu.png"
              alt="Quipu"
              width={48}
              height={48}
              priority
              className="h-auto w-[48px] object-contain"
            />
          ) : (
            <Image
              src="/ISOLOGO BLANCO.png"
              alt="Quipu"
              width={120}
              height={42}
              priority
              className="h-auto w-[120px] object-contain"
            />
          )}
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-5">
          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-1">
              <SidebarLink
                item={{ key: "inicio", label: "Inicio", icon: <IconHome className="size-5" /> }}
                activeKey={activeKey}
                onNavigate={onNavigate}
                collapsed={effectiveCollapsed}
              />
              <SidebarLink
                item={{ key: "caja", label: "Caja", icon: <IconWallet className="size-5" /> }}
                activeKey={activeKey}
                onNavigate={onNavigate}
                collapsed={effectiveCollapsed}
              />
              <SidebarLink
                item={{
                  key: "cobros",
                  label: "Cobros",
                  icon: <IconArrowDownRight className="size-5" />,
                }}
                activeKey={activeKey}
                onNavigate={onNavigate}
                collapsed={effectiveCollapsed}
              />
              <SidebarLink
                item={{
                  key: "pagos",
                  label: "Pagos",
                  icon: <IconArrowUpRight className="size-5" />,
                }}
                activeKey={activeKey}
                onNavigate={onNavigate}
                collapsed={effectiveCollapsed}
              />
              <SidebarLink
                item={{ key: "tesoreria", label: "Tesorería", icon: <IconBank className="size-5" /> }}
                activeKey={activeKey}
                onNavigate={onNavigate}
                collapsed={effectiveCollapsed}
              />
              <SidebarLink
                item={{ key: "reportes", label: "Reportes", icon: <IconChart className="size-5" /> }}
                activeKey={activeKey}
                onNavigate={onNavigate}
                collapsed={effectiveCollapsed}
              />
              <SidebarLink
                item={{ key: "ia", label: "IA", icon: <IconSparkles className="size-5" /> }}
                activeKey={activeKey}
                onNavigate={onNavigate}
                collapsed={effectiveCollapsed}
              />
            </div>
          </nav>

          <div className="shrink-0 space-y-3">
            {footerCta ? footerCta : null}
            {effectiveCollapsed ? null : (
              <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                <div className="text-sm font-semibold">Plan Profesional</div>
                <div className="mt-1 text-xs text-white/70">
                  Automatizá reportes, aprobaciones y proyecciones.
                </div>
                <button className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white hover:opacity-90 active:translate-y-px">
                  Ver plan
                </button>
              </div>
            )}

            <a
              href="https://wa.me/5492216161594?text=Hola%2C%20necesito%20ayuda%20con%20Quipu"
              target="_blank"
              rel="noopener noreferrer"
              className={[
                "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-sm transition",
                effectiveCollapsed ? "justify-center px-2" : "",
                "text-white/80 hover:bg-white/5 hover:text-white",
              ].join(" ")}
              title={effectiveCollapsed ? "Centro de ayuda" : undefined}
            >
              <span className="text-white/80">
                <IconHelp className="size-5" />
              </span>
              {effectiveCollapsed ? null : "Centro de ayuda"}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

export const Sidebar = React.memo(SidebarInner);

function SidebarLink({
  item,
  activeKey,
  onNavigate,
  collapsed,
}: {
  item: SidebarItem;
  activeKey: string;
  onNavigate?: (key: string) => void;
  collapsed: boolean;
}) {
  const active = item.key === activeKey;
  return (
    <button
      type="button"
      onClick={() => onNavigate?.(item.key)}
      title={collapsed ? item.label : undefined}
      className={[
        "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-sm transition",
        collapsed ? "justify-center px-2" : "",
        active
          ? "bg-white/10 ring-1 ring-white/15 text-white"
          : "text-white/80 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <span className={active ? "text-white" : "text-white/80"}>{item.icon}</span>
      {collapsed ? null : <span className="font-medium">{item.label}</span>}
    </button>
  );
}

