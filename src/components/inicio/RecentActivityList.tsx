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
 
   const rowClassName = compact
     ? "flex items-center justify-between gap-3 rounded-2xl border border-border bg-white/60 px-3 py-2 hover:bg-white/80"
     : "flex items-center justify-between gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3 hover:bg-white/80";
 
   return (
     <div className={compact ? "space-y-2" : "space-y-3"}>
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
                   "text-sm font-semibold",
                   isIncome ? "text-emerald-700" : "text-rose-700",
                 ].join(" ")}
               >
                 {isIncome ? "+" : "-"} {formatMoney(m.amount, currency)}
               </div>
               <div className="mt-1 text-xs text-muted-foreground">{m.type}</div>
             </div>
           </div>
         );
       })}
     </div>
   );
 }
 
