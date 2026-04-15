import { supabaseServer } from '@/lib/supabase-server';
import { getDailyReportListItems } from '@/lib/daily-report-index';
import { resolveProjectRow } from '@/lib/resolve-project';

function norm(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

export type CalendarReportStatus = {
  /** Dates (YYYY-MM-DD) with any field data that feeds daily reports */
  loggedDates: string[];
  /** Dates (YYYY-MM-DD) with a signed daily report row */
  signedDates: string[];
};

/**
 * Logged dates come from the same aggregation as /api/reports.
 * Signed dates come from `daily_signed_reports` when present.
 */
export async function getCalendarReportStatus(projectName: string): Promise<CalendarReportStatus> {
  if (!projectName || projectName === 'All Projects') {
    return { loggedDates: [], signedDates: [] };
  }

  const { row: project } = await resolveProjectRow(supabaseServer, { projectName });
  if (!project?.id) {
    return { loggedDates: [], signedDates: [] };
  }

  const all = await getDailyReportListItems();
  const loggedDates = [
    ...new Set(
      all
        .filter((r) => r.projectId === project.id || norm(r.projectName) === norm(project.name))
        .map((r) => r.date.slice(0, 10))
    ),
  ].sort();

  const signedDates: string[] = [];
  const signedRes = await supabaseServer
    .from('daily_signed_reports')
    .select('signed_at, created_at')
    .eq('project_id', project.id);

  if (!signedRes.error && signedRes.data) {
    for (const r of signedRes.data as { signed_at?: string | null; created_at?: string | null }[]) {
      const ts = r.signed_at || r.created_at;
      if (!ts) continue;
      signedDates.push(new Date(ts).toISOString().split('T')[0]);
    }
  } else if (signedRes.error) {
    console.warn('[calendar-report-status] daily_signed_reports:', signedRes.error.message);
  }

  return {
    loggedDates,
    signedDates: [...new Set(signedDates)].sort(),
  };
}
