import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Megaphone, 
  Award, 
  Users, 
  PhoneCall, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Layers 
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
  Pie
} from 'recharts';

export const MetaAnalytics: React.FC = () => {
  const { leads, stats, dropdownSettings } = useCRM();

  // Module Breakdown Data
  const moduleData = dropdownSettings.modules.map(mod => {
    const modLeads = leads.filter(l => l.module === mod);
    const registrations = modLeads.filter(l => l.status === 'Registration').length;
    return {
      name: mod,
      leads: modLeads.length,
      registrations,
    };
  });

  // Status Breakdown Data
  const statusCounts: Record<string, number> = {};
  leads.forEach(l => {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  });

  const pieData = dropdownSettings.statuses.map(st => ({
    name: st.label,
    value: statusCounts[st.label] || 0,
    color: st.color,
  }));

  // Campaign Performance Breakdown
  const campaignsMap: Record<string, { total: number; registered: number; pitched: number }> = {};
  leads.forEach(l => {
    const cName = l.campaignName || 'Organic / Unspecified';
    if (!campaignsMap[cName]) {
      campaignsMap[cName] = { total: 0, registered: 0, pitched: 0 };
    }
    campaignsMap[cName].total += 1;
    if (l.status === 'Registration') campaignsMap[cName].registered += 1;
    if (l.status === 'Pitched') campaignsMap[cName].pitched += 1;
  });

  const campaignRows = Object.entries(campaignsMap).map(([name, data]) => ({
    name,
    total: data.total,
    registered: data.registered,
    pitched: data.pitched,
    conversionRate: data.total > 0 ? Math.round((data.registered / data.total) * 100) : 0,
  })).sort((a, b) => b.total - a.total);

  // HR Calling Performance
  const hrMap: Record<string, { leadsAssigned: number; callsLogged: number; registered: number }> = {};
  leads.forEach(l => {
    const hr = l.hrName || 'Unassigned';
    if (!hrMap[hr]) {
      hrMap[hr] = { leadsAssigned: 0, callsLogged: 0, registered: 0 };
    }
    hrMap[hr].leadsAssigned += 1;
    hrMap[hr].callsLogged += l.callReports?.length || 0;
    if (l.status === 'Registration') hrMap[hr].registered += 1;
  });

  const hrRows = Object.entries(hrMap).map(([hrName, data]) => ({
    hrName,
    leadsAssigned: data.leadsAssigned,
    callsLogged: data.callsLogged,
    registered: data.registered,
    convRate: data.leadsAssigned > 0 ? Math.round((data.registered / data.leadsAssigned) * 100) : 0,
  })).sort((a, b) => b.registered - a.registered);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meta Ads & Enrollment Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Campaign ROI, module interest trends, and counselor telecalling conversion performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Meta Leads
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalLeads}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Directly captured from Meta Ad campaigns
          </p>
        </div>

        {/* Registered Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registrations Closed
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.registeredCount}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Conversion rate: <strong className="text-emerald-600">{stats.conversionRate}%</strong>
          </p>
        </div>

        {/* Pitched & Interested */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pitched / In Discussion
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.pitchedCount + stats.interestedCount}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {stats.pitchedCount} Pitched, {stats.interestedCount} Highly Interested
          </p>
        </div>

        {/* Calls Logged */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Calls Logged
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <PhoneCall className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalCallsLogged}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {stats.callBackCount} pending scheduled callbacks
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module breakdown bar chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Leads & Registrations by Module
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Candidate demand across SAP, AWS, Cloud, Data Science, Data Analytics, and AI
          </p>

          <div className="h-64 w-full">
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
                <Bar dataKey="registrations" fill="#10b981" radius={[4, 4, 0, 0]} name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Status Breakdown
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Distribution of active pipeline stages
          </p>

          <div className="h-44 w-full flex items-center justify-center">
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

      {/* Two Tables: Campaign ROI & Telecaller Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Attribution Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Meta Ads Campaign Performance
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Lead volume and registrations by Meta Campaign
          </p>

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
                {campaignRows.map(row => (
                  <tr key={row.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]" title={row.name}>
                      {row.name}
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">{row.total}</td>
                    <td className="py-2.5 text-right text-blue-600 font-semibold">{row.pitched}</td>
                    <td className="py-2.5 text-right text-emerald-600 font-bold">{row.registered}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{row.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HR Telecaller Leaderboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Counselor / HR Calling Performance
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Team telecalling volume and student enrollment conversion
          </p>

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
                {hrRows.map(row => (
                  <tr key={row.hrName} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{row.hrName}</td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{row.leadsAssigned}</td>
                    <td className="py-2.5 text-right text-indigo-600 font-medium">{row.callsLogged}</td>
                    <td className="py-2.5 text-right text-emerald-600 font-bold">{row.registered}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{row.convRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
