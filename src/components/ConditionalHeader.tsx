"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { DashboardHeader } from "./DashboardHeader";

export function ConditionalHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Show the date/action topbar ONLY when viewing a specific project's dashboard
  if (!pathname.startsWith("/projects/dashboard")) return null;

  // The 'Dashboard' sections in the project sidebar have their own date selectors or don't need the top bar
  const view = searchParams.get("view");
  const dashboardViews = ["activity", "reports", "project-insights"];
  if (!view || dashboardViews.includes(view)) {
    return null;
  }

  return <DashboardHeader />;
}
