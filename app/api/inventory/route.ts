import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

async function resolveProjectId(projectName: string | null): Promise<string | null> {
  if (!projectName || projectName === 'All Projects') return null;
  const { data } = await supabaseServer.from('projects').select('id').eq('name', projectName).maybeSingle();
  return data?.id ?? null;
}

// GET /api/inventory?project=<name>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get('project');
  const projectId = await resolveProjectId(projectName);
  if (!projectId) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabaseServer
    .from('inventory')
    .select('id, project_id, name, quantity, sort_order, updated_at')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/inventory  body: { project: string, name: string, quantity?: number | string | null }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectName = body.project as string | undefined;
    const name = (body.name as string | undefined)?.trim();
    const qtyRaw = body.quantity;

    const projectId = await resolveProjectId(projectName ?? null);
    if (!projectId) {
      return NextResponse.json({ error: 'Valid project name required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    let quantity: number | null = null;
    if (qtyRaw !== undefined && qtyRaw !== null && String(qtyRaw).trim() !== '') {
      const n = Number(String(qtyRaw).replace(/,/g, ''));
      quantity = Number.isFinite(n) ? n : null;
    }

    const { data: maxRow } = await supabaseServer
      .from('inventory')
      .select('sort_order')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = typeof maxRow?.sort_order === 'number' ? maxRow.sort_order + 1 : 0;

    const { data, error } = await supabaseServer
      .from('inventory')
      .insert({
        project_id: projectId,
        name,
        quantity,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
