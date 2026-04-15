import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { resolveProjectRow } from '@/lib/resolve-project';
import { isUuidLike } from '@/lib/is-uuid';

function safeRows<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) {
    console.warn('[daily-report]', res.error.message);
    return [] as T;
  }
  return (res.data ?? []) as T;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function utcDayBounds(dateParam: string): { start: string; end: string } {
  return {
    start: `${dateParam}T00:00:00.000Z`,
    end: `${dateParam}T23:59:59.999Z`,
  };
}

/** Monday 00:00 UTC of the week containing dateParam through end of selected day */
function utcWeekStartIso(dateParam: string): string {
  const [y, m, d] = dateParam.split('-').map(Number);
  const noon = Date.UTC(y, m - 1, d, 12, 0, 0);
  const dow = new Date(noon).getUTCDay();
  const mondayOffset = (dow + 6) % 7;
  const monMs = noon - mondayOffset * 86400000;
  const mon = new Date(monMs);
  return `${mon.getUTCFullYear()}-${String(mon.getUTCMonth() + 1).padStart(2, '0')}-${String(mon.getUTCDate()).padStart(2, '0')}T00:00:00.000Z`;
}

type MetricRow = {
  acres_completed?: number | null;
  green_space_completed?: number | null;
  water_usage?: number | null;
  number_of_operators?: number | null;
  notes?: string | null;
  logged_at?: string | null;
  signature_url?: string | null;
};

function aggregateMetrics(rows: MetricRow[]) {
  let acres = 0;
  let greenSpace = 0;
  let water = 0;
  let maxOps = 0;
  for (const r of rows) {
    acres += Number(r.acres_completed) || 0;
    greenSpace += Number(r.green_space_completed) || 0;
    water += Number(r.water_usage) || 0;
    const op = Number(r.number_of_operators);
    if (!Number.isNaN(op)) maxOps = Math.max(maxOps, op);
  }
  return { acres, greenSpace, water, operators: maxOps };
}

function fmtNum(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

type ChemLine = { name: string; quantity: number; unit: string };

function flattenChemicals(
  logs: { chemicals?: { name: string; quantity: number; unit: string }[] }[]
): ChemLine[] {
  const out: ChemLine[] = [];
  for (const log of logs) {
    const items = Array.isArray(log.chemicals) ? log.chemicals : [];
    for (const c of items) {
      if (!c?.name) continue;
      out.push({
        name: c.name,
        quantity: Number(c.quantity) || 0,
        unit: c.unit || '',
      });
    }
  }
  return out;
}

function aggregateChems(lines: ChemLine[]): Map<string, { quantity: number; unit: string }> {
  const map = new Map<string, { quantity: number; unit: string }>();
  for (const line of lines) {
    const key = `${line.name}||${line.unit}`;
    const prev = map.get(key);
    if (prev) prev.quantity += line.quantity;
    else map.set(key, { quantity: line.quantity, unit: line.unit });
  }
  return map;
}

function priClass(p: string | null | undefined): string {
  const x = (p || '').toLowerCase();
  if (x.includes('critical')) return 'pri-critical';
  if (x.includes('high')) return 'pri-high';
  if (x.includes('medium')) return 'pri-medium';
  return 'pri-low';
}

/** Narrative lines for metrics + chemical logs (material usage) with optional per-entry signatures */
function buildMaterialLogHtml(metricsDay: MetricRow[], chemDayLogs: unknown[]): string {
  if (metricsDay.length === 0 && chemDayLogs.length === 0) return '';

  const items: string[] = [];

  const sortedM = [...metricsDay].sort(
    (a, b) =>
      new Date(a.logged_at || 0).getTime() - new Date(b.logged_at || 0).getTime()
  );
  for (const row of sortedM) {
    const when = row.logged_at ? new Date(row.logged_at) : new Date();
    const parts: string[] = [];
    if (row.acres_completed != null && !Number.isNaN(Number(row.acres_completed))) {
      parts.push(`Acres ${fmtNum(Number(row.acres_completed))} ac`);
    }
    if (row.green_space_completed != null && !Number.isNaN(Number(row.green_space_completed))) {
      parts.push(`Green space ${fmtNum(Number(row.green_space_completed))} sq ft`);
    }
    if (row.water_usage != null && !Number.isNaN(Number(row.water_usage))) {
      parts.push(`Water ${fmtNum(Number(row.water_usage), 0)} gal`);
    }
    if (row.number_of_operators != null && String(row.number_of_operators).trim() !== '') {
      parts.push(`Operators ${row.number_of_operators}`);
    }
    const summary = parts.length ? parts.join(' · ') : 'Metrics log';
    const noteExtra =
      row.notes && String(row.notes).trim()
        ? ` — ${escapeHtml(String(row.notes).slice(0, 220))}${String(row.notes).length > 220 ? '…' : ''}`
        : '';
    const sig = row.signature_url
      ? `<div class="sig-inline"><img class="sig-img" src="${escapeHtml(row.signature_url)}" alt="Signature" /></div>`
      : '';
    items.push(`<div class="material-item">
      <div class="val"><strong>Metrics</strong> — ${escapeHtml(summary)}${noteExtra}</div>
      <div class="meta">${escapeHtml(when.toLocaleString('en-US'))}</div>
      ${sig}
    </div>`);
  }

  const sortedC = [...chemDayLogs].sort(
    (a, b) =>
      new Date((a as { logged_at?: string }).logged_at || 0).getTime() -
      new Date((b as { logged_at?: string }).logged_at || 0).getTime()
  );
  for (const log of sortedC) {
    const row = log as {
      logged_at?: string;
      application_type?: string;
      notes?: string | null;
      chemicals?: ChemLine[];
      signature_url?: string | null;
    };
    const when = row.logged_at ? new Date(row.logged_at) : new Date();
    const chems = Array.isArray(row.chemicals) ? row.chemicals : [];
    const chemStr =
      chems.length > 0
        ? chems
            .map((c) => `${escapeHtml(c.name)} ${fmtNum(Number(c.quantity), 2)} ${escapeHtml(c.unit || '')}`.trim())
            .join('; ')
        : '—';
    const noteExtra =
      row.notes && String(row.notes).trim()
        ? ` — ${escapeHtml(String(row.notes).slice(0, 160))}${String(row.notes).length > 160 ? '…' : ''}`
        : '';
    const sig = row.signature_url
      ? `<div class="sig-inline"><img class="sig-img" src="${escapeHtml(row.signature_url)}" alt="Signature" /></div>`
      : '';
    items.push(`<div class="material-item">
      <div class="val"><strong>Chemicals</strong> — ${escapeHtml(row.application_type || 'Application')} — ${chemStr}${noteExtra}</div>
      <div class="meta">${escapeHtml(when.toLocaleString('en-US'))}</div>
      ${sig}
    </div>`);
  }

  return `<div class="section-wrap">
    <div class="section-header">Material log</div>
    <div class="material-list">${items.join('')}</div>
  </div>`;
}

function collectDaySignatureRefs(
  metricsDay: MetricRow[],
  chemDayLogs: unknown[],
  checklists: unknown[]
): { url: string; label: string }[] {
  const out: { url: string; label: string }[] = [];
  for (const m of metricsDay) {
    const u = m.signature_url;
    if (typeof u === 'string' && u.length > 0) {
      const t = m.logged_at ? new Date(m.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      out.push({ url: u, label: t ? `Metrics · ${t}` : 'Metrics' });
    }
  }
  for (const log of chemDayLogs) {
    const row = log as { signature_url?: string | null; logged_at?: string };
    const u = row.signature_url;
    if (typeof u === 'string' && u.length > 0) {
      const t = row.logged_at ? new Date(row.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      out.push({ url: u, label: t ? `Chemicals · ${t}` : 'Chemicals' });
    }
  }
  for (const chk of checklists) {
    const c = chk as { signature_url?: string | null; logged_at?: string };
    const u = c.signature_url;
    if (typeof u === 'string' && u.length > 0) {
      const t = c.logged_at ? new Date(c.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      out.push({ url: u, label: t ? `Equipment · ${t}` : 'Equipment checklist' });
    }
  }
  return out;
}

const REPORT_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #555; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report-sheet { width: 100%; max-width: 850px; margin: 40px auto 60px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.35); position: relative; padding-bottom: 56px; }
  .section-header { background: #FF6633; color: #fff; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 16px; }
  .section-wrap { padding: 0 28px; margin-top: 20px; }
  .top-bar { background: #000; color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 10px 28px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; flex-wrap: wrap; gap: 8px; }
  .report-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px; border-bottom: 1px solid #e0e0e0; }
  .report-header h1 { font-size: 22px; font-weight: 700; color: #222; margin-bottom: 4px; }
  .report-header p { font-size: 13px; color: #666; }
  .logo-circle { width: 40px; height: 40px; border-radius: 50%; background: #FF6633; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 14px; letter-spacing: -1px; flex-shrink: 0; }
  .weather-grid { display: flex; border: 1px solid #ddd; }
  .weather-cell { flex: 1; text-align: center; padding: 16px 8px; border-right: 1px solid #ddd; }
  .weather-cell:last-child { border-right: none; }
  .weather-cell .time { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
  .weather-cell .temp { font-size: 28px; font-weight: 700; color: #222; margin: 8px 0; }
  .weather-cell .cond { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
  .weather-cell .info { font-size: 10px; color: #666; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 10px 12px; }
  thead tr { background: #f5f5f5; }
  th { text-align: center; color: #444; font-weight: 700; border-bottom: 1px solid #ddd; }
  th:first-child { text-align: left; }
  td { border-bottom: 1px solid #eee; }
  td:first-child { font-weight: 500; color: #444; }
  .td-num { text-align: center; }
  .td-num .val { font-weight: 700; font-size: 14px; color: #222; }
  .td-num .unit { font-size: 10px; color: #888; margin-top: 2px; }
  .td-to-date { background: #fafafa; }
  .th-to-date { background: #f0f0f0 !important; }
  .table-wrap { border: 1px solid #ddd; border-top: none; }
  .notes-body { padding: 16px 28px; }
  .note-item { margin-bottom: 10px; font-size: 13px; color: #222; line-height: 1.6; }
  .note-meta { font-size: 11px; color: #888; font-weight: 600; margin-top: 6px; }
  .thumb-row { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0; }
  .thumb-row img { width: 64px; height: 64px; object-fit: cover; border: 1px solid #ddd; }
  .card-body { border: 1px solid #ddd; border-top: none; padding: 16px; }
  .card-item + .card-item { border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px; }
  .card-title { font-size: 13px; font-weight: 700; color: #222; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; padding: 2px 6px; border-radius: 3px; margin-left: 6px; }
  .badge-open { background: #FFF3E0; color: #E65100; }
  .badge-closed { background: #E8F5E9; color: #2E7D32; }
  .badge-rec { background: #FFEBEE; color: #C62828; }
  .badge-neg { background: #F44336; color: #fff; }
  .badge-pos { background: #4CAF50; color: #fff; }
  .badge-orange { background: #FF6633; color: #fff; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 12px; margin-top: 8px; }
  .span-2 { grid-column: 1 / -1; }
  .detail { font-size: 12px; margin-top: 6px; }
  .pri-low { color: #4CAF50; font-weight: 700; }
  .pri-medium { color: #FF9800; font-weight: 700; }
  .pri-high { color: #FF6633; font-weight: 700; }
  .pri-critical { color: #F44336; font-weight: 700; }
  .checklist-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f9f9f9; border: 1px solid #eee; border-radius: 4px; padding: 10px; font-size: 13px; }
  .sig-img { max-width: 200px; height: 40px; object-fit: contain; border-bottom: 2px solid #000; margin-top: 8px; }
  .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .photo-thumb { position: relative; aspect-ratio: 1; background: #eee; overflow: hidden; }
  .photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-ts { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.6)); padding: 16px 4px 4px; text-align: right; font-size: 10px; font-weight: 700; font-family: monospace; color: #fff; text-shadow: 1px 1px 1px rgba(0,0,0,0.8); }
  .survey-body { padding: 16px 28px; }
  .survey-table th { width: auto; }
  .survey-table th.col-chk { width: 40px; }
  .chkbox { display: inline-flex; width: 14px; height: 14px; border: 1px solid #999; background: #eee; align-items: center; justify-content: center; font-size: 11px; }
  .survey-table td { vertical-align: top; }
  .survey-table td.italic { color: #555; font-style: italic; }
  .app-type-row { padding: 8px 16px; border-bottom: 1px solid #eee; font-size: 11px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .app-type-label { font-weight: 700; text-transform: uppercase; color: #666; }
  .material-list { padding: 12px 16px; font-size: 13px; border: 1px solid #ddd; border-top: none; }
  .material-item { border-left: 3px solid #FF6633; padding: 6px 12px; margin-bottom: 10px; }
  .material-item .val { font-size: 13px; color: #222; line-height: 1.5; }
  .material-item .meta { font-size: 11px; color: #888; font-weight: 600; margin-top: 4px; }
  .material-item .sig-inline { margin-top: 8px; }
  .signature-gallery { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 16px; align-items: flex-end; }
  .signature-gallery .sig-unit { max-width: 220px; }
  .signature-gallery .sig-unit .sig-meta { font-size: 11px; color: #888; font-weight: 600; margin-top: 6px; }
  .signature-block { padding: 20px 28px; border-top: 1px solid #eee; margin-top: 20px; }
  .signature-block p { font-size: 13px; font-weight: 700; margin-bottom: 16px; }
  .signature-block img { max-width: 280px; height: 56px; object-fit: contain; border-bottom: 2px solid #000; }
  .signature-block .sig-meta { font-size: 11px; color: #888; font-weight: 600; margin-top: 8px; }
  .report-footer { text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding: 16px 28px 20px; margin-top: 40px; }
  .report-footer span { font-weight: 900; letter-spacing: 0.1em; color: #FF6633; }
  @media print { body { background: #fff; } .report-sheet { margin: 0; box-shadow: none; max-width: none; } }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  let projectParam = searchParams.get('project');
  let projectIdParam = searchParams.get('project_id');
  if (!projectIdParam && projectParam && isUuidLike(projectParam)) {
    projectIdParam = projectParam.trim();
    projectParam = null;
  }

  if (!dateParam || ((!projectParam || projectParam === 'All Projects') && !projectIdParam)) {
    return new NextResponse('Please select a specific project and date to generate a daily report.', { status: 400 });
  }

  const { row: projectRow, error: resolveErr } = await resolveProjectRow(supabaseServer, {
    projectId: projectIdParam,
    projectName: projectParam?.trim() || null,
  });

  if (resolveErr) {
    console.warn('[daily-report]', resolveErr);
  }

  if (!projectRow?.id) {
    const label = projectParam || projectIdParam || 'Unknown';
    return new NextResponse(
      `<div style="padding:40px;font-family:sans-serif"><h2>Project not found</h2><p>No project named <b>${escapeHtml(String(label))}</b>.</p></div>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const projectId = projectRow.id;
  const projectName = projectRow.name || projectParam || 'Project';
  const projectDisplayLocation = projectRow.location || 'Location not provided';
  const jobLabel = projectRow.job_number ? `Job # ${escapeHtml(String(projectRow.job_number))}` : 'Job # —';

  const { start: startDate, end: endDate } = utcDayBounds(dateParam);
  const weekStart = utcWeekStartIso(dateParam);

  const [
    notesRes,
    metricsDayRes,
    metricsWeekRes,
    metricsTotRes,
    chemDayRes,
    chemWeekRes,
    chemTotRes,
    incidentsRes,
    obsRes,
    surveysRes,
    checklistsRes,
    attachRes,
  ] = await Promise.all([
    supabaseServer.from('notes').select('*').eq('project_id', projectId).gte('logged_at', startDate).lte('logged_at', endDate),
    supabaseServer.from('metrics').select('*').eq('project_id', projectId).gte('logged_at', startDate).lte('logged_at', endDate),
    supabaseServer.from('metrics').select('*').eq('project_id', projectId).gte('logged_at', weekStart).lte('logged_at', endDate),
    supabaseServer.from('metrics').select('*').eq('project_id', projectId).lte('logged_at', endDate),
    supabaseServer
      .from('chemicals_logs')
      .select('*, chemicals:chemical_applications(name, quantity, unit)')
      .eq('project_id', projectId)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate),
    supabaseServer
      .from('chemicals_logs')
      .select('*, chemicals:chemical_applications(name, quantity, unit)')
      .eq('project_id', projectId)
      .gte('logged_at', weekStart)
      .lte('logged_at', endDate),
    supabaseServer
      .from('chemicals_logs')
      .select('*, chemicals:chemical_applications(name, quantity, unit)')
      .eq('project_id', projectId)
      .lte('logged_at', endDate),
    supabaseServer.from('incidents').select('*').eq('project_id', projectId).gte('logged_at', startDate).lte('logged_at', endDate),
    supabaseServer.from('observations').select('*, assignees:observation_assignees(name)').eq('project_id', projectId).gte('logged_at', startDate).lte('logged_at', endDate),
    supabaseServer
      .from('surveys')
      .select('*, questions:survey_questions(question, answer, description)')
      .eq('project_id', projectId)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate),
    supabaseServer.from('equipment_checklists').select('*').eq('project_id', projectId).gte('logged_at', startDate).lte('logged_at', endDate),
    supabaseServer.from('attachments').select('*').eq('project_id', projectId).gte('logged_at', startDate).lte('logged_at', endDate),
  ]);

  const notes = safeRows(notesRes);
  const metricsDay = safeRows(metricsDayRes) as MetricRow[];
  const metricsWeek = safeRows(metricsWeekRes) as MetricRow[];
  const metricsTot = safeRows(metricsTotRes) as MetricRow[];
  const chemDayLogs = safeRows(chemDayRes);
  const chemWeekLogs = safeRows(chemWeekRes);
  const chemTotLogs = safeRows(chemTotRes);
  const incidents = safeRows(incidentsRes);
  const observations = safeRows(obsRes);
  const surveys = safeRows(surveysRes);
  const checklists = safeRows(checklistsRes);
  const attachments = safeRows(attachRes);

  const dayAgg = aggregateMetrics(metricsDay);
  const weekAgg = aggregateMetrics(metricsWeek);
  const totAgg = aggregateMetrics(metricsTot);

  const chemDayMap = aggregateChems(flattenChemicals(chemDayLogs as { chemicals?: ChemLine[] }[]));
  const chemWeekMap = aggregateChems(flattenChemicals(chemWeekLogs as { chemicals?: ChemLine[] }[]));
  const chemTotMap = aggregateChems(flattenChemicals(chemTotLogs as { chemicals?: ChemLine[] }[]));

  const applicationTypes = (chemDayLogs as { application_type?: string }[])
    .map((l) => l.application_type)
    .filter(Boolean);
  const appTypeLabel = applicationTypes[0] || '—';

  const allPhotos: { url: string; ts: string }[] = [];

  const pushPhotos = (urls: unknown, tsIso: string) => {
    const arr = Array.isArray(urls) ? urls : [];
    const t = new Date(tsIso).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    for (const url of arr) {
      if (typeof url === 'string') allPhotos.push({ url, ts: t });
    }
  };

  for (const n of notes) {
    pushPhotos(n.photos, n.logged_at || n.created_at || endDate);
  }
  for (const o of observations) {
    pushPhotos(o.cloudinary_urls, o.logged_at || endDate);
    pushPhotos(o.resolution_photos, o.logged_at || endDate);
  }
  for (const i of incidents) {
    pushPhotos(i.photos, i.logged_at || endDate);
  }
  for (const m of metricsDay) {
    pushPhotos((m as { photos?: string[] }).photos, (m as { logged_at?: string }).logged_at || endDate);
  }
  for (const c of chemDayLogs) {
    pushPhotos((c as { photos?: string[] }).photos, (c as { logged_at?: string }).logged_at || endDate);
  }
  for (const a of attachments) {
    const urls = a.cloudinary_urls;
    let arr: string[] = [];
    if (Array.isArray(urls)) arr = urls as string[];
    else if (typeof urls === 'string') {
      try {
        arr = JSON.parse(urls || '[]');
      } catch {
        arr = [];
      }
    }
    const ts = a.logged_at || a.created_at || endDate;
    pushPhotos(arr, ts);
  }

  const hasData =
    notes.length +
      metricsDay.length +
      chemDayLogs.length +
      incidents.length +
      observations.length +
      surveys.length +
      checklists.length +
      attachments.length >
    0;

  if (!hasData) {
    return new NextResponse(
      `<div style="padding:40px;font-family:sans-serif;text-align:center">
       <h2>No activity logged</h2>
       <p>No field data was logged for <b>${escapeHtml(projectName)}</b> on <b>${escapeHtml(dateParam)}</b>.</p>
    </div>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const topDate = new Date(`${dateParam}T12:00:00.000Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const preparedBy =
    (notes[0] as { logged_by?: string })?.logged_by ||
    (observations[0] as { assignees?: { name: string }[] })?.assignees?.[0]?.name ||
    'Field team';

  const notesHtml = notes
    .map((n, i) => {
      const text = escapeHtml(String((n as { notes_text?: string }).notes_text || ''));
      const metaTs = new Date((n as { logged_at?: string }).logged_at || (n as { created_at?: string }).created_at || endDate);
      const thumbs = Array.isArray((n as { photos?: string[] }).photos) ? (n as { photos: string[] }).photos : [];
      const thumbsHtml =
        thumbs.length > 0
          ? `<div class="thumb-row">${thumbs
              .slice(0, 6)
              .map((u) => `<img src="${escapeHtml(u)}" alt="" />`)
              .join('')}</div>`
          : '';
      return `<div class="note-item"><strong>${i + 1}.</strong> ${text}</div>${thumbsHtml}<div class="note-meta">${escapeHtml(String((n as { category?: string }).category || 'Note'))} | ${metaTs.toLocaleDateString('en-US')} | ${metaTs.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>`;
    })
    .join('');

  const metricRowsHtml = `
    <tr>
      <td>Acres</td>
      <td class="td-num"><div class="val">${fmtNum(dayAgg.acres)}</div><div class="unit">Acres</div></td>
      <td class="td-num"><div class="val">${fmtNum(weekAgg.acres)}</div><div class="unit">Acres</div></td>
      <td class="td-num td-to-date"><div class="val">${fmtNum(totAgg.acres)}</div><div class="unit">Acres</div></td>
    </tr>
    <tr>
      <td>Green space</td>
      <td class="td-num"><div class="val">${fmtNum(dayAgg.greenSpace)}</div><div class="unit">sq ft</div></td>
      <td class="td-num"><div class="val">${fmtNum(weekAgg.greenSpace)}</div><div class="unit">sq ft</div></td>
      <td class="td-num td-to-date"><div class="val">${fmtNum(totAgg.greenSpace)}</div><div class="unit">sq ft</div></td>
    </tr>
    <tr>
      <td>Water usage</td>
      <td class="td-num"><div class="val">${fmtNum(dayAgg.water, 0)}</div><div class="unit">gal</div></td>
      <td class="td-num"><div class="val">${fmtNum(weekAgg.water, 0)}</div><div class="unit">gal</div></td>
      <td class="td-num td-to-date"><div class="val">${fmtNum(totAgg.water, 0)}</div><div class="unit">gal</div></td>
    </tr>
    <tr>
      <td>Operators</td>
      <td class="td-num"><div class="val">${dayAgg.operators || '—'}</div><div class="unit"></div></td>
      <td class="td-num"><div class="val">${weekAgg.operators || '—'}</div><div class="unit"></div></td>
      <td class="td-num td-to-date"><div class="val">${totAgg.operators || '—'}</div><div class="unit"></div></td>
    </tr>
  `;

  const chemKeys = new Set<string>([...chemDayMap.keys(), ...chemWeekMap.keys(), ...chemTotMap.keys()]);
  const chemRowsHtml = Array.from(chemKeys)
    .map((key) => {
      const name = key.split('||')[0];
      const unit = chemDayMap.get(key)?.unit || chemWeekMap.get(key)?.unit || chemTotMap.get(key)?.unit || '';
      const d = chemDayMap.get(key)?.quantity ?? 0;
      const w = chemWeekMap.get(key)?.quantity ?? 0;
      const t = chemTotMap.get(key)?.quantity ?? 0;
      return `<tr>
      <td>${escapeHtml(name)}</td>
      <td class="td-num"><div class="val">${fmtNum(d, 2)}</div><div class="unit">${escapeHtml(unit)}</div></td>
      <td class="td-num"><div class="val">${fmtNum(w, 2)}</div><div class="unit">${escapeHtml(unit)}</div></td>
      <td class="td-num td-to-date"><div class="val">${fmtNum(t, 2)}</div><div class="unit">${escapeHtml(unit)}</div></td>
    </tr>`;
    })
    .join('');

  const incidentsHtml = incidents
    .map((row) => {
      const i = row as {
        title?: string;
        logged_at?: string;
        recordable?: boolean;
        is_recordable?: boolean;
        status?: string;
        description?: string;
        location?: string;
        injury_illness_type?: string;
        injured_employee_info?: string[];
        investigation?: string;
        corrective_action?: string;
      };
      const recordable = i.recordable ?? i.is_recordable;
      const badge =
        i.status === 'Closed'
          ? `<span class="badge badge-closed">Closed</span>`
          : recordable
            ? `<span class="badge badge-rec">Recordable</span>`
            : `<span class="badge badge-open">Open</span>`;
      const when = i.logged_at ? new Date(i.logged_at) : new Date();
      const emp =
        Array.isArray(i.injured_employee_info) && i.injured_employee_info.length
          ? i.injured_employee_info.join(', ')
          : '—';
      return `<div class="card-item">
        <div>
          <span class="card-title">${escapeHtml(i.title || 'Incident')}</span>
          ${badge}
        </div>
        <div class="grid-2">
          <div><strong>Date:</strong> ${escapeHtml(when.toLocaleDateString())}</div>
          <div><strong>Time:</strong> ${escapeHtml(when.toLocaleTimeString())}</div>
          <div class="span-2"><strong>Location:</strong> ${escapeHtml(i.location || projectName)}</div>
          <div class="span-2"><strong>Injury type:</strong> ${escapeHtml(i.injury_illness_type || '—')}</div>
        </div>
        <div class="detail"><strong>Employee info:</strong> ${escapeHtml(emp)}</div>
        <div class="detail"><strong>Description:</strong> ${escapeHtml(i.description || '')}</div>
        <div class="detail"><strong>Investigation / outcome:</strong> ${escapeHtml([i.investigation, i.corrective_action].filter(Boolean).join(' '))}</div>
      </div>`;
    })
    .join('');

  const observationsHtml = observations
    .map((row) => {
      const o = row as {
        type?: string;
        category?: string;
        status?: string;
        priority?: string;
        description?: string;
        due_date?: string;
        resolution_notes?: string;
        assignees?: { name?: string }[];
        assigned_to?: string;
      };
      const title = o.type || 'Observation';
      const cat = (o.category || '').toLowerCase();
      const catBadge =
        cat === 'positive' || o.category === 'Positive'
          ? `<span class="badge badge-pos">Positive</span>`
          : cat === 'negative' || o.category === 'Negative'
            ? `<span class="badge badge-neg">Negative</span>`
            : '';
      const st = (o.status || '').toLowerCase();
      const stBadge =
        st === 'closed' || st === 'resolved'
          ? `<span class="badge badge-closed">Closed</span>`
          : `<span class="badge badge-open">Open</span>`;
      const assignee =
        o.assignees?.map((a) => a.name).filter(Boolean).join(', ') || o.assigned_to || '—';
      const due = o.due_date ? new Date(o.due_date).toLocaleDateString() : 'N/A';
      return `<div class="card-item">
        <div>
          <span class="card-title">${escapeHtml(title)}</span>
          ${catBadge}
          ${stBadge}
        </div>
        <div class="grid-2">
          <div><strong>Priority:</strong> <span class="${priClass(o.priority)}">${escapeHtml(o.priority || '—')}</span></div>
          <div><strong>Assignee:</strong> ${escapeHtml(assignee)}</div>
          <div><strong>Due:</strong> ${escapeHtml(due)}</div>
        </div>
        <div class="detail"><strong>Description:</strong> ${escapeHtml(o.description || '')}</div>
        ${o.resolution_notes ? `<div class="detail"><strong>Resolution:</strong> ${escapeHtml(o.resolution_notes)}</div>` : ''}
      </div>`;
    })
    .join('');

  const surveyHtml = surveys
    .map((s) => {
      const qs = (s as { questions?: { question?: string; answer?: string; description?: string }[] }).questions || [];
      const qHtml = qs
        .map(
          (q) => `<tr>
            <td>${escapeHtml(q.question || '')}</td>
            <td style="text-align:center;"><span class="chkbox">${q.answer === 'N/A' ? '✓' : ''}</span></td>
            <td style="text-align:center;"><span class="chkbox">${q.answer === 'No' ? '✓' : ''}</span></td>
            <td style="text-align:center;"><span class="chkbox">${q.answer === 'Yes' ? '✓' : ''}</span></td>
            <td class="italic">${escapeHtml(q.description || '')}</td>
          </tr>`
        )
        .join('');
      const logged = (s as { logged_at?: string }).logged_at;
      return `<table class="survey-table">
        <thead>
          <tr>
            <th style="text-align:left;">Questions</th>
            <th class="col-chk">N/A</th>
            <th class="col-chk">No</th>
            <th class="col-chk">Yes</th>
            <th style="text-align:left;">Description</th>
          </tr>
        </thead>
        <tbody>${qHtml}</tbody>
      </table>
      <div class="note-meta" style="margin-top:10px;">${logged ? escapeHtml(new Date(logged).toLocaleString()) : ''}</div>
      <hr style="margin:20px 0;border:0;border-top:1px solid #eee;" />`;
    })
    .join('');

  const checkHtml = checklists
    .map((chk) => {
      const c = chk as {
        logged_at?: string;
        equipment_id?: string;
        hours?: number;
        fuel_level?: string;
        engine_oil?: string;
        tires?: string;
        safety_guards?: string;
        lights_signals?: string;
        fire_extinguisher?: string;
        status?: string;
        operator_name?: string;
        signature_url?: string;
      };
      const when = c.logged_at ? new Date(c.logged_at) : new Date();
      return `<div class="card-body" style="margin-bottom:12px;">
      <div class="checklist-grid">
        <div><strong>Site name:</strong> ${escapeHtml(projectName)}</div>
        <div><strong>Date:</strong> ${escapeHtml(when.toLocaleDateString())}</div>
        <div><strong>Operator:</strong> ${escapeHtml(c.operator_name || '—')}</div>
        <div><strong>Unit #:</strong> ${escapeHtml(c.equipment_id || 'N/A')}</div>
        <div><strong>Hours:</strong> ${escapeHtml(String(c.hours ?? 0))} hrs</div>
        <div><strong>Fuel level:</strong> ${escapeHtml(c.fuel_level || 'N/A')}</div>
        <div><strong>Engine oil:</strong> ${escapeHtml(c.engine_oil || 'N/A')}</div>
        <div><strong>Tires:</strong> ${escapeHtml(c.tires || 'N/A')}</div>
        <div><strong>Safety guards:</strong> ${escapeHtml(c.safety_guards || 'N/A')}</div>
        <div><strong>Lights / signals:</strong> ${escapeHtml(c.lights_signals || 'N/A')}</div>
        <div><strong>Fire extinguisher:</strong> ${escapeHtml(c.fire_extinguisher || 'N/A')}</div>
        <div><strong>Overall condition:</strong> ${escapeHtml(c.status || 'N/A')}</div>
      </div>
      ${c.signature_url ? `<img class="sig-img" src="${escapeHtml(c.signature_url)}" alt="Operator signature" />` : ''}
      <div class="note-meta" style="margin-top:6px;">${escapeHtml(when.toLocaleString())}</div>
    </div>`;
    })
    .join('');

  const photosHtml = allPhotos
    .slice(0, 16)
    .map(
      (p) => `<div class="photo-thumb">
          <img src="${escapeHtml(p.url)}" alt="" />
          <div class="photo-ts">${escapeHtml(p.ts)}</div>
        </div>`
    )
    .join('');

  const weatherSection = ''; // Weather is not stored in DB yet; omit section to avoid misleading data.

  const metricsSection =
    metricsDay.length > 0
      ? `<div class="section-wrap">
    <div class="section-header">Metrics</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Day total</th>
            <th>Week total</th>
            <th class="th-to-date">Quantities to date</th>
          </tr>
        </thead>
        <tbody>${metricRowsHtml}</tbody>
      </table>
    </div>
  </div>`
      : '';

  const chemicalsSection =
    chemRowsHtml.length > 0
      ? `<div class="section-wrap">
    <div class="section-header">Chemicals</div>
    <div class="table-wrap">
      <div class="app-type-row">
        <span class="app-type-label">Application type:</span>
        <span class="badge badge-orange">${escapeHtml(appTypeLabel)}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Day total</th>
            <th>Week total</th>
            <th class="th-to-date">Quantities to date</th>
          </tr>
        </thead>
        <tbody>${chemRowsHtml}</tbody>
      </table>
    </div>
  </div>`
      : '';

  const materialLogSection = buildMaterialLogHtml(metricsDay, chemDayLogs);

  const signatureRefs = collectDaySignatureRefs(metricsDay, chemDayLogs, checklists);
  const signatureGalleryHtml =
    signatureRefs.length > 0
      ? `<div class="signature-gallery">${signatureRefs
          .map(
            (s) => `<div class="sig-unit">
            <img src="${escapeHtml(s.url)}" alt="" style="max-width:220px;height:56px;object-fit:contain;border-bottom:2px solid #000;" />
            <div class="sig-meta">${escapeHtml(s.label)}</div>
          </div>`
          )
          .join('')}</div>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daily Field Report – ${escapeHtml(projectName)}</title>
  <style>${REPORT_CSS}</style>
</head>
<body>
<div class="report-sheet">
  <div class="top-bar">
    <span>Date ${escapeHtml(topDate)}</span>
    <span>${jobLabel}</span>
    <span>Prepared by ${escapeHtml(preparedBy)}</span>
  </div>

  <div class="report-header">
    <div>
      <h1>${escapeHtml(projectName)}</h1>
      <p>${escapeHtml(projectDisplayLocation)}</p>
    </div>
    <div class="logo-circle">UV</div>
  </div>

  ${weatherSection}

  ${
    notesHtml
      ? `<div class="section-wrap">
    <div class="section-header">General notes</div>
    <div class="notes-body">${notesHtml}</div>
  </div>`
      : ''
  }

  ${metricsSection}

  ${chemicalsSection}

  ${materialLogSection}

  ${
    incidentsHtml
      ? `<div class="section-wrap">
    <div class="section-header">Incidents</div>
    <div class="card-body">${incidentsHtml}</div>
  </div>`
      : ''
  }

  ${
    observationsHtml
      ? `<div class="section-wrap">
    <div class="section-header">Observations</div>
    <div class="card-body">${observationsHtml}</div>
  </div>`
      : ''
  }

  ${
    checkHtml
      ? `<div class="section-wrap" style="margin-top:32px;">
    <div class="section-header">Equipment checklist</div>
    ${checkHtml}
  </div>`
      : ''
  }

  ${
    photosHtml
      ? `<div class="section-wrap">
    <div class="section-header">Site photos</div>
    <div style="padding:16px 0;">
      <div class="photo-grid">${photosHtml}</div>
    </div>
  </div>`
      : ''
  }

  ${
    surveyHtml
      ? `<div class="section-wrap">
    <div class="section-header">Survey</div>
    <div class="survey-body">${surveyHtml}</div>
  </div>`
      : ''
  }

  <div class="signature-block">
    <p>I, ${escapeHtml(preparedBy)}, have reviewed the field data recorded for this day.</p>
    ${signatureGalleryHtml}
  </div>

  <div class="report-footer">
    Powered by <span>UTILITY VISION</span><br />
    ${escapeHtml(projectName)}
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
