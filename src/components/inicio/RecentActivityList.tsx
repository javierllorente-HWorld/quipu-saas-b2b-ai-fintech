 "use client";
 
 import * as React from "react";
 import type { ActivityItem, CurrencyCode } from "./mock";
 import { formatMoney, formatTimeAgo } from "./format";
 
 export type RecentActivityListProps = {
   items: ActivityItem[];
   currency: CurrencyCode;
   limit?: number;
   compact?: boolean;
 };
 
 export function RecentActivityList({
   items,
   currency,
   limit,
   compact,
 }: RecentActivityListProps) {
   const visibleItems = React.useMemo(() => {
     if (!limit) return items;
     return items.slice(0, limit);
   }, [items, limit]);
 
  const containerClassName = compact
    ? "overflow-hidden rounded-2xl border border-border bg-white/60"
    : "overflow-hidden rounded-2xl border border-border bg-white/60";
  const rowClassName = compact
    ? "flex items-center justify-between gap-3 px-3 py-2 hover:bg-black/[0.02]"
    : "flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/[0.02]";
 
   return (
    <div className={containerClassName}>
      <div className="divide-y divide-border">
       {visibleItems.map((m) => {
         const isIncome = m.type === "Ingreso";
         return (
           <div key={m.id} className={rowClassName}>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {m.description}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {formatTimeAgo(m.timestamp)}
              </div>
             </div>
             <div className="text-right">
               <div
                 className={[
                  "inline-flex items-baseline justify-end gap-1 text-sm font-semibold tabular-nums",
                   isIncome ? "text-emerald-700" : "text-rose-700",
                 ].join(" ")}
               >
                <span className="inline-block w-3 text-right" aria-hidden="true">
                  {isIncome ? "+" : "-"}
                </span>
                <span>{formatMoney(m.amount, currency)}</span>
               </div>
               <div className="mt-1 text-xs text-muted-foreground">{m.type}</div>
             </div>
           </div>
         );
       })}
      </div>
    </div>
   );
 }
 
