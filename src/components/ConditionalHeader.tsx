"use client";

import { useProject } from "@/context/ProjectContext";
import { DashboardHeader } from "./DashboardHeader";

export function ConditionalHeader() {
  const { selectedProject } = useProject();

  // Only show the date/action bar when a real project is selected
  if (selectedProject === "All Projects") return null;

  return <DashboardHeader />;
}
