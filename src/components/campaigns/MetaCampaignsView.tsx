import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaAdsService } from '../../services/metaAdsService';
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Users, 
  MousePointer, 
  RefreshCw, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ExternalLink,
  Search,
  Zap,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const MetaCampaignsView: React.FC = () => {
  const { 
    campaignInsights, 
    marketingConfig, 
    syncCampaignInsights, 
    isSyncingCampaigns,
    setActiveTab,
    setSearchQuery,
    leads
  } = useCRM();

  const [dateRangeFilter, setDateRangeFilter] = useState('Last 7 Days');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);

  // Currency formatter
  const formatMoney = (amount: number) => {
    return MetaAdsService.formatCurrency(amount, marketingConfig.currency || 'INR');
  };

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaignInsights.filter(campaign => {
      const matchesStatus = statusFilter === 'ALL' || campaign.status === statusFilter;
      const matchesModule = moduleFilter === 'ALL' || campaign.moduleHint === moduleFilter;
      const matchesSearch = 
        campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.campaignId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.moduleHint && campaign.moduleHint.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesModule && matchesSearch;
    });
  }, [campaignInsights, statusFilter, moduleFilter, searchTerm]);

  // Aggregate Metrics
  const aggregateMetrics = useMemo(() => {
    const totalSpend = filteredCampaigns.reduce((sum, c) => sum + c.amountSpent, 0);
    const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.dailyBudget, 0);
    const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalReach = filteredCampaigns.reduce((sum, c) => sum + c.reach, 0);
    const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalLeads = filteredCampaigns.reduce((sum, c) => sum + c.leadsCount, 0);

    const avgCtr = totalClicks > 0 && totalImpressions > 0 
      ? ((totalClicks / totalImpressions) * 100) 
      : 0;
    
    const avgCpm = totalImpressions > 0 
      ? (totalSpend / totalImpressions) * 1000 
      : 0;

    const avgCpl = totalLeads > 0 
      ? (totalSpend / totalLeads) 
      : 0;

    const avgFrequency = totalReach > 0 
      ? (totalImpressions / totalReach) 
      : 1;

    return {
      totalSpend,
      totalBudget,
      totalImpressions,
      totalReach,
      totalClicks,
      totalLeads,
      avgCtr,
      avgCpm,
      avgCpl,
      avgFrequency,
    };
  }, [filteredCampaigns]);

  // Handle Sync
  const handleSync = async () => {
    const success = await syncCampaignInsights();
    if (success) {
      setSyncSuccessToast(true);
      setTimeout(() => setSyncSuccessToast(false), 3500);
    }
  };

  // Export Campaign Analytics CSV
  const handleExportCSV = () => {
    const headers = [
      'Campaign ID',
      'Campaign Name',
      'Status',
      'Course Module',
      'Daily Budget',
      'Amount Spent',
      'Leads Count',
      'Cost Per Lead (CPL)',
      'Impressions',
      'Reach',
      'Clicks',
      'CTR (%)',
      'CPM',
      'Frequency',
      'Currency',
      'Date Range'
    ];

    const rows = filteredCampaigns.map(c => [
      c.campaignId,
      `"${c.campaignName.replace(/"/g, '""')}"`,
      c.status,
      c.moduleHint || '',
      c.dailyBudget,
      c.amountSpent,
      c.leadsCount,
      c.cpl.toFixed(2),
      c.impressions,
      c.reach,
      c.clicks,
      c.ctr.toFixed(2),
      c.cpm.toFixed(2),
      c.frequency.toFixed(2),
      c.currency,
      c.dateRange
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta-campaigns-insights-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Switch to Leads tab filtered by this campaign
  const handleViewLeadsForCampaign = (campaignName: string) => {
    setSearchQuery(campaignName);
    setActiveTab('leads');
  };

  // Unique Modules for filtering
  const availableModules = Array.from(
    new Set(campaignInsights.map(c => c.moduleHint).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Top Banner / Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Meta Ads Marketing & Spend Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Meta Graph API v20.0 Live
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Direct real-time marketing intelligence: Budget, Spend, CPL, Impressions, Reach, and Campaign conversion performance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={isSyncingCampaigns}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            title="Fetch latest spend and insights from Meta Graph API"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingCampaigns ? 'animate-spin' : ''}`} />
            {isSyncingCampaigns ? 'Syncing with Meta...' : 'Sync Meta Insights'}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Configure Meta Ad Account and API Keys"
          >
            <Sliders className="h-4 w-4" />
            API Settings
          </button>
        </div>
      </div>

      {/* Sync Success Alert */}
      {syncSuccessToast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm">
              Live Meta Marketing API Sync Successful! Campaigns, Spend, CPL, and Reach data are up-to-date.
            </span>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Meta Ad Account Connection Status Strip */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-slate-50 p-4 dark:border-indigo-950/50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Connected Ad Account:</span>
            <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300">
              {marketingConfig.adAccountId}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-600 dark:text-slate-400">
            Account: <strong>{marketingConfig.accountName || 'Nexus Tech Ed Ads Manager'}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-600 dark:text-slate-400">
            Currency: <strong className="uppercase">{marketingConfig.currency || 'INR'}</strong>
          </span>
        </div>

        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Last Synced:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {marketingConfig.lastSyncAt ? new Date(marketingConfig.lastSyncAt).toLocaleString() : 'Just now'}
          </span>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Total Spend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Amount Spent
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatMoney(aggregateMetrics.totalSpend)}
            </h3>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
              <span>Across {filteredCampaigns.length} campaigns</span>
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3" /> ROI Active
              </span>
            </p>
          </div>
        </div>

        {/* 2. Total Daily Budget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Daily Ad Budget
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatMoney(aggregateMetrics.totalBudget)} <span className="text-xs font-medium text-slate-400">/day</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {filteredCampaigns.filter(c => c.status === 'ACTIVE').length} active ad campaigns pacing
            </p>
          </div>
        </div>

        {/* 3. Cost Per Lead (CPL) */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Avg Cost Per Lead (CPL)
            </span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {formatMoney(aggregateMetrics.avgCpl)}
            </h3>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-400 font-medium">
              Calculated live: Total Spend / Total Leads
            </p>
          </div>
        </div>

        {/* 4. Total Meta Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Campaign Leads Acquired
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {aggregateMetrics.totalLeads.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Leadgen Instant Forms & Reels submissions
            </p>
          </div>
        </div>

        {/* 5. Impressions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Impressions
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {aggregateMetrics.totalImpressions.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Avg CPM: <strong>{formatMoney(aggregateMetrics.avgCpm)}</strong>
            </p>
          </div>
        </div>

        {/* 6. Unique Reach */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Unique Reach
            </span>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {aggregateMetrics.totalReach.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Frequency: <strong>{aggregateMetrics.avgFrequency.toFixed(2)}x</strong>
            </p>
          </div>
        </div>

        {/* 7. Total Clicks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Direct Ad Clicks
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <MousePointer className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {aggregateMetrics.totalClicks.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Avg CTR: <strong>{aggregateMetrics.avgCtr.toFixed(2)}%</strong>
            </p>
          </div>
        </div>

        {/* 8. Conversion Efficiency */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Click-to-Lead Conv.
            </span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {aggregateMetrics.totalClicks > 0 
                ? ((aggregateMetrics.totalLeads / aggregateMetrics.totalClicks) * 100).toFixed(1) 
                : '0'}%
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Form submit conversion efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaign name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Campaigns</option>
              <option value="PAUSED">Paused Campaigns</option>
            </select>
          </div>

          {/* Module Filter */}
          {availableModules.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Module:</span>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Modules</option>
                {availableModules.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400">Range:</span>
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Month">This Month</option>
            <option value="Today">Today</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
      </div>

      {/* Module Spend vs CPL Comparison Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Course Module Budget & Spend Distribution
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Real-time Meta Adset Allocation
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map(c => {
            const pctOfSpend = aggregateMetrics.totalSpend > 0 
              ? Math.round((c.amountSpent / aggregateMetrics.totalSpend) * 100) 
              : 0;

            return (
              <div 
                key={c.campaignId}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                    {c.moduleHint || c.campaignName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {c.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(pctOfSpend, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Spend: <strong className="text-slate-900 dark:text-slate-100">{formatMoney(c.amountSpent)}</strong> ({pctOfSpend}%)</span>
                  <span>CPL: <strong className="text-emerald-600 dark:text-emerald-400">{formatMoney(c.cpl)}</strong></span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 pt-1.5">
                  <span>Leads: <strong className="text-slate-700 dark:text-slate-300">{c.leadsCount}</strong></span>
                  <span>Daily: <strong className="text-slate-700 dark:text-slate-300">{formatMoney(c.dailyBudget)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Campaign Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Live Meta Ad Campaigns Performance Table
            </h2>
            <p className="text-xs text-slate-500">
              Click any campaign to inspect or filter leads acquired through it.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Showing {filteredCampaigns.length} campaigns
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Campaign Name & Module</th>
                <th className="px-4 py-3.5 text-right">Daily Budget</th>
                <th className="px-4 py-3.5 text-right">Amount Spent</th>
                <th className="px-4 py-3.5 text-right font-black text-indigo-700 dark:text-indigo-300">Leads</th>
                <th className="px-4 py-3.5 text-right font-black text-emerald-700 dark:text-emerald-400">Live CPL</th>
                <th className="px-4 py-3.5 text-right">Impressions</th>
                <th className="px-4 py-3.5 text-right">Reach</th>
                <th className="px-4 py-3.5 text-right">CTR (%)</th>
                <th className="px-4 py-3.5 text-right">CPM</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredCampaigns.map((camp) => {
                const isGoodCpl = camp.cpl <= 210;
                return (
                  <tr 
                    key={camp.campaignId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${camp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {camp.status}
                      </span>
                    </td>

                    {/* Name & Module */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {camp.campaignName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {camp.moduleHint && (
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                            {camp.moduleHint}
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-slate-400">
                          {camp.campaignId}
                        </span>
                        {camp.adsetsCount && (
                          <span className="text-[10px] text-slate-400">
                            ({camp.adsetsCount} adsets)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Daily Budget */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-xs">
                      {formatMoney(camp.dailyBudget)}
                    </td>

                    {/* Amount Spent */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatMoney(camp.amountSpent)}
                    </td>

                    {/* Leads Count */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                        {camp.leadsCount} leads
                      </span>
                    </td>

                    {/* Cost Per Lead (CPL) */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-black ${
                        isGoodCpl 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {formatMoney(camp.cpl)}
                      </span>
                    </td>

                    {/* Impressions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                      {camp.impressions.toLocaleString()}
                    </td>

                    {/* Reach */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                      {camp.reach.toLocaleString()}
                    </td>

                    {/* CTR */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-xs">
                      <span className={camp.ctr >= 3.0 ? 'text-emerald-600 font-bold' : ''}>
                        {camp.ctr.toFixed(2)}%
                      </span>
                    </td>

                    {/* CPM */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                      {formatMoney(camp.cpm)}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleViewLeadsForCampaign(camp.campaignName)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-all cursor-pointer"
                        title="View all leads captured by this campaign"
                      >
                        <span>View Leads</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    No campaigns match your current filters. Try changing your search query or status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational / Direct Integration Architecture Info Footer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Direct Meta Marketing Graph API Active
          </h4>
          <p className="mt-0.5">
            Syncs with endpoint <code className="text-indigo-600 dark:text-indigo-400">https://graph.facebook.com/v20.0/{'{act_id}'}/campaigns?fields=insights.date_preset(last_7d)</code>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('settings')}
            className="font-bold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1"
          >
            Change API Credentials <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
