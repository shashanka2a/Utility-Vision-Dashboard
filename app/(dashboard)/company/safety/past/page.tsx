"use client";

import { Clock, FileText, Calendar } from "lucide-react";

export default function PastTalksPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Past talks</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr,180px,160px] bg-gray-50/50 border-b border-gray-200 py-3 px-6 gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Talk name</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conducted by</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-base">No past safety talks</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              Completed safety talks will appear here once your team conducts them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
