"use client";

import { useState, useCallback } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Role = "member" | "admin" | "accountAdmin";

interface Permission {
  id: string;
  label: string;
  member: boolean;
  admin: boolean;
  accountAdmin: boolean;
}

interface PermissionGroup {
  title: string;
  permissions: Permission[];
}

const DEFAULT_GROUPS: PermissionGroup[] = [
  {
    title: "Directory",
    permissions: [
      { id: "dir_create_emp",    label: "Can create new employees",                 member: true,  admin: true,  accountAdmin: false },
      { id: "dir_manage_emp",    label: "Can manage employees",                     member: true,  admin: true,  accountAdmin: false },
      { id: "dir_manage_roles",  label: "Can manage user roles and access",         member: false, admin: false, accountAdmin: false },
      { id: "dir_cos",           label: "Can create/edit/delete contact companies", member: true,  admin: true,  accountAdmin: true  },
      { id: "dir_contacts",      label: "Can create/edit/delete contacts",          member: true,  admin: true,  accountAdmin: true  },
      { id: "dir_groups",        label: "Can create/edit/delete groups",            member: false, admin: true,  accountAdmin: false },
      { id: "dir_certs",         label: "Can create/edit/delete certifications",    member: false, admin: true,  accountAdmin: false },
      { id: "dir_class",         label: "Can create/edit/delete classifications",   member: true,  admin: true,  accountAdmin: false },
    ],
  },
  {
    title: "Projects",
    permissions: [
      { id: "proj_create",   label: "Can create projects",                      member: false, admin: true,  accountAdmin: true  },
      { id: "proj_settings", label: "Can manage project settings",              member: false, admin: true,  accountAdmin: false },
      { id: "proj_survey",   label: "Can modify survey question settings",      member: false, admin: true,  accountAdmin: false },
      { id: "proj_email",    label: "Can use the automatic email feature",      member: false, admin: true,  accountAdmin: false },
    ],
  },
  {
    title: "Activity & Reports",
    permissions: [
      { id: "act_view_all",   label: "Can view all activity",             member: true,  admin: true,  accountAdmin: true  },
      { id: "act_export",     label: "Can export reports",                member: false, admin: true,  accountAdmin: true  },
      { id: "act_sign",       label: "Can sign and submit daily reports", member: true,  admin: true,  accountAdmin: false },
      { id: "act_delete",     label: "Can delete activity records",       member: false, admin: false, accountAdmin: true  },
    ],
  },
  {
    title: "Safety",
    permissions: [
      { id: "safe_schedule",  label: "Can schedule safety talks",         member: false, admin: true,  accountAdmin: true  },
      { id: "safe_conduct",   label: "Can conduct safety talks",          member: true,  admin: true,  accountAdmin: false },
      { id: "safe_library",   label: "Can manage safety talk library",    member: false, admin: true,  accountAdmin: true  },
    ],
  },
];

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
        focus-visible:ring-gray-900 focus-visible:ring-offset-2
        ${checked ? "bg-gray-800" : "bg-gray-200"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md
          transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [groups, setGroups] = useState<PermissionGroup[]>(DEFAULT_GROUPS);

  const toggle = useCallback((groupTitle: string, permId: string, role: Role) => {
    setGroups(prev =>
      prev.map(g =>
        g.title !== groupTitle ? g : {
          ...g,
          permissions: g.permissions.map(p =>
            p.id !== permId ? p : { ...p, [role]: !p[role] }
          ),
        }
      )
    );
  }, []);

  const handleRestore = () => setGroups(DEFAULT_GROUPS);

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Roles & permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control what each role can do across your workspace</p>
        </div>
        <button
          onClick={handleRestore}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
        >
          Restore defaults
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">

        {/* ── Sticky column header ── */}
        <div className="sticky top-0 z-10 bg-gray-50 py-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_150px_150px_150px] px-6 py-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Project member</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Project admin</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Account admin</span>
            </div>
          </div>
        </div>

        {/* ── Permission Groups ── */}
        {groups.map(group => (
          <div key={group.title} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            {/* Group title row */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{group.title}</h2>
            </div>

            {/* Permission rows */}
            <div className="divide-y divide-gray-100">
              {group.permissions.map(perm => (
                <div
                  key={perm.id}
                  className="grid grid-cols-[1fr_150px_150px_150px] items-center px-6 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Label */}
                  <span className="text-sm text-gray-700">{perm.label}</span>

                  {/* Member */}
                  <div className="flex justify-center">
                    <Toggle
                      checked={perm.member}
                      onChange={() => toggle(group.title, perm.id, "member")}
                    />
                  </div>

                  {/* Admin */}
                  <div className="flex justify-center">
                    <Toggle
                      checked={perm.admin}
                      onChange={() => toggle(group.title, perm.id, "admin")}
                    />
                  </div>

                  {/* Account Admin */}
                  <div className="flex justify-center">
                    <Toggle
                      checked={perm.accountAdmin}
                      onChange={() => toggle(group.title, perm.id, "accountAdmin")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
