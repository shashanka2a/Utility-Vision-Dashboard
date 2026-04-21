import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { deliverEmployeeLoginInvite } from '@/lib/employee-invite';
import { getPublicAppBaseUrl } from '@/lib/app-url';

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
    send_login_invite,
  } = body;

  const { data, error } = await supabaseServer
    .from('employees')
    .insert([{ name, role, status, assigned_projects, email, phone, employee_id, classification }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let invite:
    | { sent: true; flow: 'invite' | 'recovery' }
    | { sent: false; error: string }
    | undefined;

  if (send_login_invite === true) {
    const inviteResult = await deliverEmployeeLoginInvite(
      {
        name: data.name,
        email: data.email,
        role: data.role,
      },
      getPublicAppBaseUrl(request)
    );
    if (inviteResult.ok) {
      invite = { sent: true, flow: inviteResult.flow };
    } else {
      invite = { sent: false, error: inviteResult.error };
    }
  }

  return NextResponse.json(
    invite ? { ...data, invite } : data,
    { status: 201 }
  );
}
