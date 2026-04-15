import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import cloudinary from '@/lib/cloudinary';

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

// DELETE /api/safety-talks?id=<uuid> — removes DB row and deletes the PDF from Cloudinary when possible
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { data: row, error: fetchErr } = await supabaseServer
    .from('safety_talk_templates')
    .select('pdf_public_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const publicId = row && typeof row === 'object' && 'pdf_public_id' in row ? (row as { pdf_public_id: string | null }).pdf_public_id : null;

  if (publicId && typeof publicId === 'string' && publicId.length > 0) {
    try {
      await new Promise<void>((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (e) {
      console.warn('[safety-talks DELETE] Cloudinary destroy failed:', e);
    }
  }

  const { error } = await supabaseServer.from('safety_talk_templates').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
