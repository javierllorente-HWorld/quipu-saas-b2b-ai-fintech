"use client";

import * as React from "react";
import { mockCompanies, mockDashboardByCompanyId } from "@/components/inicio/mock";
import { CopilotCard } from "@/components/inicio/CopilotCard";
import { useRequireDemoAuth } from "@/components/shell/useRequireDemoAuth";

export default function IaPage() {
  useRequireDemoAuth();

  const activeCompanyId = mockCompanies[0]?.id ?? "acme-ar";

  const inicioData =
    mockDashboardByCompanyId[activeCompanyId] ?? mockDashboardByCompanyId["acme-ar"];

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <CopilotCard suggestions={inicioData.copilotSuggestions} />
    </section>
  );
}
