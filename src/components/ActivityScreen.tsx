"use client";

import { Calendar, SlidersHorizontal, Search, LayoutGrid, X, Loader2, ChevronDown } from 'lucide-react';
import { ActivityCard } from './ActivityCard';
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  employeeName: string;
  action: string;
  project: string;
  activityType: string;
  timestamp: string;
  metrics: { label: string; value: string; unit: string; highlight?: boolean; id?: string }[];
  photos: string[];
}

interface Filters {
  projects: string[];
  members: string[];
  activityTypes: string[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  'Notes', 'Chemicals', 'Metrics', 'Survey', 'Checklists',
  'Attachments', 'Observations', 'Incidents', 'Safety Talks', 'Activity',
];

// Map action text → activity type for mock data
function inferType(action: string): string {
  if (action.includes('note'))        return 'Notes';
  if (action.includes('chemical'))    return 'Chemicals';
  if (action.includes('material'))    return 'Metrics';
  if (action.includes('inspection'))  return 'Checklists';
  if (action.includes('equipment'))   return 'Checklists';
  return 'Activity';
}

const mockActivities: Activity[] = [
  {
    id: '1', employeeName: 'William Barfield',
    action: 'submitted a material log in', project: 'Caloosahatchee Wicking Project',
    activityType: 'Metrics', timestamp: '8:19 PM | 2026-03-24 for 2026-03-23',
    metrics: [{ label: 'SPRAYING: Super Dye', value: '24', unit: 'oz.', highlight: true }],
    photos: [],
  },
  {
    id: '2', employeeName: 'Ricky Smith',
    action: 'submitted a general note in', project: 'Storey Bend Wicking Project',
    activityType: 'Notes', timestamp: '5:32 AM | 2026-03-25 for 2026-03-24',
    metrics: [{ label: 'EQUIPMENT: Kubota', value: '4.5', unit: 'hrs', highlight: true }],
    photos: [
      'https://images.unsplash.com/photo-1637531347055-4fa8aa80c111?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1759579471231-4e68075ebc76?w=200&h=200&fit=crop',
    ],
  },
  {
    id: '3', employeeName: 'Sarah Johnson',
    action: 'completed daily inspection for', project: 'Redlands Wicking Project',
    activityType: 'Checklists', timestamp: '8:15 AM | 2026-03-25 for 2026-03-25',
    metrics: [{ label: 'AREA COMPLETED', value: '15.2', unit: 'Acres', highlight: true, id: 'ACRES-003' }],
    photos: [],
  },
  {
    id: '4', employeeName: 'Mike Torres',
    action: 'submitted equipment maintenance log in', project: 'Oakwood Infrastructure',
    activityType: 'Checklists', timestamp: '7:45 PM | 2026-03-24 for 2026-03-24',
    metrics: [{ label: 'MAINTENANCE: Filter Check', value: '1', unit: 'session', highlight: true }],
    photos: ['https://images.unsplash.com/photo-1759579471231-4e68075ebc76?w=200&h=200&fit=crop'],
  },
];

// ─── Multi-select pill component ─────────────────────────────────────────────

function MultiSelect({
  label, placeholder, options, selected, onChange, searchable = false,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = searchable
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
      >
        <span className={selected.length ? 'text-gray-900' : 'text-gray-400'}>
          {selected.length === 0
            ? placeholder
            : selected.length === 1
            ? selected[0]
            : `${selected.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-hidden flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}…`}
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FF6633]"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No options found</p>
            ) : filtered.map(opt => (
              <label key={opt} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="w-4 h-4 text-[#FF6633] border-gray-300 rounded focus:ring-[#FF6633]"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFE5DC] text-[#E55A2B] rounded-full text-xs font-medium">
              {s}
              <button type="button" onClick={() => toggle(s)} className="hover:text-[#FF6633] focus:outline-none">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filters Modal ────────────────────────────────────────────────────────────

function FiltersModal({
  isOpen, onClose, applied, onApply, projectOptions, memberOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  applied: Filters;
  onApply: (f: Filters) => void;
  projectOptions: string[];
  memberOptions: string[];
}) {
  const [draft, setDraft] = useState<Filters>(applied);

  // Sync when modal opens
  useEffect(() => { if (isOpen) setDraft(applied); }, [isOpen, applied]);

  if (!isOpen) return null;

  const activeCount = draft.projects.length + draft.members.length + draft.activityTypes.length;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Row 1: Project + Member */}
          <div className="grid grid-cols-2 gap-4">
            <MultiSelect
              label="Project"
              placeholder="Select projects"
              options={projectOptions}
              selected={draft.projects}
              onChange={v => setDraft(d => ({ ...d, projects: v }))}
              searchable
            />
            <MultiSelect
              label="Member"
              placeholder="Search members"
              options={memberOptions}
              selected={draft.members}
              onChange={v => setDraft(d => ({ ...d, members: v }))}
              searchable
            />
          </div>

          {/* Row 2: Activity type */}
          <MultiSelect
            label="Activity type"
            placeholder="Activity type"
            options={ACTIVITY_TYPES}
            selected={draft.activityTypes}
            onChange={v => setDraft(d => ({ ...d, activityTypes: v }))}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => setDraft({ projects: [], members: [], activityTypes: [] })}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
          >
            Clear All
          </button>
          <button
            onClick={() => { onApply(draft); onClose(); }}
            className="px-5 py-2 text-sm font-medium text-white bg-[#FF6633] hover:bg-[#E55A2B] rounded-lg transition-colors shadow-sm"
          >
            Apply{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = { projects: [], members: [], activityTypes: [] };

export function ActivityScreen() {
  const [activities] = useState<Activity[]>(mockActivities);
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [memberOptions, setMemberOptions] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // ── Fetch project & employee names from DB ──────────────────────────────────
  const fetchMeta = useCallback(async () => {
    try {
      const [projRes, empRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/employees'),
      ]);
      const [projects, employees] = await Promise.all([projRes.json(), empRes.json()]);
      setProjectOptions(projects.map((p: { name: string }) => p.name));
      setMemberOptions(employees.map((e: { name: string }) => e.name));
    } catch {
      // silent — filters will just show empty options
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  // ── Derive filter badge count ──────────────────────────────────────────────
  const activeFilterCount =
    appliedFilters.projects.length +
    appliedFilters.members.length +
    appliedFilters.activityTypes.length;

  // ── Client-side filter ────────────────────────────────────────────────────
  const filtered = activities.filter(a => {
    const q = search.toLowerCase();
    if (q && !a.employeeName.toLowerCase().includes(q) &&
             !a.project.toLowerCase().includes(q) &&
             !a.action.toLowerCase().includes(q)) return false;
    if (appliedFilters.projects.length && !appliedFilters.projects.includes(a.project)) return false;
    if (appliedFilters.members.length  && !appliedFilters.members.includes(a.employeeName)) return false;
    if (appliedFilters.activityTypes.length && !appliedFilters.activityTypes.includes(a.activityType)) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Activity</h1>
            <p className="text-sm text-gray-500 mt-0.5">Recent activity across all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{filtered.length} records</span>
            <span className="w-2 h-2 bg-[#4CAF50] rounded-full" aria-label="Live" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </button>

          {/* Filters button */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
              activeFilterCount > 0
                ? 'border-[#FF6633] bg-[#FFF3EF] text-[#FF6633]'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {loadingMeta
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <SlidersHorizontal className="w-4 h-4" />}
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#FF6633] text-white rounded-full text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activities..."
              aria-label="Search activities"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear filters shortcut */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => setAppliedFilters(EMPTY_FILTERS)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}

          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all" aria-label="Change view layout">
            <LayoutGrid className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Active filter pills summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {appliedFilters.projects.map(p => (
              <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFE5DC] text-[#E55A2B] rounded-full text-xs font-medium">
                📁 {p}
                <button onClick={() => setAppliedFilters(f => ({ ...f, projects: f.projects.filter(x => x !== p) }))}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {appliedFilters.members.map(m => (
              <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F5E9] text-[#4CAF50] rounded-full text-xs font-medium">
                👤 {m}
                <button onClick={() => setAppliedFilters(f => ({ ...f, members: f.members.filter(x => x !== m) }))}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {appliedFilters.activityTypes.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                🏷 {t}
                <button onClick={() => setAppliedFilters(f => ({ ...f, activityTypes: f.activityTypes.filter(x => x !== t) }))}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <p className="text-lg font-medium">No activities match your filters</p>
            <button onClick={() => { setAppliedFilters(EMPTY_FILTERS); setSearch(''); }} className="text-sm text-[#FF6633] underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        applied={appliedFilters}
        onApply={setAppliedFilters}
        projectOptions={projectOptions}
        memberOptions={memberOptions}
      />
    </div>
  );
}
