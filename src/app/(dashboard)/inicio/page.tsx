"use client";

import * as React from "react";
import {
  AutomaticAlertsCard,
  type AutomaticAlertItem,
} from "@/components/inicio/AutomaticAlertsCard";
import { KpiRow } from "@/components/inicio/KpiRow";
import { UpcomingTable } from "@/components/inicio/UpcomingTable";
import type { Company, CurrencyCode, Kpi, UpcomingItem } from "@/components/inicio/mock";
import { IconSparkles } from "@/components/inicio/icons";
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

type AlertsApiSuccess = {
  ok: true;
  alerts: AutomaticAlertItem[];
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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [company, setCompany] = React.useState<Company>(topbarCompanyLoading);
  const [kpis, setKpis] = React.useState<Kpi[]>([]);
  const [upcoming, setUpcoming] = React.useState<UpcomingItem[]>([]);
  const [automaticAlerts, setAutomaticAlerts] = React.useState<AutomaticAlertItem[]>([]);

  const fetchAlerts = React.useCallback(async () => {
    const res = await fetch("/api/alerts", { cache: "no-store" });
    if (!res.ok) {
      setAutomaticAlerts([]);
      return;
    }
    let alertsJson: AlertsApiSuccess & { ok?: boolean };
    try {
      alertsJson = (await res.json()) as AlertsApiSuccess & { ok?: boolean };
    } catch {
      setAutomaticAlerts([]);
      return;
    }
    if (alertsJson.ok && Array.isArray(alertsJson.alerts)) {
      setAutomaticAlerts(alertsJson.alerts);
    } else {
      setAutomaticAlerts([]);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, alertsRes] = await Promise.all([
          fetch("/api/dashboard", { cache: "no-store" }),
          fetch("/api/alerts", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        const json = (await dashRes.json()) as DashboardApiSuccess & { ok?: boolean; error?: string };
        if (cancelled) return;
        if (!dashRes.ok || !json.ok) {
          setError(json.error ?? "No se pudo cargar el panel.");
          setCompany(topbarCompanyNeutral);
          setKpis(mapApiKpis({}));
          setUpcoming([]);
          setAutomaticAlerts([]);
          return;
        }
        setCompany(companyFromOrg(json.organization));
        setKpis(mapApiKpis(json.kpis));
        setUpcoming(mapUpcomingEvents(json.upcomingEvents));

        if (alertsRes.ok) {
          const alertsJson = (await alertsRes.json()) as AlertsApiSuccess & { ok?: boolean };
          if (!cancelled && alertsJson.ok && Array.isArray(alertsJson.alerts)) {
            setAutomaticAlerts(alertsJson.alerts);
          } else if (!cancelled) {
            setAutomaticAlerts([]);
          }
        } else if (!cancelled) {
          setAutomaticAlerts([]);
        }
      } catch {
        if (cancelled) return;
        setError("No se pudo conectar con el servidor.");
        setCompany(topbarCompanyNeutral);
        setKpis(mapApiKpis({}));
        setUpcoming([]);
        setAutomaticAlerts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inicio</h1>
            <p className="mt-1 text-sm text-muted-foreground">Resumen de salud financiera</p>
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
        <section className="space-y-3">
          <KpiRow kpis={kpis} currency={company.currency} />

          <UpcomingTable items={upcoming} currency={company.currency} />

          <AutomaticAlertsCard items={automaticAlerts} onRefreshAlerts={fetchAlerts} />
        </section>
      )}
    </>
  );
}
