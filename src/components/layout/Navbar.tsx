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
  Zap,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  Smartphone,
  User,
  ChevronDown,
  Check
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
    metaConfig,
    googleSheetConfig,
    syncGoogleSheetLeads,
    isSyncingSheet,
    multiSheetConfig,
    syncAllSheetSources,
    isSyncingAllSheets,
    currentUser,
    setCurrentUser,
    users,
    isMobileAppMode,
    setIsMobileAppMode
  } = useCRM();

  const [showToast, setShowToast] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleClearData = () => {
    if (window.confirm('Clear all stored CRM data and reset to a clean database? This cannot be undone.')) {
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
              onClick={() => setActiveTab('google_sheets')}
              title={googleSheetConfig.isConnected ? 'Google Sheets Live Connected' : 'Configure Google Sheets Live Sync'}
              className="hidden sm:inline-flex items-center space-x-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>Google Sheet</span>
              {googleSheetConfig.isConnected && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              title="Open Meta Ads Integration"
              className="hidden lg:inline-flex items-center space-x-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
            >
              <Zap className="h-3 w-3 text-blue-500" />
              <span>Meta Webhook</span>
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
        {/* Quick Google Sheets Sync Trigger */}
        {(multiSheetConfig?.sources?.length > 0 || googleSheetConfig.sheetUrl) && (
          <button
            onClick={() => multiSheetConfig?.sources?.length > 0 ? syncAllSheetSources() : syncGoogleSheetLeads(true)}
            disabled={isSyncingSheet || isSyncingAllSheets}
            title="Sync all connected Google Sheets for live leads"
            className="flex items-center space-x-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${(isSyncingSheet || isSyncingAllSheets) ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {(isSyncingSheet || isSyncingAllSheets) 
                ? 'Syncing...' 
                : (multiSheetConfig?.sources?.length > 1) 
                  ? `Sync ${multiSheetConfig.sources.length} Sheets` 
                  : 'Sync Sheet'}
            </span>
          </button>
        )}

        {/* Export CSV button */}
        <button
          onClick={exportCSV}
          title="Export Leads CSV"
          className="hidden md:flex items-center space-x-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>

        {/* Clear Database button */}
        <button
          onClick={handleClearData}
          title="Clear all CRM data and reset to a clean state"
          className="hidden lg:flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 text-slate-400" />
          <span>Clear Data</span>
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

        {/* Mobile App Mode Launcher */}
        <button
          onClick={() => setIsMobileAppMode(true)}
          title="Open Telecaller Mobile Application"
          className="hidden sm:inline-flex items-center space-x-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
        >
          <Smartphone className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden md:inline">Telecaller App</span>
        </button>

        {/* User profile dropdown & role indicator */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-2.5 dark:border-slate-700 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer shadow-xs"
          >
            <div className="hidden lg:block text-left pr-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser?.name || 'User'}
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Admin'}
              </div>
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 font-black text-white text-[11px] shadow-xs">
              {(currentUser?.name || 'HR').slice(0, 2).toUpperCase()}
            </div>

            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Staff User</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">{currentUser?.name}</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                  Role: {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Admin'}
                </span>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  Switch Active Role / User
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      if (u.role === 'telecaller') {
                        setIsMobileAppMode(true);
                      }
                      setIsUserMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-xl transition ${
                      currentUser?.id === u.id 
                        ? 'bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/60 dark:text-indigo-400' 
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-left">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{u.role.replace('_', ' ')}</div>
                    </div>
                    {currentUser?.id === u.id && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsMobileAppMode(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="flex w-full items-center space-x-1.5 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Launch Telecaller App View</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-white dark:text-slate-900">
          <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />
          <span>CRM database cleared & reset to clean state successfully!</span>
        </div>
      )}
    </header>
  );
};
