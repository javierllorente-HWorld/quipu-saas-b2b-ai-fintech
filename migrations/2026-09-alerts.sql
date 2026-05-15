-- General alerts table (overdue invoices and future alert types).
-- Idempotent: safe to re-run. Copy-paste into Neon SQL Editor if needed.

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL
    REFERENCES public.organizations (id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL
    REFERENCES public.invoices (id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alerts_organization_invoice_type_key UNIQUE (organization_id, invoice_id, alert_type)
);

CREATE INDEX IF NOT EXISTS idx_alerts_organization_id
  ON public.alerts (organization_id);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at
  ON public.alerts (created_at DESC);
