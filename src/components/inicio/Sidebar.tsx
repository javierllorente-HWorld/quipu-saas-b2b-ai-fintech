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
} from "./icons";

type SidebarItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

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
};

export function Sidebar({
  activeKey = "inicio",
  onNavigate,
  footerCta,
}: SidebarProps) {
  return (
    <aside className="h-full w-[220px] bg-[color:var(--quipu-night)] text-white">
      <div className="flex h-full flex-col px-2.5 py-5">
        <div className="px-1">
          <Image
            src="/ISOLOGO BLANCO.png"
            alt="Quipu"
            width={120}
            height={42}
            priority
            className="h-auto w-[120px] object-contain"
          />
        </div>

        <nav className="mt-7 flex flex-1 flex-col justify-between gap-6">
          <div className="space-y-1">
            <SidebarLink
              item={{ key: "inicio", label: "Inicio", icon: <IconHome className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
            />
            <SidebarLink
              item={{ key: "caja", label: "Caja", icon: <IconWallet className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
            />
            <SidebarLink
              item={{ key: "cobros", label: "Cobros", icon: <IconArrow className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
            />
            <SidebarLink
              item={{ key: "pagos", label: "Pagos", icon: <IconBank className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
            />
            <SidebarLink
              item={{ key: "tesoreria", label: "Tesorería", icon: <IconWallet className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
            />
            <SidebarLink
              item={{ key: "reportes", label: "Reportes", icon: <IconChart className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
            />
            <SidebarLink
              item={{ key: "ia", label: "IA", icon: <IconSparkles className="size-5" /> }}
              activeKey={activeKey}
              onNavigate={onNavigate}
            />
          </div>

          <div className="space-y-3">
            {footerCta ? footerCta : null}
            <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="text-sm font-semibold">Plan Profesional</div>
              <div className="mt-1 text-xs text-white/70">
                Automatizá reportes, aprobaciones y proyecciones.
              </div>
              <button className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white hover:opacity-90 active:translate-y-px">
                Ver plan
              </button>
            </div>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white/85 hover:bg-white/5"
              onClick={() => onNavigate?.("help")}
            >
              <IconHelp className="size-5 text-white/85" />
              Centro de ayuda
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
}: {
  item: SidebarItem;
  activeKey: string;
  onNavigate?: (key: string) => void;
}) {
  const active = item.key === activeKey;
  return (
    <button
      type="button"
      onClick={() => onNavigate?.(item.key)}
      className={[
        "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-sm transition",
        active
          ? "bg-white/10 ring-1 ring-white/15 text-white"
          : "text-white/80 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <span className={active ? "text-white" : "text-white/80"}>{item.icon}</span>
      <span className="font-medium">{item.label}</span>
    </button>
  );
}

