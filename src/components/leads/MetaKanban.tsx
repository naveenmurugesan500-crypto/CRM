import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaLead } from '../../types/crm';
import { 
  PhoneCall, 
  MessageCircle, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  User, 
  CheckCircle2, 
  XCircle,
  Megaphone
} from 'lucide-react';
import { 
  formatDate, 
  formatDateTime, 
  cleanPhoneForWhatsApp, 
  getCallBackUrgency,
  getStatusStyle,
  formatLeadTime 
} from '../../utils/formatters';

interface MetaKanbanProps {
  filteredLeads: MetaLead[];
}

export const MetaKanban: React.FC<MetaKanbanProps> = ({ filteredLeads }) => {
  const { 
    dropdownSettings, 
    moveLeadStatus, 
    setLeadToLogCall, 
    setLeadToEdit, 
    setIsLeadModalOpen 
  } = useCRM();

  const statuses = dropdownSettings.statuses;

  const handleNextStatus = (lead: MetaLead, e: React.MouseEvent) => {
    e.stopPropagation();
    const curIdx = statuses.findIndex(s => s.label.toLowerCase() === lead.status.toLowerCase());
    if (curIdx !== -1 && curIdx < statuses.length - 1) {
      moveLeadStatus(lead.id, statuses[curIdx + 1].label);
    }
  };

  const handlePrevStatus = (lead: MetaLead, e: React.MouseEvent) => {
    e.stopPropagation();
    const curIdx = statuses.findIndex(s => s.label.toLowerCase() === lead.status.toLowerCase());
    if (curIdx > 0) {
      moveLeadStatus(lead.id, statuses[curIdx - 1].label);
    }
  };

  return (
    <div className="overflow-x-auto pb-4 pt-2">
      <div className="flex gap-4 min-w-[1250px] h-[calc(100vh-250px)] items-start">
        {statuses.map((status, statusIndex) => {
          const columnLeads = filteredLeads.filter(
            l => l.status.toLowerCase() === status.label.toLowerCase()
          );

          return (
            <div
              key={status.key}
              className="w-72 flex-shrink-0 flex flex-col max-h-full rounded-2xl border border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60 p-3 shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {status.label}
                  </h3>
                </div>

                <span className="rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
                {columnLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 py-10 text-xs text-slate-400 text-center">
                    <span>No leads in {status.label}</span>
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const waPhone = cleanPhoneForWhatsApp(lead.phone);
                    const cbUrgency = getCallBackUrgency(lead.callBackTime);

                    return (
                      <div
                        key={lead.id}
                        className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-850 dark:bg-slate-800 transition-all space-y-2.5"
                      >
                        {/* Top: Module & Calls count */}
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {lead.module}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {lead.callReports?.length || 0} calls
                          </span>
                        </div>

                        {/* Name & Phone & Collection Time */}
                        <div>
                          <h4 
                            onClick={() => { setLeadToEdit(lead); setIsLeadModalOpen(true); }}
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
                          >
                            {lead.name}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{lead.phone}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5 text-indigo-500" />
                              {lead.timeOfLead || formatLeadTime(lead.timeOfLead, lead.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Direct Call & WhatsApp Buttons */}
                        <div className="flex items-center space-x-1.5 pt-1">
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex-1 flex items-center justify-center space-x-1 rounded-md bg-slate-50 border border-slate-200 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200"
                          >
                            <PhoneCall className="h-3 w-3 text-indigo-500" />
                            <span>Call</span>
                          </a>

                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20following%20up%20regarding%20your%20${encodeURIComponent(lead.module)}%20course%20inquiry.`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 flex items-center justify-center space-x-1 rounded-md bg-emerald-50 border border-emerald-200 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                            >
                              <MessageCircle className="h-3 w-3 text-emerald-500" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                        {/* Call Back Schedule Warning */}
                        {lead.status === 'Call Back' && lead.callBackTime && (
                          <div className={`rounded-lg p-2 text-xs flex items-center space-x-1.5 ${
                            cbUrgency.isOverdue 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900'
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900'
                          }`}>
                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate text-[11px]">
                              {cbUrgency.isOverdue ? 'Overdue: ' : 'Callback: '}
                              {formatDateTime(lead.callBackTime)}
                            </span>
                          </div>
                        )}

                        {/* Meta Attribution & Counselor */}
                        <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          {lead.campaignName && (
                            <div className="truncate" title={lead.campaignName}>
                              🎯 {lead.campaignName}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>Counselor:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{lead.hrName}</span>
                          </div>
                        </div>

                        {/* Bottom Actions: Move backward/forward & Log Call */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <button
                            disabled={statusIndex === 0}
                            onClick={(e) => handlePrevStatus(lead, e)}
                            title="Move back"
                            className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setLeadToLogCall(lead)}
                            className="flex items-center space-x-1 rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 shadow-sm transition"
                          >
                            <PhoneCall className="h-3 w-3" />
                            <span>Log Call</span>
                          </button>

                          <button
                            disabled={statusIndex === statuses.length - 1}
                            onClick={(e) => handleNextStatus(lead, e)}
                            title="Move forward"
                            className="p-1 rounded text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 disabled:opacity-20"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
