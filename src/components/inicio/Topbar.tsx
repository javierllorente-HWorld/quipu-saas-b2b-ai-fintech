"use client";

import * as React from "react";
import type { Company } from "./mock";
import {
  IconChevronDown,
  IconHistory,
  IconLogout,
  IconMenu,
} from "./icons";
import { getDemoSession, signOutDemo } from "@/lib/demoAuth";
import { useRouter } from "next/navigation";
import { mockDashboardByCompanyId } from "@/components/inicio/mock";
import { RecentActivityDropdown } from "@/components/inicio/RecentActivityDropdown";

export type TopbarProps = {
  companies: Company[];
  activeCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  onOpenSidebar: () => void;
};

export function Topbar({
  companies,
  activeCompanyId,
  onCompanyChange,
  onOpenSidebar,
}: TopbarProps) {
  void onCompanyChange;
  const router = useRouter();
  const active = companies.find((c) => c.id === activeCompanyId) ?? companies[0];
  const dashboard = mockDashboardByCompanyId[activeCompanyId];
  const session = React.useMemo(() => getDemoSession(), []);
  const userName = session?.user?.name ?? "Usuario";
  const userRole = session?.user?.role ?? "";
  const initials = React.useMemo(() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  }, [userName]);

  const notificationsRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!userMenuOpen) return;
    function onPointerDown(e: PointerEvent) {
      const el = menuRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setUserMenuOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [userMenuOpen]);

  React.useEffect(() => {
    if (!notificationsOpen) return;
    function onPointerDown(e: PointerEvent) {
      const el = notificationsRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setNotificationsOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [notificationsOpen]);

  React.useEffect(() => {
    if (!userMenuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setUserMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [userMenuOpen]);

  React.useEffect(() => {
    if (!notificationsOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setNotificationsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [notificationsOpen]);

  function onLogout() {
    signOutDemo();
    setUserMenuOpen(false);
    router.replace("/login");
  }

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground hover:bg-white/70 md:hidden"
            onClick={onOpenSidebar}
            aria-label="Abrir menú"
          >
            <IconMenu className="size-5" />
          </button>

          <div
            className="inline-flex h-10 items-center rounded-2xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm"
            aria-label="Empresa"
          >
            {active?.name ?? "Empresa"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              className={[
                "inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-card hover:bg-white/70",
                notificationsOpen ? "bg-white/80" : "",
              ].join(" ")}
              aria-label="Últimos movimientos"
              aria-haspopup="menu"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setUserMenuOpen(false);
                setNotificationsOpen((v) => !v);
              }}
            >
              <IconHistory className="size-5 text-foreground" />
            </button>

            {notificationsOpen ? (
              <div
                className="absolute right-0 top-full z-30 mt-2 w-[340px] rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
                role="menu"
                aria-label="Últimos movimientos"
              >
                <RecentActivityDropdown
                  items={dashboard?.activity ?? []}
                  currency={active?.currency ?? "ARS"}
                />
              </div>
            ) : null}
          </div>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-white/70"
              aria-label="Menú de usuario"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              onClick={() => {
                setNotificationsOpen(false);
                setUserMenuOpen((v) => !v);
              }}
            >
              <span className="inline-flex size-7 items-center justify-center rounded-xl bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]">
                {initials}
              </span>
              <span className="hidden sm:inline">{userName}</span>
              <IconChevronDown className="size-4 text-muted-foreground" />
            </button>

            {userMenuOpen ? (
              <div
                className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
                role="menu"
                aria-label="Opciones de usuario"
              >
                <div className="flex gap-3 p-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--quipu-ice)] text-sm font-semibold text-[color:var(--quipu-night)]">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {userName}
                    </div>
                    {userRole ? (
                      <div className="text-xs text-muted-foreground">{userRole}</div>
                    ) : null}
                  </div>
                </div>

                <div className="border-t border-border px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    <span>
                      <span className="font-medium text-foreground">Estado:</span>{" "}
                      En línea
                    </span>
                  </div>
                </div>

                <div className="border-t border-border p-1.5">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-foreground hover:bg-black/5"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    <IconLogout className="size-4 text-muted-foreground" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

