"use client";

import * as React from "react";
import type { Company } from "./mock";
import {
  IconChevronDown,
  IconHistory,
  IconLogout,
  IconMenu,
} from "./icons";
import { signOutDemo } from "@/lib/demoAuth";
import { useRouter } from "next/navigation";
import { mockDashboardByCompanyId } from "@/components/inicio/mock";
import { RecentActivityDropdown } from "@/components/inicio/RecentActivityDropdown";

/** Alineado con APIs demo; priorizar esta org en la lista de `/api/organizations`. */
const DEMO_ORGANIZATION_ID = "7356d336-7207-415d-87e2-d05fd6e70efe";

// TODO: centralizar organization/user en un provider global para evitar refetch al navegar.

export type TopbarProps = {
  companies: Company[];
  activeCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  onOpenSidebar: () => void;
};

type MeApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

type OrgApiRow = {
  id: string;
  name: string;
  default_currency?: string | null;
};

type LoadState = "loading" | "success" | "error";

function initialsFromName(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function toCurrencyCode(value: string | null | undefined): "ARS" | "USD" {
  return (value ?? "").trim().toUpperCase() === "USD" ? "USD" : "ARS";
}

export function Topbar({
  companies,
  activeCompanyId,
  onCompanyChange,
  onOpenSidebar,
}: TopbarProps) {
  void onCompanyChange;
  const router = useRouter();
  const active = companies.find((c) => c.id === activeCompanyId) ?? companies[0];

  const [orgState, setOrgState] = React.useState<LoadState>("loading");
  const [orgRow, setOrgRow] = React.useState<OrgApiRow | null>(null);
  const [meState, setMeState] = React.useState<LoadState>("loading");
  const [meUser, setMeUser] = React.useState<MeApiUser | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const orgFetch = fetch("/api/organizations", { cache: "no-store" }).then((r) => r.json());
    const meFetch = fetch("/api/me", { cache: "no-store" }).then((r) => r.json());

    Promise.all([orgFetch, meFetch])
      .then(([orgBody, meBody]) => {
        if (cancelled) return;

        const rows = orgBody?.organizations as OrgApiRow[] | undefined;
        const picked =
          Array.isArray(rows) && rows.length > 0
            ? rows.find((o) => o.id === DEMO_ORGANIZATION_ID) ?? rows[0]
            : null;
        if (orgBody?.ok === true && picked?.id && typeof picked.name === "string" && picked.name.trim()) {
          setOrgRow(picked);
          setOrgState("success");
        } else {
          setOrgRow(null);
          setOrgState("error");
        }

        if (
          meBody?.ok === true &&
          meBody.user &&
          typeof meBody.user.fullName === "string" &&
          meBody.user.fullName.trim()
        ) {
          setMeUser(meBody.user);
          setMeState("success");
        } else {
          setMeUser(null);
          setMeState("error");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setOrgRow(null);
        setOrgState("error");
        setMeUser(null);
        setMeState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const companyLabel =
    orgState === "loading"
      ? "Cargando empresa..."
      : orgState === "success" && orgRow?.name?.trim()
        ? orgRow.name.trim()
        : "Empresa";

  const userName =
    meState === "loading"
      ? "Cargando usuario..."
      : meState === "success" && meUser?.fullName?.trim()
        ? meUser.fullName.trim()
        : "Usuario";

  const activityCompanyId = orgRow?.id ?? activeCompanyId ?? active?.id ?? "";
  const dashboard = mockDashboardByCompanyId[activityCompanyId];

  const displayCurrency =
    orgState === "success" && orgRow ? toCurrencyCode(orgRow.default_currency) : "ARS";

  const initials = React.useMemo(() => initialsFromName(userName), [userName]);

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
            {companyLabel}
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
                  currency={displayCurrency}
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
                    {meState === "loading" ? (
                      <div className="text-xs text-muted-foreground">Cargando...</div>
                    ) : meState === "error" ? (
                      <div className="text-xs text-muted-foreground">Rol</div>
                    ) : meUser?.role?.trim() ? (
                      <div className="text-xs text-muted-foreground">{meUser.role.trim()}</div>
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

