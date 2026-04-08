import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/survey?project=<name>&date=<YYYY-MM-DD>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get('project');
  const date = searchParams.get('date');

  let projectId: string | null = null;
  if (projectName && projectName !== 'All Projects') {
    const { data: proj } = await supabaseServer.from('projects').select('id').eq('name', projectName).single();
    projectId = proj?.id ?? null;
  }

  let query = supabaseServer
    .from('surveys')
    .select('*, questions:survey_questions(id, question, answer, description)')
    .order('logged_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);
  if (date) query = query.gte('logged_at', `${date}T00:00:00.000Z`).lte('logged_at', `${date}T23:59:59.999Z`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
