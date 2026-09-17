import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { DropdownEditor } from './DropdownEditor';
import { MetaAdsService } from '../../services/metaAdsService';
import { 
  Sliders, 
  Zap, 
  MessageSquare, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Layers,
  Key,
  DollarSign,
  Phone,
  HelpCircle,
  Copy,
  Check,
  BookOpen,
  Info,
  FileSpreadsheet
} from 'lucide-react';
import { GoogleSheetsSyncView } from '../integration/GoogleSheetsSyncView';

type SettingsTab = 'google_sheets' | 'meta_api' | 'guide' | 'dropdowns' | 'communication' | 'backup';

export const SettingsView: React.FC = () => {
  const { 
    marketingConfig, 
    updateMarketingConfig,
    crmSettings,
    updateCrmSettings,
    metaConfig,
    updateMetaConfig,
    exportDatabase,
    exportCSV,
    importDatabase,
    resetAllData,
    syncCampaignInsights,
    leads
  } = useCRM();

  const [activeTab, setActiveTab] = useState<SettingsTab>('meta_api');
  
  // Local state for forms
  const [adAccountId, setAdAccountId] = useState(marketingConfig.adAccountId);
  const [accountName, setAccountName] = useState(marketingConfig.accountName || '');
  const [accessToken, setAccessToken] = useState(marketingConfig.accessToken);
  const [appId, setAppId] = useState(marketingConfig.appId);
  const [appSecret, setAppSecret] = useState(marketingConfig.appSecret);
  const [pageId, setPageId] = useState(marketingConfig.pageId);
  const [currency, setCurrency] = useState(marketingConfig.currency || 'INR');
  const [autoSyncInterval, setAutoSyncInterval] = useState(marketingConfig.autoSyncInterval || '15m');

  // WhatsApp & Calling settings
  const [countryCode, setCountryCode] = useState(crmSettings.defaultCountryCode || '+91');
  const [whatsappTemplate, setWhatsappTemplate] = useState(crmSettings.whatsappTemplate);

  // Testing connection state
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    accountName?: string;
    permissions?: string[];
  } | null>(null);

  // Save banners
  const [savedBanner, setSavedBanner] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Handle Meta Config Save
  const handleSaveMetaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateMarketingConfig({
      adAccountId: adAccountId.trim(),
      accountName: accountName.trim(),
      accessToken: accessToken.trim(),
      appId: appId.trim(),
      appSecret: appSecret.trim(),
      pageId: pageId.trim(),
      currency,
      autoSyncInterval,
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  // Handle Communication Settings Save
  const handleSaveCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    updateCrmSettings({
      defaultCountryCode: countryCode.trim(),
      whatsappTemplate: whatsappTemplate.trim(),
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  // Test Meta API Connection
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    try {
      const result = await MetaAdsService.testConnection({
        ...marketingConfig,
        adAccountId,
        accessToken,
        currency,
      });
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Connection failed due to network or authentication error.',
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  // Handle File Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabase(content);
        if (ok) {
          alert('Database successfully restored from JSON backup!');
        } else {
          alert('Invalid JSON backup file format. Please check the file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Insert token placeholder into template
  const insertPlaceholder = (tag: string) => {
    setWhatsappTemplate(prev => `${prev} {${tag}}`);
  };

  // Live WhatsApp Preview Text
  const previewWhatsAppText = whatsappTemplate
    .replace(/{name}/g, 'Rahul Sharma')
    .replace(/{module}/g, 'SAP')
    .replace(/{counselor}/g, 'Priya Sharma')
    .replace(/{date}/g, new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              CRM Control & Settings Hub
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage direct Meta Marketing API credentials, dynamic dropdown lists, telecalling templates, and system backups.
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Toast */}
      {savedBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm">Settings saved successfully and persisted across sessions!</span>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Saved</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('google_sheets')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'google_sheets'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Google Sheets Live Sync
        </button>

        <button
          onClick={() => setActiveTab('meta_api')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'meta_api'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="h-4 w-4" />
          Meta Ads & Marketing API
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Step-by-Step Connection Guide
        </button>

        <button
          onClick={() => setActiveTab('dropdowns')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'dropdowns'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          Editable Dropdown Lists
        </button>

        <button
          onClick={() => setActiveTab('communication')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'communication'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Telecalling & WhatsApp
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="h-4 w-4" />
          Backup & Storage
        </button>
      </div>

      {/* Tab 0: Google Sheets Live Sync */}
      {activeTab === 'google_sheets' && (
        <GoogleSheetsSyncView />
      )}

      {/* Tab 1: Meta Marketing API Integration */}
      {activeTab === 'meta_api' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveMetaConfig} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Meta Marketing API & Ad Account Connection
                </h3>
                <p className="text-xs text-slate-500">
                  Connect your Meta Ads Manager to retrieve live ad spend, budget, CPL, impressions, reach, and click metrics.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Graph API v20.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Ad Account ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta Ad Account ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adAccountId}
                    onChange={(e) => setAdAccountId(e.target.value)}
                    placeholder="act_120248848255150533"
                    className="w-full font-mono text-sm rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Found in your Meta Ads Manager URL (e.g. <code>act_120248848255150533</code>).
                </p>
              </div>

              {/* Account Nickname */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Ad Account Label / Nickname
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Nexus Tech Ed Ads Manager"
                  className="w-full text-sm rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  A recognizable name displayed across reports.
                </p>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Ad Account Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="AED">AED (United Arab Emirates Dirham)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  All spend, budget, and CPL metrics format in this currency.
                </p>
              </div>

              {/* Auto Sync Interval */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Background Insights Sync
                </label>
                <select
                  value={autoSyncInterval}
                  onChange={(e) => setAutoSyncInterval(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="5m">Every 5 Minutes (Real-Time)</option>
                  <option value="15m">Every 15 Minutes (Recommended)</option>
                  <option value="1h">Hourly</option>
                  <option value="manual">Manual Refresh Only</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Interval for fetching campaign spend from Meta Graph API.
                </p>
              </div>

              {/* Meta User / System User Access Token */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  User Access Token (Long-Lived or System User) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="EAAL8b...[Your Meta Access Token]"
                    className="w-full font-mono text-xs rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Requires permissions: <code>ads_read</code>, <code>read_insights</code>, <code>leads_retrieval</code>.</span>
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline inline-flex items-center gap-1 dark:text-indigo-400"
                  >
                    Meta Graph API Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* App ID & Secret */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta App ID
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="827491048291042"
                  className="w-full font-mono text-xs rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta App Secret
                </label>
                <input
                  type="password"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full font-mono text-xs rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Test Connection Diagnostic Box */}
            {testResult && (
              <div className={`rounded-xl border p-4 text-xs space-y-2 ${
                testResult.success 
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300' 
                  : 'border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.accountName && (
                  <div>Verified Account: <strong>{testResult.accountName}</strong></div>
                )}
                {testResult.permissions && testResult.permissions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="font-semibold">Granted Permissions:</span>
                    {testResult.permissions.map(p => (
                      <span key={p} className="bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px] border border-current">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConn}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isTestingConn ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
                {isTestingConn ? 'Testing API...' : 'Test Connection'}
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer active:scale-95"
              >
                <Save className="h-4 w-4" />
                Save Meta API Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Step-by-Step Connection Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50 p-6 dark:border-indigo-950/60 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-lg">
              <BookOpen className="h-5 w-5" />
              <span>Complete Step-by-Step Guide: Connecting Meta & This CRM</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl">
              Follow these simple steps to synchronize <strong>all data</strong> from Meta Ads Manager (Facebook & Instagram): Total Ad Spend, Daily Budgets, CPL, Impressions, Reach, Clicks, and Real-Time Instant Form Leads directly into your Untouched Leads queue.
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> 1. Marketing Spend API
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Budget, Spend & CPL</h4>
              <p className="text-xs text-slate-500">
                Syncs daily budget, spend, cost per lead, impressions, and CTR via Meta Graph API v20.0.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 2. Real-Time Leads
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Instant Forms & Webhook</h4>
              <p className="text-xs text-slate-500">
                Pushes prospect Name, Phone, Email, Campaign attribution, and Date/Time directly into Untouched Leads.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" /> 3. Instant CSV Import
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Zero-Code Quick Sync</h4>
              <p className="text-xs text-slate-500">
                Download official Meta Ads CSV export and drag-and-drop to import hundreds of past leads in 2 seconds.
              </p>
            </div>
          </div>

          {/* Detailed Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">1</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create a Meta App in Meta for Developers
                </h3>
              </div>
              <div className="pl-9 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>1. Open your web browser and navigate to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold dark:text-indigo-400">developers.facebook.com <ExternalLink className="inline h-3 w-3" /></a> and log in with your Facebook account.</p>
                <p>2. Click <strong>My Apps</strong> in the top-right corner $\rightarrow$ click <strong>Create App</strong>.</p>
                <p>3. Select <strong>Other</strong> as your use case $\rightarrow$ click <strong>Next</strong>.</p>
                <p>4. Select <strong>Business</strong> as the App Type $\rightarrow$ click <strong>Next</strong>.</p>
                <p>5. Enter an App Name (e.g. <em>Nexus CRM Integration</em>) and select your Meta Business Account $\rightarrow$ click <strong>Create App</strong>.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">2</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add "Marketing API" & "Webhooks" Products
                </h3>
              </div>
              <div className="pl-9 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>1. In your Meta App Dashboard sidebar, scroll down to <strong>Add Products</strong>.</p>
                <p>2. Find <strong>Marketing API</strong> $\rightarrow$ click <strong>Set Up</strong>.</p>
                <p>3. Find <strong>Webhooks</strong> $\rightarrow$ click <strong>Set Up</strong>.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">3</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generate a Permanent (Never-Expiring) System User Token
                </h3>
              </div>
              <div className="pl-9 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>Standard user tokens expire after 60 days. Creating a <strong>System User Token</strong> ensures permanent, uninterrupted CRM sync 24/7:</p>
                <p>1. Open <a href="https://business.facebook.com/settings" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold dark:text-indigo-400">business.facebook.com/settings <ExternalLink className="inline h-3 w-3" /></a> (Business Settings).</p>
                <p>2. Under <strong>Users</strong> in the left menu, click <strong>System Users</strong> $\rightarrow$ click <strong>Add</strong>.</p>
                <p>3. Set Name to <em>CRM Lead Bot</em> and System User Role to <strong>Admin</strong> $\rightarrow$ click <strong>Create System User</strong>.</p>
                <p>4. Click <strong>Assign Assets</strong>:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Under <strong>Pages</strong>: Select your Facebook Page $\rightarrow$ enable <strong>Full Control</strong>.</li>
                  <li>Under <strong>Ad Accounts</strong>: Select your Ad Account $\rightarrow$ enable <strong>Full Control</strong> (Manage Campaigns).</li>
                </ul>
                <p>5. Click <strong>Generate New Token</strong>:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Select your App from the dropdown.</li>
                  <li>Set Token Expiration: <strong>Never</strong>.</li>
                  <li>Check the following required permissions:
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['ads_read', 'read_insights', 'leads_retrieval', 'pages_manage_ads', 'pages_read_engagement', 'pages_show_list'].map(scope => (
                        <code key={scope} className="rounded bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                          {scope}
                        </code>
                      ))}
                    </div>
                  </li>
                </ul>
                <p>6. Click <strong>Generate Token</strong> $\rightarrow$ copy the generated string (starts with <code>EAA...</code>).</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">4</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Locate Your Meta Ad Account ID (`act_...`)
                </h3>
              </div>
              <div className="pl-9 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>1. Open <a href="https://adsmanager.facebook.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold dark:text-indigo-400">adsmanager.facebook.com <ExternalLink className="inline h-3 w-3" /></a>.</p>
                <p>2. Look at the top-left account selector dropdown or your browser's address bar:</p>
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=<span className="text-indigo-600 dark:text-indigo-400 font-bold">120248848255150533</span>
                </div>
                <p>3. Your Ad Account ID is <code>act_120248848255150533</code>.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">5</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Save Credentials in CRM & Verify with 1-Click Test
                </h3>
              </div>
              <div className="pl-9 space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>1. Go to the <strong>Meta Ads & Marketing API</strong> tab right above.</p>
                <p>2. Paste your <strong>Ad Account ID</strong> and <strong>Access Token</strong>.</p>
                <p>3. Select your currency (e.g. <strong>INR ₹</strong> or <strong>USD $</strong>).</p>
                <p>4. Click <strong>Test Connection</strong>. You will receive an instant diagnostic green confirmation showing active token permissions.</p>
                <p>5. Click <strong>Save Meta API Settings</strong>.</p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('meta_api')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Open Meta Ads & Marketing API Tab Now
                  </button>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">6</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Real-Time Lead Webhook Subscription
                </h3>
              </div>
              <div className="pl-9 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>1. In Meta App Dashboard $\rightarrow$ <strong>Webhooks</strong> $\rightarrow$ select <strong>Page</strong> in the dropdown.</p>
                <p>2. Click <strong>Subscribe to this object</strong>:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Callback URL: Enter your CRM deployment URL or webhook endpoint.</li>
                  <li>Verify Token: <code>nexus_meta_leads_verify_token_2026</code></li>
                </ul>
                <p>3. In the list of subscription fields, locate <strong>`leadgen`</strong> $\rightarrow$ click <strong>Subscribe</strong>.</p>
                <p>4. Now, any time a candidate submits a lead form on Facebook or Instagram, Meta sends the lead data (Name, Phone, Email, Campaign, Adset, Ad, Form Responses, Submission Date & Time) directly into your <strong>Untouched Leads</strong> queue!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Editable Dropdown Lists (Modules, HR Telecallers, Statuses) */}
      {activeTab === 'dropdowns' && (
        <div className="space-y-6">
          <DropdownEditor />
        </div>
      )}

      {/* Tab 3: Telecalling & WhatsApp Settings */}
      {activeTab === 'communication' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveCommunication} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Telecalling & WhatsApp Outreach Config
              </h3>
              <p className="text-xs text-slate-500">
                Configure one-click WhatsApp outreach message templates and default dialing prefixes for telecallers.
              </p>
            </div>

            <div className="space-y-4">
              {/* Default Country Dialing Code */}
              <div className="max-w-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Default Country Dialing Code
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+91"
                    className="w-full font-mono text-sm rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Prepend when telecallers click to dial or open WhatsApp.
                </p>
              </div>

              {/* WhatsApp Message Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Quick WhatsApp Pitch Template
                  </label>
                  <span className="text-xs text-slate-400">
                    Tokens auto-populate from lead details
                  </span>
                </div>

                {/* Pill Insert Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-xs text-slate-400">Insert tag:</span>
                  {['name', 'module', 'counselor', 'date'].map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => insertPlaceholder(token)}
                      className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 transition-colors cursor-pointer"
                    >
                      +{`{${token}}`}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Live Preview Box */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2">
                <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" /> Live WhatsApp Chat Preview
                </span>
                <div className="rounded-xl bg-white dark:bg-slate-800 p-3.5 shadow-sm text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  <p className="whitespace-pre-wrap">{previewWhatsAppText}</p>
                  <span className="block text-right text-[10px] text-slate-400 mt-1">12:30 PM • Sent</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer active:scale-95"
              >
                <Save className="h-4 w-4" />
                Save Outreach Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Backup, Export & System Restore */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                CRM Database Backup, Export & Restore
              </h3>
              <p className="text-xs text-slate-500">
                Safeguard all leads, telecalling logs, Meta campaign insights, and custom dropdown configurations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Card 1: Full JSON Backup */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Download className="h-5 w-5" />
                  <h4>Full Database Backup (JSON)</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Exports entire state: all {leads.length} leads, call reports, Meta marketing configurations, and custom dropdowns.
                </p>
                <button
                  onClick={exportDatabase}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download JSON Backup
                </button>
              </div>

              {/* Card 2: Leads CSV Export */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Download className="h-5 w-5" />
                  <h4>Export Leads to Excel / CSV</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Clean CSV formatted with Name, Phone, Email, Module, Date, Counselor, Status, and Call logs count.
                </p>
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4 text-emerald-600" />
                  Download Leads CSV
                </button>
              </div>

              {/* Card 3: Restore Database */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3 md:col-span-2">
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold">
                  <Upload className="h-5 w-5" />
                  <h4>Restore Database from JSON Backup</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Select a previous JSON backup file to overwrite and restore all leads, call histories, and configurations.
                </p>
                <label className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 transition-all cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Select Backup File (.json)
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Factory Reset Section */}
            <div className="pt-6 border-t border-rose-200 dark:border-rose-900/40">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4" /> Danger Zone: Factory Reset
                  </h4>
                  <p className="text-xs text-slate-500">
                    Resets all leads, call logs, dropdown options, and Meta credentials back to initial seed data.
                  </p>
                </div>

                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset to Factory Defaults
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetAllData();
                        setShowResetConfirm(false);
                        alert('CRM has been reset to factory defaults.');
                      }}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-all cursor-pointer"
                    >
                      Confirm Reset Everything
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
