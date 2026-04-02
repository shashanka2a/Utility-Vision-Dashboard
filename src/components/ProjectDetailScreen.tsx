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

export function ProjectDetailScreen({ title, icon: Icon, emptyMessage, dataType }: ProjectDetailScreenProps) {
  const { selectedProject, selectedDate } = useProject();
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

  // Handle Gallery Rendering (Timeline Style)
  if (dataType === 'gallery') {
    const allPhotos = data.flatMap(item => 
      (item.photos || []).map((url: string) => ({
        url,
        uploadedBy: item.employeeName,
        date: item.timestamp,
        isoDate: item.isoTimestamp?.split('T')[0] || item.timestamp.split(' at ')[0],
        project: item.project,
        description: item.metrics?.find((m: any) => m.label?.toLowerCase().includes('note') || m.label?.toLowerCase().includes('desc'))?.value || 'Uploaded in ' + item.activityType,
        fileName: url.split('/').pop()
      }))
    );

    // Group by date
    const groups: { [key: string]: any[] } = {};
    allPhotos.forEach(p => {
      const d = p.isoDate;
      if (!groups[d]) groups[d] = [];
      groups[d].push(p);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return (
      <div className="h-full flex flex-col bg-gray-50 flex-1 overflow-hidden">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
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

        <div className="flex-1 overflow-auto p-8 pt-4 space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin mb-4" />
               <p className="text-sm font-medium">Scanning project history...</p>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="flex-1" />
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                  {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : date}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {groups[date].map((photo, index) => (
                    <div 
                      key={index} 
                      className="group relative aspect-square bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      onClick={() => setViewerState({ isOpen: true, index: allPhotos.indexOf(photo), list: allPhotos })}
                    >
                      <NextImage 
                        src={photo.url} 
                        alt="Gallery item"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
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
              <div className="flex-1" />
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

  // Specialized rendering for Attachments module (File Card Grid)
  if (dataType === 'attachments') {
    const files = data.flatMap(item => 
      (item.photos || []).map((url: string) => ({
        url,
        fileName: url.split('/').pop() || 'Untitled File',
        uploadedBy: item.employeeName,
        date: item.timestamp,
        project: item.project,
        description: item.metrics?.find((m: any) => m.label?.toLowerCase().includes('note'))?.value
      }))
    );

    return (
      <div className="h-full flex flex-col bg-gray-50 flex-1 overflow-hidden">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
           <div className="text-xs text-gray-400 font-medium">
             Drag and drop files below or <span className="text-[#2196F3] cursor-pointer">select files</span>. The file size limit is 60MB.
           </div>
        </div>

        <div className="flex-1 overflow-auto p-8 pt-4">
          {loading ? (
             <div className="flex py-20 justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
             </div>
          ) : files.length === 0 ? (
            <div className="flex-1" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {files.map((file, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#2196F3] transition-all cursor-pointer group"
                  onClick={() => setViewerState({ isOpen: true, index: idx, list: files })}
                >
                  <div className="aspect-square relative transition-transform duration-300 group-hover:scale-[1.02]">
                    <NextImage src={file.url} alt={file.fileName} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100">
                    <p className="text-[13px] font-medium text-gray-700 truncate">{file.fileName}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{file.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ImageViewer 
          isOpen={viewerState.isOpen}
          photos={viewerState.list.map(f => f.url)}
          initialIndex={viewerState.index}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
          metadata={viewerState.list[viewerState.index]}
        />
      </div>
    );
  }

  // Generic fallback rendering for other dataTypes (Work logs, Survey, etc.)
  return (
    <div className="h-full flex flex-col bg-gray-50 flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm font-medium">Fetching database data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1" />
        ) : (
          <div className="w-full max-w-5xl flex flex-col items-center justify-center py-20 text-center">
             <div className="w-16 h-16 bg-[#2196F3]/5 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-[#2196F3]" />
             </div>
             <p className="text-gray-900 font-bold text-lg">Displaying {data.length} items...</p>
             <p className="text-gray-500 text-sm mt-1 max-w-sm">Records retrieved safely. Detailed views for this module are still being integrated.</p>
          </div>
        )}
      </div>
    </div>
  );
}

