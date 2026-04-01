"use client";

import { Clock, Plus, Pencil, Trash2, X, Loader2, Search, LayoutGrid, List } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/context/ProjectContext";

interface Project {
  id: string;
  name: string;
  job_number: string;
  acres_completed: number;
  last_activity: string | null;
  status: 'active' | 'paused' | 'completed';
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  project_groups?: string;
  project_template?: string;
  created_at?: string;
}

type FormData = {
  name: string;
  job_number: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  start_date: string;
  end_date: string;
  project_template: string;
};

const today = new Date().toISOString().split('T')[0];

const emptyForm: FormData = {
  name: '',
  job_number: '',
  street_address: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'United States',
  start_date: today,
  end_date: '',
  project_template: 'Wicking Jobs Template | Company default template',
};

const PROJECT_TEMPLATES = [
  'Wicking Jobs Template | Company default template',
  'Infrastructure Template',
  'Environmental Project Template',
  'General Construction Template',
];

export function ProjectsScreen() {
  const router = useRouter();
  const { setSelectedProject } = useProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      setProjects(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openAdd = () => {
    setEditingProject(null);
    setFormData(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      job_number: project.job_number,
      street_address: project.street_address ?? '',
      city: project.city ?? '',
      state: project.state ?? '',
      zip_code: project.zip_code ?? '',
      country: project.country ?? 'United States',
      start_date: project.start_date ?? today,
      end_date: project.end_date ?? '',
      project_template: project.project_template ?? PROJECT_TEMPLATES[0],
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingProject) {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Create failed');
        const created = await res.json();
        setProjects(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof FormData, value: string | number) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const activeCount = projects.filter(p => p.status === 'active').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Projects</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{projects.length}</span> total &middot;{' '}
              <span className="font-medium text-[#4CAF50]">{activeCount} active</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors focus:outline-none ${
                  viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'
                }`}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors focus:outline-none ${
                  viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'
                }`}
                aria-label="List view"
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6633] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-[#FF6633] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={fetchProjects} className="text-sm text-[#FF6633] underline">Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-sm">Click &ldquo;Add Project&rdquo; to create your first one.</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 content-start">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="bg-white border border-gray-300 rounded-lg p-5 hover:shadow-lg transition-all duration-200"
                >
                  {/* Top row: name + status + date + actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <button 
                        onClick={() => {
                          setSelectedProject(project.name);
                          router.push('/projects/dashboard');
                        }}
                        className="text-left group/title focus:outline-none"
                      >
                        <h3 className="font-semibold text-black text-base truncate group-hover/title:text-[#2196F3] transition-colors">{project.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 group-hover/title:text-gray-600">{project.job_number}</p>
                      </button>
                      {(project.city || project.state) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[project.city, project.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Status badge */}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.status === 'active'  ? 'bg-[#E8F5E9] text-[#4CAF50]' :
                        project.status === 'paused'  ? 'bg-[#FFF8E1] text-[#FFC107]' :
                                                       'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      {/* Start date inline */}
                      {project.start_date && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(project.start_date).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        onClick={() => openEdit(project)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                        aria-label={`Edit ${project.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 hover:bg-[#FFEBEE] rounded-lg transition-colors focus:outline-none"
                        aria-label={`Delete ${project.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#F44336]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide gap-4">
                <span>Project</span>
                <span className="w-20 text-center">Job #</span>
                <span className="w-28 text-center">Start Date</span>
                <span className="w-20 text-center">Status</span>
                <span className="w-16 text-center">Actions</span>
              </div>
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 gap-4 hover:bg-gray-50 transition-colors ${
                    i < projects.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  {/* Name + location */}
                  <div className="min-w-0">
                    <button 
                      onClick={() => {
                        setSelectedProject(project.name);
                        router.push('/projects/dashboard');
                      }}
                      className="text-left group/list focus:outline-none"
                    >
                      <p className="font-medium text-gray-900 text-sm truncate group-hover/list:text-[#2196F3] transition-colors">{project.name}</p>
                    </button>
                    {(project.city || project.state) && (
                      <p className="text-xs text-gray-400 mt-0.5">{[project.city, project.state].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                  {/* Job # */}
                  <span className="w-20 text-center text-sm text-gray-600">{project.job_number || '—'}</span>
                  {/* Start date */}
                  <span className="w-28 text-center text-sm text-gray-600">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : '—'}
                  </span>
                  {/* Status */}
                  <span className={`w-20 text-center px-2 py-1 rounded text-xs font-medium ${
                    project.status === 'active'  ? 'bg-[#E8F5E9] text-[#4CAF50]' :
                    project.status === 'paused'  ? 'bg-[#FFF8E1] text-[#FFC107]' :
                                                   'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  {/* Actions */}
                  <div className="w-16 flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(project)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                      aria-label={`Edit ${project.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 hover:bg-[#FFEBEE] rounded-lg transition-colors focus:outline-none"
                      aria-label={`Delete ${project.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#F44336]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProject ? 'Edit project' : 'New project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6633]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 space-y-5">
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                {/* Row 1: Name + Job # */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="p-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="Name this project"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="p-job" className="block text-sm font-medium text-gray-700 mb-1">
                      Job #
                    </label>
                    <input
                      id="p-job"
                      type="text"
                      required
                      value={formData.job_number}
                      onChange={e => set('job_number', e.target.value)}
                      placeholder="Job #"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Row 2: Search address + Street address */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search address
                    </label>
                    <div className="relative">
                      <input
                        id="p-search"
                        type="text"
                        placeholder="Search address"
                        className="w-full pl-3 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="p-street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street address
                    </label>
                    <input
                      id="p-street"
                      type="text"
                      value={formData.street_address}
                      onChange={e => set('street_address', e.target.value)}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Row 3: City + State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="p-city"
                      type="text"
                      value={formData.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="p-state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      id="p-state"
                      type="text"
                      value={formData.state}
                      onChange={e => set('state', e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Row 4: Zip code + Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-zip" className="block text-sm font-medium text-gray-700 mb-1">
                      Zip code
                    </label>
                    <input
                      id="p-zip"
                      type="text"
                      value={formData.zip_code}
                      onChange={e => set('zip_code', e.target.value)}
                      placeholder="Zip code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="p-country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      id="p-country"
                      type="text"
                      value={formData.country}
                      onChange={e => set('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Row 5: Start date + End date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-start" className="block text-sm font-medium text-gray-700 mb-1">
                      Project start date
                    </label>
                    <input
                      id="p-start"
                      type="date"
                      value={formData.start_date}
                      onChange={e => set('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all text-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="p-end" className="block text-sm font-medium text-gray-700 mb-1">
                      Project end date
                    </label>
                    <input
                      id="p-end"
                      type="date"
                      value={formData.end_date}
                      onChange={e => set('end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all text-gray-700"
                    />
                  </div>
                </div>



                {/* Row 8: Project template (full width) */}
                <div>
                  <label htmlFor="p-template" className="block text-sm font-medium text-gray-700 mb-1">
                    Project template
                  </label>
                  <select
                    id="p-template"
                    value={formData.project_template}
                    onChange={e => set('project_template', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all text-gray-700"
                  >
                    {PROJECT_TEMPLATES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6633] text-white rounded-lg text-sm font-medium hover:bg-[#E55A2B] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}