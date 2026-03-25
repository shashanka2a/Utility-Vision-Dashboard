import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// PUT /api/projects/[id]
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const {
    name, job_number,
    street_address, city, state, zip_code, country,
    start_date, end_date, project_template,
  } = body;

  const { data, error } = await supabaseServer
    .from('projects')
    .update({
      name, job_number,
      street_address, city, state, zip_code, country,
      start_date: start_date || null,
      end_date: end_date || null,
      project_template,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/projects/[id]
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { error } = await supabaseServer
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
