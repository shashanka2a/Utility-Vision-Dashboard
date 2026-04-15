import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export type ChemicalPresetRow = {
  id: string;
  application_type: 'spraying' | 'wicking';
  name: string;
  unit: string | null;
  sort_order: number;
  updated_at?: string;
};

function groupRows(rows: ChemicalPresetRow[]) {
  const spraying = rows.filter((r) => r.application_type === 'spraying').sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const wicking = rows.filter((r) => r.application_type === 'wicking').sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  return { spraying, wicking };
}

// GET /api/company/chemical-presets — { spraying: [...], wicking: [...] }
export async function GET() {
  const { data, error } = await supabaseServer
    .from('company_chemical_presets')
    .select('id, application_type, name, unit, sort_order, updated_at')
    .order('application_type', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as ChemicalPresetRow[];
  return NextResponse.json(groupRows(rows));
}

// POST /api/company/chemical-presets  body: { application_type: 'spraying' | 'wicking', name: string, unit?: string | null }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const application_type = body.application_type as string;
    const name = (body.name as string | undefined)?.trim();
    const unitRaw = body.unit;

    if (application_type !== 'spraying' && application_type !== 'wicking') {
      return NextResponse.json({ error: 'application_type must be spraying or wicking' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const unit =
      unitRaw === undefined || unitRaw === null || String(unitRaw).trim() === ''
        ? null
        : String(unitRaw).trim();

    const { data: maxRow } = await supabaseServer
      .from('company_chemical_presets')
      .select('sort_order')
      .eq('application_type', application_type)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = typeof maxRow?.sort_order === 'number' ? maxRow.sort_order + 1 : 0;

    const { data, error } = await supabaseServer
      .from('company_chemical_presets')
      .insert({
        application_type,
        name,
        unit,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data as ChemicalPresetRow, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
