import { NextResponse } from 'next/server';
import { getDailyReportListItems } from '@/lib/daily-report-index';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');

    const formattedData = await getDailyReportListItems();
    const filtered =
      project && project !== 'All Projects'
        ? formattedData.filter((r) => r.projectName === project)
        : formattedData;

    return NextResponse.json(filtered);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
