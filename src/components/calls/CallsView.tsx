import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CallReport, MetaLead } from '../../types/crm';
import { 
  PhoneCall, 
  MessageCircle, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Award, 
  User, 
  FileText, 
  Filter 
} from 'lucide-react';
import { 
  formatDate, 
  formatDateTime, 
  formatRelativeTime, 
  cleanPhoneForWhatsApp, 
  getStatusStyle 
} from '../../utils/formatters';

interface CallWithLead extends CallReport {
  lead?: MetaLead;
}

export const CallsView: React.FC = () => {
  const { leads, dropdownSettings, setLeadToLogCall } = useCRM();

  const [filterHr, setFilterHr] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [filterTime, setFilterTime] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [search, setSearch] = useState('');

  // Flatten all call reports with their parent lead
  const allCalls: CallWithLead[] = useMemo(() => {
    const list: CallWithLead[] = [];
    leads.forEach(lead => {
      (lead.callReports || []).forEach(report => {
        list.push({
          ...report,
          lead,
        });
      });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Filtered calls
  const filteredCalls = allCalls.filter(call => {
    if (filterHr !== 'all' && call.hrName !== filterHr) return false;
    if (filterOutcome !== 'all' && call.statusAtCall !== filterOutcome) return false;

    const callDateStr = call.createdAt.slice(0, 10);
    if (filterTime === 'today' && callDateStr !== todayStr) return false;

    if (filterTime === 'week') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if (callDateStr < sevenDaysAgo) return false;
    }

    if (filterTime === 'month') {
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
      if (callDateStr < firstOfMonth) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const matchLeadName = (call.lead?.name || '').toLowerCase().includes(q);
      const matchPhone = (call.lead?.phone || '').toLowerCase().includes(q);
      const matchRemarks = (call.remarks || '').toLowerCase().includes(q);
      const matchHr = call.hrName.toLowerCase().includes(q);
      if (!matchLeadName && !matchPhone && !matchRemarks && !matchHr) return false;
    }

    return true;
  });

  // Summary Metrics
  const callsToday = allCalls.filter(c => c.createdAt.slice(0, 10) === todayStr).length;
  const registrationsOnCalls = allCalls.filter(c => c.statusAtCall === 'Registration').length;
  const callbacksScheduled = allCalls.filter(c => c.statusAtCall === 'Call Back').length;

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Telecalling Activity & Call Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Chronological record of all counseling calls, student discussions, and outcomes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Calls Logged</span>
            <PhoneCall className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {allCalls.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Lifetime telecalling logs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calls Today</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {callsToday}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Logged on {formatDate(todayStr)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registrations Closed</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {registrationsOnCalls}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Enrollments confirmed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Callbacks Scheduled</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {callbacksScheduled}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Follow-ups booked</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search calls by candidate, notes..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Time Filter */}
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Today's Calls</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* HR Counselor Filter */}
          <select
            value={filterHr}
            onChange={(e) => setFilterHr(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Counselors</option>
            {dropdownSettings.hrNames.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          {/* Outcome Filter */}
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Call Outcomes</option>
            {dropdownSettings.statuses.map(st => (
              <option key={st.key} value={st.label}>{st.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calls Table */}
      {filteredCalls.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          No calls found matching current filters.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">Call Time</th>
                  <th className="py-3.5 px-3">Counselor (HR)</th>
                  <th className="py-3.5 px-3">Candidate / Student</th>
                  <th className="py-3.5 px-3">Module</th>
                  <th className="py-3.5 px-3">Call Outcome</th>
                  <th className="py-3.5 px-3 max-w-[280px]">Discussion Notes / Remarks</th>
                  <th className="py-3.5 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCalls.map((call) => {
                  const statusStyle = getStatusStyle(call.statusAtCall);
                  const waPhone = call.lead ? cleanPhoneForWhatsApp(call.lead.phone) : '';

                  return (
                    <tr 
                      key={call.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Time */}
                      <td className="py-3 pl-4 pr-3">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {formatDateTime(call.createdAt)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(call.createdAt)}
                        </span>
                      </td>

                      {/* Counselor */}
                      <td className="py-3 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {call.hrName}
                      </td>

                      {/* Candidate */}
                      <td className="py-3 px-3">
                        {call.lead ? (
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">
                              {call.lead.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {call.lead.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Unknown Lead</span>
                        )}
                      </td>

                      {/* Module */}
                      <td className="py-3 px-3">
                        {call.lead?.module ? (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {call.lead.module}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Outcome */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${statusStyle.bg}`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                          {call.statusAtCall}
                        </span>

                        {call.statusAtCall === 'Call Back' && call.callBackTime && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Due: {formatDateTime(call.callBackTime)}</span>
                          </div>
                        )}
                      </td>

                      {/* Discussion Remarks */}
                      <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 max-w-[280px]">
                        <p className="line-clamp-2 italic" title={call.remarks}>
                          "{call.remarks}"
                        </p>
                      </td>

                      {/* Action: Log another call */}
                      <td className="py-3 pr-4 text-right">
                        {call.lead && (
                          <div className="flex items-center justify-end space-x-1.5">
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(call.lead.name)},%20following%20up%20on%20our%20earlier%20call.`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="WhatsApp Candidate"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => setLeadToLogCall(call.lead!)}
                              className="rounded-lg bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-bold hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition"
                            >
                              Follow-up Call
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
