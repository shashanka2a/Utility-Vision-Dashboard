import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/projects
export async function GET() {
  const { data, error } = await supabaseServer
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/projects
export async function POST(request: Request) {
  const body = await request.json();
  const {
    name, job_number, acres_completed, status,
    street_address, city, state, zip_code, country,
    start_date, end_date, project_groups, project_template,
  } = body;

  const { data, error } = await supabaseServer
    .from('projects')
    .insert([{
      name, job_number, acres_completed, status,
      street_address, city, state, zip_code, country,
      start_date, end_date, project_groups, project_template,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
