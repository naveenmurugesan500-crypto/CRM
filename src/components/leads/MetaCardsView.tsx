import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaLead } from '../../types/crm';
import { 
  PhoneCall, 
  MessageCircle, 
  Clock, 
  Calendar, 
  Edit, 
  Trash2, 
  Megaphone,
  User 
} from 'lucide-react';
import { 
  formatDate, 
  formatDateTime, 
  cleanPhoneForWhatsApp, 
  getCallBackUrgency, 
  getStatusStyle,
  formatLeadTime 
} from '../../utils/formatters';

interface MetaCardsViewProps {
  filteredLeads: MetaLead[];
}

export const MetaCardsView: React.FC<MetaCardsViewProps> = ({ filteredLeads }) => {
  const { 
    columnVisibility, 
    setLeadToLogCall, 
    setLeadToEdit, 
    setIsLeadModalOpen, 
    deleteLead 
  } = useCRM();

  if (filteredLeads.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
        No leads match current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
      {filteredLeads.map((lead) => {
        const statusStyle = getStatusStyle(lead.status);
        const waPhone = cleanPhoneForWhatsApp(lead.phone);
        const cbUrgency = getCallBackUrgency(lead.callBackTime);

        return (
          <div
            key={lead.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Header: Module & Status Badge */}
              <div className="flex items-center justify-between mb-2">
                {columnVisibility.showModule && (
                  <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {lead.module}
                  </span>
                )}
                {columnVisibility.showStatus && (
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${statusStyle.bg}`}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {lead.status}
                  </span>
                )}
              </div>

              {/* Name & Date */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 
                    onClick={() => { setLeadToEdit(lead); setIsLeadModalOpen(true); }}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer transition"
                  >
                    {lead.name}
                  </h3>
                  {columnVisibility.showDate && (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{formatDate(lead.dateOfLead)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                        <Clock className="h-2.5 w-2.5 text-indigo-500" />
                        <span>{lead.timeOfLead || formatLeadTime(lead.timeOfLead, lead.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => { setLeadToEdit(lead); setIsLeadModalOpen(true); }}
                    title="Edit Lead"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete lead ${lead.name}?`)) {
                        deleteLead(lead.id);
                      }
                    }}
                    title="Delete Lead"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {lead.phone}
                </div>
                {columnVisibility.showEmail && lead.email && (
                  <div className="text-slate-400 truncate">{lead.email}</div>
                )}
              </div>

              {/* Call Back Time Warning */}
              {columnVisibility.showCallBack && lead.status === 'Call Back' && lead.callBackTime && (
                <div className={`mt-2 rounded-lg p-2 text-xs flex items-center space-x-1.5 ${
                  cbUrgency.isOverdue 
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold border border-amber-200'
                }`}>
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {cbUrgency.isOverdue ? 'Overdue: ' : 'Callback: '}
                    {formatDateTime(lead.callBackTime)}
                  </span>
                </div>
              )}

              {/* Meta Attribution */}
              {(columnVisibility.showCampaign || columnVisibility.showAdName) && (
                <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 space-y-1">
                  {columnVisibility.showCampaign && lead.campaignName && (
                    <div className="truncate font-semibold text-slate-700 dark:text-slate-300">
                      🎯 {lead.campaignName}
                    </div>
                  )}
                  {columnVisibility.showAdName && lead.adName && (
                    <div className="text-[11px] text-slate-400 truncate">
                      Ad: {lead.adName}
                    </div>
                  )}
                  {columnVisibility.showHr && (
                    <div className="text-[11px] pt-1 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Counselor:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{lead.hrName}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                <a
                  href={`tel:${lead.phone}`}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 flex items-center space-x-1"
                >
                  <PhoneCall className="h-3 w-3 text-indigo-500" />
                  <span>Call</span>
                </a>

                {waPhone && (
                  <a
                    href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20reaching%20out%20regarding%20your%20${encodeURIComponent(lead.module)}%20course%20inquiry.`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center space-x-1"
                  >
                    <MessageCircle className="h-3 w-3 text-emerald-500" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setLeadToLogCall(lead)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition"
              >
                Log Call
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
