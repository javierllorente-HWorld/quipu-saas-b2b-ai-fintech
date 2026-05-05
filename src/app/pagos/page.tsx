"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { IconX } from "@/components/inicio/icons";
import {
  topbarCompanyLoading,
  topbarCompanyNeutral,
} from "@/components/shell/topbarCompanyPlaceholders";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { PagosKpiRow } from "@/components/pagos/KpiRow";
import { PaymentsCalendarChart } from "@/components/pagos/PaymentsCalendarChart";
import { UpcomingPaymentsTable } from "@/components/pagos/UpcomingPaymentsTable";
import { VendorsTable } from "@/components/pagos/VendorsTable";
import { RecentPaymentsTable } from "@/components/pagos/RecentPaymentsTable";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { ProgramarPagoModal } from "@/components/shared/ProgramarPagoModal";
import {
  mapPayablesApiPayload,
  type PayablesApiSuccessPayload,
} from "@/components/pagos/mapPayablesApi";

export default function PagosPage() {
  useRequireDemoAuth();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [pagoModalOpen, setPagoModalOpen] = React.useState(false);

  const [payablesLoading, setPayablesLoading] = React.useState(true);
  const [payablesError, setPayablesError] = React.useState<string | null>(null);
  const [payablesView, setPayablesView] = React.useState<
    ReturnType<typeof mapPayablesApiPayload> | null
  >(null);

  const [bankAccounts, setBankAccounts] = React.useState<{ id: string; label: string }[]>([]);
  const [bankAccountsError, setBankAccountsError] = React.useState<string | null>(null);

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  const loadPayables = React.useCallback(() => {
    let cancelled = false;
    setPayablesLoading(true);
    setPayablesError(null);

    fetch("/api/payables", { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as PayablesApiSuccessPayload & {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || body.ok !== true) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "No se pudieron cargar los datos de pagos.",
          );
        }
        if (cancelled) return;
        setPayablesView(mapPayablesApiPayload(body as PayablesApiSuccessPayload));
        setPayablesError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setPayablesView(null);
        setPayablesError(e instanceof Error ? e.message : "Error al cargar pagos.");
      })
      .finally(() => {
        if (!cancelled) setPayablesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadBankAccounts = React.useCallback(() => {
    let cancelled = false;
    setBankAccountsError(null);
    fetch("/api/cash", { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as
          | {
              ok?: boolean;
              error?: string;
              bankBalances?: { id: string; bank?: string; balance?: unknown }[];
            }
          | undefined;

        if (!res.ok || body?.ok !== true) {
          throw new Error(
            typeof body?.error === "string" && body.error.trim()
              ? body.error
              : "No se pudieron cargar las cuentas bancarias.",
          );
        }

        const accounts = (body.bankBalances ?? [])
          .map((row) => {
            const id = typeof row.id === "string" ? row.id : "";
            const bank = typeof row.bank === "string" ? row.bank : "";
            const balance = Number(row.balance);
            const suffix = Number.isFinite(balance) ? ` — $${balance.toLocaleString("es-AR")}` : "";
            const label = `${bank || "Cuenta"}${suffix}`;
            return id ? { id, label } : null;
          })
          .filter((x): x is { id: string; label: string } => x !== null);

        if (cancelled) return;
        setBankAccounts(accounts);
        setBankAccountsError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBankAccounts([]);
        setBankAccountsError(
          e instanceof Error ? e.message : "No se pudieron cargar las cuentas bancarias.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const cancelPayables = loadPayables();
    const cancelAccounts = loadBankAccounts();
    return () => {
      cancelPayables();
      cancelAccounts();
    };
  }, [loadPayables, loadBankAccounts]);

  const topbarCompanies = React.useMemo(() => {
    if (payablesView?.organization) {
      return [
        {
          id: payablesView.organization.id,
          name: payablesView.organization.name,
          currency: payablesView.currency,
        },
      ];
    }
    if (payablesLoading) return [topbarCompanyLoading];
    return [topbarCompanyNeutral];
  }, [payablesView, payablesLoading]);

  const activeCompanyId =
    payablesView?.organization?.id ??
    (payablesLoading ? topbarCompanyLoading.id : topbarCompanyNeutral.id);

  const displayCurrency = payablesView?.currency ?? "ARS";

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="pagos" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="pagos"
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
            activeCompanyId={activeCompanyId}
            onCompanyChange={() => {}}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <main className="px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-7xl">
              <header className="mb-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                      Pagos
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pagos a proveedores, vencimientos y aprobaciones.
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {payablesLoading
                        ? "Cargando datos…"
                        : payablesError
                          ? "No se pudo actualizar"
                          : "Datos desde servidor"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white transition hover:opacity-95 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setPagoModalOpen(true)}
                      disabled={payablesLoading}
                    >
                      Programar pago
                    </button>
                  </div>
                </div>
              </header>

              {payablesError ? (
                <div
                  className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                  role="alert"
                >
                  {payablesError}
                </div>
              ) : null}

              {payablesLoading ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  Cargando datos de pagos…
                </div>
              ) : payablesView ? (
                <section className="space-y-4">
                  <PagosKpiRow kpis={payablesView.kpis} currency={displayCurrency} />

                  <PaymentsCalendarChart
                    title="Calendario de pagos"
                    points={payablesView.calendar.points}
                    currency={displayCurrency}
                  />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      {payablesView.upcoming.length > 0 ? (
                        <UpcomingPaymentsTable
                          title="Próximos pagos"
                          items={payablesView.upcoming}
                          currency={displayCurrency}
                        />
                      ) : (
                        <div className="qp-card">
                          <div className="qp-card-header">
                            <div className="text-base font-semibold tracking-tight">
                              Próximos pagos
                            </div>
                          </div>
                          <div className="qp-card-content">
                            <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                              Todavía no hay pagos programados.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <VendorsTable
                        title="Proveedores"
                        items={payablesView.vendors}
                        currency={displayCurrency}
                      />
                    </div>
                  </div>

                  <div>
                    <RecentPaymentsTable
                      title="Pagos recientes"
                      items={payablesView.recent}
                      currency={displayCurrency}
                    />
                  </div>
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      <ProgramarPagoModal
        open={pagoModalOpen}
        onClose={() => setPagoModalOpen(false)}
        bankAccounts={bankAccounts}
        onSaved={() => {
          setPagoModalOpen(false);
          loadPayables();
          loadBankAccounts();
        }}
      />
    </div>
  );
}
