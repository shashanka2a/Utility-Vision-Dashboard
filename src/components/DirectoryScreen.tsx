"use client";

import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  assignedProjects: string[];
}

const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'Ricky Smith',
    role: 'Field Supervisor',
    status: 'active',
    assignedProjects: ['Storey Bend Wicking Project', 'Redlands Wicking Project']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Site Manager',
    status: 'active',
    assignedProjects: ['Redlands Wicking Project']
  },
  {
    id: '3',
    name: 'Mike Torres',
    role: 'Equipment Operator',
    status: 'active',
    assignedProjects: ['Oakwood Infrastructure']
  },
  {
    id: '4',
    name: 'Jennifer Lee',
    role: 'Safety Officer',
    status: 'active',
    assignedProjects: ['Storey Bend Wicking Project', 'Oakwood Infrastructure', 'Pine Valley Development']
  },
  {
    id: '5',
    name: 'David Martinez',
    role: 'Field Technician',
    status: 'active',
    assignedProjects: ['Pine Valley Development']
  },
  {
    id: '6',
    name: 'Emily Chen',
    role: 'Project Coordinator',
    status: 'inactive',
    assignedProjects: []
  },
  {
    id: '7',
    name: 'Robert Anderson',
    role: 'Equipment Operator',
    status: 'active',
    assignedProjects: ['Storey Bend Wicking Project']
  },
  {
    id: '8',
    name: 'Maria Garcia',
    role: 'Quality Inspector',
    status: 'active',
    assignedProjects: ['Redlands Wicking Project', 'Maple Ridge Utilities']
  }
];

const availableProjects = [
  'Storey Bend Wicking Project',
  'Redlands Wicking Project',
  'Oakwood Infrastructure',
  'Pine Valley Development',
  'Maple Ridge Utilities'
];

export function DirectoryScreen() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    status: 'active' as Employee['status'],
    assignedProjects: [] as string[]
  });

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: '',
      status: 'active',
      assignedProjects: []
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      status: employee.status,
      assignedProjects: employee.assignedProjects
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee) {
      setEmployees(employees.map(e => 
        e.id === editingEmployee.id 
          ? { ...e, ...formData }
          : e
      ));
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData
      };
      setEmployees([...employees, newEmployee]);
    }
    
    setIsModalOpen(false);
  };

  const toggleProject = (project: string) => {
    if (formData.assignedProjects.includes(project)) {
      setFormData({
        ...formData,
        assignedProjects: formData.assignedProjects.filter(p => p !== project)
      });
    } else {
      setFormData({
        ...formData,
        assignedProjects: [...formData.assignedProjects, project]
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Directory</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{employees.length}</span> team members
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6633] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Assigned Projects
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#FF6633] to-[#E55A2B] rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="ml-3 font-medium text-black">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.role}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'active'
                        ? 'bg-[#E8F5E9] text-[#4CAF50]'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        employee.status === 'active' ? 'bg-[#4CAF50]' : 'bg-gray-500'
                      }`} />
                      {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {employee.assignedProjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {employee.assignedProjects.slice(0, 2).map((project, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-[#FFE5DC] text-[#E55A2B] rounded text-xs font-medium"
                          >
                            {project}
                          </span>
                        ))}
                        {employee.assignedProjects.length > 2 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            +{employee.assignedProjects.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No projects assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6633]"
                        aria-label={`Edit ${employee.name}`}
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-1.5 hover:bg-[#FFEBEE] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#F44336]"
                        aria-label={`Delete ${employee.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-[#F44336]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-black">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
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
                <label htmlFor="employee-name" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Full Name
                </label>
                <input
                  id="employee-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Role
                </label>
                <input
                  id="role"
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                  placeholder="Field Supervisor"
                />
              </div>

              <div>
                <label htmlFor="emp-status" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Status
                </label>
                <select
                  id="emp-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Assigned Projects
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  {availableProjects.map(project => (
                    <label key={project} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.assignedProjects.includes(project)}
                        onChange={() => toggleProject(project)}
                        className="w-4 h-4 text-[#FF6633] border-gray-300 rounded focus:ring-[#FF6633]"
                      />
                      <span className="ml-2.5 text-sm text-gray-700">{project}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.assignedProjects.length} project{formData.assignedProjects.length !== 1 ? 's' : ''} selected
                </p>
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
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}