 "use client";
 
 import * as React from "react";
import { useRouter } from "next/navigation";
 import type { ActivityItem, CurrencyCode } from "./mock";
 import { RecentActivityList } from "./RecentActivityList";
 
 export type RecentActivityDropdownProps = {
   items: ActivityItem[];
   currency: CurrencyCode;
  loading?: boolean;
 };
 
 export function RecentActivityDropdown({
   items,
   currency,
  loading,
 }: RecentActivityDropdownProps) {
  const router = useRouter();
   return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold tracking-tight text-foreground">
          Últimos movimientos
        </div>
      </div>
 
      <div className="mt-3 max-h-[292px] overflow-auto pr-1">
        {loading ? (
          <div className="space-y-3" aria-label="Cargando movimientos">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-7 shrink-0 rounded-full bg-black/10 animate-pulse" />
                  <div className="min-w-0">
                    <div className="h-4 w-40 max-w-[60vw] rounded bg-black/10 animate-pulse" />
                    <div className="mt-2 h-3 w-16 rounded bg-black/10 animate-pulse" />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="h-4 w-20 rounded bg-black/10 animate-pulse" />
                  <div className="mt-2 h-3 w-14 rounded bg-black/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length ? (
          <RecentActivityList items={items} currency={currency} limit={4} compact />
        ) : (
          <div className="rounded-2xl border border-border bg-white/60 px-3 py-6 text-center text-xs text-muted-foreground">
            Sin movimientos recientes
          </div>
        )}
       </div>

      <div className="mt-4 border-t border-border pt-3">
        <button
          type="button"
          className="qp-btn-primary h-10 w-full px-4"
          onClick={() => router.push("/caja")}
        >
          Ir al historial
        </button>
      </div>
     </div>
   );
 }
 
