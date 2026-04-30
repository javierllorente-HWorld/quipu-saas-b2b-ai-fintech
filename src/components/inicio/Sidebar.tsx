"use client";

import * as React from "react";
import Image from "next/image";
import {
  IconBank,
  IconChart,
  IconHelp,
  IconHome,
  IconSparkles,
  IconWallet,
  IconChevronDown,
} from "./icons";

type SidebarItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const SIDEBAR_COLLAPSED_KEY = "quipu_sidebar_collapsed";

function IconArrow({ className }: { className?: string }) {
  // Minimal icon to avoid overloading sidebar visuals
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 12h10" />
      <path d="M13 8l4 4-4 4" />
    </svg>
  );
}

export type SidebarProps = {
  activeKey?: string;
  onNavigate?: (key: string) => void;
  footerCta?: React.ReactNode;
  forceExpanded?: boolean;
};

export function Sidebar({
  activeKey = "inicio",
  onNavigate,
  footerCta,
  forceExpanded = false,
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (raw === "true") setCollapsed(true);
    if (raw === "false") setCollapsed(false);
  }, []);

  const effectiveCollapsed = collapsed && !forceExpanded;

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    }
  }

  return (
    <aside
      className={[
        "relative h-full bg-[color:var(--quipu-night)] text-white overflow-visible",
        "w-[220px] md:transition-[width] md:duration-200 md:ease-out",
        effectiveCollapsed ? "md:w-[72px]" : "md:w-[220px]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={effectiveCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        className={[
          "hidden md:inline-flex",
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
          "size-10 items-center justify-center rounded-2xl",
          "bg-[color:var(--quipu-accent)] text-white shadow-[var(--shadow-card)]",
          "ring-1 ring-white/10",
          "transition-transform duration-200",
          "hover:opacity-95 active:translate-x-1/2 active:translate-y-[-50%] active:scale-[0.98]",
        ].join(" ")}
        title={effectiveCollapsed ? "Expandir" : "Colapsar"}
      >
        <IconChevronDown
          className={[
            "size-4 transition-transform duration-200",
            effectiveCollapsed ? "-rotate-90" : "rotate-90",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "flex h-full flex-col py-5",
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

        <nav className="mt-7 flex flex-1 flex-col justify-between gap-6">
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
              item={{ key: "cobros", label: "Cobros", icon: <IconArrow className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
              collapsed={effectiveCollapsed}
            />
            <SidebarLink
              item={{ key: "pagos", label: "Pagos", icon: <IconWallet className="size-5" /> }}
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

          <div className="space-y-3">
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

            <button
              type="button"
              className={[
                "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-sm transition",
                effectiveCollapsed ? "justify-center px-2" : "",
                "text-white/80 hover:bg-white/5 hover:text-white",
              ].join(" ")}
              onClick={() => onNavigate?.("help")}
              title={effectiveCollapsed ? "Centro de ayuda" : undefined}
            >
              <span className="text-white/80">
                <IconHelp className="size-5" />
              </span>
              {effectiveCollapsed ? null : "Centro de ayuda"}
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}

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

