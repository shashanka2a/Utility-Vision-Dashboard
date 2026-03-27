import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/safety-talks — list all safety talk templates
export async function GET() {
  const { data, error } = await supabaseServer
    .from('safety_talk_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/safety-talks — create a new talk template (with PDF URL from Cloudinary)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, pdf_url, pdf_public_id, file_size, uploaded_by } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('safety_talk_templates')
    .insert([{ name, description, pdf_url, pdf_public_id, file_size, uploaded_by }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/safety-talks?id=<uuid>
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('safety_talk_templates')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
