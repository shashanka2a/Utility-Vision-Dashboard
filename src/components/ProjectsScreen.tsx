"use client";

import { Clock, Plus, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  jobNumber: string;
  acresCompleted: number;
  lastActivity: string;
  status: 'active' | 'paused' | 'completed';
}

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Storey Bend Wicking Project',
    jobNumber: 'JOB-2024-001',
    acresCompleted: 145.6,
    lastActivity: '2 hours ago',
    status: 'active'
  },
  {
    id: '2',
    name: 'Redlands Wicking Project',
    jobNumber: 'JOB-2024-002',
    acresCompleted: 98.3,
    lastActivity: '5 hours ago',
    status: 'active'
  },
  {
    id: '3',
    name: 'Oakwood Infrastructure',
    jobNumber: 'JOB-2024-003',
    acresCompleted: 67.2,
    lastActivity: '1 day ago',
    status: 'active'
  },
  {
    id: '4',
    name: 'Pine Valley Development',
    jobNumber: 'JOB-2024-004',
    acresCompleted: 124.8,
    lastActivity: '3 days ago',
    status: 'paused'
  },
  {
    id: '5',
    name: 'Maple Ridge Utilities',
    jobNumber: 'JOB-2023-089',
    acresCompleted: 203.5,
    lastActivity: '1 week ago',
    status: 'completed'
  }
];

export function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    jobNumber: '',
    acresCompleted: 0,
    status: 'active' as Project['status']
  });

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      jobNumber: '',
      acresCompleted: 0,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      jobNumber: project.jobNumber,
      acresCompleted: project.acresCompleted,
      status: project.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProject) {
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...formData, lastActivity: 'Just now' }
          : p
      ));
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        lastActivity: 'Just now'
      };
      setProjects([newProject, ...projects]);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Projects</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{projects.length}</span> active projects
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6633] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 content-start">
        {projects.map(project => (
          <div
            key={project.id}
            className="bg-white border border-gray-300 rounded-lg p-5 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-black text-base">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{project.jobNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'active' ? 'bg-[#E8F5E9] text-[#4CAF50]' :
                  project.status === 'paused' ? 'bg-[#FFF8E1] text-[#FFC107]' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6633]"
                  aria-label={`Edit ${project.name}`}
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 hover:bg-[#FFEBEE] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#F44336]"
                  aria-label={`Delete ${project.name}`}
                >
                  <Trash2 className="w-4 h-4 text-[#F44336]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Acres Completed</p>
                <p className="text-xl font-bold text-[#FF6633]">{project.acresCompleted}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Last Activity</p>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-sm text-gray-700">{project.lastActivity}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6633]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label htmlFor="job-number" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Job Number
                </label>
                <input
                  id="job-number"
                  type="text"
                  required
                  value={formData.jobNumber}
                  onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                  placeholder="JOB-2024-001"
                />
              </div>

              <div>
                <label htmlFor="acres" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Acres Completed
                </label>
                <input
                  id="acres"
                  type="number"
                  step="0.1"
                  required
                  value={formData.acresCompleted}
                  onChange={(e) => setFormData({ ...formData, acresCompleted: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#FF6633] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2"
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}