"use client";

import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  RotateCw, Moon, UserPlus, Send, ChevronDown, PenTool 
} from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { format, addDays, subDays } from "date-fns";

export function DashboardHeader() {
  const { selectedDate, setSelectedDate } = useProject();

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const formattedDate = format(selectedDate, "EEE d MMM yyyy");

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
          
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white shadow-sm min-w-[180px]">
             <span className="text-sm text-gray-700 font-medium flex-1">{formattedDate}</span>
             <CalendarIcon className="w-4 h-4 text-gray-400" />
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
        <div className="h-8 w-px bg-gray-200" />
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[#FFBD8E]/30 text-[#E55A2B] rounded-lg text-sm font-semibold hover:bg-[#FFBD8E]/40 transition-colors">
          <PenTool className="w-4 h-4" />
          <span>Sign</span>
        </button>

        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 bg-[#00A3FF] text-white rounded-lg shadow-sm hover:bg-[#0092E6] transition-colors">
            <UserPlus className="w-5 h-5" />
          </button>
          <button className="p-2 bg-[#90CDF4] text-white rounded-lg shadow-sm hover:bg-[#7FB8DB] transition-colors">
            <Send className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            <button className="flex items-center gap-2 h-9 px-4 bg-[#00A3FF] text-white rounded-l-lg font-semibold text-sm hover:bg-[#0092E6] transition-colors">
              Reports
            </button>
            <button className="flex items-center justify-center w-9 h-9 bg-[#0089D7] text-white rounded-r-lg hover:bg-[#007ABF] transition-colors border-l border-[#00A3FF]/20">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
