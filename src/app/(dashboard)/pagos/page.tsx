"use client";

import * as React from "react";
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

  const [pagoModalOpen, setPagoModalOpen] = React.useState(false);

  const [payablesLoading, setPayablesLoading] = React.useState(true);
  const [payablesError, setPayablesError] = React.useState<string | null>(null);
  const [payablesView, setPayablesView] = React.useState<
    ReturnType<typeof mapPayablesApiPayload> | null
  >(null);

  const [bankAccounts, setBankAccounts] = React.useState<{ id: string; label: string }[]>([]);

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
      })
      .catch(() => {
        if (cancelled) return;
        setBankAccounts([]);
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

  const displayCurrency = payablesView?.currency ?? "ARS";

  return (
    <>
      <header className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pagos</h1>
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
        <section className="space-y-3">
          <PagosKpiRow kpis={payablesView.kpis} currency={displayCurrency} />

          <PaymentsCalendarChart
            title="Calendario de pagos"
            points={payablesView.calendar.points}
            currency={displayCurrency}
          />

          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              {payablesView.upcoming.length > 0 ? (
                <UpcomingPaymentsTable
                  title="Próximos pagos"
                  items={payablesView.upcoming}
                  currency={displayCurrency}
                  onRefresh={() => {
                    loadPayables();
                  }}
                />
              ) : (
                <div className="qp-card">
                  <div className="qp-card-header">
                    <div className="text-base font-semibold tracking-tight">Próximos pagos</div>
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
    </>
  );
}
