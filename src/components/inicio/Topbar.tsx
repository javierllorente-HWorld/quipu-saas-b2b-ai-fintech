"use client";

import * as React from "react";
import type { Company } from "./mock";
import { IconBell, IconChevronDown, IconMenu, IconSearch } from "./icons";

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
  const active = companies.find((c) => c.id === activeCompanyId) ?? companies[0];

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

          <div className="relative">
            <select
              className="h-10 appearance-none rounded-2xl border border-border bg-card pl-4 pr-10 text-sm font-medium text-foreground shadow-sm hover:bg-white/70"
              value={active?.id}
              onChange={(e) => onCompanyChange(e.target.value)}
              aria-label="Seleccionar empresa"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IconChevronDown className="size-4" />
            </span>
          </div>
        </div>

        <div className="hidden w-full max-w-md items-center md:flex">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IconSearch className="size-4" />
            </span>
            <input
              className="qp-input h-10 pl-9"
              placeholder="Buscar movimientos, clientes, facturas…"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-card hover:bg-white/70"
            aria-label="Notificaciones"
          >
            <IconBell className="size-5 text-foreground" />
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-white/70"
            aria-label="Menú de usuario"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-xl bg-[color:var(--quipu-ice)] text-[color:var(--quipu-night)]">
              U
            </span>
            <span className="hidden sm:inline">Usuario</span>
            <IconChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden sm:px-6">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <IconSearch className="size-4" />
          </span>
          <input
            className="qp-input h-10 pl-9"
            placeholder="Buscar…"
          />
        </div>
      </div>
    </div>
  );
}

