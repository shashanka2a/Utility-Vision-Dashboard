import { ReportsScreen } from "@/components/ReportsScreen";
import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase-server";

async function getInitialReports() {
  const { data } = await supabaseServer
    .from('daily_signed_reports')
    .select('*, projects(name)')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (!data || data.length === 0) return [];

  return data.map((report: any) => ({
    id: report.id,
    projectName: report.projects?.name || 'Unknown Project',
    date: report.signed_at || report.created_at,
    timestamp: new Date(report.created_at).toLocaleString(),
    weather: { high: 75, low: 60, condition: 'sunny' },
    photos: report.signature_url ? [report.signature_url] : [],
    delays: 0
  }));
}

export default async function ReportsPage() {
  const initialReports = await getInitialReports();

  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading reports...</div>}>
      <ReportsScreen initialReports={initialReports} />
    </Suspense>
  );
}
