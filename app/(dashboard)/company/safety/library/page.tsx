"use client";

import { Search, Plus, Calendar, Download, MoreHorizontal, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TALKS = [
  "3 Types of Poor Housekeeping Hazards",
  "Automated External Defibrillator (AED)",
  "Back Injuries and Prevention (Spanish)",
  "Back Injury and Prevention Safety",
  "Back Protection",
  "Back Protection (Spanish)",
  "Burns",
  "Cold Stress",
  "Coronavirus (COVID-19)"
];

export default function SafetyLibraryPage() {
  const [search, setSearch] = useState("");

  const filtered = TALKS.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        
        <div className="flex items-center gap-3">

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633]/20 w-64 transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2BD166] text-white text-sm font-semibold rounded-lg hover:bg-[#25b85a] transition-colors shadow-sm">
            <Calendar className="w-4 h-4" />
            Bulk schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2196F3] text-white text-sm font-semibold rounded-lg hover:bg-[#1e88e5] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Upload talk
          </button>
          <button className="p-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1e88e5] transition-colors shadow-sm">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Table Head */}
        <div className="bg-gray-50/50 border-b border-gray-200 py-3 px-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Talk name</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {filtered.map((talk, idx) => (
            <div key={idx} className="group flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <span className="text-[15px] text-gray-800 font-medium">{talk}</span>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500 italic">
              No talks found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
