"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { KpiRow } from "@/components/inicio/KpiRow";
import { UpcomingTable } from "@/components/inicio/UpcomingTable";
import type { Company, CurrencyCode, Kpi, UpcomingItem } from "@/components/inicio/mock";
import { IconSparkles, IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import {
  topbarCompanyLoading,
  topbarCompanyNeutral,
} from "@/components/shell/topbarCompanyPlaceholders";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { useRouter } from "next/navigation";

type DashboardApiKpis = {
  totalAvailable?: number;
  netFlow?: number;
  receivables?: number;
  payables?: number;
  income?: number;
};

type DashboardApiOrg = {
  id?: string;
  name?: string;
  default_currency?: string;
};

type UpcomingApiEvent = {
  id: string;
  type: "collection" | "payment" | string;
  date: string | null;
  amount: number;
  description?: string;
  counterpartyName?: string;
  documentNumber?: string;
  computedStatus?: "overdue" | "upcoming" | string;
  status?: string;
};

type DashboardApiSuccess = {
  ok: true;
  organization: DashboardApiOrg | null;
  kpis: DashboardApiKpis;
  upcomingEvents: UpcomingApiEvent[];
};

function toCurrencyCode(value: unknown): CurrencyCode {
  if (value === "USD") return "USD";
  return "ARS";
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapApiKpis(api: DashboardApiKpis | undefined): Kpi[] {
  const k = api ?? {};
  return [
    {
      key: "availableBalance",
      label: "Saldo total disponible",
      value: num(k.totalAvailable),
      hint: "En bancos + caja",
    },
    {
      key: "netFlow",
      label: "Flujo neto",
      value: num(k.netFlow),
      hint: "Ingresos menos egresos (caja)",
    },
    {
      key: "accountsReceivable",
      label: "Cuentas por cobrar",
      value: num(k.receivables),
      hint: "Facturas pendientes",
    },
    {
      key: "accountsPayable",
      label: "Cuentas por pagar",
      value: num(k.payables),
      hint: "Bills pendientes",
    },
    {
      key: "income",
      label: "Ingresos",
      value: num(k.income),
      hint: "Movimientos de entrada",
    },
  ];
}

function mapUpcomingEvents(events: UpcomingApiEvent[] | undefined): UpcomingItem[] {
  if (!events?.length) return [];
  const fallbackDate = new Date().toISOString().slice(0, 10);
  return events.map((ev) => {
    const dateStr =
      typeof ev.date === "string" && ev.date.length >= 10 ? ev.date.slice(0, 10) : fallbackDate;
    const isCollection = ev.type === "collection";
    const counterparty = (ev.counterpartyName ?? "").trim();
    const computed =
      ev.computedStatus === "overdue" || ev.computedStatus === "upcoming"
        ? ev.computedStatus
        : undefined;
    return {
      id: ev.id,
      type: isCollection ? "Cobro" : "Pago",
      description: ev.description?.trim() || (isCollection ? "Cobro pendiente" : "Pago pendiente"),
      date: dateStr,
      counterparty: counterparty.length > 0 ? counterparty : "—",
      amount: num(ev.amount),
      computedStatus: computed,
    };
  });
}

function companyFromOrg(org: DashboardApiOrg | null | undefined): Company {
  return {
    id: org?.id ?? "unknown",
    name: org?.name?.trim() || "Empresa",
    currency: toCurrencyCode(org?.default_currency),
  };
}

export default function InicioPage() {
  useRequireDemoAuth();

  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [company, setCompany] = React.useState<Company>(topbarCompanyLoading);
  const [kpis, setKpis] = React.useState<Kpi[]>([]);
  const [upcoming, setUpcoming] = React.useState<UpcomingItem[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (cancelled) return;
        const json = (await res.json()) as DashboardApiSuccess & { ok?: boolean; error?: string };
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          setError(json.error ?? "No se pudo cargar el panel.");
          setCompany(topbarCompanyNeutral);
          setKpis(mapApiKpis({}));
          setUpcoming([]);
          return;
        }
        setCompany(companyFromOrg(json.organization));
        setKpis(mapApiKpis(json.kpis));
        setUpcoming(mapUpcomingEvents(json.upcomingEvents));
      } catch {
        if (cancelled) return;
        setError("No se pudo conectar con el servidor.");
        setCompany(topbarCompanyNeutral);
        setKpis(mapApiKpis({}));
        setUpcoming([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  const topbarCompanies = React.useMemo(() => [company], [company]);

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="inicio" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="inicio"
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
            activeCompanyId={company.id}
            onCompanyChange={() => {}}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <main className="px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-7xl">
              <header className="mb-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                      Inicio
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Resumen de salud financiera
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--quipu-accent)] px-5 text-sm font-medium text-white hover:opacity-95 active:translate-y-px"
                      onClick={() => router.push("/ia")}
                    >
                      <IconSparkles className="size-4" />
                      Copiloto Quipu
                    </button>
                  </div>
                </div>
              </header>

              {error ? (
                <div
                  className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                  Cargando datos del panel…
                </div>
              ) : (
                <section className="space-y-4">
                  <KpiRow kpis={kpis} currency={company.currency} />

                  <UpcomingTable items={upcoming} currency={company.currency} />
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
