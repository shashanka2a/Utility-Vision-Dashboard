import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/chemicals?project=<name>&date=<YYYY-MM-DD>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get('project');
  const date = searchParams.get('date');

  // Resolve project_id from name
  let projectId: string | null = null;
  if (projectName && projectName !== 'All Projects') {
    const { data: proj } = await supabaseServer
      .from('projects')
      .select('id')
      .eq('name', projectName)
      .single();
    projectId = proj?.id ?? null;
  }

  let query = supabaseServer
    .from('chemicals_logs')
    // Nest chemical_applications as 'chemicals' using the FK relationship
    .select('*, chemicals:chemical_applications(id, name, quantity, unit)')
    .order('logged_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);

  if (date) {
    query = query
      .gte('logged_at', `${date}T00:00:00.000Z`)
      .lte('logged_at', `${date}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

// POST /api/chemicals — called from mobile app when saving a chemical log
export async function POST(request: Request) {
  const body = await request.json();
  const { project_id, application_type, chemicals, notes, photos, signature_url } = body;

  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  // 1. Insert the log header
  const { data: log, error: logError } = await supabaseServer
    .from('chemicals_logs')
    .insert([{
      project_id,
      application_type: application_type || 'Spraying',
      notes: notes || null,
      photos: photos || [],
      signature_url: typeof signature_url === 'string' && signature_url.length > 0 ? signature_url : null,
      logged_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 });

  // 2. Insert the individual chemical applications
  if (Array.isArray(chemicals) && chemicals.length > 0) {
    const items = chemicals.map((c: { name: string; quantity: number; unit: string }) => ({
      chemical_log_id: log.id,
      name: c.name,
      quantity: c.quantity,
      unit: c.unit,
    }));
    const { error: itemsError } = await supabaseServer
      .from('chemical_applications')
      .insert(items);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json(log, { status: 201 });
}
