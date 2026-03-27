"use client";

import { Search, Plus, MoreHorizontal, ChevronLeft, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TEMPLATES = [
  { name: "Default Template", isFavorite: false },
  { name: "Wicking Jobs Template", isFavorite: true },
];

export default function ProjectTemplatesPage() {
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project templates</h1>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2BD166] text-white text-sm font-semibold rounded-lg hover:bg-[#25b85a] transition-colors shadow-sm">

          <Plus className="w-4 h-4" />
          Project template
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633]/20 w-64 transition-shadow bg-gray-50/50"
        />
      </div>

      {/* List Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Table Head */}
        <div className="bg-gray-50/50 border-b border-gray-200 py-3 px-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Template name</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {filtered.map((template, idx) => (
            <div key={idx} className="group flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-base text-gray-800 font-medium">{template.name}</span>
                {template.isFavorite && <Star className="w-4 h-4 fill-gray-900 text-gray-900" />}
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500 italic">
              No templates found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
