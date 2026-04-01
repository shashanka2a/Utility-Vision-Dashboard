"use client";

import { useProject } from "@/context/ProjectContext";
import { 
  FileText, ClipboardList, PenTool, AlertCircle, 
  Search, Eye, Activity, Image as ImageIcon, 
  FileSpreadsheet, MessageSquare, Clipboard, Loader2,
  Plus, MoreHorizontal, ArrowUpDown
} from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface ProjectDetailScreenProps {
  title: string;
  icon: any;
  emptyMessage?: string;
  dataType?: 'activity' | 'attachments' | 'checklists' | 'toolbox' | 'observations' | 'incidents' | 'notes' | 'survey' | 'directory' | 'gallery' | 'settings' | 'work-logs';
}

export function ProjectDetailScreen({ title, icon: Icon, emptyMessage, dataType }: ProjectDetailScreenProps) {
  const { selectedProject, selectedDate } = useProject();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!selectedProject || !selectedDate) return;

    setLoading(true);
    fetch('/api/activities')
      .then(res => res.json())
      .then((activities: any[]) => {
        // Filter by project and date
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        let filtered = activities.filter(a => {
           const matchProject = selectedProject === "All Projects" || a.project === selectedProject;
           const matchDate = a.timestamp.includes(dateStr) || a.isoTimestamp?.startsWith(dateStr);
           return matchProject && matchDate;
        });

        // Filter by dataType if applicable
        if (dataType === 'notes') {
          filtered = filtered.filter(a => a.activityType === 'Notes');
        } else if (dataType === 'observations') {
          filtered = filtered.filter(a => a.activityType === 'Observations');
        } else if (dataType === 'incidents') {
          filtered = filtered.filter(a => a.activityType === 'Incidents');
        }
        
        setData(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dataType, selectedProject, selectedDate]);

  // Handle Note-specific rendering
  if (dataType === 'notes') {
    return (
      <div className="h-full flex flex-col bg-gray-50 flex-1 overflow-hidden">
        {/* Top Controls */}
        <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0">
          <div className="relative w-[300px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633]/20 focus:border-[#FF6633] transition-all"
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6633] text-white rounded-lg text-sm font-semibold hover:bg-[#E55A2B] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Note</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[200px_1fr_150px_60px] gap-4 items-center px-6 py-3 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-1 text-[13px] font-semibold text-gray-500">
                Category
                <ArrowUpDown className="w-3 h-3 text-gray-400" />
              </div>
              <div className="text-[13px] font-semibold text-gray-500">Description</div>
              <div className="text-[13px] font-semibold text-gray-500">Attachments</div>
              <div></div>
            </div>

            {/* Table Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-gray-300" />
                <p className="text-sm">Fetching notes...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No notes found</h3>
                <p className="text-gray-500 text-sm text-center max-w-[250px]">
                  There are no notes recorded for {selectedProject} on {format(selectedDate, "MMM d, yyyy")}.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.map((note, idx) => (
                  <div key={note.id || idx} className="grid grid-cols-[200px_1fr_150px_60px] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="text-[14px] text-gray-700 font-medium">
                      {note.metrics?.find((m: any) => m.label?.toLowerCase().includes('category'))?.value || "General Notes"}
                    </div>
                    <div className="text-[14px] text-gray-600 truncate">
                      {note.action || "No description provided"}
                    </div>
                    <div className="text-[14px] text-gray-500">
                      {note.photos?.length ? `${note.photos.length} files` : "—"}
                    </div>
                    <div className="flex justify-end">
                      <button className="p-1 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Generic fallback rendering for other dataTypes
  return (
    <div className="h-full flex flex-col bg-gray-50 flex-1 overflow-hidden">
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
              {emptyMessage || `There is currently no ${title.toLowerCase()} recorded for ${selectedProject} on ${format(selectedDate, "MMM d, yyyy")}.`}
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

