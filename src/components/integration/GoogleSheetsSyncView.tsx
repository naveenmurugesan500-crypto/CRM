import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { GoogleSheetsService, SheetConnectionTestResult } from '../../services/googleSheetsService';
import { GoogleSheetSource } from '../../types/crm';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Flame, 
  ArrowRight,
  HelpCircle,
  Play,
  Info,
  Plus,
  Trash2,
  Edit2,
  X,
  Building2,
  CheckCheck
} from 'lucide-react';

const COURSE_MODULE_OPTIONS = [
  'Full-Stack Web Dev',
  'Data Science & AI',
  'SAP ERP & S/4HANA',
  'Cloud & DevOps (AWS)',
  'Generative AI & LLMs',
  'Cyber Security',
  'Python Programming',
  'Digital Marketing',
  'General Inquiry'
];

export const GoogleSheetsSyncView: React.FC = () => {
  const { 
    multiSheetConfig,
    updateMultiSheetConfig,
    addSheetSource,
    updateSheetSource,
    deleteSheetSource,
    syncAllSheetSources,
    syncSingleSheetSource,
    isSyncingAllSheets,
    adAccounts,
    leads,
    setActiveTab 
  } = useCRM();

  // Local state for auto-sync intervals
  const [autoSync, setAutoSync] = useState(multiSheetConfig.autoSync);
  const [syncInterval, setSyncInterval] = useState(multiSheetConfig.syncInterval || 2);
  const [settingsSavedBanner, setSettingsSavedBanner] = useState(false);

  // Modal State for Add / Edit Sheet Source
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalGid, setModalGid] = useState('0');
  const [modalSheetName, setModalSheetName] = useState('');
  const [modalTargetModule, setModalTargetModule] = useState(COURSE_MODULE_OPTIONS[0]);
  const [modalAdAccountName, setModalAdAccountName] = useState(
    adAccounts.length > 0 ? adAccounts[0].accountName : 'Meta Primary Account'
  );
  const [modalEnabled, setModalEnabled] = useState(true);

  // In-flight testing state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; res: SheetConnectionTestResult } | null>(null);

  // Sync Results Notification
  const [syncNotice, setSyncNotice] = useState<{ message: string; isError?: boolean } | null>(null);

  const untouchedCount = leads.filter(l => !l.isProcessed).length;
  const activeSources = multiSheetConfig.sources.filter(s => s.enabled);
  const totalSyncedLeadsAcrossAll = multiSheetConfig.sources.reduce(
    (sum, s) => sum + (s.totalSyncedCount || 0), 0
  );

  // Open Modal to Add New Sheet
  const handleOpenAddModal = () => {
    setEditingSourceId(null);
    setModalName(`Lead Form #${multiSheetConfig.sources.length + 1} - ${modalTargetModule}`);
    setModalUrl('');
    setModalGid('0');
    setModalSheetName('');
    setModalTargetModule(COURSE_MODULE_OPTIONS[0]);
    setModalAdAccountName(adAccounts.length > 0 ? adAccounts[0].accountName : 'Meta Primary Account');
    setModalEnabled(true);
    setIsModalOpen(true);
  };

  // Open Modal to Edit Existing Sheet
  const handleOpenEditModal = (source: GoogleSheetSource) => {
    setEditingSourceId(source.id);
    setModalName(source.name);
    setModalUrl(source.sheetUrl);
    setModalGid(source.gid || '0');
    setModalSheetName(source.sheetName || '');
    setModalTargetModule(source.targetModule || COURSE_MODULE_OPTIONS[0]);
    setModalAdAccountName(source.adAccountName || (adAccounts.length > 0 ? adAccounts[0].accountName : 'Meta Primary Account'));
    setModalEnabled(source.enabled);
    setIsModalOpen(true);
  };

  // Save Modal (Create or Update)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalUrl.trim() || !modalName.trim()) {
      alert('Please fill in both a Form/Sheet Name and the Google Sheet URL.');
      return;
    }

    const parsed = GoogleSheetsService.parseSheetUrl(modalUrl);

    if (editingSourceId) {
      updateSheetSource(editingSourceId, {
        name: modalName.trim(),
        sheetUrl: modalUrl.trim(),
        sheetId: parsed.sheetId,
        gid: modalGid || parsed.gid || '0',
        sheetName: modalSheetName.trim(),
        targetModule: modalTargetModule,
        adAccountName: modalAdAccountName,
        enabled: modalEnabled,
      });
      setSyncNotice({ message: `Updated configuration for "${modalName}".` });
    } else {
      addSheetSource({
        name: modalName.trim(),
        sheetUrl: modalUrl.trim(),
        sheetId: parsed.sheetId,
        gid: modalGid || parsed.gid || '0',
        sheetName: modalSheetName.trim(),
        targetModule: modalTargetModule,
        adAccountName: modalAdAccountName,
        enabled: modalEnabled,
      });
      setSyncNotice({ message: `Added new Google Sheet source "${modalName}". Ready to sync!` });
    }

    setIsModalOpen(false);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  // Paste from clipboard helper in modal
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setModalUrl(text.trim());
      }
    } catch (e) {
      // clipboard permission fallback
    }
  };

  // Test Link for a specific source
  const handleTestSource = async (source: GoogleSheetSource) => {
    setTestingId(source.id);
    setTestResult(null);

    try {
      const res = await GoogleSheetsService.testConnection(source.sheetUrl, source.gid, source.sheetName);
      setTestResult({ id: source.id, res });
    } catch (err: any) {
      setTestResult({
        id: source.id,
        res: {
          success: false,
          message: err.message || 'Connection test failed.',
        },
      });
    } finally {
      setTestingId(null);
    }
  };

  // 1-Click Sync All Sheets
  const handleSyncAll = async () => {
    const res = await syncAllSheetSources();
    setSyncNotice({
      message: res.message,
      isError: !res.success,
    });
    setTimeout(() => setSyncNotice(null), 6000);
  };

  // Single Sheet Sync
  const handleSyncSingle = async (source: GoogleSheetSource) => {
    const res = await syncSingleSheetSource(source.id);
    setSyncNotice({
      message: res.message,
      isError: !res.success,
    });
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // Save Global Auto-Sync Settings
  const handleSaveAutoSyncSettings = () => {
    updateMultiSheetConfig({
      autoSync,
      syncInterval: Number(syncInterval),
    });
    setSettingsSavedBanner(true);
    setTimeout(() => setSettingsSavedBanner(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header & Master Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Multi-Sheet & Lead Form Integration
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {activeSources.length} Active Forms
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Run multiple Meta lead forms concurrently. Each Google Sheet feeds directly into <strong>Untouched Leads</strong> with course & ad account tagging.
              </p>
            </div>
          </div>
        </div>

        {/* Master Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Master 1-Click Sync All Sheets */}
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAllSheets || multiSheetConfig.sources.length === 0}
            className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer active:scale-95"
            title="Fetch live leads from all connected Google Sheets simultaneously"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingAllSheets ? 'animate-spin' : ''}`} />
            <span>{isSyncingAllSheets ? 'Syncing All Sheets...' : `Sync All (${multiSheetConfig.sources.length}) Sheets Now`}</span>
          </button>

          {/* Add Sheet Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead Form Sheet</span>
          </button>

          {/* Jump to Untouched Queue */}
          <button
            onClick={() => setActiveTab('untouched')}
            className="flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 transition cursor-pointer"
            title="View leads in Untouched Queue awaiting counselor assignment"
          >
            <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Untouched ({untouchedCount})</span>
          </button>
        </div>
      </div>

      {/* Sync / Settings Feedback Notifications */}
      {syncNotice && (
        <div className={`rounded-xl border p-4 flex items-center justify-between animate-in fade-in duration-200 ${
          syncNotice.isError 
            ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200' 
            : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
        }`}>
          <div className="flex items-center space-x-2">
            {syncNotice.isError ? (
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="font-semibold text-sm">{syncNotice.message}</span>
          </div>
          <button onClick={() => setSyncNotice(null)} className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {settingsSavedBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm">Auto-sync schedule updated successfully!</span>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Saved</span>
        </div>
      )}

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Connected Sheets</span>
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {multiSheetConfig.sources.length} <span className="text-xs font-normal text-slate-400">({activeSources.length} active)</span>
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Separate form endpoints
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Master Polling</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {multiSheetConfig.autoSync ? `Every ${multiSheetConfig.syncInterval || 2}m` : 'Manual Sync'}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {multiSheetConfig.lastSyncAllAt 
              ? `Last: ${new Date(multiSheetConfig.lastSyncAllAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
              : 'Awaiting sync'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leads Ingested</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalSyncedLeadsAcrossAll.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Deduplicated & verified
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Untouched Queue</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {untouchedCount}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Fresh leads awaiting counselor
          </span>
        </div>
      </div>

      {/* Multi-Sheet Cards Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Connected Meta Lead Form Google Sheets</span>
          </h2>
          <span className="text-xs text-slate-400">
            Each card represents an independent Meta Lead Form & Google Sheet
          </span>
        </div>

        {multiSheetConfig.sources.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">No Google Sheets connected yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              Connect your first Meta Lead Form Google Sheet to start streaming leads directly into Untouched Leads.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Connect First Google Sheet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {multiSheetConfig.sources.map((source) => {
              const isThisTesting = testingId === source.id;
              const sourceTest = testResult && testResult.id === source.id ? testResult.res : null;

              return (
                <div 
                  key={source.id} 
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-slate-900 ${
                    source.enabled 
                      ? 'border-slate-200 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700' 
                      : 'border-slate-200/60 opacity-60 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mt-0.5">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                          {source.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {/* Course Module Badge */}
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {source.targetModule || 'General'}
                          </span>
                          {/* Ad Account Badge */}
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Building2 className="h-2.5 w-2.5 text-slate-400" />
                            {source.adAccountName || 'Default Account'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enable / Disable Switch */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateSheetSource(source.id, { enabled: !source.enabled })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                          source.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={source.enabled ? 'Click to disable syncing this form' : 'Click to enable syncing this form'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            source.enabled ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Sheet Details & URL */}
                  <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="truncate max-w-[240px] font-mono text-[11px] text-slate-400" title={source.sheetUrl}>
                        {source.sheetUrl}
                      </span>
                      <a
                        href={source.sheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400 ml-2 whitespace-nowrap"
                      >
                        <span>Open Sheet</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 text-center text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Total Rows</span>
                        <strong className="text-slate-800 dark:text-slate-200">{source.lastFetchedRows || 0}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Leads Added</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{source.totalSyncedCount || 0}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Last Sync</span>
                        <strong className="text-slate-700 dark:text-slate-300">
                          {source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </strong>
                      </div>
                    </div>

                    {/* Last Sync Status Message */}
                    {source.lastSyncMessage && (
                      <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                        source.lastSyncStatus === 'error'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {source.lastSyncStatus === 'error' ? (
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-rose-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                        )}
                        <span className="truncate">{source.lastSyncMessage}</span>
                      </div>
                    )}

                    {/* Inline Test Result Diagnostics */}
                    {sourceTest && (
                      <div className={`p-2.5 rounded-xl border text-xs ${
                        sourceTest.success
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        <div className="font-bold">{sourceTest.message}</div>
                        {sourceTest.success && sourceTest.headers && (
                          <div className="text-[10px] mt-1 text-emerald-700 dark:text-emerald-400 truncate">
                            Headers: {sourceTest.headers.slice(0, 5).join(', ')}
                            {sourceTest.headers.length > 5 ? ` (+${sourceTest.headers.length - 5} more)` : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {/* Test Connection Button */}
                      <button
                        onClick={() => handleTestSource(source)}
                        disabled={isThisTesting}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer disabled:opacity-50"
                        title="Test link accessibility and detect headers"
                      >
                        {isThisTesting ? 'Testing...' : 'Test Link'}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(source)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        title="Edit Sheet details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${source.name}" from Google Sheets sync list?`)) {
                            deleteSheetSource(source.id);
                          }
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 cursor-pointer"
                        title="Delete this sheet source"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Single Sync Button */}
                    <button
                      onClick={() => handleSyncSingle(source)}
                      disabled={source.lastSyncStatus === 'syncing' || !source.enabled}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 cursor-pointer transition active:scale-95"
                    >
                      <RefreshCw className={`h-3 w-3 ${source.lastSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>{source.lastSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Sheet'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Background Auto-Sync Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Multi-Sheet Background Auto-Sync Scheduler</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuously query all enabled Google Sheets in the background so fresh Meta leads arrive in the CRM without clicking any buttons.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Auto Sync Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Background Auto-Polling
            </label>
            <div className="flex items-center space-x-3 mt-1">
              <button
                type="button"
                onClick={() => setAutoSync(!autoSync)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  autoSync ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {autoSync ? 'Enabled (Automated Background Ingestion)' : 'Disabled (Manual Sync Only)'}
              </span>
            </div>
          </div>

          {/* Sync Frequency */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Polling Frequency
            </label>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
              disabled={!autoSync}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-50 cursor-pointer"
            >
              <option value={1}>Every 1 Minute (Ultra Real-Time)</option>
              <option value={2}>Every 2 Minutes (Recommended)</option>
              <option value={5}>Every 5 Minutes</option>
              <option value={10}>Every 10 Minutes</option>
              <option value={15}>Every 15 Minutes</option>
            </select>
          </div>

          {/* Save Schedule Button */}
          <div className="flex items-end">
            <button
              onClick={handleSaveAutoSyncSettings}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Scheduler Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Lead Form Architecture Guide */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-500" />
            <span>How to Connect Multiple Meta Lead Forms via Google Sheets</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Running 5, 10, or 20 separate Meta Lead Forms across different Ad Accounts? Here is the foolproof setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Each Lead Form to Sheet</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              In Meta Ads Manager or via Zapier / Make, connect each Instant Lead Form to its own Google Sheet (e.g. <em>SAP Leads Form</em>, <em>Full-Stack Form</em>).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Set Share to "Viewer"</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Open the Google Sheet, click the blue <strong>Share</strong> button, and change General Access to <strong>"Anyone with the link can view"</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                3
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add Form in CRM</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Click <strong>"Add Lead Form Sheet"</strong> above, paste the URL, select the Course Module & Ad Account. That's it! 1-click sync or auto-poll handles the rest.
            </p>
          </div>
        </div>

        {/* Lead Guard Guarantee */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-indigo-950 dark:text-indigo-200 text-sm">
                Software Architecture: Multi-Sheet Ingestion & Anti-Duplicate Protection
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Parallel Multi-Sheet Querying:</strong> All Google Sheets are polled concurrently using <code>Promise.allSettled</code>, ensuring maximum sync speed.</li>
                <li><strong>Strict Cross-Sheet Deduplication:</strong> If a student submits multiple forms across different campaigns, the CRM deduplicates them via 10-digit phone and email so telecallers never double-call.</li>
                <li><strong>Counselor Protection:</strong> Assigned counselors, call history, and statuses are never overridden by incoming sheet updates.</li>
                <li><strong>Direct Route to Untouched Leads:</strong> Fresh leads land straight into the <strong>Untouched Leads</strong> queue ready for instant telecaller assignment.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Sheet Source Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>{editingSourceId ? 'Edit Google Sheet Source' : 'Add Meta Lead Form Google Sheet'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 pt-4">
              {/* Form / Sheet Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Lead Form / Sheet Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Web Dev - Lead Form #1"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Google Sheet URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Google Sheet URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                    value={modalUrl}
                    onChange={(e) => setModalUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                    title="Paste from clipboard"
                  >
                    Paste
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Ensure the sheet is set to <strong>"Anyone with the link can view"</strong>.
                </p>
              </div>

              {/* Module & Ad Account Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Course Module */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Course Module Tag
                  </label>
                  <select
                    value={modalTargetModule}
                    onChange={(e) => setModalTargetModule(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    {COURSE_MODULE_OPTIONS.map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned Meta Ad Account */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Meta Ad Account
                  </label>
                  <select
                    value={modalAdAccountName}
                    onChange={(e) => setModalAdAccountName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    {adAccounts.map((acc) => (
                      <option key={acc.id} value={acc.accountName}>
                        {acc.accountName} ({acc.adAccountId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GID & Tab Name (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Sheet Tab GID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={modalGid}
                    onChange={(e) => setModalGid(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tab Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sheet1"
                    value={modalSheetName}
                    onChange={(e) => setModalSheetName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Enable Switch */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="modalEnabledCheckbox"
                  checked={modalEnabled}
                  onChange={(e) => setModalEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="modalEnabledCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Enable automatic background syncing for this sheet
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{editingSourceId ? 'Save Changes' : 'Add Sheet Source'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
