import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { deliverEmployeeLoginInvite } from '@/lib/employee-invite';

function appUrlFromRequest(request: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, '');
  return new URL(request.url).origin;
}

// POST /api/employees/[id]/invite — email login invite via Gmail SMTP + Supabase Auth link
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data: employee, error: empError } = await supabaseServer
    .from('employees')
    .select('id, name, email, role')
    .eq('id', id)
    .single();

  if (empError || !employee) {
    return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  }

  const result = await deliverEmployeeLoginInvite(employee, appUrlFromRequest(request));

  if (!result.ok) {
    const msg = result.error;
    const lower = msg.toLowerCase();
    const status =
      lower.includes('not configured') ||
      lower.includes('must point') ||
      lower.includes('required on the server')
        ? 503
        : lower.includes('email address') || lower.includes('worker role')
          ? 400
          : 500;
    return NextResponse.json({ error: msg }, { status });
  }

  return NextResponse.json({ ok: true, flow: result.flow });
}
