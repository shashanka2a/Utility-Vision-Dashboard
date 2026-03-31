import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('daily_signed_reports')
    .select(`
      *,
      projects (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format data to match frontend requirements
  const formattedData = data.map((report: any) => ({
    id: report.id,
    projectName: report.projects?.name || 'Unknown Project',
    date: report.signed_at || report.created_at,
    timestamp: new Date(report.created_at).toLocaleString(),
    weather: {
      high: 75,
      low: 60,
      condition: 'sunny'
    },
    photos: report.signature_url ? [report.signature_url] : [],
    delays: 0
  }));

  return NextResponse.json(formattedData);
}
