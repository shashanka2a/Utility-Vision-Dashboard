import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// PATCH /api/company/chemical-presets/[id]  body: { name?: string, unit?: string | null, sort_order?: number }
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body.name === 'string') {
      const n = body.name.trim();
      if (!n) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
      updates.name = n;
    }

    if ('unit' in body) {
      const u = body.unit;
      updates.unit = u === undefined || u === null || String(u).trim() === '' ? null : String(u).trim();
    }

    if (body.sort_order !== undefined) {
      const s = Number(body.sort_order);
      if (!Number.isFinite(s)) return NextResponse.json({ error: 'sort_order must be a number' }, { status: 400 });
      updates.sort_order = Math.round(s);
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseServer.from('company_chemical_presets').update(updates).eq('id', id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// DELETE /api/company/chemical-presets/[id]
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { error } = await supabaseServer.from('company_chemical_presets').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
