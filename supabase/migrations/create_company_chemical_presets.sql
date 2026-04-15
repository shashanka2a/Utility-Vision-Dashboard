-- Company-wide default chemical line items for Spraying vs Wicking (field app + reports).
-- Mobile app: GET /api/company/chemical-presets
-- Same six defaults for both application types (matches field-app DEFAULT_CHEMICALS).

CREATE TABLE IF NOT EXISTS public.company_chemical_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type text NOT NULL CHECK (application_type IN ('spraying', 'wicking')),
  name text NOT NULL,
  unit text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS company_chemical_presets_type_sort_idx
  ON public.company_chemical_presets (application_type, sort_order, name);

-- Seed once when table is empty (same 6 lines for spraying + wicking)
INSERT INTO public.company_chemical_presets (application_type, name, unit, sort_order)
SELECT t.application_type, c.name, c.unit, c.sort_order
FROM (
  VALUES
    ('Glyphosate'::text, 'GAL'::text, 0),
    ('Surfactant', 'oz', 1),
    ('Super Dye', 'oz', 2),
    ('2,4-D', 'GAL', 3),
    ('Ecomazapyr 2SL', 'GAL', 4),
    ('Regular Dye', 'oz', 5)
) AS c(name, unit, sort_order)
CROSS JOIN (
  VALUES ('spraying'::text), ('wicking'::text)
) AS t(application_type)
WHERE NOT EXISTS (SELECT 1 FROM public.company_chemical_presets LIMIT 1);
