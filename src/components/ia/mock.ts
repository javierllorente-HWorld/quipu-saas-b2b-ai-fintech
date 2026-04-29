import type { CurrencyCode } from "@/components/inicio/mock";

export type IaKpiKey =
  | "ahorrosDetectados"
  | "riesgosDetectados"
  | "proyeccionSugerida30d"
  | "oportunidadesPriorizadas";

export type IaKpi = {
  key: IaKpiKey;
  label: string;
  format: "money" | "count";
  value: number;
  deltaPct?: number;
  hint?: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  timestamp?: string;
};

export type HealthMetricKey =
  | "ingresos"
  | "egresos"
  | "resultadoOperativo"
  | "flujoCajaNeto"
  | "liquidezCorriente";

export type HealthMetric = {
  key: HealthMetricKey;
  label: string;
  format: "money" | "number";
  value: number;
  deltaPct?: number;
};

export type RecommendedQuestion = {
  id: string;
  text: string;
};

export type SmartAlert = {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
};

export type SuggestedAction = {
  id: string;
  title: string;
  description: string;
  ctaLabel?: string;
};

export type ModuleKey = "caja" | "cobros" | "pagos" | "rentabilidad";

export type ModuleRecommendationTab = {
  key: ModuleKey;
  label: string;
  items: { id: string; title: string; detail?: string }[];
};

export type Opportunity = {
  id: string;
  title: string;
  impact: string;
};

export type CopilotMockData = {
  currency: CurrencyCode;
  kpis: IaKpi[];
  chat: {
    messages: ChatMessage[];
  };
  healthSummary: HealthMetric[];
  recommendedQuestions: RecommendedQuestion[];
  smartAlerts: SmartAlert[];
  suggestedActions: SuggestedAction[];
  moduleRecommendations: ModuleRecommendationTab[];
  opportunities: Opportunity[];
};

const acme: CopilotMockData = {
  currency: "ARS",
  kpis: [
    {
      key: "ahorrosDetectados",
      label: "Ahorros detectados",
      format: "money",
      value: 4250000,
      deltaPct: 12.4,
      hint: "vs. último mes",
    },
    {
      key: "riesgosDetectados",
      label: "Riesgos detectados",
      format: "count",
      value: 3,
      deltaPct: 25,
      hint: "vs. último mes",
    },
    {
      key: "proyeccionSugerida30d",
      label: "Proyección sugerida (30 días)",
      format: "money",
      value: 38450000,
      deltaPct: 9.6,
      hint: "vs. proyección actual",
    },
    {
      key: "oportunidadesPriorizadas",
      label: "Oportunidades priorizadas",
      format: "count",
      value: 5,
      hint: "para esta semana",
    },
  ],
  chat: {
    messages: [
      {
        id: "m1",
        role: "assistant",
        text:
          "Hola. Analicé tu salud financiera y encontré oportunidades para mejorar la rentabilidad y optimizar el flujo de caja. ¿Qué te gustaría profundizar hoy?",
        timestamp: "09:30",
      },
      {
        id: "m2",
        role: "user",
        text: "¿Cómo viene la salud financiera del negocio?",
        timestamp: "09:31",
      },
      {
        id: "m3",
        role: "assistant",
        text:
          "En general, estás sólido: ingresos +14,8% y liquidez +8,7% vs período anterior. Riesgo principal: concentración de caja en 2 bancos y 3 clientes con atrasos. Si querés, te muestro 3 acciones rápidas para reducir riesgo esta semana.",
        timestamp: "09:31",
      },
    ],
  },
  healthSummary: [
    { key: "ingresos", label: "Ingresos", format: "money", value: 152680900, deltaPct: 14.8 },
    { key: "egresos", label: "Egresos", format: "money", value: 116470300, deltaPct: -8.3 },
    { key: "resultadoOperativo", label: "Resultado operativo", format: "money", value: 36210600, deltaPct: 26.4 },
    { key: "flujoCajaNeto", label: "Flujo de caja neto", format: "money", value: 18975300, deltaPct: 8.7 },
    { key: "liquidezCorriente", label: "Liquidez corriente", format: "number", value: 1.86, deltaPct: 7.7 },
  ],
  recommendedQuestions: [
    { id: "q1", text: "¿Cuáles son los principales riesgos para los próximos 30 días?" },
    { id: "q2", text: "¿Dónde puedo reducir costos sin afectar la operación?" },
    { id: "q3", text: "¿Qué clientes tienen mayor riesgo de atraso en pagos?" },
    { id: "q4", text: "¿Cómo impacta este escenario en mi flujo de caja?" },
  ],
  smartAlerts: [
    {
      id: "a1",
      title: "Atraso en pagos de clientes",
      description: "3 facturas por $ 2.540.000 con más de 15 días de atraso.",
      severity: "high",
    },
    {
      id: "a2",
      title: "Vencimientos próximos",
      description: "Tenés 5 pagos a proveedores en los próximos 7 días.",
      severity: "medium",
    },
    {
      id: "a3",
      title: "Meta de cobros en riesgo",
      description: "Cobros proyectados -6% vs meta mensual.",
      severity: "low",
    },
  ],
  suggestedActions: [
    {
      id: "s1",
      title: "Revisar caja y previsión semanal",
      description: "Identificá quiebres de liquidez y mové fechas no críticas.",
      ctaLabel: "Actuar",
    },
    {
      id: "s2",
      title: "Revisar cobros atrasados",
      description: "Priorizá 3 clientes con mayor mora y automatizá recordatorios.",
      ctaLabel: "Actuar",
    },
    {
      id: "s3",
      title: "Priorizar pagos",
      description: "Pagá primero lo que tiene descuento o impacto operativo alto.",
      ctaLabel: "Actuar",
    },
    {
      id: "s4",
      title: "Analizar rentabilidad",
      description: "Detectá productos/servicios con margen bajo y ajustá precios.",
      ctaLabel: "Actuar",
    },
  ],
  moduleRecommendations: [
    {
      key: "caja",
      label: "Caja",
      items: [
        { id: "c1", title: "Reducí salidas no críticas en los próximos 7 días", detail: "Impacto: +$ 980.000" },
        { id: "c2", title: "Consolidá saldos entre cuentas para evitar sobregiros", detail: "Impacto: menor costo financiero" },
      ],
    },
    {
      key: "cobros",
      label: "Cobros",
      items: [
        { id: "r1", title: "Enviar recordatorios a 5 clientes con deuda alta", detail: "Impacto: +$ 1.760.000" },
        { id: "r2", title: "Crear links de pago para 3 facturas vencidas", detail: "Reduce fricción de cobro" },
      ],
    },
    {
      key: "pagos",
      label: "Pagos",
      items: [
        { id: "p1", title: "Aprovechá pronto pago con 2 proveedores", detail: "Ahorro estimado: $ 320.000" },
        { id: "p2", title: "Reprogramá 1 pago no crítico para liberar liquidez", detail: "Impacto: +$ 540.000" },
      ],
    },
    {
      key: "rentabilidad",
      label: "Rentabilidad",
      items: [
        { id: "g1", title: "Mejorar margen en línea de Productos A", detail: "Impacto estimado: +$ 1.320.000" },
        { id: "g2", title: "Renegociar condiciones con 2 proveedores", detail: "Impacto estimado: +$ 1.130.000" },
      ],
    },
  ],
  opportunities: [
    { id: "o1", title: "Mejorar márgenes en Productos A", impact: "Impacto estimado: +$ 1.320.000" },
    { id: "o2", title: "Renegociar condiciones con 2 proveedores", impact: "Impacto estimado: +$ 1.130.000" },
    { id: "o3", title: "Optimizar gastos operativos no críticos", impact: "Impacto estimado: +$ 980.000" },
    { id: "o4", title: "Diversificar cartera de clientes", impact: "Reduce concentración de riesgo" },
  ],
};

const northwind: CopilotMockData = {
  currency: "USD",
  kpis: [
    { key: "ahorrosDetectados", label: "Savings detected", format: "money", value: 12400, deltaPct: 7.2, hint: "vs last month" },
    { key: "riesgosDetectados", label: "Risks detected", format: "count", value: 2, deltaPct: 0, hint: "stable" },
    { key: "proyeccionSugerida30d", label: "Suggested 30d projection", format: "money", value: 96500, deltaPct: 3.4, hint: "vs baseline" },
    { key: "oportunidadesPriorizadas", label: "Prioritized opportunities", format: "count", value: 4, hint: "this week" },
  ],
  chat: {
    messages: [
      { id: "nm1", role: "assistant", text: "Hi. This is a mock Copilot experience. What would you like to analyze first?", timestamp: "09:30" },
      { id: "nm2", role: "user", text: "How is my cash health?", timestamp: "09:31" },
      { id: "nm3", role: "assistant", text: "Healthy overall. Key risk: 1 vendor payment overdue and concentration in one bank. I can suggest 3 quick actions.", timestamp: "09:31" },
    ],
  },
  healthSummary: [
    { key: "ingresos", label: "Ingresos", format: "money", value: 96500, deltaPct: 5.3 },
    { key: "egresos", label: "Egresos", format: "money", value: 74200, deltaPct: -1.8 },
    { key: "resultadoOperativo", label: "Resultado operativo", format: "money", value: 22300, deltaPct: 7.4 },
    { key: "flujoCajaNeto", label: "Flujo de caja neto", format: "money", value: 12400, deltaPct: 3.1 },
    { key: "liquidezCorriente", label: "Liquidez corriente", format: "number", value: 1.54, deltaPct: 2.0 },
  ],
  recommendedQuestions: [
    { id: "nq1", text: "What are my top risks in the next 30 days?" },
    { id: "nq2", text: "Where can I cut costs without impacting ops?" },
    { id: "nq3", text: "Which customers are at higher delay risk?" },
  ],
  smartAlerts: [
    { id: "na1", title: "Upcoming maturities", description: "2 vendor payments due in 7 days.", severity: "medium" },
    { id: "na2", title: "Collections target risk", description: "Projected collections -4% vs target.", severity: "low" },
  ],
  suggestedActions: [
    { id: "ns1", title: "Review cash forecast", description: "Shift non-critical spend to smooth liquidity.", ctaLabel: "Act" },
    { id: "ns2", title: "Prioritize overdue payables", description: "Avoid penalties and reduce vendor risk.", ctaLabel: "Act" },
  ],
  moduleRecommendations: [
    { key: "caja", label: "Cash", items: [{ id: "nc1", title: "Reduce discretionary spend for 7 days" }] },
    { key: "cobros", label: "Collections", items: [{ id: "nc2", title: "Send reminders to top 3 overdue accounts" }] },
    { key: "pagos", label: "Payments", items: [{ id: "nc3", title: "Pay early where discounts apply" }] },
    { key: "rentabilidad", label: "Profitability", items: [{ id: "nc4", title: "Review low-margin SKUs" }] },
  ],
  opportunities: [
    { id: "no1", title: "Renegotiate 1 vendor contract", impact: "Estimated impact: +$ 1,200" },
    { id: "no2", title: "Optimize SaaS costs", impact: "Estimated impact: +$ 980" },
  ],
};

export const mockCopilotByCompanyId: Record<string, CopilotMockData> = {
  "acme-ar": acme,
  "north-us": northwind,
};

