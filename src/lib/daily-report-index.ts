import { supabaseServer } from '@/lib/supabase-server';

export type DailyReportListItem = {
  id: string;
  projectName: string;
  date: string;
  timestamp: string;
  weather: { high: number; low: number; condition: 'sunny' | 'rainy' | 'cloudy' };
  photos: string[];
  delays: number;
};

function rowTimestamp(row: { logged_at?: string | null; created_at?: string | null }): string | null {
  return row.logged_at || row.created_at || null;
}

/**
 * One entry per (calendar day in UTC, project) where any field module logged data.
 * Used by the Reports screen and GET /api/reports.
 */
export async function getDailyReportListItems(): Promise<DailyReportListItem[]> {
  const { data: projects, error: projectsError } = await supabaseServer.from('projects').select('id, name');
  if (projectsError) {
    console.error('[daily-report-index] projects:', projectsError.message);
  }
  const idToName = Object.fromEntries((projects || []).map((p) => [p.id as string, p.name as string]));

  const keys = new Set<string>();

  const addFromRows = (rows: { logged_at?: string | null; created_at?: string | null; project_id?: string | null }[]) => {
    for (const row of rows) {
      const ts = rowTimestamp(row);
      if (!ts || !row.project_id) continue;
      const name = idToName[row.project_id];
      if (!name) continue;
      const dateStr = new Date(ts).toISOString().split('T')[0];
      keys.add(`${dateStr}|${name}`);
    }
  };

  const addFromActivities = (rows: { created_at?: string | null; project_name?: string | null }[]) => {
    for (const row of rows) {
      const ts = row.created_at;
      const name = row.project_name;
      if (!ts || !name || typeof name !== 'string') continue;
      const dateStr = new Date(ts).toISOString().split('T')[0];
      keys.add(`${dateStr}|${name}`);
    }
  };

  const queries = [
    supabaseServer.from('notes').select('logged_at, project_id'),
    supabaseServer.from('metrics').select('logged_at, project_id'),
    supabaseServer.from('chemicals_logs').select('logged_at, project_id'),
    supabaseServer.from('incidents').select('logged_at, project_id'),
    supabaseServer.from('observations').select('logged_at, project_id'),
    supabaseServer.from('surveys').select('logged_at, project_id'),
    supabaseServer.from('equipment_checklists').select('logged_at, project_id'),
    supabaseServer.from('attachments').select('logged_at, project_id'),
  ] as const;

  const settled = await Promise.all(queries);
  for (const res of settled) {
    if (res.error) {
      console.warn('[daily-report-index]', res.error.message);
      continue;
    }
    const rows = (res.data as { logged_at?: string; created_at?: string; project_id?: string }[]) || [];
    addFromRows(rows);
  }

  // Unified activity feed (table or view): has project_name + created_at even when per-module queries are empty/RLS-blocked.
  const actRes = await supabaseServer.from('activities').select('created_at, project_name');
  if (actRes.error) {
    console.warn('[daily-report-index] activities:', actRes.error.message);
  } else {
    addFromActivities((actRes.data as { created_at?: string; project_name?: string }[]) || []);
  }

  const items: DailyReportListItem[] = Array.from(keys).map((k) => {
    const pipe = k.indexOf('|');
    const date = k.slice(0, pipe);
    const projectName = k.slice(pipe + 1);
    const id = `${date}_${projectName.replace(/\s+/g, '_')}`;
    const timestamp = new Date(`${date}T12:00:00.000Z`).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      id,
      projectName,
      date,
      timestamp,
      weather: { high: 75, low: 60, condition: 'sunny' as const },
      photos: [],
      delays: 0,
    };
  });

  items.sort((a, b) => (a.date === b.date ? a.projectName.localeCompare(b.projectName) : b.date.localeCompare(a.date)));
  return items;
}
