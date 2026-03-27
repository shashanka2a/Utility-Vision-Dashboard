"use client";

import { CalendarCheck, Plus } from "lucide-react";

export default function UpcomingTalksPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming talks</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Schedule talk
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr,180px,180px,120px] bg-gray-50/50 border-b border-gray-200 py-3 px-6 gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Talk name</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned to</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled date</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <CalendarCheck className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-base">No upcoming talks scheduled</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              Schedule safety talks from the Library to assign them to your team.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            Schedule a talk
          </button>
        </div>
      </div>
    </div>
  );
}
