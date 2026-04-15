import type { SupabaseClient } from '@supabase/supabase-js';
import { isUuidLike } from '@/lib/is-uuid';

/** Columns we read from `projects` — matches app usage (no legacy `location` column). */
export type ProjectRow = {
  id: string;
  name: string;
  job_number?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
};

/** Single-line address for reports (DB has address fields, not `location`). */
export function formatProjectAddress(row: ProjectRow): string {
  const parts: string[] = [];
  const s = row.street_address?.trim();
  if (s) parts.push(s);
  const cityState = [row.city?.trim(), row.state?.trim()].filter(Boolean).join(', ');
  if (cityState) parts.push(cityState);
  const z = row.zip_code?.trim();
  if (z) parts.push(z);
  if (parts.length) return parts.join(' · ');
  return 'Location not provided';
}

function norm(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

async function fetchProjectById(
  supabase: SupabaseClient,
  id: string
): Promise<{ row: ProjectRow | null; error: string | null }> {
  if (!isUuidLike(id)) return { row: null, error: null };
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, job_number, street_address, city, state, zip_code')
    .eq('id', id.trim())
    .maybeSingle();
  if (error) return { row: null, error: error.message };
  if (data?.id) return { row: data as ProjectRow, error: null };
  return { row: null, error: null };
}

/**
 * Resolve a project row by UUID, or by display name with tolerant matching
 * (normalization, substring, light token overlap). Uses one `projects` select.
 */
export async function resolveProjectRow(
  supabase: SupabaseClient,
  opts: { projectId?: string | null; projectName?: string | null }
): Promise<{ row: ProjectRow | null; error: string | null }> {
  let { projectId, projectName } = opts;

  // Some clients mistakenly send UUID in `project` instead of `project_id`
  const nameTrim = projectName?.trim();
  if (!projectId && nameTrim && isUuidLike(nameTrim)) {
    projectId = nameTrim;
    projectName = null;
  }

  if (projectId) {
    const byId = await fetchProjectById(supabase, projectId);
    if (byId.error) return { row: null, error: byId.error };
    if (byId.row) return { row: byId.row, error: null };
  }

  const q = projectName?.trim();
  if (!q) return { row: null, error: null };

  // `project` param is literally a UUID string → resolve by id (already tried) or fail
  if (isUuidLike(q)) {
    return fetchProjectById(supabase, q);
  }

  const { data: all, error } = await supabase
    .from('projects')
    .select('id, name, job_number, street_address, city, state, zip_code');
  if (error) return { row: null, error: error.message };
  if (!all?.length) {
    // This is almost always either (a) no projects exist, or (b) RLS blocked reads due to missing service role.
    const countRes = await supabase.from('projects').select('id', { count: 'exact', head: true });
    const c = typeof countRes.count === 'number' ? countRes.count : null;
    return {
      row: null,
      error:
        c === 0
          ? 'No readable rows in `projects`. If projects exist, set SUPABASE_SERVICE_ROLE_KEY on the server (anon key is subject to RLS).'
          : null,
    };
  }

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
