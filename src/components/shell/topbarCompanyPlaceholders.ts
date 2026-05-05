import type { Company } from "@/components/inicio/mock";

/** Para `Topbar.companies` mientras el módulo aún no recibió `organization` desde la API. */
export const topbarCompanyLoading: Company = {
  id: "__topbar_loading__",
  name: "Cargando empresa...",
  currency: "ARS",
};

/** Fallback neutro si falló la carga o no hay org en el payload del módulo. */
export const topbarCompanyNeutral: Company = {
  id: "__topbar_neutral__",
  name: "Empresa",
  currency: "ARS",
};
