import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

/**
 * Upload safety talk PDFs to Cloudinary as raw assets (not Supabase Storage).
 * Requires CLOUDINARY_* (or NEXT_PUBLIC_/EXPO_PUBLIC_) env vars.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && !process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the server.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes?: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'safety-talks',
          public_id: `stk-${Date.now()}`,
        },
        (error, res) => {
          if (error) reject(error);
          else if (res) resolve(res as { secure_url: string; public_id: string; bytes?: number });
          else reject(new Error('Empty Cloudinary response'));
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      pdf_url: result.secure_url,
      pdf_public_id: result.public_id,
      file_size: result.bytes ?? file.size,
      name: file.name.replace(/\.pdf$/i, ''),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('[safety-talks/upload]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
