-- Binary PDF body on report_artifacts (nullable). Idempotent.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'report_artifacts'
  ) THEN
    ALTER TABLE public.report_artifacts
      ADD COLUMN IF NOT EXISTS pdf_content BYTEA NULL;
  END IF;
END
$$;
