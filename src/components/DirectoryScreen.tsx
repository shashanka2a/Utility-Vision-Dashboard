"use client";

import { Plus, X, Loader2, Search, ChevronDown, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  assigned_projects: string[];
  email?: string;
  phone?: string;
  employee_id?: string;
  classification?: string;
}

type FormData = {
  name: string;
  role: string;
  status: 'active' | 'inactive';
  assigned_projects: string[];
  email: string;
  phone: string;
  employee_id: string;
  classification: string;
};

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'account_admin',  label: 'Account admin',  description: 'Admin access to company and all projects' },
  { value: 'project_admin',  label: 'Project admin',  description: 'Admin access to invited projects' },
  { value: 'project_member', label: 'Project member', description: 'Standard access to invited projects' },
  { value: 'view_only',      label: 'View only',      description: 'View only access to invited projects' },
  { value: 'worker',         label: 'Worker',         description: 'No login. Time and activity is tracked by supervisors' },
] as const;

type RoleValue = typeof ROLES[number]['value'];

function roleLabel(value: string) {
  return ROLES.find(r => r.value === value)?.label ?? value;
}

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyForm: FormData = {
  name: '',
  role: '',
  status: 'active',
  assigned_projects: [],
  email: '',
  phone: '',
  employee_id: '',
  classification: '',
};

// ─── Role Dropdown ────────────────────────────────────────────────────────────

function RoleDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent ${
          value ? 'border-gray-300 text-gray-900' : 'border-gray-300 text-gray-400'
        }`}
      >
        <span>{value ? roleLabel(value) : 'Select'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {ROLES.map(role => (
            <button
              key={role.value}
              type="button"
              onClick={() => { onChange(role.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-baseline gap-1 ${
                value === role.value ? 'bg-[#FFF3EF]' : ''
              }`}
            >
              <span className="font-medium text-gray-900">{role.label}</span>
              <span className="text-gray-400 text-xs"> – {role.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DirectoryScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);


  // ── data loading ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, projRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/projects'),
      ]);
      if (!empRes.ok || !projRes.ok) throw new Error('Failed to load data');
      const [empData, projData] = await Promise.all([empRes.json(), projRes.json()]);
      setEmployees(empData);
      setProjectNames(projData.map((p: { name: string }) => p.name));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── modal helpers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      status: emp.status,
      assigned_projects: emp.assigned_projects ?? [],
      email: emp.email ?? '',
      phone: emp.phone ?? '',
      employee_id: emp.employee_id ?? '',
      classification: emp.classification ?? '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleToggleStatus = async (emp: Employee) => {
    setMenuOpenId(null);
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emp, status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleDelete = async (emp: Employee) => {
    setMenuOpenId(null);
    if (!confirm(`Remove ${emp.name} from the team?`)) return;
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setEmployees(prev => prev.filter(e => e.id !== emp.id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) { setError('Please select a role.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editingEmployee) {
        const res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
        closeModal();
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Create failed');
        const created = await res.json();
        setEmployees(prev => [...prev, created]);
        closeModal();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setFormData(prev => ({ ...prev, [k]: v }));

  const toggleProject = (project: string) => {
    const cur = formData.assigned_projects;
    set('assigned_projects', cur.includes(project) ? cur.filter(p => p !== project) : [...cur, project]);
  };

  const activeCount = employees.filter(e => e.status === 'active').length;

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Directory</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{employees.length}</span> team members &middot;{' '}
              <span className="font-medium text-[#4CAF50]">{activeCount} active</span>
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6633] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-[#FF6633] animate-spin" />
          </div>
        ) : error && employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={fetchData} className="text-sm text-[#FF6633] underline">Retry</button>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <p className="text-lg font-medium">No team members yet</p>
            <p className="text-sm">Click &ldquo;Add Employee&rdquo; to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">EID</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">Email / Phone</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">Classification</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEdit(emp)}
                        className="flex items-center gap-3 text-left hover:underline focus:outline-none"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-[#FF6633] to-[#E55A2B] rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm flex-shrink-0">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-black text-sm">{emp.name}</span>
                      </button>
                    </td>
                    {/* EID */}
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.employee_id || '–'}</td>
                    {/* Email / Phone */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{emp.email || ''}</div>
                      {emp.phone && <div className="text-sm text-gray-500">{emp.phone}</div>}
                      {!emp.email && !emp.phone && <span className="text-sm text-gray-400">—</span>}
                    </td>
                    {/* Classification */}
                    <td className="px-6 py-4 text-sm text-gray-700">{emp.classification || '–'}</td>
                    {/* Role */}
                    <td className="px-6 py-4 text-sm text-gray-700">{roleLabel(emp.role)}</td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'active' ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-[#4CAF50]' : 'bg-gray-500'}`} />
                        {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                      </span>
                    </td>
                    {/* ⋯ Menu */}
                    <td className="px-3 py-4">
                      <div className="relative flex justify-end" ref={menuOpenId === emp.id ? menuRef : null}>
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === emp.id ? null : emp.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6633]"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>

                        {menuOpenId === emp.id && (
                          <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[160px] py-1 overflow-hidden">
                            <button
                              onClick={() => handleToggleStatus(emp)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {emp.status === 'active' ? 'Make inactive' : 'Make active'}
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleDelete(emp)}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEmployee ? 'Edit employee' : 'Create employee'}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <form id="emp-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 space-y-5">
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <RoleDropdown value={formData.role} onChange={v => set('role', v as RoleValue)} />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="emp-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    id="emp-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="emp-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      id="emp-email"
                      type="email"
                      value={formData.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="Email"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                    {/* QR / scan icon */}
                    <button
                      type="button"
                      title="Scan QR code"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                        <rect x="2" y="2" width="6" height="6" rx="1" />
                        <rect x="12" y="2" width="6" height="6" rx="1" />
                        <rect x="2" y="12" width="6" height="6" rx="1" />
                        <path d="M12 12h2M14 12v2M12 16h2M16 14h2M16 16v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="emp-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#FF6633] focus-within:border-transparent transition-all">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-r border-gray-300 cursor-default select-none flex-shrink-0">
                      {/* US flag emoji */}
                      <span className="text-base leading-none">🇺🇸</span>
                      <span className="text-sm text-gray-600">+1</span>
                    </div>
                    <input
                      id="emp-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="(555) 000-0000"
                      className="flex-1 px-3 py-2 text-sm focus:outline-none placeholder-gray-400 bg-white"
                    />
                  </div>
                </div>

                {/* Employee ID */}
                <div>
                  <label htmlFor="emp-id" className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                  <input
                    id="emp-id"
                    type="text"
                    value={formData.employee_id}
                    onChange={e => set('employee_id', e.target.value)}
                    placeholder="Enter employee ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>

                {/* Classification */}
                <div>
                  <label htmlFor="emp-class" className="block text-sm font-medium text-gray-700 mb-1.5">Classification</label>
                  <div className="relative">
                    <input
                      id="emp-class"
                      type="text"
                      value={formData.classification}
                      onChange={e => set('classification', e.target.value)}
                      placeholder="Search classifications"
                      className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all placeholder-gray-400"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>



                {/* Assigned Projects */}
                {projectNames.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Assigned Projects{' '}
                      <span className="font-normal text-gray-400">({formData.assigned_projects.length} selected)</span>
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                      {projectNames.map(project => (
                        <label key={project} className="flex items-center cursor-pointer hover:bg-white p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.assigned_projects.includes(project)}
                            onChange={() => toggleProject(project)}
                            className="w-4 h-4 text-[#FF6633] border-gray-300 rounded focus:ring-[#FF6633]"
                          />
                          <span className="ml-2.5 text-sm text-gray-700">{project}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="emp-form"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6633] text-white rounded-lg text-sm font-medium hover:bg-[#E55A2B] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}