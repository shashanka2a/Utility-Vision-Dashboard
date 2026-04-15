"use client";

import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  RotateCw, Moon, UserPlus, Send, ChevronDown, PenTool,
  Briefcase
} from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isWeekend, isPast } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";

function CalendarDropdown({
  selectedDate,
  onSelect,
  projectName,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  projectName: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const [daysWithData, setDaysWithData] = useState<Set<string>>(new Set());
  const [loadingDots, setLoadingDots] = useState(false);
  
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingDots(true);
      try {
        const params = new URLSearchParams();
        if (projectName && projectName !== "All Projects") params.set("project", projectName);
        const res = await fetch(`/api/reports?${params.toString()}`);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          if (!cancelled) setDaysWithData(new Set());
          return;
        }
        const set = new Set<string>();
        for (const r of data) {
          if (r?.date) set.add(String(r.date).slice(0, 10));
        }
        if (!cancelled) setDaysWithData(set);
      } catch {
        if (!cancelled) setDaysWithData(new Set());
      } finally {
        if (!cancelled) setLoadingDots(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectName, currentMonth]);

  const getStatusIndicator = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    if (daysWithData.has(dayStr)) {
      return <div className="w-1.5 h-1.5 rounded-full bg-green-500 mx-auto mt-0.5" />;
    }
    return <div className="h-2 w-2 mt-0.5" />;
  };

  return (
    <div className="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
      <div className="bg-[#FF7733] p-4 text-center">
        <h3 className="text-white font-bold text-lg">{format(selectedDate, "EEEE, MMM do")}</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200 shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-gray-900">{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200 shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-gray-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
          {days.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isSameMonthDay = isSameMonth(day, currentMonth);
            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelect(day)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${!isSameMonthDay ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg text-[13px] font-medium ${isSelected ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  {format(day, "d")}
                </div>
                {isSameMonthDay && getStatusIndicator(day)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DashboardHeader() {
  const { selectedDate, setSelectedDate, selectedProject, setSelectedProject } = useProject();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view = searchParams.get("view");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(data => {
      setProjects(["All Projects", ...data.map((p: any) => p.name)]);
    }).catch(console.error);
  }, []);

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const formattedDate = format(selectedDate, "EEE d MMM yyyy");

  const isInsightsView = view === "project-insights" || pathname.startsWith("/insights");
  const showProjectSelector = selectedProject === "All Projects" || isInsightsView;

  const getSignatureStatus = (date: Date) => {
    const dayStr = format(date, "yyyy-MM-dd");
    if (["2026-03-18", "2026-03-25", "2026-03-26", "2026-03-27", "2026-03-30", "2026-03-31"].includes(dayStr)) return "signed";
    if (['2026-03-02', '2026-03-09', '2026-03-16', '2026-03-23'].includes(dayStr)) return "draft";
    return "none";
  };

  const sigStatus = getSignatureStatus(selectedDate);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setCalendarOpen(false);
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) setProjectOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
      <div className="flex items-center gap-2">
        {/* Project Selector - Shown ONLY on Insights or when Global */}
        {showProjectSelector && (
          <div className="relative mr-2" ref={projectRef}>
            <button 
              onClick={() => setProjectOpen(!projectOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm min-w-[140px]"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#FF6633]" />
              <span className="truncate max-w-[120px]">{selectedProject}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            
            {projectOpen && (
              <div className="absolute top-12 left-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-1 animate-in fade-in slide-in-from-top-1">
                {projects.map(p => (
                  <button
                    key={p}
                    onClick={() => { setSelectedProject(p); setProjectOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedProject === p ? 'text-[#FF6633] font-bold bg-[#FFF3EF]' : 'text-gray-700'}`}
                  >
                    {p}
                    {selectedProject === p && <div className="w-1.5 h-1.5 rounded-full bg-[#FF6633]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={handleToday} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 font-medium hover:bg-gray-100 transition-colors">
          Today
        </button>
        
        <div className="flex items-center gap-1 ml-2">
          <button onClick={handlePrevDay} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="relative" ref={calendarRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setCalendarOpen(!calendarOpen); }}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white shadow-sm min-w-[180px] hover:border-gray-300 transition-colors"
            >
               <span className="text-sm text-gray-700 font-medium flex-1 text-left">{formattedDate}</span>
               <CalendarIcon className="w-4 h-4 text-gray-400" />
            </button>
            {calendarOpen && (
              <CalendarDropdown
                selectedDate={selectedDate}
                projectName={selectedProject}
                onSelect={(d) => {
                  setSelectedDate(d);
                  setCalendarOpen(false);
                }}
              />
            )}
          </div>

          <button onClick={handleNextDay} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-3">
          <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50">
            <RotateCw className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50">
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {sigStatus === 'signed' ? (
          <>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
               <PenTool className="w-3.5 h-3.5 text-green-500" />
               <div className="text-[11px] leading-tight">
                 <span className="text-gray-500">Signed by </span>
                 <span className="font-bold text-gray-800">ARTIFACT EMPLOYEE</span>
                 <br/>
                 <span className="text-gray-500 font-medium">on {format(selectedDate, "do MMM yyyy")}</span>
               </div>
            </div>
            <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Unsign</button>
          </>
        ) : sigStatus === 'draft' ? (
          <>
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
               <div className="w-2.5 h-[3px] rounded-full bg-yellow-400" />
               <div className="text-[11px] leading-tight">
                 <span className="text-yellow-700 font-semibold">Unsigned Draft</span>
                 <br/>
                 <span className="text-yellow-600 font-medium">Awaiting Signature</span>
               </div>
            </div>
            <button className="px-4 py-1.5 bg-[#FF6633] text-white rounded-lg text-[13px] font-semibold hover:bg-[#E55A2B] transition-colors shadow-sm">Sign Report</button>
          </>
        ) : (
          <button className="px-4 py-1.5 bg-[#FF6633] text-white rounded-lg text-[13px] font-semibold hover:bg-[#E55A2B] transition-colors shadow-sm">Sign Report</button>
        )}

        <div className="flex items-center gap-2 ml-1">
          <button className="p-2 bg-[#00A3FF] text-white rounded-lg shadow-sm hover:bg-[#0092E6] transition-colors"><UserPlus className="w-4 h-4" /></button>
          <button className="p-2 bg-[#00A3FF] text-white rounded-lg shadow-sm hover:bg-[#0092E6] transition-colors"><Send className="w-4 h-4" /></button>
          <div className="flex items-center">
            <button className="h-9 px-4 bg-[#00A3FF] text-white rounded-l-lg font-semibold text-[13px] hover:bg-[#0092E6] transition-colors shadow-sm">Reports</button>
            <button className="flex items-center justify-center w-9 h-9 bg-[#0089D7] text-white rounded-r-lg hover:bg-[#007ABF] transition-colors shadow-sm"><ChevronDown className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </header>
  );
}
