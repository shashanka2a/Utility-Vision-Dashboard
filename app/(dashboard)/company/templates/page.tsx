"use client";

import { Search, Plus, MoreHorizontal, FileText } from "lucide-react";
import { useState } from "react";

// Initializing as empty to remove mock data
const TEMPLATES: any[] = [];

export default function ProjectTemplatesPage() {
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project templates</h1>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
          <Plus className="w-4 h-4" />
          Create template
        </button>
      </div>

      {/* List Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Table Head */}
        <div className="bg-gray-50/50 border-b border-gray-200 py-3 px-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Template name</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold text-base">No project templates</p>
                <p className="text-gray-400 text-sm mt-1 max-w-xs px-6">
                  Create templates to quickly set up new projects with predefined structures and settings.
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors mt-2">
                <Plus className="w-4 h-4" />
                Create your first template
              </button>
            </div>
          ) : (
            filtered.map((template, idx) => (
              <div key={idx} className="group flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-base text-gray-800 font-medium">{template.name}</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
