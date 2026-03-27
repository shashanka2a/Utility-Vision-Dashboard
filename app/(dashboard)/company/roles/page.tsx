"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Permission {
  id: string;
  label: string;
  member: boolean;
  admin: boolean;
  accountAdmin: boolean;
}

const DIRECTORY_PERMISSIONS: Permission[] = [
  { id: "create_emp", label: "Can create new employees", member: true, admin: true, accountAdmin: false },
  { id: "manage_emp", label: "Can manage employees", member: true, admin: true, accountAdmin: false },
  { id: "manage_roles", label: "Can manage user roles and access", member: false, admin: false, accountAdmin: false },
  { id: "manage_cos", label: "Can create/edit/delete contact companies", member: true, admin: true, accountAdmin: true },
  { id: "manage_contacts", label: "Can create/edit/delete contacts", member: true, admin: true, accountAdmin: true },
  { id: "manage_groups", label: "Can create/edit/delete groups", member: false, admin: true, accountAdmin: false },
  { id: "manage_certs", label: "Can create/edit/delete certifications", member: false, admin: true, accountAdmin: false },
  { id: "manage_class", label: "Can create/edit/delete classifications", member: true, admin: true, accountAdmin: false },
];

const PROJECT_PERMISSIONS: Permission[] = [
  { id: "create_proj", label: "Can create projects", member: false, admin: true, accountAdmin: true },
  { id: "manage_proj", label: "Can manage project settings", member: false, admin: true, accountAdmin: false },
  { id: "manage_survey", label: "Can modify survey question settings", member: false, admin: true, accountAdmin: false },
  { id: "use_email", label: "Can use the automatic email feature", member: false, admin: true, accountAdmin: false },
];

function PermissionRow({ permission }: { permission: Permission }) {
  return (
    <div className="grid grid-cols-[1fr,120px,120px,120px] items-center py-4 px-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700 font-medium">{permission.label}</span>
      
      {/* Member Toggle */}
      <div className="flex justify-center">
        <button 
          className={`w-11 h-6 rounded-full transition-colors relative ${permission.member ? 'bg-gray-800' : 'bg-gray-200'}`}
          aria-pressed={permission.member}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${permission.member ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Admin Toggle */}
      <div className="flex justify-center">
        <button 
          className={`w-11 h-6 rounded-full transition-colors relative ${permission.admin ? 'bg-gray-800' : 'bg-gray-200'}`}
          aria-pressed={permission.admin}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${permission.admin ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Account Admin Toggle */}
      <div className="flex justify-center">
        <button 
          className={`w-11 h-6 rounded-full transition-colors relative ${permission.accountAdmin ? 'bg-gray-800' : 'bg-gray-200'}`}
          aria-pressed={permission.accountAdmin}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${permission.accountAdmin ? 'translate-x-5' : ''}`} />
        </button>
      </div>
    </div>
  );
}

export default function RolesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/company" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Roles & permissions</h1>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm bg-white">
          Restore default permissions
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Table Head */}
        <div className="grid grid-cols-[1fr,120px,120px,120px] bg-gray-50/80 border-b border-gray-200 py-3 px-6">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Project member</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Project admin</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Account admin</span>
        </div>

        {/* Directory Section */}
        <div className="bg-white">
          <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Directory</h2>
          </div>
          {DIRECTORY_PERMISSIONS.map(p => (
            <PermissionRow key={p.id} permission={p} />
          ))}
        </div>

        {/* Projects Section */}
        <div className="bg-white border-t-8 border-gray-100/50">
          <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Projects</h2>
          </div>
          {PROJECT_PERMISSIONS.map(p => (
            <PermissionRow key={p.id} permission={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
