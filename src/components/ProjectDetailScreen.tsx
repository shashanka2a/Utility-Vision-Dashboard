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
import NextImage from "next/image";
import { ImageViewer } from "./ImageViewer";
import { ActivityCard } from "./ActivityCard";
import type { Activity as ActivityType } from "./ActivityScreen";

interface ProjectDetailScreenProps {
  title: string;
  icon: any;
  emptyMessage?: string;
  dataType?: 'activity' | 'attachments' | 'checklists' | 'toolbox' | 'observations' | 'incidents' | 'notes' | 'survey' | 'directory' | 'gallery' | 'settings' | 'work-logs';
}

export function ProjectDetailScreen({ title, icon: Icon, emptyMessage, dataType: defaultDataType }: ProjectDetailScreenProps) {
  const { selectedProject, selectedDate } = useProject();
  const [dataType, setDataType] = useState(defaultDataType || 'notes');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; index: number; list: any[] }>({
    isOpen: false,
    index: 0,
    list: []
  });

  useEffect(() => {
    if (!selectedProject || !selectedDate) return;

    setLoading(true);
    fetch('/api/activities')
      .then(res => res.json())
      .then((activities: any[]) => {
        // Filter by project
        const matchProject = (a: any) => selectedProject === "All Projects" || a.project === selectedProject;
        
        // Filter by date (unless it's gallery)
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const matchDate = (a: any) => dataType === 'gallery' || a.timestamp.includes(dateStr) || a.isoTimestamp?.startsWith(dateStr);

        let filtered = activities.filter(a => matchProject(a) && matchDate(a));

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

  // Handle Gallery Rendering
  if (dataType === 'gallery') {
    const allPhotos = data.flatMap(item => 
      (item.photos || []).map((url: string) => ({
        url,
        uploadedBy: item.employeeName,
        date: item.timestamp,
        project: item.project,
        description: item.metrics?.find((m: any) => m.label?.toLowerCase().includes('note') || m.label?.toLowerCase().includes('desc'))?.value || 'Uploaded in ' + item.activityType,
        fileName: url.split('/').pop()
      }))
    );

    return (
      <div className="h-full flex flex-col bg-gray-50 flex-1 overflow-hidden">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Gallery</h1>
            <p className="text-sm text-gray-500 mt-1">Viewing all assets for {selectedProject}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Find assets..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633]/10 focus:border-[#FF6633] transition-all"
                />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin mb-4" />
               <p className="text-sm">Scanning project archives...</p>
            </div>
          ) : allPhotos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No media found</h3>
               <p className="text-gray-500 max-w-xs mx-auto">Upload attachments or submit logs with photos to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allPhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className="group relative aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => setViewerState({ isOpen: true, index, list: allPhotos })}
                >
                  <NextImage 
                    src={photo.url} 
                    alt="Gallery item"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-[11px] font-bold truncate">{photo.uploadedBy}</p>
                      <p className="text-gray-300 text-[9px] truncate">{photo.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ImageViewer 
          isOpen={viewerState.isOpen}
          photos={viewerState.list.map(p => p.url)}
          initialIndex={viewerState.index}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
          metadata={viewerState.list[viewerState.index]}
        />
      </div>
    );
  }

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
                    <div className="text-[14px] text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {note.metrics?.find((m: any) => m.label?.toLowerCase().includes('category'))?.value || "General Notes"}
                    </div>
                    <div className="text-[14px] text-gray-600 max-w-full truncate">
                      {note.metrics?.find((m: any) => {
                        const l = (m.label || m.name || '').toLowerCase();
                        return (
                          l === 'description' || l === 'note' || l === 'content' || 
                          l === 'details' || l === 'comment' || l === 'message' || 
                          l === 'general note' || l === 'text' ||
                          l.includes('note') || l.includes('desc')
                        );
                      })?.value || note.action?.replace(' in', '') || "No description provided"}
                    </div>
                    <div className="text-[14px] text-gray-500 whitespace-nowrap">
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
      {/* Dynamic Header */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.length} records found for {selectedProject} on {format(selectedDate, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
             <Plus className="w-4 h-4" />
             <span>New {title}</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-medium">Fetching details from project history...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="max-w-md w-full text-center py-12 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm mx-auto mt-10">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No {title.toLowerCase()} found</h2>
            <p className="text-gray-500 mb-8 max-w-[280px] mx-auto">
              There are currently no {title.toLowerCase()} recorded for this period.
            </p>
            <button className="px-6 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md">
              Create First Entry
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {data.map((item, idx) => (
              <ActivityCard key={item.id || idx} activity={item as ActivityType} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

