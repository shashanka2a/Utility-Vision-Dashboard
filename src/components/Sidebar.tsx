"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, FileText, TrendingUp, Calendar, LayoutDashboard,
  Briefcase, ChevronDown, Users, Image, Settings,
  Shield, Info, ClipboardList, ChevronRight,
  FolderOpen, CloudRain, BookOpen, Clock3, CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProject } from "@/context/ProjectContext";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ProjectOption { id: string; name: string; }

// ─── Main icon-rail nav ────────────────────────────────────────────────────────
const MAIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/activity" },
  { id: "projects",  label: "Projects",  icon: FolderOpen,      path: "/projects" },
  { id: "directory", label: "Directory", icon: Users,            path: "/directory" },
  { id: "company",   label: "Company",   icon: Settings,         path: "/company" },
] as const;

// ─── Which main-nav icon is active ─────────────────────────────────────────────
function getActiveSection(pathname: string) {
  if (["/activity", "/reports", "/insights", "/daily-logs", "/live-views"].some(p => pathname.startsWith(p))) return "dashboard";
  if (pathname.startsWith("/projects"))  return "projects";
  if (pathname.startsWith("/directory")) return "directory";
  if (pathname.startsWith("/company"))   return "company";
  return "dashboard";
}

// ─── Dashboard sub-nav (ALWAYS Activity / Reports / Insights) ──────────────────
// NOTE: This is completely independent of project selection. Never changes.
function DashboardSubNav({ pathname }: { pathname: string }) {
  const NAV = [
    { label: "Activity", icon: BarChart3, path: "/activity" },
    { label: "Reports",  icon: FileText,  path: "/reports" },
    {
      label: "Insights",
      icon: TrendingUp,
      path: "/insights",
      children: [{ label: "Daily summary", path: "/insights/summary" }],
    },
  ];

  const [insightsOpen, setInsightsOpen] = useState(pathname.startsWith("/insights"));

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-100 mb-2">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pt-2">
        {NAV.map((item) => {
          const isActive = pathname.startsWith(item.path);
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setInsightsOpen(o => !o)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[15px] rounded-lg transition-all focus:outline-none ${
                    isActive ? "text-[#2196F3] bg-[#2196F3]/5 font-semibold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#2196F3]" : "text-gray-400"}`} strokeWidth={1.5} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {insightsOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {insightsOpen && (
                  <div className="ml-9 mt-1 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block px-3 py-2 text-[14px] rounded-lg transition-colors ${
                          pathname === child.path ? "text-[#2196F3] font-semibold bg-[#2196F3]/5" : "text-gray-500 hover:text-gray-900"
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
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-[15px] rounded-lg transition-all mb-0.5 focus:outline-none ${
                isActive ? "text-[#2196F3] font-semibold bg-[#2196F3]/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#2196F3]" : "text-gray-400"}`} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Project detail sub-nav (ONLY shown on /projects/dashboard) ────────────────
const PROJECT_NAV = [
  {
    label: "Dashboard", icon: LayoutDashboard,
    children: [
      { label: "Activity",  view: "activity" },
      { label: "Reports",   view: "reports" },
      { label: "Insights",  view: "project-insights" },
    ],
  },
  {
    label: "Daily logs", icon: Calendar,
    children: [
      { label: "Work logs",   view: "work-logs" },
      { label: "Notes",       view: "notes" },
      { label: "Attachments", view: "attachments" },
      { label: "Survey",      view: "survey" },
    ],
  },
  {
    label: "Safety & QC", icon: Briefcase,
    children: [
      { label: "Checklists",    view: "checklists" },
      { label: "Toolbox talks", view: "toolbox-talks" },
      { label: "Observations",  view: "observations" },
      { label: "Incidents",     view: "incidents" },
      { label: "Insights",      view: "safety-insights" },
    ],
  },
  { label: "Directory", icon: Users,    view: "directory" },
  { label: "Gallery",   icon: Image,    view: "gallery" },
  { label: "Settings",  icon: Settings, view: "settings" },
];

function ProjectSubNav({ currentView }: { currentView: string }) {
  const { selectedProject } = useProject();
  
  // Start with only the group containing the active view being open
  const defaultOpen = PROJECT_NAV.find(group => 
    group.children?.some(c => ('view' in c ? c.view : null) === currentView)
  )?.label ?? "Dashboard";

  const [openGroups, setOpenGroups] = useState<string[]>([defaultOpen]);
  const toggle = (label: string) =>
    setOpenGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white">      {/* Weather widget */}
      <div className="px-4 pt-4 pb-3">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
          <CloudRain className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div>
            <div className="text-gray-900 font-bold text-base leading-none">66° / 83°</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Rain expected</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {PROJECT_NAV.map((item) => {
          const isGroup = !!item.children;
          const isOpen = openGroups.includes(item.label);
          const itemView = 'view' in item ? item.view : null;

          const isActiveGroup = item.children?.some(c => ('view' in c ? c.view : null) === currentView);
          const isActive = itemView === currentView;

          if (isGroup) {
            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => toggle(item.label)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[15px] rounded-lg transition-all focus:outline-none ${
                    isActiveGroup ? "text-[#2196F3] bg-[#2196F3]/5 font-semibold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActiveGroup ? "text-[#2196F3]" : "text-gray-400"}`} strokeWidth={1.5} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {item.children?.map(child => {
                      const childView = 'view' in child ? child.view : '';
                      const isChildActive = childView === currentView;
                      return (
                        <Link
                          key={child.label}
                          href={`/projects/dashboard?project=${encodeURIComponent(selectedProject)}&view=${childView}`}
                          className={`block py-2 pr-4 text-[14px] rounded-lg transition-colors ${
                            isChildActive
                              ? "bg-[#252525] text-[#2196F3] font-semibold pl-4 ml-8"
                              : "text-gray-500 hover:text-gray-900 ml-11 pl-0"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={`/projects/dashboard?project=${encodeURIComponent(selectedProject)}&view=${itemView}`}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-[15px] rounded-lg transition-all mb-0.5 focus:outline-none ${
                isActive ? "text-[#2196F3] font-semibold bg-[#2196F3]/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#2196F3]" : "text-gray-400"}`} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Company sub-nav ───────────────────────────────────────────────────────────
function CompanySubNav({ pathname }: { pathname: string }) {
  const [safetyOpen, setSafetyOpen] = useState(pathname.startsWith("/company/safety"));

  const COMPANY_NAV = [
    { label: "Company info",        icon: Info,          path: "/company" },
    { label: "Roles & permissions", icon: Shield,        path: "/company/roles" },
    { label: "Project templates",   icon: ClipboardList, path: "/company/templates" },
    {
      label: "Safety talks", icon: BookOpen, path: "/company/safety",
      children: [
        { label: "Library",      path: "/company/safety/library",   icon: BookOpen },
        { label: "Past talks",   path: "/company/safety/past",      icon: Clock3 },
        { label: "Upcoming",     path: "/company/safety/upcoming",  icon: CalendarCheck },
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

// ─── Project selector dropdown (used inside the project detail view header) ─────
function ProjectSelectorDropdown() {
  const router = useRouter();
  const { selectedProject, setSelectedProject } = useProject();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProjects(data); })
      .catch(() => {});
  }, []);

  const select = (name: string) => {
    setSelectedProject(name);
    setOpen(false);
    // Explicitly navigate to dashboard with newly selected project context
    router.push(`/projects/dashboard?project=${encodeURIComponent(name)}&view=activity`);
  };

  return (
    <div className="px-4 pt-4 pb-2 relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2.5 rounded-lg text-[15px] text-left flex items-center justify-between transition-colors focus:outline-none"
      >
        <span className="text-gray-900 truncate font-semibold">{selectedProject}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-lg shadow-lg z-20 border border-gray-100 py-1 max-h-[300px] overflow-y-auto">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => select(p.name)}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                selectedProject === p.name ? "text-[#2196F3] font-medium bg-[#2196F3]/5" : "text-gray-600"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar export ───────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSection = getActiveSection(pathname);
  const { selectedProject, setSelectedProject } = useProject();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isProjectDetail = pathname.startsWith("/projects/dashboard");
  const currentView = searchParams?.get("view") ?? "activity";

  return (
    <aside className="flex h-full flex-shrink-0">
      {/* ── Icon rail ── */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-6 gap-6 relative">
        <div className="w-12 h-12 bg-[#FF6633] rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 shadow-lg shadow-orange-500/10">
          <span className="text-white font-bold text-base">UV</span>
        </div>

        {MAIN_NAV.map(({ id, label, icon: Icon, path }) => {
          const isActive = activeSection === id;
          // Dashboard icon resets project selection so Activity shows all projects
          if (id === "dashboard") {
            return (
              <button
                key={id}
                onClick={() => { setSelectedProject("All Projects"); router.push(path); }}
                title={label}
                className={`flex flex-col items-center gap-1.5 w-16 py-3 rounded-xl transition-all ${
                  isActive ? "bg-gray-700/80 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-white/10" : "fill-current/5"}`} strokeWidth={1.5} />
                <span className="text-[10px] font-semibold leading-none">{label}</span>
              </button>
            );
          }
          return (
            <Link
              key={id}
              href={path}
              title={label}
              className={`flex flex-col items-center gap-1.5 w-16 py-3 rounded-xl transition-all ${
                isActive ? "bg-gray-700/80 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-white/10" : "fill-current/5"}`} strokeWidth={1.5} />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* User avatar */}
        <div className="relative w-full flex flex-col items-center pb-4">
          {isUserMenuOpen && (
            <div className="absolute bottom-16 left-full ml-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50">
              <div className="flex flex-col">
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium">My profile</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium">My projects</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium">Notifications</button>
                <button className="px-6 py-3 text-left text-gray-700 hover:bg-gray-50 text-[15px] font-medium">Help</button>
                <div className="h-px bg-gray-100 my-1" />
                <button className="px-6 py-3 text-left text-red-500 hover:bg-red-50 text-[15px] font-semibold">Log out</button>
              </div>
            </div>
          )}
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center transition-all cursor-pointer border-2 shadow-sm ${
              isUserMenuOpen ? "border-orange-500 bg-gray-500 scale-110" : "border-gray-700"
            }`}
          >
            <span className="text-white text-xs font-semibold">U</span>
          </div>
        </div>
      </div>

      {/* ── Sub-nav panel: one of three, mutually exclusive ── */}

      {/* 1. Dashboard (Activity/Reports/Insights) — only when on /activity* etc. */}
      {activeSection === "dashboard" && <DashboardSubNav pathname={pathname} />}

      {/* 2. Project detail — only when on /projects/dashboard route */}
      {isProjectDetail && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <ProjectSelectorDropdown />
          <ProjectSubNav currentView={currentView} />
        </div>
      )}

      {/* 3. Company */}
      {activeSection === "company" && <CompanySubNav pathname={pathname} />}
    </aside>
  );
}
