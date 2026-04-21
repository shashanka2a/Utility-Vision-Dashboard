"use client";

import { 
  Plus, X, Loader2, Search, ChevronDown, MoreHorizontal, LayoutGrid, List,
  Mail, Phone, ArrowRight, Shield, User, MapPin, Briefcase
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

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
  photo_url?: string;
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
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all focus:outline-none ${
          open ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-300 hover:border-gray-400'
        } ${value ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <span>{value ? roleLabel(value) : 'Select'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Options list */}
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden divide-y divide-gray-100">
          {ROLES.map(role => (
            <button
              key={role.value}
              type="button"
              onClick={() => { onChange(role.value); setOpen(false); }}
              className="w-full text-left px-4 py-3.5 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-between gap-3"
            >
              <span className="flex items-baseline gap-1.5 min-w-0">
                <span className="font-semibold text-gray-900 whitespace-nowrap">{role.label}</span>
                <span className="text-gray-300">–</span>
                <span className="text-gray-400 truncate">{role.description}</span>
              </span>
              {value === role.value && (
                <svg className="w-4 h-4 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DirectoryScreen({ projectFilter }: { projectFilter?: string }) {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inviteLoadingId, setInviteLoadingId] = useState<string | null>(null);
  /** Create flow: send password-setup email when saving (unless worker / no email). */
  const [sendInviteOnCreate, setSendInviteOnCreate] = useState(true);


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
      let [empData, projData] = await Promise.all([empRes.json(), projRes.json()]);
      
      if (projectFilter && projectFilter !== 'All Projects') {
         // Filter to only active employees assigned to this specific project (case-insensitive match)
         empData = empData.filter((e: any) => 
            e.status === 'active' && 
            e.assigned_projects?.some((p: string) => p.toLowerCase() === projectFilter.toLowerCase())
         );
      }
      
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
    setSendInviteOnCreate(true);
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

  const handleSendLoginInvite = async (emp: Employee) => {
    if (!emp.email?.trim()) {
      toast.error('Add an email address for this employee first.');
      return;
    }
    if (emp.role === 'worker') {
      toast.error('Workers do not use login. Change the role to send an invite.');
      return;
    }
    setMenuOpenId(null);
    setInviteLoadingId(emp.id);
    try {
      const res = await fetch(`/api/employees/${emp.id}/invite`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Invite failed');
      }
      const flow = data.flow as string | undefined;
      toast.success(
        flow === 'recovery'
          ? 'Password setup email sent (existing account).'
          : 'Login invite email sent.'
      );
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Invite failed');
    } finally {
      setInviteLoadingId(null);
    }
  };

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
        const wantsInvite =
          sendInviteOnCreate &&
          Boolean(formData.email?.trim()) &&
          formData.role !== 'worker';
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            send_login_invite: wantsInvite,
          }),
        });
        if (!res.ok) throw new Error('Create failed');
        const created = (await res.json()) as Employee & {
          invite?:
            | { sent: true; flow: 'invite' | 'recovery' }
            | { sent: false; error: string };
        };
        const { invite, ...newEmployee } = created;

        if (invite) {
          if (invite.sent) {
            toast.success(
              invite.flow === 'recovery'
                ? 'Employee added. Password email sent (existing account).'
                : 'Employee added. Login invite sent — they can set a password and use the dashboard.'
            );
          } else {
            toast.warning(`Employee saved, but invite was not sent: ${invite.error}`);
          }
        } else {
          toast.success('Employee added.');
        }
        setEmployees(prev => [...prev, newEmployee]);
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

  const inviteEligibleForCreate =
    Boolean(formData.email?.trim()) &&
    formData.role !== '' &&
    formData.role !== 'worker';

  const filteredEmployees = employees.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.name.toLowerCase().includes(q) || 
           (e.employee_id && e.employee_id.toLowerCase().includes(q)) || 
           (e.email && e.email.toLowerCase().includes(q)) ||
           (e.role && roleLabel(e.role).toLowerCase().includes(q));
  });

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              {projectFilter && projectFilter !== 'All Projects' ? `${projectFilter} Directory` : 'Directory'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{filteredEmployees.length}</span> team members &middot;{' '}
              <span className="font-medium text-[#4CAF50]">{activeCount} active</span>
              {projectFilter && projectFilter !== 'All Projects' && ' (Currently assigned to Project)'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search directory..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-[250px] focus:outline-none focus:ring-2 focus:ring-[#FF6633]/20 focus:border-[#FF6633] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            
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
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6633] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
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
          viewMode === 'list' ? (
            <div className="overflow-x-auto">
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm min-w-[700px]">
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
                  {filteredEmployees.map(emp => (
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
                                onClick={() => { setMenuOpenId(null); openEdit(emp); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={
                                  inviteLoadingId === emp.id ||
                                  !emp.email?.trim() ||
                                  emp.role === 'worker'
                                }
                                title={
                                  !emp.email?.trim()
                                    ? 'Add an email address first'
                                    : emp.role === 'worker'
                                      ? 'Workers do not use login'
                                      : undefined
                                }
                                onClick={() => handleSendLoginInvite(emp)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                              >
                                {inviteLoadingId === emp.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                ) : (
                                  <Mail className="w-4 h-4 shrink-0 text-gray-500" />
                                )}
                                Send login invite
                              </button>
                              <div className="border-t border-gray-100 my-1" />
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
              {filteredEmployees.map(emp => (
                <div 
                  key={emp.id} 
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 group flex flex-col"
                >
                  {/* Card Header: Avatar & Basic Info */}
                  <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white relative">
                    <div className="absolute top-4 right-4">
                      <div className="relative" ref={menuOpenId === emp.id ? menuRef : null}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === emp.id ? null : emp.id); }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                        {menuOpenId === emp.id && (
                          <div className="absolute right-0 top-7 z-30 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[150px] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => { setMenuOpenId(null); openEdit(emp); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={
                                inviteLoadingId === emp.id ||
                                !emp.email?.trim() ||
                                emp.role === 'worker'
                              }
                              title={
                                !emp.email?.trim()
                                  ? 'Add an email address first'
                                  : emp.role === 'worker'
                                    ? 'Workers do not use login'
                                    : undefined
                              }
                              onClick={() => handleSendLoginInvite(emp)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                            >
                              {inviteLoadingId === emp.id ? (
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                              ) : (
                                <Mail className="w-4 h-4 shrink-0 text-gray-500" />
                              )}
                              Send login invite
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleToggleStatus(emp)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {emp.status === 'active' ? 'Make inactive' : 'Make active'}
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleDelete(emp)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-white p-1 rounded-full border border-gray-100 shadow-sm relative z-10">
                        <div className="w-full h-full bg-gradient-to-br from-[#FF6633] to-[#E55A2B] rounded-full flex items-center justify-center text-xl font-bold text-white shadow-inner">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <button 
                        onClick={() => openEdit(emp)} 
                        className="text-lg font-bold text-gray-900 group-hover:text-[#FF6633] transition-colors line-clamp-1"
                      >
                        {emp.name}
                      </button>
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest border transition-all ${
                        emp.status === 'active' 
                          ? 'bg-green-50 text-green-600 border-green-100' 
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                       <Shield className="w-3 h-3" />
                       {roleLabel(emp.role)}
                    </div>
                  </div>

                  {/* Card Body: Important Details */}
                  <div className="p-6 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID</p>
                        <p className="text-sm font-semibold text-gray-800">{emp.employee_id || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Classification</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{emp.classification || '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Projects</p>
                       <div className="flex flex-wrap gap-1">
                         {emp.assigned_projects?.length ? (
                           emp.assigned_projects.slice(0, 2).map((p, i) => (
                             <span key={i} className="px-2 py-0.5 bg-blue-50 text-[11px] font-medium text-blue-600 rounded">
                               {p}
                             </span>
                           ))
                         ) : <span className="text-sm text-gray-400">No project assigned</span>}
                         {emp.assigned_projects?.length > 2 && (
                           <span className="px-2 py-0.5 bg-gray-50 text-[11px] font-medium text-gray-500 rounded">
                             +{emp.assigned_projects.length - 2} more
                           </span>
                         )}
                       </div>
                    </div>
                  </div>

                  {/* Card Footer: Quick Actions */}
                  <div className="px-3 pb-4 pt-2 mt-auto">
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href={emp.email ? `mailto:${emp.email}` : '#'}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                          emp.email ? 'border-gray-100 bg-gray-50 text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200' : 'bg-gray-50 opacity-40 cursor-not-allowed text-gray-400 border-transparent'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                      <a 
                        href={emp.phone ? `tel:${emp.phone}` : '#'}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                          emp.phone ? 'border-gray-100 bg-gray-50 text-gray-700 hover:bg-white hover:shadow-md hover:border-gray-200' : 'bg-gray-50 opacity-40 cursor-not-allowed text-gray-400 border-transparent'
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    </div>
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

                {/* Login invite (new employees only) */}
                {!editingEmployee && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50/90 p-4 space-y-2">
                    <label
                      className={`flex items-start gap-3 ${inviteEligibleForCreate ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <input
                        type="checkbox"
                        checked={inviteEligibleForCreate && sendInviteOnCreate}
                        disabled={!inviteEligibleForCreate}
                        onChange={e => setSendInviteOnCreate(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#FF6633] border-gray-300 rounded focus:ring-[#FF6633] disabled:opacity-40"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-800">
                          Send login invite email
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                          They get a link to set their password, then they can sign in to the Utility Vision
                          dashboard.
                        </span>
                      </span>
                    </label>
                    {!formData.email?.trim() && (
                      <p className="text-xs text-amber-800 pl-7">Enter an email above to enable.</p>
                    )}
                    {formData.role === 'worker' && (
                      <p className="text-xs text-gray-500 pl-7">Worker role has no dashboard login.</p>
                    )}
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
                  {editingEmployee ? 'Save' : 'Add employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}