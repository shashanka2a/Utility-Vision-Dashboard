import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// PATCH /api/inventory/[id]  body: { name?: string, quantity?: number | string | null }
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

    if ('quantity' in body) {
      const qtyRaw = body.quantity;
      if (qtyRaw === undefined || qtyRaw === null || String(qtyRaw).trim() === '') {
        updates.quantity = null;
      } else {
        const n = Number(String(qtyRaw).replace(/,/g, ''));
        updates.quantity = Number.isFinite(n) ? n : null;
      }
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseServer.from('inventory').update(updates).eq('id', id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// DELETE /api/inventory/[id]
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { error } = await supabaseServer.from('inventory').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
