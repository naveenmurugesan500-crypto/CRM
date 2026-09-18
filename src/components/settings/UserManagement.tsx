import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CRMUser, UserRole } from '../../types/crm';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit2, 
  Phone, 
  Mail, 
  Key, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  UserCheck,
  X,
  Plus,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, setCurrentUser, setIsMobileAppMode } = useCRM();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CRMUser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('telecaller');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setRole('telecaller');
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u: CRMUser) => {
    setEditingUser(u);
    setName(u.name);
    setPhone(u.phone || '');
    setEmail(u.email || '');
    setPassword(u.password || '');
    setRole(u.role);
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a valid user name.');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setErrorMsg('Please provide at least a Phone Number or an Email ID.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
        role,
      });
    } else {
      addUser({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim() || '1234',
        role,
        isActive: true,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (u: CRMUser) => {
    if (currentUser.id === u.id) {
      alert('You cannot delete your own active user account.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove user "${u.name}"?`)) {
      deleteUser(u.id);
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="h-3 w-3" />
            Admin (Full Access)
          </span>
        );
      case 'sales_manager':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <UserCheck className="h-3 w-3" />
            Sales Manager
          </span>
        );
      case 'telecaller':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Smartphone className="h-3 w-3" />
            Telecaller (Mobile App)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            User Management & Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create users using Phone Number or Email with distinct access levels: Admin, Sales Manager, and Telecaller.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Access Levels Matrix Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-1">
          <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>Admin</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Full system control: All leads, Marketing Spend API, Multi-Account Portfolio, Google Sheets, Settings, User Management, and Lead Deletions.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-1">
          <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span>Sales Manager</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Leads assignment (individual & bulk), call performance reports, add new leads, edit leads, and remove/delete leads.
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-1">
          <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1">
            <Smartphone className="h-4 w-4 text-amber-600" />
            <span>Telecaller (Mobile App Only)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Streamlined Mobile App: Only view assigned leads, 1-tap Phone Call, 1-tap WhatsApp chat, status updates & remarks. No deletions.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-500 dark:text-slate-400 text-[10px]">
              <tr>
                <th className="px-4 py-3">Team Member</th>
                <th className="px-4 py-3">Access Level</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {currentUser.id === u.id && (
                            <span className="rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[9px] px-1 font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {getRoleBadge(u.role)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                    {u.phone ? (
                      <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {u.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-[11px]">
                    {u.email ? (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {u.email}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(u)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      title="Edit User"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      disabled={currentUser.id === u.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={currentUser.id === u.id ? 'Cannot delete your active account' : 'Delete User'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {editingUser ? 'Edit User Profile' : 'Create New Team Member'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-1.5 font-semibold">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Access Level / Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="telecaller">Telecaller (Mobile App Only - Calls & WhatsApp)</option>
                  <option value="sales_manager">Sales Manager (Assign Leads, Call Reports, Add/Edit/Remove)</option>
                  <option value="admin">Admin (Full System Access & Settings)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="ramesh@immek.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Password / PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter login password or PIN"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
