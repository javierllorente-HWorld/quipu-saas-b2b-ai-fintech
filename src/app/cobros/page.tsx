"use client";

import * as React from "react";
import { Sidebar } from "@/components/inicio/Sidebar";
import { Topbar } from "@/components/inicio/Topbar";
import { mockCompanies } from "@/components/inicio/mock";
import { IconX } from "@/components/inicio/icons";
import { useSidebarNavigate } from "@/components/shell/useSidebarNavigate";
import { CobrosKpiRow } from "@/components/cobros/KpiRow";
import { DebtAgingDonut } from "@/components/cobros/DebtAgingDonut";
import { CustomersReceivableTable } from "@/components/cobros/CustomersReceivableTable";
import { InvoicesPendingTable } from "@/components/cobros/InvoicesPendingTable";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";
import { RegisterCobroModal } from "@/components/shared/RegisterCobroModal";
import {
  mapReceivablesApiPayload,
  type ReceivablesApiSuccessPayload,
} from "@/components/cobros/mapReceivablesApi";

export default function CobrosPage() {
  useRequireDemoAuth();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [cobroModalOpen, setCobroModalOpen] = React.useState(false);

  const [receivablesLoading, setReceivablesLoading] = React.useState(true);
  const [receivablesError, setReceivablesError] = React.useState<string | null>(null);
  const [receivablesView, setReceivablesView] = React.useState<
    ReturnType<typeof mapReceivablesApiPayload> | null
  >(null);

  const onNavigate = useSidebarNavigate({
    onAfterNavigate: () => setSidebarOpen(false),
  });

  React.useEffect(() => {
    let cancelled = false;
    setReceivablesLoading(true);
    setReceivablesError(null);

    fetch("/api/receivables", { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as ReceivablesApiSuccessPayload & {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || body.ok !== true) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "No se pudieron cargar los datos de cobros.",
          );
        }
        if (cancelled) return;
        setReceivablesView(mapReceivablesApiPayload(body as ReceivablesApiSuccessPayload));
        setReceivablesError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setReceivablesView(null);
        setReceivablesError(e instanceof Error ? e.message : "Error al cargar cobros.");
      })
      .finally(() => {
        if (!cancelled) setReceivablesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const topbarCompanies = React.useMemo(() => {
    if (receivablesView?.organization) {
      return [
        {
          id: receivablesView.organization.id,
          name: receivablesView.organization.name,
          currency: receivablesView.currency,
        },
      ];
    }
    return mockCompanies;
  }, [receivablesView]);

  const activeCompanyId =
    receivablesView?.organization?.id ?? mockCompanies[0]?.id ?? "acme-ar";

  const displayCurrency = receivablesView?.currency ?? mockCompanies[0]?.currency ?? "ARS";

  return (
    <div className="qp-shell">
      <div className="min-h-screen bg-background md:flex">
        <div className="hidden md:block md:shrink-0">
          <Sidebar activeKey="cobros" onNavigate={onNavigate} />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[260px] shadow-2xl">
              <Sidebar
                activeKey="cobros"
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
                      Cobros
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Cuentas por cobrar, facturas pendientes y deuda vencida.
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {receivablesLoading
                        ? "Cargando datos…"
                        : receivablesError
                          ? "No se pudo actualizar"
                          : "Datos desde servidor"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--quipu-accent)] px-4 text-sm font-medium text-white transition hover:opacity-95 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setCobroModalOpen(true)}
                      disabled={receivablesLoading}
                    >
                      Registrar cobro
                    </button>
                  </div>
                </div>
              </header>

              {receivablesError ? (
                <div
                  className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                  role="alert"
                >
                  {receivablesError}
                </div>
              ) : null}

              {receivablesLoading ? (
                <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  Cargando datos de cobros…
                </div>
              ) : receivablesView ? (
                <section className="space-y-4">
                  <CobrosKpiRow kpis={receivablesView.kpis} currency={displayCurrency} />

                  <DebtAgingDonut
                    title="Antigüedad de deuda"
                    subtitle="Distribución de facturas pendientes según días de vencimiento."
                    items={receivablesView.aging.items}
                    total={receivablesView.aging.total}
                    currency={displayCurrency}
                  />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <CustomersReceivableTable
                      title="Clientes por cobrar"
                      items={receivablesView.customers}
                      currency={displayCurrency}
                    />
                    <InvoicesPendingTable
                      title="Facturas pendientes"
                      items={receivablesView.invoices}
                      currency={displayCurrency}
                    />
                  </div>
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      <RegisterCobroModal
        open={cobroModalOpen}
        onClose={() => setCobroModalOpen(false)}
      />
    </div>
  );
}
