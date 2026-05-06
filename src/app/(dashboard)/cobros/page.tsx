"use client";

import * as React from "react";
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
import { formatMoney, formatShortDate } from "@/components/inicio/format";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}

export default function CobrosPage() {
  useRequireDemoAuth();

  const [cobroModalOpen, setCobroModalOpen] = React.useState(false);

  const [receivablesLoading, setReceivablesLoading] = React.useState(true);
  const [receivablesError, setReceivablesError] = React.useState<string | null>(null);
  const [receivablesView, setReceivablesView] = React.useState<
    ReturnType<typeof mapReceivablesApiPayload> | null
  >(null);

  const [bankAccounts, setBankAccounts] = React.useState<{ id: string; label: string }[]>([]);

  const [voidingCollectionId, setVoidingCollectionId] = React.useState<string | null>(null);
  const [voidCollectionError, setVoidCollectionError] = React.useState<string | null>(null);

  const loadReceivables = React.useCallback(() => {
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

  async function requestVoidCollection(collectionId: string) {
    const confirmed = window.confirm(
      "¿Querés anular este cobro?\n\nSe creará un movimiento inverso y se ajustará el saldo.",
    );
    if (!confirmed) return;

    setVoidCollectionError(null);
    setVoidingCollectionId(collectionId);

    try {
      const res = await fetch(`/api/receivables/collections/${encodeURIComponent(collectionId)}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || body.ok !== true) {
        const msg =
          typeof body.error === "string" && body.error.trim()
            ? body.error
            : "No se pudo anular el cobro.";
        setVoidCollectionError(msg);
        return;
      }

      loadReceivables();
      loadBankAccounts();
    } catch {
      setVoidCollectionError("No se pudo anular el cobro. Reintentá en unos segundos.");
    } finally {
      setVoidingCollectionId(null);
    }
  }

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
    const cancelReceivables = loadReceivables();
    const cancelAccounts = loadBankAccounts();
    return () => {
      cancelReceivables();
      cancelAccounts();
    };
  }, [loadReceivables, loadBankAccounts]);

  const displayCurrency = receivablesView?.currency ?? "ARS";

  return (
    <>
      <header className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cobros</h1>
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
        <section className="space-y-3">
          <CobrosKpiRow kpis={receivablesView.kpis} currency={displayCurrency} />

          <DebtAgingDonut
            title="Antigüedad de deuda"
            subtitle="Distribución de facturas pendientes según días de vencimiento."
            items={receivablesView.aging.items}
            total={receivablesView.aging.total}
            currency={displayCurrency}
          />

          <div className="grid gap-3 lg:grid-cols-2">
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

          <div className="qp-card">
            <div className="qp-card-header">
              <div>
                <div className="text-base font-semibold tracking-tight">Cobros recientes</div>
                <div className="mt-1 text-sm text-muted-foreground">Últimos cobros registrados.</div>
                {voidCollectionError ? (
                  <p className="mt-2 text-sm text-rose-700" role="alert">
                    {voidCollectionError}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="qp-card-content">
              {receivablesView.recentCollections && receivablesView.recentCollections.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="py-3 pr-4 font-medium">Fecha</th>
                        <th className="py-3 pr-4 font-medium">Descripción</th>
                        <th className="py-3 pr-4 font-medium">Cuenta destino</th>
                        <th className="py-3 pl-2 text-right font-medium">Monto</th>
                        <th
                          className="sticky right-0 z-[1] w-[5.5rem] min-w-[5.5rem] bg-card py-3 pl-3 text-right font-medium shadow-[-12px_0_16px_-12px_rgba(0,0,0,0.12)]"
                          scope="col"
                        >
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {receivablesView.recentCollections.map((row) => {
                        const busy = voidingCollectionId === row.id;
                        return (
                          <tr
                            key={row.id}
                            className={[
                              "group hover:bg-black/[0.02]",
                              busy ? "opacity-60" : "",
                            ].join(" ")}
                            aria-busy={busy || undefined}
                          >
                            <td className="py-3 pr-4 text-muted-foreground">
                              {row.date ? formatShortDate(row.date) : "Sin fecha"}
                            </td>
                            <td className="py-3 pr-4 text-foreground">{row.description}</td>
                            <td className="py-3 pr-4 text-muted-foreground">
                              {row.bankAccountName ?? "—"}
                            </td>
                            <td className="py-3 pl-2 text-right font-semibold text-foreground">
                              {formatMoney(row.amount, displayCurrency)}
                            </td>
                            <td className="sticky right-0 z-[1] w-[5.5rem] min-w-[5.5rem] bg-card py-3 pl-3 text-right align-middle shadow-[-12px_0_16px_-12px_rgba(0,0,0,0.12)] group-hover:bg-black/[0.02]">
                              <button
                                type="button"
                                disabled={voidingCollectionId !== null}
                                onClick={() => void requestVoidCollection(row.id)}
                                className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-white/80 hover:text-rose-700 disabled:pointer-events-none disabled:opacity-40"
                                aria-label="Anular cobro"
                              >
                                {busy ? (
                                  <span
                                    className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
                                    aria-hidden
                                  />
                                ) : (
                                  <TrashIcon />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay cobros registrados.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <RegisterCobroModal
        open={cobroModalOpen}
        onClose={() => setCobroModalOpen(false)}
        bankAccounts={bankAccounts}
        onSaved={() => {
          setCobroModalOpen(false);
          loadReceivables();
          loadBankAccounts();
        }}
      />
    </>
  );
}
