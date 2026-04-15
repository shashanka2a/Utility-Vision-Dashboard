import { supabaseServer } from '@/lib/supabase-server';
import { isUuidLike } from '@/lib/is-uuid';

export type DailyReportListItem = {
  id: string;
  /** Canonical name from `projects.name` when resolvable */
  projectName: string;
  /** Prefer passing this to `/api/reports/daily` — avoids name mismatches */
  projectId: string | null;
  date: string;
  timestamp: string;
  weather: { high: number; low: number; condition: 'sunny' | 'rainy' | 'cloudy' };
  photos: string[];
  delays: number;
};

function rowTimestamp(row: { logged_at?: string | null; created_at?: string | null }): string | null {
  return row.logged_at || row.created_at || null;
}

function normName(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

type EntryValue = { date: string; projectId: string | null; projectName: string };

/**
 * One entry per (calendar day in UTC, project) where any field module logged data.
 * Used by the Reports screen and GET /api/reports.
 */
export async function getDailyReportListItems(): Promise<DailyReportListItem[]> {
  const { data: projects, error: projectsError } = await supabaseServer.from('projects').select('id, name');
  if (projectsError) {
    console.error('[daily-report-index] projects:', projectsError.message);
  }
  const projectList = projects || [];
  const idToName = Object.fromEntries(projectList.map((p) => [p.id as string, p.name as string]));
  const nameToCanonical = new Map<string, { id: string; name: string }>();
  for (const p of projectList) {
    nameToCanonical.set(normName(p.name as string), { id: p.id as string, name: p.name as string });
  }

  /** Deduped entries: prefer key by project UUID when known */
  const entryMap = new Map<string, EntryValue>();

  function addEntry(dateStr: string, projectId: string | null, rawName?: string | null) {
    let pid = projectId;
    let display = (rawName || '').trim();

    // `activities.project_name` (or bad rows) sometimes stores a UUID instead of a human name
    if (!pid && display && isUuidLike(display)) {
      pid = display;
      display = '';
    }

    if (pid && idToName[pid]) {
      display = idToName[pid];
    } else if (!pid && display) {
      const hit = nameToCanonical.get(normName(display));
      if (hit) {
        pid = hit.id;
        display = hit.name;
      }
    } else if (pid && !display) {
      display = idToName[pid] || '';
    }

    // Prefer showing a short id label over leaking raw UUID as the card title
    if (pid && !display) {
      display = `Project ${pid.slice(0, 8)}…`;
    }

    if (!dateStr || !display) return;

    const key = pid ? `${dateStr}|id:${pid}` : `${dateStr}|n:${normName(display)}`;
    if (!entryMap.has(key)) {
      entryMap.set(key, { date: dateStr, projectId: pid, projectName: display });
    }
  }

  const addFromRows = (rows: { logged_at?: string | null; created_at?: string | null; project_id?: string | null }[]) => {
    for (const row of rows) {
      const ts = rowTimestamp(row);
      if (!ts || !row.project_id) continue;
      const name = idToName[row.project_id];
      if (!name) continue;
      const dateStr = new Date(ts).toISOString().split('T')[0];
      addEntry(dateStr, row.project_id, name);
    }
  };

  const addFromActivities = (rows: { created_at?: string | null; project_name?: string | null }[]) => {
    for (const row of rows) {
      const ts = row.created_at;
      const name = row.project_name;
      if (!ts || !name || typeof name !== 'string') continue;
      const dateStr = new Date(ts).toISOString().split('T')[0];
      addEntry(dateStr, null, name);
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

  const actRes = await supabaseServer.from('activities').select('created_at, project_name');
  if (actRes.error) {
    console.warn('[daily-report-index] activities:', actRes.error.message);
  } else {
    addFromActivities((actRes.data as { created_at?: string; project_name?: string }[]) || []);
  }

  const items: DailyReportListItem[] = Array.from(entryMap.values()).map((e) => {
    const slug = (e.projectId || e.projectName).toString().replace(/\s+/g, '_');
    const id = `${e.date}_${slug}`;
    const timestamp = new Date(`${e.date}T12:00:00.000Z`).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      id,
      projectName: e.projectName,
      projectId: e.projectId,
      date: e.date,
      timestamp,
      weather: { high: 75, low: 60, condition: 'sunny' as const },
      photos: [],
      delays: 0,
    };
  });

  items.sort((a, b) => (a.date === b.date ? a.projectName.localeCompare(b.projectName) : b.date.localeCompare(a.date)));
  return items;
}
