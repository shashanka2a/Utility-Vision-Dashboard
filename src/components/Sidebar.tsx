"use client";

import { ChevronDown, BarChart3, FileText, TrendingUp, FolderOpen, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const projects = [
  { id: "all", name: "All Projects" },
  { id: "storey-bend", name: "Storey Bend Wicking Project" },
  { id: "redlands", name: "Redlands Wicking Project" },
  { id: "oakwood", name: "Oakwood Infrastructure" },
];

const navItems = [
  { path: "/activity", icon: BarChart3, label: "Activity" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/daily-logs", icon: TrendingUp, label: "Daily logs" },
  { path: "/projects", icon: FolderOpen, label: "Projects" },
  { path: "/directory", icon: Users, label: "Directory" },
  { path: "/company", icon: Building2, label: "Company" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("all");

  const selectedProjectName = projects.find((p) => p.id === selectedProject)?.name ?? "Select project";

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6633] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">UV</span>
          </div>
          <span className="font-semibold">Utility Vision</span>
        </Link>
      </div>

      <div className="px-3 py-4 border-b border-gray-700">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="w-full bg-black hover:bg-gray-700 px-3 py-2 rounded text-sm text-left flex items-center justify-between transition-colors"
          >
            <span className="text-gray-300 truncate">{selectedProjectName}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </button>
          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black rounded shadow-lg z-10 border border-gray-700">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setSelectedProject(project.id);
                    setIsProjectDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  {project.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            href={path}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
              pathname === path
                ? "bg-black text-white border-l-2 border-[#FF6633]"
                : "text-gray-500 hover:bg-gray-700 hover:text-gray-300"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="flex-1 text-left text-sm">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
