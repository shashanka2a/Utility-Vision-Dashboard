"use client";

import { useProject } from "@/context/ProjectContext";
import { 
  FileText, ClipboardList, PenTool, AlertCircle, 
  Search, Eye, Activity, Image as ImageIcon, 
  FileSpreadsheet, MessageSquare, Clipboard, Loader2,
  Plus, MoreHorizontal, ArrowUpDown, Calendar,
  Clock, User, TrendingUp, BarChart as BarChartIcon,
  CheckCircle2, AlertTriangle, Info, Briefcase, ChevronDown, ChevronRight
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import NextImage from "next/image";
import { ImageViewer } from "./ImageViewer";
import { ActivityCard } from "./ActivityCard";
import type { Activity as ActivityType } from "./ActivityScreen";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  LineChart, Line, AreaChart, Area
} from 'recharts';

interface ProjectDetailScreenProps {
  title: string;
  icon: any;
  emptyMessage?: string;
  dataType?: 'activity' | 'attachments' | 'checklists' | 'safety-talks' | 'observations' | 'incidents' | 'notes' | 'survey' | 'directory' | 'gallery' | 'settings' | 'metrics' | 'chemicals';
}

export function ProjectDetailScreen({ title, icon: Icon, emptyMessage, dataType }: ProjectDetailScreenProps) {
  const { selectedProject, setSelectedProject, selectedDate } = useProject();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<string[]>([]);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; index: number; list: any[] }>({
    isOpen: false,
    index: 0,
    list: []
  });

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(p => {
      setProjectsList(["All Projects", ...p.map((x: any) => x.name)]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProject || !selectedDate) return;

    setLoading(true);
    fetch('/api/activities')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((activities: any[]) => {
        const matchProject = (a: any) => selectedProject === "All Projects" || a.project === selectedProject;
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        
        const matchDate = (a: any) => {
          if (dataType === 'gallery') return true;
          if (dataType === 'activity') {
            if (timeRange === 'all') return true;
            const itemDate = new Date(a.isoTimestamp || a.timestamp);
            const refDate = new Date(selectedDate);
            
            if (timeRange === 'custom') {
               const start = new Date(startDate);
               const end = new Date(endDate);
               end.setHours(23, 59, 59, 999);
               return itemDate >= start && itemDate <= end;
            }

            if (timeRange === '1d') return format(itemDate, "yyyy-MM-dd") === dateStr;
            const diffDays = Math.floor((refDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
            if (timeRange === '7d') return diffDays >= 0 && diffDays < 7;
            if (timeRange === '30d') return diffDays >= 0 && diffDays < 30;
          }
          return a.timestamp.includes(dateStr) || a.isoTimestamp?.startsWith(dateStr);
        };

        let filtered = activities.filter(a => matchProject(a) && matchDate(a));
// ... (rest of logic)

        if (dataType === 'notes') {
          filtered = filtered.filter(a => a.activityType === 'Notes');
        } else if (dataType === 'observations') {
          filtered = filtered.filter(a => a.activityType === 'Observations');
        } else if (dataType === 'incidents') {
          filtered = filtered.filter(a => a.activityType === 'Incidents');
        } else if (dataType === 'metrics') {
          // Actual metrics stored in the DB as an array
          filtered = filtered.filter(a => a.metrics && a.metrics.length > 0);
        } else if (dataType === 'chemicals') {
          filtered = filtered.filter(a => a.activityType === 'Chemicals');
        } else if (dataType === 'survey') {
          filtered = filtered.filter(a => a.activityType === 'Survey');
        } else if (dataType === 'safety-talks') {
          filtered = filtered.filter(a => a.activityType === 'Toolbox Talk' || a.activityType === 'Safety Meeting' || a.activityType === 'Safety Talks');
        } else if (dataType === 'checklists') {
          filtered = filtered.filter(a => a.activityType?.toLowerCase().includes('checklist'));
        } else if (dataType === 'activity') {
          filtered = filtered.filter(a => 
            a.action?.toLowerCase().includes('insight') || 
            a.activityType?.toLowerCase().includes('metric') ||
            a.metrics?.length > 0
          );
        }
        
        setData(filtered);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [dataType, selectedProject, selectedDate, timeRange]);

  // Derive Insights Data
  const insightsMetrics = useMemo(() => {
    if (dataType !== 'activity') return null;
    
    // Group by activity type for a distribution chart
    const distribution: { [key: string]: number } = {};
    data.forEach(item => {
      const type = item.activityType || 'General';
      distribution[type] = (distribution[type] || 0) + 1;
    });

    const chartData = Object.entries(distribution).map(([name, value]) => ({ name, value }));

    // Group by day for a trend chart (last 14 days)
    const trends: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(today, i), "MMM d");
      trends[d] = 0;
    }

    data.forEach(item => {
      const d = item.isoTimestamp ? format(new Date(item.isoTimestamp), "MMM d") : null;
      if (d && trends[d] !== undefined) {
        trends[d]++;
      }
    });

    const trendData = Object.entries(trends).map(([date, count]) => ({ date, count }));

    return { chartData, trendData };
  }, [data, dataType]);

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No media found</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Upload attachments or submit logs with photos to see them here.</p>
            </div>
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
          photos={viewerState.list.map((p: any) => p.url)}
          initialIndex={viewerState.index}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
          metadata={viewerState.list[viewerState.index]}
        />
      </div>
    );
  }

  // Handle Specialized Insights Dashboard (Graphs)
  if (dataType === 'activity') {
    return (
      <div className="h-full flex flex-col bg-[#F8F9FB] flex-1 overflow-hidden uppercase-sidebar-fix">
        {/* Senior Designer Level Integrated Toolbar */}
        <div className="px-8 py-3 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm relative z-20">
            {/* LEFT: PRIMARY SELECTION (PROJECT) */}
            <div className="flex items-center gap-4">
                <div className="relative">
                   <div className="flex flex-col mb-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Scope</span>
                   </div>
                   <button 
                     onClick={() => setProjectOpen(!projectOpen)}
                     className="group flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-200/50 hover:border-[#FF6633]/30 shadow-sm"
                   >
                      <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                        <Briefcase className="w-4 h-4 text-[#FF6633]" />
                      </div>
                      <div className="flex flex-col items-start pr-2">
                         <span className="text-[14px] font-black text-gray-900 leading-none">{selectedProject}</span>
                         <span className="text-[10px] text-gray-500 font-bold mt-1 opacity-70">Switch Context</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${projectOpen ? 'rotate-180' : ''}`} />
                   </button>

                   {projectOpen && (
                     <div className="absolute top-16 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-50">
                        <div className="px-5 py-2 mb-1">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Projects</span>
                        </div>
                        {projectsList.map(p => (
                          <button
                            key={p}
                            onClick={() => { setSelectedProject(p); setProjectOpen(false); }}
                            className={`w-full text-left px-5 py-3 text-[13px] hover:bg-gray-50 flex items-center justify-between transition-colors ${selectedProject === p ? 'text-[#FF6633] font-black bg-[#FFF3EF]' : 'text-gray-600 font-medium'}`}
                          >
                            {p}
                            {selectedProject === p && <CheckCircle2 className="w-4 h-4 text-[#FF6633]" />}
                          </button>
                        ))}
                     </div>
                   )}
                </div>

                <div className="h-10 w-[1px] bg-gray-200 hidden md:block" />

                {/* CENTER: ANALYTICAL WINDOW (QUICK TOGGLES) */}
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-1">Time Segment</span>
                   <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50">
                      {(['7d', '30d', 'all', 'custom'] as const).map(range => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-5 py-2 text-[12px] font-black rounded-xl transition-all duration-200 ${timeRange === range ? 'bg-white text-[#FF6633] shadow-md scale-[1.02]' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                        >
                          {range === '7d' ? '7D' : range === '30d' ? '30D' : range === 'all' ? 'Full Scope' : 'Custom'}
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            {/* RIGHT: DATA RANGE / PERIOD DISPLAY */}
            <div className="flex items-end flex-col gap-1">
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pr-1">Active Range</span>
               {timeRange === 'custom' ? (
                 <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border-2 border-[#FF6633]/20 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex flex-col group/date">
                       <input 
                         type="date" 
                         value={startDate} 
                         onChange={(e) => setStartDate(e.target.value)}
                         className="bg-transparent border-none p-0 text-[13px] font-black text-gray-900 focus:ring-0 cursor-pointer"
                       />
                       <span className="text-[8px] font-black text-[#FF6633] uppercase">Start Window</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col group/date">
                       <input 
                         type="date" 
                         value={endDate} 
                         onChange={(e) => setEndDate(e.target.value)}
                         className="bg-transparent border-none p-0 text-[13px] font-black text-gray-900 focus:ring-0 cursor-pointer"
                       />
                       <span className="text-[8px] font-black text-[#FF6633] uppercase">End Window</span>
                    </div>
                 </div>
               ) : (
                 <div className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-200 group cursor-default transition-all hover:bg-white hover:shadow-md">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                       <Calendar className="w-4 h-4 text-[#FF6633]" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[14px] font-black text-gray-900 leading-none">{format(selectedDate, "MMMM yyyy")}</span>
                       <span className="text-[10px] text-gray-500 font-bold mt-1">Summary Snapshot</span>
                    </div>
                 </div>
               )}
            </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
           {loading ? (
             <div className="flex items-center justify-center h-full py-20">
               <Loader2 className="w-10 h-10 animate-spin text-[#FF6633]" />
             </div>
           ) : data.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Icon className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">No insights for this period</h3>
               <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
                 Try expanding the time range or selecting a different date to see analytical records.
               </p>
             </div>
           ) : (
             <div className="max-w-6xl mx-auto space-y-8 pb-12">
               {/* Summary Stats */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Logs', value: data.length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
                   { label: 'Key Metrics', value: data.reduce((acc, curr) => acc + (curr.metrics?.length || 0), 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                   { label: 'Visual Checks', value: data.filter(d => d.photos?.length).length, icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
                   { label: 'Safety Issues', value: data.filter(d => d.activityType === 'Incidents').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                     <div className="flex items-center justify-between mb-4">
                       <div className={`p-2.5 ${stat.bg} ${stat.color} rounded-xl`}>
                         <stat.icon className="w-5 h-5" />
                       </div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Snapshot</span>
                     </div>
                     <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                     <p className="text-[13px] text-gray-500 font-medium mt-0.5">{stat.label}</p>
                   </div>
                 ))}
               </div>

               {/* Charts Container */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Bar Chart: Activity Distro */}
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                     <div>
                       <h3 className="text-lg font-bold text-gray-900 tracking-tight">Record Distribution</h3>
                       <p className="text-xs text-gray-500 mt-1 font-medium">Breakdown by activity type</p>
                     </div>
                     <div className="p-2 bg-gray-50 rounded-lg">
                       <BarChartIcon className="w-4 h-4 text-gray-400" />
                     </div>
                   </div>
                   <div className="h-[280px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={insightsMetrics?.chartData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                         <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }}
                            dy={10}
                         />
                         <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }} 
                         />
                         <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                         />
                         <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                           {insightsMetrics?.chartData.map((_entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                           ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 {/* Area Chart: Activity Trend */}
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                     <div>
                       <h3 className="text-lg font-bold text-gray-900 tracking-tight">Activity Momentum</h3>
                       <p className="text-xs text-gray-500 mt-1 font-medium">Daily record count trends</p>
                     </div>
                     <div className="p-2 bg-indigo-50 rounded-lg">
                       <TrendingUp className="w-4 h-4 text-indigo-500" />
                     </div>
                   </div>
                   <div className="h-[280px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={insightsMetrics?.trendData}>
                         <defs>
                           <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                         <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }}
                            dy={10}
                         />
                         <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }} 
                         />
                         <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                         />
                         <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorCount)" 
                         />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </div>

               {/* Detailed Logs List */}
               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 font_title">
                    <h4 className="text-[14px] font-black text-gray-900 uppercase tracking-widest">Core Insight Records</h4>
                    <span className="text-[12px] text-gray-400 font-medium">{data.length} entries</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-auto">
                    {data.slice(0, 50).map((item, idx) => (
                      <div key={item.id || idx} className="p-6 hover:bg-gray-50 transition-colors group">
                         <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">
                                 {item.employeeName?.charAt(0)}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[15px] font-bold text-gray-900">{item.employeeName}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded uppercase tracking-wider">{item.activityType}</span>
                                  </div>
                                  <p className="text-[14px] text-gray-600 leading-relaxed max-w-2xl">
                                    {item.action || item.metrics?.[0]?.value || 'Insight data record'}
                                  </p>
                                  <div className="flex items-center gap-4 mt-3">
                                     <div className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        {format(new Date(item.isoTimestamp || item.timestamp), "MMM d, h:mm a")}
                                     </div>
                                     {item.photos?.length > 0 && (
                                       <div className="flex items-center gap-1.5 text-[12px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                                          <ImageIcon className="w-3.5 h-3.5" />
                                          {item.photos.length} visual confirms
                                       </div>
                                     )}
                                  </div>
                               </div>
                            </div>
                            <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <MoreHorizontal className="w-5 h-5 text-gray-400" />
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
           )}
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No attachments found</h2>
              <p className="text-gray-500 max-w-[280px] mx-auto text-sm">
                There are currently no recorded attachments for this project period.
              </p>
            </div>
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
          photos={viewerState.list.map((f: any) => f.url)}
          initialIndex={viewerState.index}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
          metadata={viewerState.list[viewerState.index]}
        />
      </div>
    );
  }

  // Handle List Rendering (Table View) for all other modules
  return (
    <div className="h-full flex flex-col bg-gray-50 flex-1 overflow-hidden">
      <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0">
        <div className="relative w-[300px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633]/20 focus:border-[#FF6633] transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[180px_1fr_150px_60px] gap-4 items-center px-6 py-3 border-b border-gray-100 bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-1 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              Recorded By
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Findings / Summary</div>
            <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Time</div>
            <div></div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-gray-300" />
              <p className="text-sm font-medium">Fetching secure records...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title === "Insights" ? "No insights" : `No ${title.toLowerCase()} found`}
              </h3>
              <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
                {emptyMessage || (title === "Insights" ? "There are no automated insights gathered for this project period yet." : `There are no ${title.toLowerCase()} recorded for this project on ${format(selectedDate, "MMM d, yyyy")}.`)}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.map((item: any, idx: number) => {
                 const note = item.metrics?.find((m: any) => {
                    const l = (m.label || m.name || '').toLowerCase();
                    return l.includes('note') || l.includes('desc') || l.includes('summary');
                 })?.value || item.action || 'Daily inspection record';

                 return (
                  <div key={item.id || idx} className="grid grid-cols-[180px_1fr_150px_60px] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {item.employeeName?.charAt(0)}
                      </div>
                      <span className="text-[14px] text-gray-900 font-bold truncate">
                        {item.employeeName}
                      </span>
                    </div>
                    
                    <div className="text-[14px] text-gray-600 truncate pr-4">
                      {note}
                    </div>

                    <div className="flex items-center gap-2 text-[13px] text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {item.timestamp?.includes(' at ') ? item.timestamp.split(' at ')[1] : 'Manual'}
                    </div>

                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                 );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
