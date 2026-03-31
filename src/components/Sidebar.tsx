"use client";

import {
  LayoutDashboard, FolderOpen, Users, Building2,
  BarChart3, FileText, TrendingUp, Eye, ChevronDown,
  ChevronRight, Settings, HardHat, Clock, MessageSquare, Info, Shield, ClipboardList, BookOpen, Clock3, CalendarCheck,
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
  { id: "company",   label: "Company",   icon: Settings,         path: "/company" },
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
  if (pathname.startsWith("/time"))      return "time";
  if (pathname.startsWith("/messages"))  return "messages";
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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Project Selector (Top of white panel) */}
      <div className="p-5 border-b border-gray-100 mb-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2.5 rounded-lg text-[15px] text-left flex items-center justify-between transition-colors focus:outline-none"
          >
            <span className="text-gray-500 truncate font-medium">{selectedProject}</span>
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
      <div className="flex-1 overflow-y-auto w-full px-3 space-y-4">
        {DASHBOARD_SUB.map((item) => {
          if (item.children) {
            // Expandable group (Insights)
            const anyChildActive = item.children.some(c => pathname.startsWith(c.path));
            return (
              <div key={item.label} className="mb-0.5">
                <button
                  onClick={() => setInsightsOpen(o => !o)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[15px] rounded-lg transition-all focus:outline-none ${
                    anyChildActive
                      ? "text-gray-900 font-semibold bg-gray-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 fill-current/5" strokeWidth={1.5} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {insightsOpen
                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                    : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {insightsOpen && (
                  <div className="pl-11 pb-1 mt-0.5 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block py-2 pr-4 pl-2 text-[14px] rounded-md transition-colors ${
                          pathname.startsWith(child.path)
                            ? "text-[#FF6633] font-semibold bg-orange-50/50"
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
          const isActivity = item.label === "Activity";

          return (
            <Link
              key={item.label}
              href={item.path ?? "#"}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-[15px] rounded-lg transition-all mb-0.5 focus:outline-none ${
                isActive
                  ? "text-[#2196F3] font-semibold bg-[#2196F3]/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon 
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#2196F3] fill-[#2196F3]/10" : "fill-current/5"}`} 
                strokeWidth={1.5} 
              />
              <span>{item.label}</span>
            </Link>
          );

        })}
      </div>
    </div>

  );
}

// ─── Company sub-nav panel ─────────────────────────────────────────────────────
function CompanySubNav({ pathname }: { pathname: string }) {
  const [safetyOpen, setSafetyOpen] = useState(pathname.startsWith("/company/safety"));

  const COMPANY_NAV = [
    { label: "Company info", icon: Info, path: "/company" },
    { label: "Roles & permissions", icon: Shield, path: "/company/roles" },
    { label: "Project templates", icon: ClipboardList, path: "/company/templates" },
    {
      label: "Safety talks",
      icon: BookOpen,
      path: "/company/safety",
      children: [
        { label: "Library", path: "/company/safety/library", icon: BookOpen },
        { label: "Past talks", path: "/company/safety/past", icon: Clock3 },
        { label: "Upcoming", path: "/company/safety/upcoming", icon: CalendarCheck },
      ],
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-100 mb-4">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Company</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {COMPANY_NAV.map((item) => {
          const isActive = pathname === item.path || (item.children?.some(c => pathname.startsWith(c.path)));
          
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setSafetyOpen(!safetyOpen)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-[15px] rounded-lg transition-all ${
                    isActive ? "text-[#2196F3] bg-[#2196F3]/5 font-semibold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {safetyOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {safetyOpen && (
                  <div className="ml-9 mt-1 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`flex items-center gap-2 px-3 py-2 text-[15px] rounded-lg transition-colors ${
                          pathname === child.path ? "text-[#2196F3] font-semibold bg-[#2196F3]/5" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                         <child.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                         <span>{child.label}</span>
                      </Link>
                    ))}

                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 text-[15px] rounded-lg transition-all ${
                pathname === item.path ? "text-[#2196F3] bg-[#2196F3]/5 font-semibold" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-4 h-4 ${pathname === item.path ? "text-[#2196F3]" : ""}`} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


export function Sidebar() {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <aside className="flex h-full flex-shrink-0">
      {/* ── Icon rail ── */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-6 gap-6 relative">

        {/* Logo - UV Block */}
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
              className={`flex flex-col items-center gap-1.5 w-16 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gray-700/80 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-white/10" : "fill-current/5"}`} strokeWidth={1.5} />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}


        {/* Spacer + Settings at bottom */}
        <div className="flex-1" />
        
        {/* User avatar with Popup */}
        <div className="relative w-full flex flex-col items-center pb-4">
          {isUserMenuOpen && (
            <div className="absolute bottom-16 left-full ml-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="flex flex-col">
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium transition-colors">My profile</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium transition-colors">My projects</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium transition-colors">Notifications</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium transition-colors">Tasks</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium transition-colors">Email preferences</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium transition-colors">Help</button>
                <div className="h-px bg-gray-100 my-1" />
                <button className="px-6 py-3 text-left text-red-500 hover:bg-red-50 text-[15px] font-semibold transition-colors">Log out</button>
              </div>
            </div>
          )}
          
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center transition-all cursor-pointer border-2 shadow-sm ${
              isUserMenuOpen ? 'border-orange-500 bg-gray-500 scale-110' : 'border-gray-700'
            }`}
          >
            <span className="text-white text-xs font-semibold">U</span>
          </div>
        </div>
      </div>



      {/* ── Sub-nav panel ── */}
      {activeSection === "dashboard" && (
        <DashboardSubNav pathname={pathname} />
      )}
      {activeSection === "company" && (
        <CompanySubNav pathname={pathname} />
      )}
    </aside>

  );
}
