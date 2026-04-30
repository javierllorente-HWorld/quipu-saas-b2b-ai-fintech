"use client";

import * as React from "react";

export type ToastProps = {
  message: string;
  show: boolean;
};

export function Toast({ message, show }: ToastProps) {
  if (!show) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[92vw]">
      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-card)]">
        {message}
      </div>
    </div>
  );
}

