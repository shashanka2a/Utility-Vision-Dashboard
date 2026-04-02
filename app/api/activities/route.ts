import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const [activitiesRes, attachmentsRes, projectsRes] = await Promise.all([
    supabaseServer.from('activities').select('*'),
    supabaseServer.from('attachments').select('*'),
    supabaseServer.from('projects').select('id, name')
  ]);

  if (activitiesRes.error) {
    return NextResponse.json({ error: activitiesRes.error.message }, { status: 500 });
  }

  const projectsMap = Object.fromEntries(
    (projectsRes.data || []).map(p => [String(p.id), p.name])
  );

  // 1. Format activities
  const activitiesData = (activitiesRes.data || []).map((activity) => ({
    id: activity.id,
    employeeName: activity.employee_name,
    action: activity.action,
    project: activity.project_name,
    activityType: activity.activity_type,
    timestamp: activity.timestamp_label,
    isoTimestamp: activity.created_at,
    metrics: activity.metrics || [],
    photos: activity.photos || [],
  }));

  // 2. Format attachments to match activity structure
  const attachmentsData = (attachmentsRes.data || []).map((a) => {
    const loggedAt = a.logged_at ? new Date(a.logged_at) : new Date();
    return {
        id: a.id,
        employeeName: 'Artifact Employee', 
        action: 'submitted attachments in',
        project: projectsMap[String(a.project_id)] || 'Unknown Project',
        activityType: 'Attachments',
        timestamp: `${loggedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} | ${loggedAt.toISOString().split('T')[0]}`,
        isoTimestamp: a.logged_at || new Date().toISOString(),
        metrics: [
            { label: 'Files', value: (a.file_names?.length || 0).toString(), unit: 'count' },
            { label: 'Note', value: a.notes || 'No description' }
        ],
        photos: Array.isArray(a.cloudinary_urls) ? a.cloudinary_urls : 
                 (typeof a.cloudinary_urls === 'string' ? JSON.parse(a.cloudinary_urls) : []),
    };
  });

  // 3. Merge and sort by time
  const combined = [...activitiesData, ...attachmentsData].sort((a, b) => 
    new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime()
  );

  return NextResponse.json(combined);
}

