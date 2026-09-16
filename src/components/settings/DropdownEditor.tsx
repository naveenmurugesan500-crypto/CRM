import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Layers, 
  Users, 
  Tag, 
  RotateCcw,
  Sparkles 
} from 'lucide-react';

export const DropdownEditor: React.FC = () => {
  const { 
    dropdownSettings, 
    addModule, 
    editModule, 
    deleteModule,
    addHrName, 
    editHrName, 
    deleteHrName,
    addStatus, 
    deleteStatus,
    resetAllData 
  } = useCRM();

  // State for adding
  const [newModuleName, setNewModuleName] = useState('');
  const [newHrName, setNewHrName] = useState('');
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#6366f1');

  // State for editing in-place
  const [editingModule, setEditingModule] = useState<{ oldName: string; current: string } | null>(null);
  const [editingHr, setEditingHr] = useState<{ oldName: string; current: string } | null>(null);

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    addModule(newModuleName.trim().toUpperCase());
    setNewModuleName('');
  };

  const handleSaveEditModule = () => {
    if (editingModule && editingModule.current.trim()) {
      editModule(editingModule.oldName, editingModule.current.trim().toUpperCase());
      setEditingModule(null);
    }
  };

  const handleAddHr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHrName.trim()) return;
    addHrName(newHrName.trim());
    setNewHrName('');
  };

  const handleSaveEditHr = () => {
    if (editingHr && editingHr.current.trim()) {
      editHrName(editingHr.oldName, editingHr.current.trim());
      setEditingHr(null);
    }
  };

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusLabel.trim()) return;
    addStatus({
      key: newStatusLabel.trim(),
      label: newStatusLabel.trim(),
      color: newStatusColor,
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderLight: 'border-indigo-200 dark:border-indigo-800',
    });
    setNewStatusLabel('');
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Manage Editable Dropdowns
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize course modules, HR telecallers, and lead status pipeline options.
        </p>
      </div>

      {/* Section 1: Course Modules */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Course Modules (Dropdown)
              </h2>
              <p className="text-xs text-slate-400">
                Options available in the "Module" dropdown on lead forms and filters
              </p>
            </div>
          </div>
        </div>

        {/* Add new module form */}
        <form onSubmit={handleAddModule} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new module (e.g. CYBER SECURITY, DEVOPS, FULL STACK)"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Module</span>
          </button>
        </form>

        {/* List of modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {dropdownSettings.modules.map((mod) => (
            <div
              key={mod}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50 text-xs"
            >
              {editingModule?.oldName === mod ? (
                <div className="flex items-center space-x-1 flex-1 mr-2">
                  <input
                    type="text"
                    value={editingModule.current}
                    onChange={(e) => setEditingModule({ ...editingModule, current: e.target.value })}
                    className="w-full rounded border border-indigo-300 p-1 text-xs text-slate-900 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    onClick={handleSaveEditModule}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingModule(null)}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {mod}
                </span>
              )}

              {editingModule?.oldName !== mod && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingModule({ oldName: mod, current: mod })}
                    title="Rename Module"
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete module "${mod}"?`)) {
                        deleteModule(mod);
                      }
                    }}
                    title="Delete Module"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: HR / Counselor Names */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              HR / Counselor Names (Dropdown)
            </h2>
            <p className="text-xs text-slate-400">
              Telecalling and admissions team members who handle inbound leads
            </p>
          </div>
        </div>

        {/* Add new HR form */}
        <form onSubmit={handleAddHr} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new HR counselor name (e.g. Meera Joshi)"
            value={newHrName}
            onChange={(e) => setNewHrName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add HR</span>
          </button>
        </form>

        {/* List of HRs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {dropdownSettings.hrNames.map((hr) => (
            <div
              key={hr}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50 text-xs"
            >
              {editingHr?.oldName === hr ? (
                <div className="flex items-center space-x-1 flex-1 mr-2">
                  <input
                    type="text"
                    value={editingHr.current}
                    onChange={(e) => setEditingHr({ ...editingHr, current: e.target.value })}
                    className="w-full rounded border border-emerald-300 p-1 text-xs text-slate-900 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    onClick={handleSaveEditHr}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingHr(null)}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {hr}
                </span>
              )}

              {editingHr?.oldName !== hr && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingHr({ oldName: hr, current: hr })}
                    title="Rename HR"
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete HR "${hr}"?`)) {
                        deleteHrName(hr);
                      }
                    }}
                    title="Delete HR"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Lead Statuses */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Lead Statuses (Dropdown)
            </h2>
            <p className="text-xs text-slate-400">
              Stages representing candidate progress (Pitched, Registration, Not Interested, Call Back, Interested)
            </p>
          </div>
        </div>

        {/* Add custom status form */}
        <form onSubmit={handleAddStatus} className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Add custom status (e.g. Demo Attended, Token Paid)"
            value={newStatusLabel}
            onChange={(e) => setNewStatusLabel(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            type="color"
            value={newStatusColor}
            onChange={(e) => setNewStatusColor(e.target.value)}
            title="Choose status badge color"
            className="h-8 w-12 rounded border border-slate-200 cursor-pointer self-center"
          />
          <button
            type="submit"
            className="flex items-center space-x-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Status</span>
          </button>
        </form>

        {/* List of statuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {dropdownSettings.statuses.map((st) => (
            <div
              key={st.key}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50 text-xs"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: st.color }}
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {st.label}
                </span>
              </div>

              {/* Don't delete mandatory statuses unless explicitly requested */}
              <button
                onClick={() => {
                  if (window.confirm(`Delete status "${st.label}"?`)) {
                    deleteStatus(st.key);
                  }
                }}
                title="Delete Status"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
