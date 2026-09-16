import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  X, 
  PhoneCall, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cleanPhoneForWhatsApp } from '../../utils/formatters';

export const CallReportModal: React.FC = () => {
  const { 
    leadToLogCall, 
    setLeadToLogCall, 
    dropdownSettings, 
    logCallReport 
  } = useCRM();

  const [selectedHr, setSelectedHr] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Pitched');
  const [callBackTime, setCallBackTime] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (leadToLogCall) {
      setSelectedHr(leadToLogCall.hrName || dropdownSettings.hrNames[0] || '');
      setSelectedStatus(leadToLogCall.status || 'Pitched');
      setCallBackTime(leadToLogCall.callBackTime || '');
      setRemarks('');
    }
  }, [leadToLogCall, dropdownSettings]);

  if (!leadToLogCall) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHr.trim()) {
      alert('Please select a Counselor Name.');
      return;
    }

    if (selectedStatus === 'Call Back' && !callBackTime) {
      alert('Please specify the Call Back Date and Time.');
      return;
    }

    logCallReport(leadToLogCall.id, {
      hrName: selectedHr,
      statusAtCall: selectedStatus,
      callBackTime: selectedStatus === 'Call Back' ? callBackTime : undefined,
      remarks: remarks.trim() || `Call logged by ${selectedHr}. Status set to ${selectedStatus}.`,
    });

    setLeadToLogCall(null);
  };

  const waPhone = cleanPhoneForWhatsApp(leadToLogCall.phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Log Call Report
              </h2>
              <p className="text-xs text-slate-400">
                Record call outcome, counseling notes, and callback schedules
              </p>
            </div>
          </div>
          <button
            onClick={() => setLeadToLogCall(null)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lead Snapshot Banner */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {leadToLogCall.name}
            </div>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {leadToLogCall.module}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            {leadToLogCall.phone && (
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{leadToLogCall.phone}</span>
                <a
                  href={`tel:${leadToLogCall.phone}`}
                  className="rounded bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-indigo-700 transition"
                >
                  Call
                </a>
                {waPhone && (
                  <a
                    href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(leadToLogCall.name)},%20thank%20you%20for%20inquiring%20about%20our%20${encodeURIComponent(leadToLogCall.module)}%20program.`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            )}
            {leadToLogCall.campaignName && (
              <span className="text-[11px] text-slate-400">
                Meta Campaign: <strong className="text-slate-600 dark:text-slate-300">{leadToLogCall.campaignName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* HR / Counselor selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Counselor / HR Name (Caller) *
            </label>
            <select
              value={selectedHr}
              onChange={(e) => setSelectedHr(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {dropdownSettings.hrNames.map(hr => (
                <option key={hr} value={hr}>{hr}</option>
              ))}
            </select>
          </div>

          {/* Lead Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Call Outcome / Lead Status *
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {dropdownSettings.statuses.map(st => (
                <option key={st.key} value={st.label}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* CONDITIONAL: If Status is Call Back -> Call Back Time */}
          {selectedStatus === 'Call Back' && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50/60 p-3.5 dark:border-amber-600/50 dark:bg-amber-950/30 space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Call Back Scheduled Time (Required)</span>
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                This lead will be prioritized in your "Call Backs" follow-up dashboard.
              </p>
              <input
                type="datetime-local"
                required
                value={callBackTime}
                onChange={(e) => setCallBackTime(e.target.value)}
                className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs font-bold text-slate-900 focus:outline-none dark:border-amber-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          {/* Call Remarks / Report Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Call Report & Discussion Notes
            </label>
            <textarea
              rows={3}
              placeholder="Candidate background, questions asked, batch preference, fee discussion..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Past Call History on this lead */}
          {leadToLogCall.callReports && leadToLogCall.callReports.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Previous Call Reports ({leadToLogCall.callReports.length})
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {leadToLogCall.callReports.map(cr => (
                  <div key={cr.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {cr.statusAtCall} • {cr.hrName}
                      </span>
                      <span className="text-slate-400">
                        {new Date(cr.createdAt).toLocaleDateString()} {new Date(cr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700 dark:text-slate-300">{cr.remarks}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setLeadToLogCall(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
            >
              Save Call Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
