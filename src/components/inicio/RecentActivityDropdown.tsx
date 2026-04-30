 "use client";
 
 import * as React from "react";
 import type { ActivityItem, CurrencyCode } from "./mock";
 import { RecentActivityList } from "./RecentActivityList";
 
 export type RecentActivityDropdownProps = {
   items: ActivityItem[];
   currency: CurrencyCode;
 };
 
 export function RecentActivityDropdown({
   items,
   currency,
 }: RecentActivityDropdownProps) {
   return (
     <div className="p-3">
       <div className="text-sm font-semibold tracking-tight text-foreground">
         Actividad reciente
       </div>
 
       <div className="mt-2">
         {items.length ? (
           <RecentActivityList items={items} currency={currency} limit={4} compact />
         ) : (
           <div className="rounded-2xl border border-border bg-white/60 px-3 py-2 text-xs text-muted-foreground">
             Sin movimientos recientes
           </div>
         )}
       </div>
     </div>
   );
 }
 
