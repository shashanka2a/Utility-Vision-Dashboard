import type { SupabaseClient } from '@supabase/supabase-js';

export type ProjectRow = {
  id: string;
  name: string;
  location: string | null;
  job_number: string | null;
};

function norm(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Resolve a project row by UUID, or by display name with tolerant matching
 * (normalization, substring, light token overlap). Uses one `projects` select.
 */
export async function resolveProjectRow(
  supabase: SupabaseClient,
  opts: { projectId?: string | null; projectName?: string | null }
): Promise<{ row: ProjectRow | null; error: string | null }> {
  const { projectId, projectName } = opts;

  if (projectId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, location, job_number')
      .eq('id', projectId)
      .maybeSingle();
    if (error) return { row: null, error: error.message };
    if (data?.id) return { row: data as ProjectRow, error: null };
  }

  const q = projectName?.trim();
  if (!q) return { row: null, error: null };

  const { data: all, error } = await supabase.from('projects').select('id, name, location, job_number');
  if (error) return { row: null, error: error.message };
  if (!all?.length) return { row: null, error: null };

  const nq = norm(q);

  let hit = all.find((p) => norm(p.name) === nq);
  if (!hit) hit = all.find((p) => norm(p.name).includes(nq) || nq.includes(norm(p.name)));
  if (!hit) {
    const qt = q.split(/\s+/).filter(Boolean).map(norm);
    hit = all.find((p) => {
      const parts = norm(p.name).split(/\s+/).filter(Boolean);
      const overlap = qt.filter((t) => parts.some((part) => part.includes(t) || t.includes(part))).length;
      return overlap >= Math.min(2, Math.max(1, qt.length));
    });
  }

  return { row: (hit as ProjectRow) ?? null, error: null };
}
