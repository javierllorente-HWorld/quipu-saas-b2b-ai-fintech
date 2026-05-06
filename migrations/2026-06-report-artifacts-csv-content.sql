-- Store generated CSV body on report_artifacts (nullable).
-- Idempotent: safe to re-run. Copy-paste into Neon SQL Editor if needed.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'report_artifacts'
  ) THEN
    ALTER TABLE public.report_artifacts
      ADD COLUMN IF NOT EXISTS csv_content TEXT NULL;
  END IF;
END
$$;
