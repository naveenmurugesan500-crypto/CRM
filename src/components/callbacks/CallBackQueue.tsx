import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Clock, 
  PhoneCall, 
  MessageCircle, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  User, 
  BookOpen 
} from 'lucide-react';
import { 
  formatDateTime, 
  cleanPhoneForWhatsApp, 
  getCallBackUrgency 
} from '../../utils/formatters';

export const CallBackQueue: React.FC = () => {
  const { leads, setLeadToLogCall } = useCRM();

  const [filterView, setFilterView] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');

  // Find all leads where status is 'Call Back'
  const callBackLeads = leads.filter(l => l.status === 'Call Back');

  const now = new Date();
  const todayDateStr = now.toISOString().slice(0, 10);

  const categorized = callBackLeads.map(l => {
    const cbDate = l.callBackTime ? new Date(l.callBackTime) : null;
    const isOverdue = cbDate ? cbDate.getTime() < now.getTime() : false;
    const isToday = cbDate ? l.callBackTime?.slice(0, 10) === todayDateStr : false;
    const isUpcoming = cbDate ? cbDate.getTime() > now.getTime() && !isToday : false;

    return {
      ...l,
      isOverdue,
      isToday,
      isUpcoming,
    };
  });

  const overdueList = categorized.filter(l => l.isOverdue);
  const todayList = categorized.filter(l => l.isToday && !l.isOverdue);
  const upcomingList = categorized.filter(l => l.isUpcoming);

  const displayList = categorized.filter(l => {
    if (filterView === 'overdue') return l.isOverdue;
    if (filterView === 'today') return l.isToday;
    if (filterView === 'upcoming') return l.isUpcoming;
    return true;
  }).sort((a, b) => {
    if (!a.callBackTime) return 1;
    if (!b.callBackTime) return -1;
    return new Date(a.callBackTime).getTime() - new Date(b.callBackTime).getTime();
  });

  return (
    <div className="space-y-5 max-w-5xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Scheduled Call Backs Queue
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Prioritized telecalling queue for candidates who requested follow-ups at a specific time.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterView('overdue')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterView === 'overdue'
              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Overdue
            </span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {overdueList.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Requires immediate calling</p>
        </div>

        <div 
          onClick={() => setFilterView('today')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterView === 'today'
              ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Due Today
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {todayList.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Scheduled for today</p>
        </div>

        <div 
          onClick={() => setFilterView('upcoming')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterView === 'upcoming'
              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Upcoming
            </span>
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {upcomingList.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Scheduled for later dates</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setFilterView('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterView === 'all'
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          All Callbacks ({callBackLeads.length})
        </button>
        <button
          onClick={() => setFilterView('overdue')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterView === 'overdue'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Overdue ({overdueList.length})
        </button>
        <button
          onClick={() => setFilterView('today')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterView === 'today'
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Today ({todayList.length})
        </button>
        <button
          onClick={() => setFilterView('upcoming')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterView === 'upcoming'
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Upcoming ({upcomingList.length})
        </button>
      </div>

      {/* Lead Cards List */}
      <div className="space-y-3">
        {displayList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            No pending callbacks matching this filter.
          </div>
        ) : (
          displayList.map((lead) => {
            const waPhone = cleanPhoneForWhatsApp(lead.phone);
            const lastReport = lead.callReports && lead.callReports.length > 0 ? lead.callReports[0] : null;

            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {lead.name}
                    </span>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {lead.module}
                    </span>
                    <span className="text-xs text-slate-400">
                      • Assigned to: <strong className="text-slate-600 dark:text-slate-300">{lead.hrName}</strong>
                    </span>
                  </div>

                  {/* Scheduled callback time banner */}
                  <div className={`inline-flex items-center space-x-2 rounded-lg px-2.5 py-1 text-xs font-bold ${
                    lead.isOverdue
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : lead.isToday
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>Callback: {formatDateTime(lead.callBackTime)}</span>
                    {lead.isOverdue && <span className="uppercase text-[10px] ml-1">(Overdue)</span>}
                  </div>

                  {/* Remarks from previous call */}
                  {lastReport && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                      Previous call: "{lastReport.remarks}"
                    </div>
                  )}
                </div>

                {/* Calling & Logging actions */}
                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Call</span>
                  </a>

                  {waPhone && (
                    <a
                      href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20following%20up%20as%20requested%20regarding%20your%20${encodeURIComponent(lead.module)}%20course%20enrollment.`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => setLeadToLogCall(lead)}
                    className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition active:scale-95"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Log Call Report</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
