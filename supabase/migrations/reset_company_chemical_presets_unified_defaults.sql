-- One-time reset: replace presets with unified defaults (same 6 for spraying + wicking).
-- Run manually if you already seeded older lists and want this set without truncate elsewhere.

TRUNCATE public.company_chemical_presets RESTART IDENTITY;

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
) AS t(application_type);
