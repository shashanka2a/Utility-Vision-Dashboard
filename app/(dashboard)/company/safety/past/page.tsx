"use client";

import { Clock } from "lucide-react";

export default function PastTalksPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Past talks</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Table header */}
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Talk name</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Conducted by</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3}>
                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-7 h-7 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-base">No past safety talks</p>
                    <p className="text-gray-400 text-sm mt-1 max-w-xs">
                      Completed safety talks will appear here once your team conducts them.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
