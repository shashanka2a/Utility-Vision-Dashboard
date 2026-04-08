import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/metrics?project=<name>&date=<YYYY-MM-DD>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get('project');
  const date = searchParams.get('date'); // YYYY-MM-DD

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
    .from('metrics')
    .select('*')
    .order('logged_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  // Filter by date if provided
  if (date) {
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;
    query = query.gte('logged_at', dayStart).lte('logged_at', dayEnd);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
