import { ReportsScreen } from "@/components/ReportsScreen";
import { Suspense } from "react";
import { getDailyReportListItems } from "@/lib/daily-report-index";

async function getInitialReports() {
  return getDailyReportListItems();
}

export default async function ReportsPage() {
  const initialReports = await getInitialReports();

  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading reports...</div>}>
      <ReportsScreen initialReports={initialReports} />
    </Suspense>
  );
}
