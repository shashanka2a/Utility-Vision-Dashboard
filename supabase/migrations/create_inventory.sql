-- Project-level inventory list (editable from dashboard, shown on daily reports)
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric(14, 4),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_project_id_idx ON public.inventory (project_id);
CREATE INDEX IF NOT EXISTS inventory_project_sort_idx ON public.inventory (project_id, sort_order, name);
