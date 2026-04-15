-- Store HTTPS URLs to signature images (e.g. Cloudinary) on field logs used for daily reports.

ALTER TABLE public.metrics
  ADD COLUMN IF NOT EXISTS signature_url TEXT;

ALTER TABLE public.chemicals_logs
  ADD COLUMN IF NOT EXISTS signature_url TEXT;

COMMENT ON COLUMN public.metrics.signature_url IS 'URL to operator/supervisor signature image for this metrics entry.';
COMMENT ON COLUMN public.chemicals_logs.signature_url IS 'URL to operator/supervisor signature image for this chemical log entry.';
