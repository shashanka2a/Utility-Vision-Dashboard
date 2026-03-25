import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// PUT /api/employees/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const {
    name, role, status, assigned_projects,
    email, phone, employee_id, classification,
  } = body;

  const { data, error } = await supabaseServer
    .from('employees')
    .update({ name, role, status, assigned_projects, email, phone, employee_id, classification })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/employees/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseServer
    .from('employees')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
