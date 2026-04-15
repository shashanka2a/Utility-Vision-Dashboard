import { NextResponse } from 'next/server';
import { getCalendarReportStatus } from '@/lib/calendar-report-status';

export async function GET(request: Request) {
  const project = new URL(request.url).searchParams.get('project');
  try {
    const status = await getCalendarReportStatus(project || '');
    return NextResponse.json(status);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message, loggedDates: [], signedDates: [] }, { status: 500 });
  }
}
