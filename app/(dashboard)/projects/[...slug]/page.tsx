"use client";

import { useProject } from "@/context/ProjectContext";
import { 
  FileText, ClipboardList, PenTool, AlertCircle, 
  Search, Eye, Activity, Image as GalleryIcon, 
  FileSpreadsheet, MessageSquare, Clipboard, Loader2,
  Calendar, LayoutDashboard, Briefcase, Users, Settings, Compass
} from "lucide-react";
import { ProjectDetailScreen } from "@/components/ProjectDetailScreen";
import { ActivityScreen } from "@/components/ActivityScreen";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProjectPage() {
  const { selectedProject, setSelectedProject } = useProject();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] || [];
  const path = slug.join('/');

  // Redirect if no project selected and we're trying to view project context
  useEffect(() => {
    if (selectedProject === 'All Projects') {
      // router.push('/projects'); // Optional: redirect back to list
    }
  }, [selectedProject, router]);

  if (selectedProject === 'All Projects') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Compass className="w-8 h-8 text-gray-300" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Select a Project First</h2>
          <p className="text-gray-500 max-w-xs mt-1">Please pick a project from the left sidebar or the project list to view its details.</p>
        </div>
        <button 
          onClick={() => router.push('/projects')}
          className="mt-2 px-6 py-2 bg-black text-white rounded-lg font-medium shadow-sm hover:bg-gray-800 transition-colors"
        >
          View Projects List
        </button>
      </div>
    );
  }

  // 1. Dashboard Mode
  if (path === 'dashboard') {
    return (
      <div className="h-full flex flex-col">
        <ActivityScreen />
      </div>
    );
  }

  // 2. Daily Logs Group
  if (path === 'daily-logs/work') {
    return <ProjectDetailScreen title="Work Logs" icon={Calendar} dataType="work-logs" />;
  }
  if (path === 'daily-logs/notes') {
    return <ProjectDetailScreen title="Notes" icon={MessageSquare} dataType="notes" />;
  }
  if (path === 'daily-logs/attachments') {
    return <ProjectDetailScreen title="Attachments" icon={Clipboard} dataType="attachments" />;
  }
  if (path === 'daily-logs/survey') {
    return <ProjectDetailScreen title="Survey" icon={FileSpreadsheet} dataType="survey" />;
  }

  // 3. Safety & QC Group
  if (path === 'safety/checklists') {
    return <ProjectDetailScreen title="Checklists" icon={ClipboardList} dataType="checklists" />;
  }
  if (path === 'safety/toolbox-talks') {
    return <ProjectDetailScreen title="Toolbox Talks" icon={PenTool} dataType="toolbox" />;
  }
  if (path === 'safety/observations') {
    return <ProjectDetailScreen title="Observations" icon={Eye} dataType="observations" />;
  }
  if (path === 'safety/incidents') {
    return <ProjectDetailScreen title="Incidents" icon={AlertCircle} dataType="incidents" />;
  }
  if (path === 'safety/insights') {
    return <ProjectDetailScreen title="Insights" icon={Activity} dataType="activity" />;
  }

  // 4. Other Bottom items
  if (path === 'directory') {
    return <ProjectDetailScreen title="Directory" icon={Users} dataType="directory" />;
  }
  if (path === 'gallery') {
    return <ProjectDetailScreen title="Gallery" icon={GalleryIcon} dataType="gallery" />;
  }
  if (path === 'settings') {
    return <ProjectDetailScreen title="Settings" icon={Settings} dataType="settings" />;
  }

  // Fallback: Default view (just show Dashboard if no path or invalid path)
  return <ProjectDetailScreen title="Overview" icon={LayoutDashboard} />;
}
