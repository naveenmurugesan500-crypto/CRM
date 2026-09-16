import React, { useState, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaStorageService } from '../../services/storage';
import { 
  Megaphone, 
  CheckCircle2, 
  Upload, 
  Key, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  FileText,
  RefreshCw,
  Copy,
  ExternalLink,
  Zap
} from 'lucide-react';

export const MetaIntegrationView: React.FC = () => {
  const { 
    metaConfig, 
    updateMetaConfig, 
    simulateMetaLead, 
    importMetaLeads, 
    stats 
  } = useCRM();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageId, setPageId] = useState(metaConfig.pageId);
  const [appId, setAppId] = useState(metaConfig.appId);
  const [appSecret, setAppSecret] = useState(metaConfig.appSecret);
  const [accessToken, setAccessToken] = useState(metaConfig.accessToken);
  const [verifyToken, setVerifyToken] = useState(metaConfig.verifyToken);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateMetaConfig({
      pageId,
      appId,
      appSecret,
      accessToken,
      verifyToken,
      isConnected: true,
      lastSyncAt: new Date().toISOString(),
    });
    setSaveStatus('Meta configuration saved successfully!');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [pasteContent, setPasteContent] = useState('');
  const [importTab, setImportTab] = useState<'upload' | 'paste'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      try {
        const parsed = MetaStorageService.parseMetaAdsCSV(content);
        if (parsed.length > 0) {
          importMetaLeads(parsed);
          setImportStatus(`Successfully imported ${parsed.length} Meta leads into Untouched Leads!`);
        } else {
          setImportStatus('No valid lead records found in this file. Please check formatting.');
        }
      } catch (err) {
        setImportStatus('Failed to parse Meta export file.');
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!pasteContent.trim()) {
      alert('Please paste Meta Ads lead data into the text box.');
      return;
    }
    try {
      const parsed = MetaStorageService.parseMetaAdsCSV(pasteContent);
      if (parsed.length > 0) {
        importMetaLeads(parsed);
        setImportStatus(`Successfully imported ${parsed.length} Meta leads directly into Untouched Leads!`);
        setPasteContent('');
      } else {
        setImportStatus('No valid lead records parsed from the pasted text.');
      }
    } catch (err) {
      setImportStatus('Failed to parse pasted data.');
    }
    setTimeout(() => setImportStatus(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meta Ads (Facebook & Instagram) Integration Hub
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sync instant form leads automatically via Meta Graph Webhooks or import Facebook Leads Center CSV exports.
        </p>
      </div>

      {saveStatus && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 animate-in fade-in">
          {saveStatus}
        </div>
      )}

      {importStatus && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 animate-in fade-in">
          {importStatus}
        </div>
      )}

      {/* Live Status & Quick Test Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Meta Leads Ingestion Status:
              </h2>
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                <span>Connected & Ready</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Page ID: <code className="text-slate-600 dark:text-slate-300">{metaConfig.pageId}</code> • Last Event: {new Date(metaConfig.lastSyncAt || Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* 1-Click Simulator Button */}
        <button
          onClick={simulateMetaLead}
          className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-blue-700 hover:to-indigo-700 transition active:scale-95 self-start md:self-auto"
        >
          <Zap className="h-4 w-4" />
          <span>Simulate Incoming Meta Lead</span>
        </button>
      </div>

      {/* Two Column Section: CSV Importer & Webhook Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: Meta Ads Leads Center CSV/TSV Importer & Direct Paste */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Upload className="h-4 w-4" />
                <span>Method 1: Import Meta Ads Leads (CSV / TSV)</span>
              </div>
              <div className="flex items-center space-x-1 rounded-lg bg-slate-100 p-0.5 text-xs font-semibold dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setImportTab('upload')}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                    importTab === 'upload'
                      ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('paste')}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                    importTab === 'paste'
                      ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Direct Paste
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Import leads exported directly from your Meta Ads Manager or Facebook Page Leads Center.
            </p>

            {importTab === 'upload' ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center hover:bg-indigo-50/80 dark:border-indigo-900/60 dark:bg-indigo-950/20 cursor-pointer transition"
              >
                <FileText className="h-10 w-10 text-indigo-500 mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to Select Meta Export File (.csv, .tsv)
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supports tab-delimited or comma-delimited Meta lead files
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv, .tsv, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  rows={6}
                  placeholder={`Paste Meta Ads TSV or CSV rows here, for example:\nid\tcreated_time\tfull_name\tphone_number\temail\tcampaign_name...\nl:1628064518663536\t2026-09-16...\tSIVAKUMAR\tp:+919600723986...`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={handlePasteImport}
                  className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition active:scale-95"
                >
                  Import Pasted Leads (Direct to Untouched)
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
              How to export from Meta Ads:
            </span>
            Go to <strong>Ads Manager → Ads tab → Results column → On-Facebook Leads</strong> → Click <strong>Download CSV</strong> (or copy & paste rows).
          </div>
        </div>

        {/* Method 2: Real-Time Webhook Endpoint & Credentials */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">
            <Globe className="h-4 w-4" />
            <span>Method 2: Meta Webhook Endpoint</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Copy these details into your <strong>Meta App Dashboard → Webhooks → Page</strong> subscription:
          </p>

          <div className="space-y-3">
            {/* Callback URL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Callback URL (Meta App Webhook Endpoint)
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  readOnly
                  value="https://api.yourdomain.com/webhooks/meta-leadgen"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://api.yourdomain.com/webhooks/meta-leadgen', 'url')}
                  className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {copiedKey === 'url' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Verify Token */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Webhook Verify Token
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  readOnly
                  value={verifyToken}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(verifyToken, 'token')}
                  className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {copiedKey === 'token' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Subscribed Fields */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400 font-semibold block">Subscribed Webhook Field:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">leadgen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta API Credentials Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
          <Key className="h-5 w-5 text-indigo-500" />
          <span>Meta Graph API Credentials</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Used to retrieve full form response fields (Name, Phone, Email, custom course questions) via Graph API:
        </p>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meta Page ID *
              </label>
              <input
                type="text"
                required
                placeholder="108492049102948"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meta App ID
              </label>
              <input
                type="text"
                placeholder="827491048291042"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meta App Secret
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Page Access Token (Permanent or System User Token) *
            </label>
            <input
              type="text"
              required
              placeholder="EAAL8b... (Never-expiring Page Access Token)"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Save Meta Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Step by Step Meta App Setup Guide */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
          <HelpCircle className="h-4 w-4 text-indigo-500" />
          <span>Quick Setup Guide for Meta Developers</span>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <li>
            Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center">Meta for Developers <ExternalLink className="h-3 w-3 ml-0.5" /></a> and select or create your Business App.
          </li>
          <li>
            Under <strong>Add Products</strong>, choose <strong>Webhooks</strong> and select the <strong>Page</strong> object.
          </li>
          <li>
            Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> shown above, then click <strong>Verify and Save</strong>.
          </li>
          <li>
            Subscribe to the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">leadgen</code> event.
          </li>
          <li>
            Ensure your System User or Access Token includes <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">leads_retrieval</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">pages_manage_ads</code> permissions.
          </li>
        </ol>
      </div>
    </div>
  );
};
