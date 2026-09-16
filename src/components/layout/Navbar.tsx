import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Megaphone, 
  PhoneCall, 
  Sparkles,
  Download,
  Zap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    isDarkMode, 
    toggleDarkMode, 
    setIsLeadModalOpen, 
    setLeadToEdit,
    resetAllData,
    exportCSV,
    setActiveTab,
    metaConfig
  } = useCRM();

  const [showToast, setShowToast] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all Meta Ads leads and dropdowns back to initial demonstration dataset?')) {
      resetAllData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => setActiveTab('leads')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 text-white cursor-pointer"
        >
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span 
              onClick={() => setActiveTab('leads')}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white cursor-pointer"
            >
              Meta Leads CRM
            </span>
            <button
              onClick={() => setActiveTab('integration')}
              title="Open Meta Ads Integration"
              className="hidden sm:inline-flex items-center space-x-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
            >
              <Zap className="h-3 w-3 text-blue-500" />
              <span>Meta Sync</span>
            </button>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block">
            Telecalling, Call Reports & Student Registration
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative mx-4 max-w-md flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads by name, phone, campaign, ad..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Export CSV button */}
        <button
          onClick={exportCSV}
          title="Export Leads CSV"
          className="hidden md:flex items-center space-x-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>

        {/* Demo Data Reset */}
        <button
          onClick={handleReset}
          title="Reset to Realistic Demo Data"
          className="hidden lg:flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Demo Data</span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Add Lead Button */}
        <button
          onClick={() => { setLeadToEdit(null); setIsLeadModalOpen(true); }}
          className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Meta Lead</span>
        </button>

        {/* Telecaller User avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-xs shadow-sm">
          HR
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-white dark:text-slate-900">
          <Sparkles className="mr-2 h-4 w-4 text-indigo-400" />
          <span>Demo Meta leads dataset successfully reloaded!</span>
        </div>
      )}
    </header>
  );
};
