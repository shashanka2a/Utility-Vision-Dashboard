import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { resolveProjectRow } from '@/lib/resolve-project';
import { fetchDayWeatherForReport, wmoToCardCondition } from '@/lib/weather-report';
import { isUuidLike } from '@/lib/is-uuid';

/**
 * GET /api/weather/day?date=YYYY-MM-DD&project_id=uuid
 * GET /api/weather/day?date=YYYY-MM-DD&project=Project+Name
 * Returns Open-Meteo daily hi/lo for the project location (same source as daily report).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  let projectId = searchParams.get('project_id');
  const projectParam = searchParams.get('project');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date (YYYY-MM-DD) is required' }, { status: 400 });
  }

  if (!projectId && projectParam && isUuidLike(projectParam)) {
    projectId = projectParam.trim();
  }

  const { row: projectRow } = await resolveProjectRow(supabaseServer, {
    projectId: projectId || null,
    projectName: projectId ? null : projectParam?.trim() || null,
  });

  if (!projectRow?.id) {
    return NextResponse.json(
      { high: null, low: null, condition: 'cloudy' as const, label: null, error: 'project_not_found' },
      { status: 200 }
    );
  }

  const w = await fetchDayWeatherForReport(projectRow, date);
  if (!w) {
    return NextResponse.json({
      high: null,
      low: null,
      condition: 'cloudy' as const,
      label: null,
      error: 'weather_unavailable',
    });
  }

  return NextResponse.json({
    high: w.highF,
    low: w.lowF,
    condition: wmoToCardCondition(w.wmoCode),
    label: w.conditionLabel,
  });
}
