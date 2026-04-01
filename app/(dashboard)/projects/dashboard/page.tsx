"use client";

import { useSearchParams } from "next/navigation";
import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ActivityScreen } from "@/components/ActivityScreen";
import { ProjectDetailScreen } from "@/components/ProjectDetailScreen";
import {
  ClipboardList, PenTool, AlertCircle, Eye,
  Activity, Image as GalleryIcon, FileSpreadsheet,
  MessageSquare, Clipboard, Users, Settings,
  Calendar, Compass, LayoutDashboard
} from "lucide-react";

function ProjectDashboardContent() {
  const { selectedProject } = useProject();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "activity";

  // Guard: no project selected
  if (selectedProject === "All Projects") {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Compass className="w-8 h-8 text-gray-300" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Select a Project First</h2>
          <p className="text-gray-500 max-w-xs mt-1">
            Pick a project from the left sidebar or the project list to view its details.
          </p>
        </div>
        <button
          onClick={() => router.push("/projects")}
          className="mt-2 px-6 py-2 bg-black text-white rounded-lg font-medium shadow-sm hover:bg-gray-800 transition-colors"
        >
          View Projects List
        </button>
      </div>
    );
  }

  // Render view in-place based on ?view= query param
  switch (view) {
    case "activity":
      return <ActivityScreen />;

    case "work-logs":
      return <ProjectDetailScreen title="Work Logs" icon={Calendar} dataType="work-logs" />;
    case "notes":
      return <ProjectDetailScreen title="Notes" icon={MessageSquare} dataType="notes" />;
    case "attachments":
      return <ProjectDetailScreen title="Attachments" icon={Clipboard} dataType="attachments" />;
    case "survey":
      return <ProjectDetailScreen title="Survey" icon={FileSpreadsheet} dataType="survey" />;

    case "checklists":
      return <ProjectDetailScreen title="Checklists" icon={ClipboardList} dataType="checklists" />;
    case "toolbox-talks":
      return <ProjectDetailScreen title="Toolbox Talks" icon={PenTool} dataType="toolbox" />;
    case "observations":
      return <ProjectDetailScreen title="Observations" icon={Eye} dataType="observations" />;
    case "incidents":
      return <ProjectDetailScreen title="Incidents" icon={AlertCircle} dataType="incidents" />;
    case "insights":
      return <ProjectDetailScreen title="Insights" icon={Activity} dataType="activity" />;

    case "directory":
      return <ProjectDetailScreen title="Directory" icon={Users} dataType="directory" />;
    case "gallery":
      return <ProjectDetailScreen title="Gallery" icon={GalleryIcon} dataType="gallery" />;
    case "settings":
      return <ProjectDetailScreen title="Settings" icon={Settings} dataType="settings" />;

    default:
      return <ActivityScreen />;
  }
}

export default function ProjectDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading...</div>}>
      <ProjectDashboardContent />
    </Suspense>
  );
}
