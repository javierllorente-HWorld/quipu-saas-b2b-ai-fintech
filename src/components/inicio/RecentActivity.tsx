"use client";

import * as React from "react";
import type { ActivityItem, CurrencyCode } from "./mock";
import { RecentActivityList } from "./RecentActivityList";

export type RecentActivityProps = {
  items: ActivityItem[];
  currency: CurrencyCode;
};

export function RecentActivity({ items, currency }: RecentActivityProps) {
  return (
    <div className="qp-card">
      <div className="qp-card-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">
              Actividad reciente
            </div>
          </div>
        </div>
      </div>
      <div className="qp-card-content">
        <RecentActivityList items={items} currency={currency} />
      </div>
    </div>
  );
}

