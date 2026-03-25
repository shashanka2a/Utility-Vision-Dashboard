import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/employees
export async function GET() {
  const { data, error } = await supabaseServer
    .from('employees')
    .select('*')
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/employees
export async function POST(request: Request) {
  const body = await request.json();
  const {
    name, role, status, assigned_projects,
    email, phone, employee_id, classification,
  } = body;

  const { data, error } = await supabaseServer
    .from('employees')
    .insert([{ name, role, status, assigned_projects, email, phone, employee_id, classification }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
