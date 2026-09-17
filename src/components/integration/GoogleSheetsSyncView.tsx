import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { GoogleSheetsService, SheetConnectionTestResult } from '../../services/googleSheetsService';
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
  Info
} from 'lucide-react';

export const GoogleSheetsSyncView: React.FC = () => {
  const { 
    googleSheetConfig, 
    updateGoogleSheetConfig, 
    syncGoogleSheetLeads, 
    isSyncingSheet, 
    leads,
    setActiveTab 
  } = useCRM();

  const [sheetUrl, setSheetUrl] = useState(googleSheetConfig.sheetUrl);
  const [sheetName, setSheetName] = useState(googleSheetConfig.sheetName || '');
  const [gid, setGid] = useState(googleSheetConfig.gid || '0');
  const [autoSync, setAutoSync] = useState(googleSheetConfig.autoSync);
  const [syncInterval, setSyncInterval] = useState(googleSheetConfig.syncInterval || 2);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<SheetConnectionTestResult | null>(null);
  const [saveBanner, setSaveBanner] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncResultBanner, setSyncResultBanner] = useState<{ text: string; isError?: boolean } | null>(null);

  // Handle Save
  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = GoogleSheetsService.parseSheetUrl(sheetUrl);

    updateGoogleSheetConfig({
      sheetUrl: sheetUrl.trim(),
      sheetId: parsed.sheetId,
      gid: gid || parsed.gid || '0',
      sheetName: sheetName.trim(),
      autoSync,
      syncInterval: Number(syncInterval),
      isConnected: parsed.isValid,
    });

    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3000);
  };

  // Test Connection
  const handleTestConnection = async () => {
    if (!sheetUrl.trim()) {
      alert('Please enter a Google Sheet URL first.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await GoogleSheetsService.testConnection(sheetUrl, gid, sheetName);
      setTestResult(res);

      if (res.success && res.sheetId) {
        updateGoogleSheetConfig({
          sheetUrl: sheetUrl.trim(),
          sheetId: res.sheetId,
          gid: res.gid || '0',
          sheetName: sheetName.trim(),
          isConnected: true,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to Google Sheet.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Manual Sync Now Trigger
  const handleSyncNow = async () => {
    if (!sheetUrl.trim()) {
      alert('Please enter and save your Google Sheet URL before syncing.');
      return;
    }

    // Save first if URL changed
    if (sheetUrl !== googleSheetConfig.sheetUrl) {
      handleSaveConfig();
    }

    const res = await syncGoogleSheetLeads(true);
    setSyncResultBanner({
      text: res.message,
      isError: !res.success,
    });
    setTimeout(() => setSyncResultBanner(null), 5000);
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSheetUrl(text.trim());
      }
    } catch (e) {
      // Clipboard permissions
    }
  };

  const untouchedCount = leads.filter(l => !l.isProcessed).length;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Google Sheets Live Sync
              </h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                googleSheetConfig.isConnected 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                <span className={`h-2 w-2 rounded-full ${googleSheetConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {googleSheetConfig.isConnected ? 'Live Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Live automated lead extraction from your Meta Ads connected Google Sheet into the Untouched Leads queue.
            </p>
          </div>
        </div>

        {/* Quick Sync & Go to Untouched Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncNow}
            disabled={isSyncingSheet || !sheetUrl}
            className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingSheet ? 'animate-spin' : ''}`} />
            <span>{isSyncingSheet ? 'Fetching Live Rows...' : 'Sync Google Sheet Now'}</span>
          </button>

          <button
            onClick={() => setActiveTab('untouched')}
            className="flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 transition cursor-pointer"
          >
            <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Untouched ({untouchedCount})</span>
          </button>
        </div>
      </div>

      {/* Notifications / Feedback Banners */}
      {saveBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm">Google Sheets sync configuration saved successfully!</span>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Saved</span>
        </div>
      )}

      {syncResultBanner && (
        <div className={`rounded-xl border p-4 flex items-center justify-between animate-fadeIn ${
          syncResultBanner.isError 
            ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300' 
            : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {syncResultBanner.isError ? (
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="font-semibold text-sm">{syncResultBanner.text}</span>
          </div>
        </div>
      )}

      {/* Sync Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Connection Status</span>
            <span className={`h-2.5 w-2.5 rounded-full ${googleSheetConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {googleSheetConfig.isConnected ? 'Live Active' : 'Disconnected'}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {googleSheetConfig.autoSync ? `Auto-sync every ${googleSheetConfig.syncInterval}m` : 'Manual sync only'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Synced</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {googleSheetConfig.lastSyncAt ? new Date(googleSheetConfig.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {googleSheetConfig.lastSyncAt ? new Date(googleSheetConfig.lastSyncAt).toLocaleDateString() : 'Awaiting first sync'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sheet Rows</span>
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {googleSheetConfig.lastFetchedRows || 0}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Detected from Google Sheet
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">New Leads Ingested</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {googleSheetConfig.totalSyncedCount || 0}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Deduplicated & added to Untouched
          </span>
        </div>
      </div>

      {/* Main Connection Setup Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <span>Connect Meta Ads Google Sheet</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter the shareable link of the Google Sheet where your Meta Lead Ads submissions are recorded.
          </p>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Google Sheet URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handlePasteClipboard}
                title="Paste URL from Clipboard"
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Paste
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Supports any standard Google Sheets edit link, share link, or published CSV link.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Sheet Tab Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tab / Sheet Name (Optional)
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="e.g. Sheet1 or MetaLeads"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">Leave empty to use default first tab</p>
            </div>

            {/* Auto-Sync Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Background Auto-Sync
              </label>
              <div className="flex items-center space-x-3 mt-1.5">
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
                  {autoSync ? 'Enabled (Live Polling)' : 'Disabled (Manual)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Automatically checks for new rows</p>
            </div>

            {/* Sync Interval */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Auto-Sync Frequency
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(Number(e.target.value))}
                disabled={!autoSync}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-50"
              >
                <option value={1}>Every 1 Minute (Ultra Real-Time)</option>
                <option value={2}>Every 2 Minutes (Recommended)</option>
                <option value={5}>Every 5 Minutes</option>
                <option value={10}>Every 10 Minutes</option>
                <option value={15}>Every 15 Minutes</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Interval for querying Google Sheets</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !sheetUrl}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition disabled:opacity-50 cursor-pointer"
              >
                {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" /> : <Zap className="h-3.5 w-3.5 text-emerald-500" />}
                <span>{isTesting ? 'Testing Link...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncingSheet || !sheetUrl}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                <span>{isSyncingSheet ? 'Ingesting Leads...' : 'Sync Live Leads Now'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>

        {/* Test Connection Diagnostics Banner */}
        {testResult && (
          <div className={`rounded-xl border p-4 transition-all ${
            testResult.success 
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' 
              : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
          }`}>
            <div className="flex items-start space-x-3">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="space-y-2 flex-1">
                <p className="font-bold text-sm">{testResult.message}</p>
                {testResult.success && testResult.headers && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Detected Meta Columns ({testResult.headers.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {testResult.headers.map((h, i) => (
                        <span key={i} className="rounded-md bg-white/70 dark:bg-emerald-900/60 px-2 py-0.5 text-[11px] font-mono font-medium border border-emerald-300 dark:border-emerald-700">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {!testResult.success && (
                  <div className="text-xs text-rose-700 dark:text-rose-300 space-y-1 mt-1">
                    <p className="font-semibold">Troubleshooting Steps:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Open your Google Sheet and click the blue <strong>"Share"</strong> button.</li>
                      <li>Under <em>General Access</em>, ensure it is set to <strong>"Anyone with the link can view"</strong>.</li>
                      <li>Alternatively, go to <strong>File &gt; Share &gt; Publish to web</strong>, choose <strong>Comma-separated values (.csv)</strong> and click <strong>Publish</strong>.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Google Sheet Connection Walkthrough */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-500" />
            <span>3-Step Quick Guide: How to Connect Your Google Sheet</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Follow these 3 simple steps in your Google Sheet to allow the CRM to read incoming Meta leads securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Open Google Sheet</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Open the Google Sheet where your Meta Lead Ads form responses are automatically collected (via Zapier, native Meta Sheets connection, or CSV).
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Set Share to "Viewer"</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Click the top-right blue <strong>Share</strong> button. Under <strong>General access</strong>, change <em>Restricted</em> to <strong>Anyone with the link</strong> (Role: <em>Viewer</em>).
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                3
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Paste Link in CRM</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Click <strong>Copy link</strong>, paste it into the URL field above, and click <strong>"Sync Live Leads Now"</strong>. New leads will stream directly into <strong>Untouched Leads</strong>!
            </p>
          </div>
        </div>

        {/* Intelligent Lead Processing Explanation */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-indigo-950 dark:text-indigo-200 text-sm">
                How Live Lead Ingestion Works in This CRM
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Zero Duplication:</strong> The CRM checks phone numbers and emails. Existing leads are never duplicated or overwritten.</li>
                <li><strong>Counselor Protection:</strong> If a lead has already been assigned to a counselor or has call reports logged, its status and notes are 100% preserved.</li>
                <li><strong>Submission Timestamp:</strong> Each lead's exact Date and Time of collection from Meta is recorded.</li>
                <li><strong>Course & Campaign Attribution:</strong> Automatically categorizes the module (SAP, AWS, Cloud, Data Science, AI) and links campaign attribution.</li>
                <li><strong>Goes Straight to Untouched Leads:</strong> Telecallers will see fresh leads appear immediately at the top of the Untouched queue.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
