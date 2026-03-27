import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format data to match frontend requirements
  const formattedData = data.map((activity) => ({
    id: activity.id,
    employeeName: activity.employee_name,
    action: activity.action,
    project: activity.project_name,
    activityType: activity.activity_type,
    timestamp: activity.timestamp_label,
    isoTimestamp: activity.created_at, // Add real timestamp for filtering
    metrics: activity.metrics || [],
    photos: activity.photos || [],
  }));

  return NextResponse.json(formattedData);
}

