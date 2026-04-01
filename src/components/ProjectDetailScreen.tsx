"use client";

import { useProject } from "@/context/ProjectContext";
import { 
  FileText, ClipboardList, PenTool, AlertCircle, 
  Search, Eye, Activity, Image as ImageIcon, 
  FileSpreadsheet, MessageSquare, Clipboard, Loader2
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectDetailScreenProps {
  title: string;
  icon: any;
  emptyMessage?: string;
  dataType?: 'activity' | 'attachments' | 'checklists' | 'toolbox' | 'observations' | 'incidents' | 'notes' | 'survey' | 'directory' | 'gallery' | 'settings' | 'work-logs';
}

export function ProjectDetailScreen({ title, icon: Icon, emptyMessage, dataType }: ProjectDetailScreenProps) {
  const { selectedProject } = useProject();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate DB fetch based on dataType and selectedProject
    setLoading(true);
    const timer = setTimeout(() => {
      // In a real app, we'd fetch from APIs here
      setData([]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [dataType, selectedProject]);
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Content */}
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm font-medium">Fetching database data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="max-w-md w-full text-center py-12 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No {title.toLowerCase()} found</h2>
            <p className="text-gray-500 mb-8">
              {emptyMessage || `There is currently no ${title.toLowerCase()} recorded for ${selectedProject} in the database.`}
            </p>
            <button className="px-6 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm">
              Create New {title.split(' ')[0]}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl">
            <p className="text-gray-500">Displaying {data.length} items...</p>
          </div>
        )}
      </div>
    </div>
  );
}
