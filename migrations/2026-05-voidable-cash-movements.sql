-- Void / reversal infrastructure for public.cash_movements.
-- Idempotent: safe to re-run. Copy-paste into Neon SQL Editor.

ALTER TABLE public.cash_movements
  ADD COLUMN IF NOT EXISTS reverses_movement_id uuid NULL;

ALTER TABLE public.cash_movements
  ADD COLUMN IF NOT EXISTS voided_at timestamptz NULL;

ALTER TABLE public.cash_movements
  ADD COLUMN IF NOT EXISTS void_reason text NULL;

-- invoice_id only when public.invoices exists (avoids broken migrations)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'invoices'
  ) THEN
    ALTER TABLE public.cash_movements
      ADD COLUMN IF NOT EXISTS invoice_id uuid NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_cash_movements_reverses_movement_id
  ON public.cash_movements (reverses_movement_id)
  WHERE reverses_movement_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cash_movements_one_reversal_per_original
  ON public.cash_movements (reverses_movement_id)
  WHERE reverses_movement_id IS NOT NULL;

-- Self-FK: reversal row points to original movement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cash_movements_reverses_movement_id_fkey'
      AND conrelid = 'public.cash_movements'::regclass
  ) THEN
    ALTER TABLE public.cash_movements
      ADD CONSTRAINT cash_movements_reverses_movement_id_fkey
      FOREIGN KEY (reverses_movement_id)
      REFERENCES public.cash_movements (id)
      ON DELETE RESTRICT;
  END IF;
END
$$;

-- FK to invoices only when table (and column) exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'invoices'
  )
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cash_movements'
      AND column_name = 'invoice_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cash_movements_invoice_id_fkey'
      AND conrelid = 'public.cash_movements'::regclass
  ) THEN
    ALTER TABLE public.cash_movements
      ADD CONSTRAINT cash_movements_invoice_id_fkey
      FOREIGN KEY (invoice_id)
      REFERENCES public.invoices (id)
      ON DELETE SET NULL;
  END IF;
END
$$;
