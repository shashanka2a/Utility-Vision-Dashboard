-- Company-wide default chemical line items for Spraying vs Wicking (field app + reports).
-- Mobile app can load these via GET /api/company/chemical-presets instead of hardcoding.

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

-- Seed defaults once (empty table only)
INSERT INTO public.company_chemical_presets (application_type, name, unit, sort_order)
SELECT v.application_type, v.name, v.unit, v.sort_order
FROM (
  VALUES
    ('spraying'::text, 'Ecomazapyr 2'::text, 'oz.'::text, 0),
    ('spraying', 'Glyphosate', 'GAL', 1),
    ('spraying', 'Imazapyr 4', 'oz.', 2),
    ('spraying', 'Milestone', 'oz.', 3),
    ('spraying', 'Polaris', 'oz.', 4),
    ('spraying', 'Regular Dye', 'oz.', 5),
    ('spraying', 'Super Dye', 'oz.', 6),
    ('spraying', 'Surfactant', 'oz.', 7),
    ('wicking', '2,4-D', 'GAL', 0),
    ('wicking', 'Glyphosate', 'GAL', 1),
    ('wicking', 'Milestone', 'oz.', 2),
    ('wicking', 'Regular Dye', 'oz.', 3),
    ('wicking', 'Super Dye', 'oz.', 4),
    ('wicking', 'Surfactant', 'oz.', 5)
) AS v(application_type, name, unit, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.company_chemical_presets LIMIT 1);
