import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const [activitiesRes, attachmentsRes, surveysRes, projectsRes] = await Promise.all([
    supabaseServer.from('activities').select('*'),
    supabaseServer.from('attachments').select('*'),
    supabaseServer.from('surveys').select('*, questions:survey_questions(question, answer)'),
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

  const surveysData = (surveysRes.data || []).map((s) => {
    const loggedAt = s.logged_at ? new Date(s.logged_at) : new Date();
    const metricsFromQuestions = (s.questions || []).map((q: any) => ({
        label: q.question,
        value: q.answer || 'N/A'
    }));

    const yesCount = (s.questions || []).filter((q:any) => q.answer === 'Yes').length;
    const noCount = (s.questions || []).filter((q:any) => q.answer === 'No').length;

    return {
        id: s.id,
        employeeName: 'Artifact Employee', // Fallback
        action: 'submitted a survey in',
        project: projectsMap[String(s.project_id)] || 'Unknown Project',
        activityType: 'Survey',
        timestamp: `${loggedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} | ${loggedAt.toISOString().split('T')[0]}`,
        isoTimestamp: s.logged_at || new Date().toISOString(),
        metrics: [
             { label: 'NOTE: Summary', value: `${s.questions?.length || 0} questions answered (${yesCount} Yes, ${noCount} No).` },
             ...metricsFromQuestions
        ],
        photos: []
    };
  });

  // 4. Merge and sort by time
  const combined = [...activitiesData, ...attachmentsData, ...surveysData].sort((a, b) => 
    new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime()
  );

  return NextResponse.json(combined);
}

