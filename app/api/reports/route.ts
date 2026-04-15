import { NextResponse } from 'next/server';
import { getDailyReportListItems } from '@/lib/daily-report-index';

export async function GET() {
  try {
    const formattedData = await getDailyReportListItems();
    return NextResponse.json(formattedData);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
