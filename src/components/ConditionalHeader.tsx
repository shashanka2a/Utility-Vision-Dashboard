"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "./DashboardHeader";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Show the date/action topbar ONLY when viewing a specific project's dashboard
  if (!pathname.startsWith("/projects/dashboard")) return null;

  return <DashboardHeader />;
}
