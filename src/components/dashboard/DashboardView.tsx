import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { TimeFilterPreset, MetaLead } from '../../types/crm';
import { 
  Megaphone, 
  Award, 
  Users, 
  PhoneCall, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  Layers,
  CalendarDays,
  Zap,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { formatDate, formatDateTime, cleanPhoneForWhatsApp } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const { 
    leads, 
    dropdownSettings, 
    setActiveTab, 
    setLeadToLogCall, 
    setLeadToEdit, 
    setIsLeadModalOpen, 
    simulateMetaLead 
  } = useCRM();

  const [timePreset, setTimePreset] = useState<TimeFilterPreset>('all');
  
  // Custom Date range
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Compute date ranges based on preset
  const { filteredLeads, periodLabel } = useMemo(() => {
    const now = new Date();
    let label = 'All Time';

    const leadsMatching = leads.filter(l => {
      const leadDateStr = l.dateOfLead || l.createdAt.slice(0, 10);

      if (timePreset === 'all') {
        label = 'All Time Records';
        return true;
      }

      if (timePreset === 'today') {
        label = `Today (${formatDate(todayStr)})`;
        return leadDateStr === todayStr;
      }

      if (timePreset === 'week') {
        // Last 7 days or current calendar week
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        label = `This Week (${formatDate(sevenDaysAgo)} – ${formatDate(todayStr)})`;
        return leadDateStr >= sevenDaysAgo && leadDateStr <= todayStr;
      }

      if (timePreset === 'month') {
        // Current month: 1st of month to today
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        label = `This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`;
        return leadDateStr >= firstDayOfMonth && leadDateStr <= todayStr;
      }

      if (timePreset === 'year') {
        const yearStr = `${now.getFullYear()}-01-01`;
        label = `This Year (${now.getFullYear()})`;
        return leadDateStr >= yearStr && leadDateStr <= todayStr;
      }

      if (timePreset === 'custom') {
        label = `Custom Period: ${formatDate(startDate)} to ${formatDate(endDate)}`;
        return leadDateStr >= startDate && leadDateStr <= endDate;
      }

      return true;
    });

    return { filteredLeads: leadsMatching, periodLabel: label };
  }, [leads, timePreset, startDate, endDate, todayStr]);

  // Recalculate KPIs dynamically for filtered period
  const totalLeads = filteredLeads.length;
  const registeredCount = filteredLeads.filter(l => l.status === 'Registration').length;
  const pitchedCount = filteredLeads.filter(l => l.status === 'Pitched').length;
  const callBackCount = filteredLeads.filter(l => l.status === 'Call Back').length;
  const interestedCount = filteredLeads.filter(l => l.status === 'Interested').length;
  const notInterestedCount = filteredLeads.filter(l => l.status === 'Not Interested').length;
  const conversionRate = totalLeads > 0 ? Math.round((registeredCount / totalLeads) * 100) : 0;
  const totalCallsLogged = filteredLeads.reduce((sum, l) => sum + (l.callReports?.length || 0), 0);

  // Module breakdown in this period
  const moduleData = dropdownSettings.modules.map(mod => {
    const modLeads = filteredLeads.filter(l => l.module === mod);
    const registered = modLeads.filter(l => l.status === 'Registration').length;
    return {
      name: mod,
      leads: modLeads.length,
      registered,
    };
  });

  // Status Funnel in this period
  const statusCounts: Record<string, number> = {};
  filteredLeads.forEach(l => {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  });

  const pieData = dropdownSettings.statuses.map(st => ({
    name: st.label,
    value: statusCounts[st.label] || 0,
    color: st.color,
  }));

  // Daily Trend data within the filtered leads
  const dateMap: Record<string, { leads: number; registered: number }> = {};
  filteredLeads.forEach(l => {
    const d = l.dateOfLead || l.createdAt.slice(0, 10);
    if (!dateMap[d]) dateMap[d] = { leads: 0, registered: 0 };
    dateMap[d].leads += 1;
    if (l.status === 'Registration') dateMap[d].registered += 1;
  });

  const trendData = Object.entries(dateMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, counts]) => ({
      date: formatDate(date),
      leads: counts.leads,
      registered: counts.registered,
    }));

  // Period Campaign Breakdown
  const campaignMap: Record<string, { total: number; registered: number; pitched: number }> = {};
  filteredLeads.forEach(l => {
    const cName = l.campaignName || 'Organic / Unassigned';
    if (!campaignMap[cName]) campaignMap[cName] = { total: 0, registered: 0, pitched: 0 };
    campaignMap[cName].total += 1;
    if (l.status === 'Registration') campaignMap[cName].registered += 1;
    if (l.status === 'Pitched') campaignMap[cName].pitched += 1;
  });

  const campaignRows = Object.entries(campaignMap).map(([name, data]) => ({
    name,
    total: data.total,
    registered: data.registered,
    pitched: data.pitched,
    convRate: data.total > 0 ? Math.round((data.registered / data.total) * 100) : 0,
  })).sort((a, b) => b.total - a.total);

  // Period Counselor Leaderboard
  const hrMap: Record<string, { assigned: number; calls: number; registered: number }> = {};
  filteredLeads.forEach(l => {
    const hr = l.hrName || 'Unassigned';
    if (!hrMap[hr]) hrMap[hr] = { assigned: 0, calls: 0, registered: 0 };
    hrMap[hr].assigned += 1;
    hrMap[hr].calls += l.callReports?.length || 0;
    if (l.status === 'Registration') hrMap[hr].registered += 1;
  });

  const hrRows = Object.entries(hrMap).map(([hrName, data]) => ({
    hrName,
    assigned: data.assigned,
    calls: data.calls,
    registered: data.registered,
    convRate: data.assigned > 0 ? Math.round((data.registered / data.assigned) * 100) : 0,
  })).sort((a, b) => b.registered - a.registered);

  // Recent 5 leads in period
  const recentLeadsInPeriod = [...filteredLeads].slice(0, 5);

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Quick Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Meta Telecalling Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time enrollment velocity, campaign ROI, and counselor performance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={simulateMetaLead}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 transition active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-500" />
            <span>Simulate Live Lead</span>
          </button>

          <button
            onClick={() => { setLeadToEdit(null); setIsLeadModalOpen(true); }}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition active:scale-95"
          >
            <span>+ Add Meta Lead</span>
          </button>
        </div>
      </div>

      {/* TIME-FRAME FILTRATION BAR (Date, Week, Month, Year, Custom, All Time) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1 text-indigo-500" />
              Time Horizon:
            </span>

            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'year', label: 'This Year' },
              { key: 'all', label: 'All Time' },
              { key: 'custom', label: 'Custom Range' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setTimePreset(p.key as TimeFilterPreset)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  timePreset === p.key
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Active Period Label */}
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
            Active Filter: <strong>{periodLabel}</strong> ({totalLeads} leads)
          </div>
        </div>

        {/* Custom Date Range Pickers (Visible when custom is selected) */}
        {timePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">From Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 p-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">To Date:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 p-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Reset to Today
            </button>
          </div>
        )}
      </div>

      {/* DYNAMIC KPI CARDS FOR SELECTED TIME HORIZON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads In Period */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Meta Leads In Period
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalLeads}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {timePreset === 'all' ? 'Total database leads' : `Captured during ${timePreset}`}
          </p>
        </div>

        {/* Student Registrations In Period */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registrations Closed
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {registeredCount}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Period Conversion Rate: <strong className="text-emerald-600">{conversionRate}%</strong>
          </p>
        </div>

        {/* Pitched & Interested Candidates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pitched / Interested
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {pitchedCount + interestedCount}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {pitchedCount} Pitched, {interestedCount} Highly Interested
          </p>
        </div>

        {/* Calls Logged In Period */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Calls Logged
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <PhoneCall className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalCallsLogged}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {callBackCount} callbacks scheduled in period
          </p>
        </div>
      </div>

      {/* DYNAMIC CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily/Period Lead Trend Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Inbound Lead & Registration Timeline
              </h2>
              <p className="text-xs text-slate-400">
                Volume trajectory across {periodLabel}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All Leads <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No lead activity recorded during this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" name="Total Leads" />
                  <Area type="monotone" dataKey="registered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" name="Registrations" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Funnel Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Status Breakdown ({periodLabel})
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Funnel distribution for selected dates
          </p>

          <div className="h-44 w-full flex items-center justify-center">
            {totalLeads === 0 ? (
              <div className="text-xs text-slate-400">No data in period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-500 dark:text-slate-400 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULE DEMAND BY PERIOD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Module Demand in {periodLabel}
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Candidate preference across SAP, AWS, Cloud, Data Science, Data Analytics, and AI
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Leads" />
              <Bar dataKey="registered" fill="#10b981" radius={[4, 4, 0, 0]} name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PERIOD TABLES: CAMPAIGN ROI & COUNSELOR PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Campaign Attribution in Period */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Meta Campaign ROI ({periodLabel})
              </h2>
              <p className="text-xs text-slate-400">
                Leads and registrations by Meta Campaign
              </p>
            </div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-600">
              {campaignRows.length} Campaigns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Campaign Name</th>
                  <th className="pb-2 text-right">Leads</th>
                  <th className="pb-2 text-right">Pitched</th>
                  <th className="pb-2 text-right">Registered</th>
                  <th className="pb-2 text-right">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {campaignRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No campaign activity in this period.
                    </td>
                  </tr>
                ) : (
                  campaignRows.map(row => (
                    <tr key={row.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]" title={row.name}>
                        {row.name}
                      </td>
                      <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">{row.total}</td>
                      <td className="py-2.5 text-right text-blue-600 font-semibold">{row.pitched}</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">{row.registered}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{row.convRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* HR Telecaller Leaderboard in Period */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Counselor Leaderboard ({periodLabel})
              </h2>
              <p className="text-xs text-slate-400">
                Calls logged and student enrollments closed
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
              {hrRows.length} Counselors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Counselor Name</th>
                  <th className="pb-2 text-right">Assigned</th>
                  <th className="pb-2 text-right">Calls Logged</th>
                  <th className="pb-2 text-right">Registered</th>
                  <th className="pb-2 text-right">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hrRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No counselor activity in this period.
                    </td>
                  </tr>
                ) : (
                  hrRows.map(row => (
                    <tr key={row.hrName} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{row.hrName}</td>
                      <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{row.assigned}</td>
                      <td className="py-2.5 text-right text-indigo-600 font-medium">{row.calls}</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">{row.registered}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{row.convRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECENT INBOUND LEADS IN PERIOD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Leads in {periodLabel}
            </h2>
            <p className="text-xs text-slate-400">
              Latest prospects captured from Meta campaigns
            </p>
          </div>
          <button
            onClick={() => setActiveTab('leads')}
            className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Open All Leads Table <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
              <tr>
                <th className="pb-2 pl-2">Lead Name</th>
                <th className="pb-2">Phone / WhatsApp</th>
                <th className="pb-2">Module</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 pr-2 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentLeadsInPeriod.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No leads in this period.
                  </td>
                </tr>
              ) : (
                recentLeadsInPeriod.map(lead => {
                  const waPhone = cleanPhoneForWhatsApp(lead.phone);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 pl-2 font-bold text-slate-900 dark:text-white">
                        {lead.name}
                      </td>
                      <td className="py-2.5 font-medium text-slate-700 dark:text-slate-300">
                        {lead.phone}
                      </td>
                      <td className="py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                          {lead.module}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {formatDate(lead.dateOfLead)}
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20reaching%20out%20regarding%20your%20${encodeURIComponent(lead.module)}%20inquiry.`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                            >
                              WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => setLeadToLogCall(lead)}
                            className="rounded bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 shadow-sm"
                          >
                            Log Call
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
