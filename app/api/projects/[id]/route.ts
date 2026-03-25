import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// PUT /api/projects/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const {
    name, job_number, acres_completed, status,
    street_address, city, state, zip_code, country,
    start_date, end_date, project_groups, project_template,
  } = body;

  const { data, error } = await supabaseServer
    .from('projects')
    .update({
      name, job_number, acres_completed, status,
      street_address, city, state, zip_code, country,
      start_date, end_date, project_groups, project_template,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/projects/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseServer
    .from('projects')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
