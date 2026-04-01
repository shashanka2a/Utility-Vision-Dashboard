"use client";

import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  RotateCw, Moon, UserPlus, Send, ChevronDown, PenTool 
} from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isWeekend, isPast } from "date-fns";
import { useState, useRef, useEffect } from "react";

function CalendarDropdown({ selectedDate, onSelect }: { selectedDate: Date, onSelect: (date: Date) => void }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getStatusIndicator = (day: Date) => {
    // Mocking logic to recreate the user's screenshot exactly
    const dayStr = format(day, "yyyy-MM-dd");
    
    // Some hardcoded days from the screenshot for exact matching 
    if (dayStr === "2026-03-18" || dayStr === "2026-03-25" || dayStr === "2026-03-26" || dayStr === "2026-03-27" || dayStr === "2026-03-30" || dayStr === "2026-03-31") {
      return <div className="w-1.5 h-1.5 rounded-full bg-green-500 mx-auto mt-0.5" />; // Green Dot (Signed)
    }
    
    // Randomly assign yellow to some past non-weekend days for demonstration
    if (['2026-03-02', '2026-03-09', '2026-03-16', '2026-03-23'].includes(dayStr)) {
       return <div className="w-2.5 h-[3px] rounded-full bg-yellow-400 mx-auto mt-0.5" />; // Yellow Bar (Draft)
    }

    // Default missing logic
    if (isPast(day) && !isWeekend(day) && !isToday(day)) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[8px] h-[8px] text-red-500 mx-auto mt-0.5">
          <path d="M12 2L22 20H2L12 2Z" />
        </svg>
      ); // Red Triangle (Missing)
    }
    
    return <div className="h-2 w-2 mt-0.5" />; // Empty placeholder
  };

  return (
    <div className="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
      {/* Orange Header */}
      <div className="bg-[#FF7733] p-4 text-center">
        <h3 className="text-white font-bold text-lg">{format(selectedDate, "EEEE, MMM do")}</h3>
      </div>
      
      <div className="p-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200 shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-gray-900">{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200 shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-gray-500">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2">
          {days.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isSameMonthDay = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelect(day)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  !isSameMonthDay ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg text-[13px] font-medium ${
                  isSelected ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}>
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
  const { selectedDate, setSelectedDate } = useProject();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const formattedDate = format(selectedDate, "EEE d MMM yyyy");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If clicking inside the calendar container, don't close it
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
      {/* Left side: Date Filter */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleToday}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium hover:bg-gray-100 transition-colors"
        >
          Today
        </button>
        
        <div className="flex items-center gap-1 ml-2">
          <button 
            onClick={handlePrevDay}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="relative" ref={calendarRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setCalendarOpen(!calendarOpen); }}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white shadow-sm min-w-[180px] hover:border-gray-300 transition-colors"
            >
               <span className="text-sm text-gray-700 font-medium flex-1 text-left pointer-events-none">{formattedDate}</span>
               <CalendarIcon className="w-4 h-4 text-gray-400 pointer-events-none" />
            </button>
            
            {calendarOpen && (
              <CalendarDropdown 
                selectedDate={selectedDate} 
                onSelect={(d) => {
                  setSelectedDate(d);
                  setCalendarOpen(false);
                }} 
              />
            )}
          </div>

          <button 
            onClick={handleNextDay}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 ml-4 border-l border-gray-200 pl-4">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <RotateCw className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Example signature status based on screenshot */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
           <PenTool className="w-3.5 h-3.5 text-green-500" />
           <div className="text-[11px] leading-tight">
             <span className="text-gray-500">Signed by </span>
             <span className="font-bold text-gray-800">ARTIFACT EMPLOYEE</span>
             <br/>
             <span className="text-gray-500 font-medium">on 10th Mar 2026</span>
           </div>
        </div>

        <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          Unsign
        </button>

        <div className="flex items-center gap-2 ml-1">
          <button className="p-2 bg-[#00A3FF] text-white rounded-lg shadow-sm hover:bg-[#0092E6] transition-colors">
            <UserPlus className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#00A3FF] text-white rounded-lg shadow-sm hover:bg-[#0092E6] transition-colors">
            <Send className="w-4 h-4" />
          </button>
          
          <div className="flex items-center">
            <button className="flex items-center gap-2 h-9 px-4 bg-[#00A3FF] text-white rounded-l-lg font-semibold text-[13px] hover:bg-[#0092E6] transition-colors shadow-sm">
              Reports
            </button>
            <button className="flex items-center justify-center w-9 h-9 bg-[#0089D7] text-white rounded-r-lg hover:bg-[#007ABF] transition-colors shadow-sm">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

