import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { ViewMode, ColumnVisibility } from '../../types/crm';
import { 
  Table as TableIcon, 
  Kanban, 
  LayoutGrid, 
  SlidersHorizontal, 
  Check, 
  RotateCcw,
  Eye,
  Filter
} from 'lucide-react';

interface ViewCustomizerProps {
  onApplyPreset?: (presetKey: string) => void;
  activePreset?: string;
}

export const ViewCustomizer: React.FC<ViewCustomizerProps> = ({ onApplyPreset, activePreset }) => {
  const { 
    viewMode, 
    setViewMode, 
    columnVisibility, 
    toggleColumn, 
    resetColumns 
  } = useCRM();

  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const columnsList: { key: keyof ColumnVisibility; label: string }[] = [
    { key: 'showDate', label: 'Date & Time of Lead' },
    { key: 'showEmail', label: 'Email Address' },
    { key: 'showModule', label: 'Course Module' },
    { key: 'showCampaign', label: 'Campaign Name' },
    { key: 'showAdset', label: 'Adset Name' },
    { key: 'showAdName', label: 'Ad Name' },
    { key: 'showHr', label: 'Counselor (HR)' },
    { key: 'showStatus', label: 'Lead Status' },
    { key: 'showCallBack', label: 'Call Back Time' },
    { key: 'showCallsCount', label: 'Calls Logged' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-xl border dark:border-slate-800">
      {/* View Mode Switcher (Table / Kanban / Cards) */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            viewMode === 'table'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <TableIcon className="h-3.5 w-3.5" />
          <span>Table View</span>
        </button>

        <button
          onClick={() => setViewMode('kanban')}
          className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            viewMode === 'kanban'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Kanban className="h-3.5 w-3.5" />
          <span>Kanban View</span>
        </button>

        <button
          onClick={() => setViewMode('cards')}
          className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            viewMode === 'cards'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Cards View</span>
        </button>
      </div>

      {/* Right side: Column Customizer & View Presets */}
      <div className="flex items-center space-x-2">
        {/* Quick Presets */}
        {onApplyPreset && (
          <div className="hidden lg:flex items-center space-x-1 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Presets:</span>
            {[
              { key: 'all', label: 'All Leads' },
              { key: 'hot', label: 'Hot Leads' },
              { key: 'callbacks', label: 'Call Backs' },
              { key: 'registered', label: 'Registrations' },
            ].map(preset => (
              <button
                key={preset.key}
                onClick={() => onApplyPreset(preset.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  activePreset === preset.key
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Column Customizer Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Customize Columns</span>
          </button>

          {showColumnMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowColumnMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                    <Eye className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Visible Columns</span>
                  </span>
                  <button
                    onClick={resetColumns}
                    title="Reset to default columns"
                    className="flex items-center text-[10px] text-slate-400 hover:text-indigo-600"
                  >
                    <RotateCcw className="h-3 w-3 mr-0.5" />
                    Reset
                  </button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {columnsList.map(col => (
                    <label
                      key={col.key}
                      className="flex items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <span>{col.label}</span>
                      <input
                        type="checkbox"
                        checked={columnVisibility[col.key]}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
