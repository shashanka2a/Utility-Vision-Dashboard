"use client";

import {
  LayoutDashboard, FolderOpen, Users, Building2,
  BarChart3, FileText, TrendingUp, Eye, ChevronDown,
  ChevronRight, Settings,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProject } from "@/context/ProjectContext";




// ─── Main nav items ────────────────────────────────────────────────────────────
const MAIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/activity" },
  { id: "projects",  label: "Projects",  icon: FolderOpen,      path: "/projects" },
  { id: "directory", label: "Directory", icon: Users,            path: "/directory" },
  { id: "company",   label: "Company",   icon: Building2,        path: "/company" },
] as const;

// ─── Dashboard sub-nav ─────────────────────────────────────────────────────────
const DASHBOARD_SUB = [
  {
    label: "Activity",
    icon: BarChart3,
    path: "/activity",
    children: null,
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/reports",
    children: null,
  },
  {
    label: "Insights",
    icon: TrendingUp,
    path: null,
    children: [
      { label: "Daily logs", path: "/daily-logs" },
    ],
  },
];

// Projects will be fetched from DB
interface ProjectOption {
  id: string;
  name: string;
}



// ─── Which main-nav section is active ─────────────────────────────────────────
function getActiveSection(pathname: string) {
  if (["/activity", "/reports", "/daily-logs", "/live-views"].some(p => pathname.startsWith(p))) return "dashboard";
  if (pathname.startsWith("/projects"))  return "projects";
  if (pathname.startsWith("/directory")) return "directory";
  if (pathname.startsWith("/company"))   return "company";
  return "dashboard";
}

// ─── Dashboard sub-nav panel ───────────────────────────────────────────────────
function DashboardSubNav({ pathname }: { pathname: string }) {
  const { selectedProject, setSelectedProject } = useProject();
  const [insightsOpen, setInsightsOpen] = useState(pathname.startsWith("/daily-logs"));
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  // Fetch real projects from DB
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects([{ id: 'all', name: 'All Projects' }, ...data]);
        }
      })
      .catch(() => {});
  }, []);

  const handleProjectSelect = (name: string) => {
    setSelectedProject(name);
    setIsProjectDropdownOpen(false);
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Project Selector (Top of white panel) */}
      <div className="p-4 border-b border-gray-100 mb-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6633]/20"
          >
            <span className="text-gray-700 truncate font-medium">{selectedProject}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          </button>

          
          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-20 border border-gray-100 py-1 max-h-[300px] overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleProjectSelect(project.name)}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                    selectedProject === project.name ? 'text-[#FF6633] font-medium bg-orange-50/50' : 'text-gray-600'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto w-full px-2">
        {DASHBOARD_SUB.map((item) => {
          if (item.children) {
            // Expandable group (Insights)
            const anyChildActive = item.children.some(c => pathname.startsWith(c.path));
            return (
              <div key={item.label} className="mb-0.5">
                <button
                  onClick={() => setInsightsOpen(o => !o)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none ${
                    anyChildActive
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {insightsOpen
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                {insightsOpen && (
                  <div className="pl-10 pb-1 mt-0.5 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block py-2 pr-3 pl-2 text-sm rounded-lg transition-colors ${
                          pathname.startsWith(child.path)
                            ? "text-blue-600 font-medium bg-blue-50/50"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Regular item
          const isActive = item.path && pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              href={item.path ?? "#"}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors mb-0.5 focus:outline-none ${
                isActive
                  ? "text-blue-600 font-semibold bg-blue-50/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);

  return (
    <aside className="flex h-full flex-shrink-0">
      {/* ── Icon rail ── */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-8 gap-6">
        {/* Logo */}
        <div className="w-12 h-12 bg-[#FF6633] rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 shadow-lg shadow-orange-500/10">
          <span className="text-white font-bold text-base">UV</span>
        </div>


        {MAIN_NAV.map(({ id, label, icon: Icon, path }) => {
          const isActive = activeSection === id;
          return (
            <Link
              key={id}
              href={path}
              title={label}
              className={`flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}

        {/* Spacer + Settings at bottom */}
        <div className="flex-1" />
        <Link
          href="/company"
          title="Settings"
          className="flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-all mb-1"
        >
          <Settings className="w-5 h-5" />
        </Link>
        {/* User avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mb-2 hover:bg-gray-500 transition-colors cursor-pointer border-2 border-gray-700">
          <span className="text-white text-xs font-medium">U</span>
        </div>
      </div>


      {/* ── Sub-nav panel (only for Dashboard section) ── */}
      {activeSection === "dashboard" && (
        <DashboardSubNav pathname={pathname} />
      )}
    </aside>
  );
}
