import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaLead, canDeleteLeads, canAssignLeads } from '../../types/crm';
import { MetaStorageService } from '../../services/storage';
import { ViewCustomizer } from './ViewCustomizer';
import { MetaKanban } from './MetaKanban';
import { MetaCardsView } from './MetaCardsView';
import { 
  PhoneCall, 
  MessageCircle, 
  Search, 
  Plus, 
  Download, 
  Clock, 
  Calendar, 
  Filter, 
  Edit, 
  Trash2, 
  User, 
  Layers, 
  Megaphone,
  CheckCircle2,
  Flame,
  ArrowRight,
  CheckSquare,
  Square,
  X,
  UserCheck,
  Tag
} from 'lucide-react';
import { 
  formatDate, 
  formatDateTime, 
  getStatusStyle, 
  cleanPhoneForWhatsApp, 
  getCallBackUrgency,
  formatLeadTime 
} from '../../utils/formatters';

export const LeadTable: React.FC = () => {
  const { 
    leads, 
    dropdownSettings, 
    searchQuery, 
    viewMode,
    columnVisibility,
    setLeadToLogCall, 
    setIsLeadModalOpen, 
    setLeadToEdit, 
    deleteLead,
    exportCSV,
    setActiveTab,
    stats,
    currentUser,
    selectedLeadIds,
    toggleSelectLead,
    selectAllLeads,
    clearSelectedLeads,
    bulkDeleteLeads,
    bulkAssignLeads,
    bulkUpdateStatus
  } = useCRM();

  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHr, setFilterHr] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  const [activePreset, setActivePreset] = useState('all');
  const [showUntouched, setShowUntouched] = useState(false);

  const activeSearch = localSearch || searchQuery;

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'all') {
      setFilterStatus('all');
      setFilterModule('all');
      setFilterHr('all');
    } else if (presetKey === 'hot') {
      setFilterStatus('all'); // custom filter in filter below
    } else if (presetKey === 'callbacks') {
      setFilterStatus('Call Back');
    } else if (presetKey === 'registered') {
      setFilterStatus('Registration');
    }
  };

  const filteredLeads = leads.filter((l) => {
    // Only show graduated leads that have been assigned a counselor and status, unless user toggles Show Untouched
    if (!showUntouched && !l.isProcessed) {
      return false;
    }

    if (activePreset === 'hot' && l.status !== 'Interested' && l.status !== 'Pitched') {
      return false;
    }
    if (filterModule !== 'all' && l.module !== filterModule) return false;
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (filterHr !== 'all' && l.hrName !== filterHr) return false;

    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matchName = (l.name || '').toLowerCase().includes(q);
      const matchPhone = (l.phone || '').toLowerCase().includes(q);
      const matchEmail = (l.email || '').toLowerCase().includes(q);
      const matchCampaign = (l.campaignName || '').toLowerCase().includes(q);
      const matchAd = (l.adName || '').toLowerCase().includes(q);
      const matchNotes = (l.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchCampaign && !matchAd && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.id));
  const isSomeSelected = filteredLeads.some(l => selectedLeadIds.includes(l.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      clearSelectedLeads();
    } else {
      selectAllLeads(filteredLeads.map(l => l.id));
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Untouched Queue Notice Banner */}
      {stats.untouchedCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/70 p-3.5 dark:border-amber-900/60 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">{stats.untouchedCount} Fresh Inbound Meta Leads</span> are currently in the Untouched queue awaiting counselor assignment & first call.
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('untouched')}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition whitespace-nowrap active:scale-95"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Go to Untouched Leads ({stats.untouchedCount})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Meta Ads Leads Directory
            </h1>
            <span className="rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-bold">
              {stats.processedCount} Processed
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Graduated leads with assigned counselor, logged calls, and active pipeline status.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            title="Export full leads database to CSV"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => { setLeadToEdit(null); setIsLeadModalOpen(true); }}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Meta Lead</span>
          </button>
        </div>
      </div>

      {/* View Mode & Column Customizer */}
      <ViewCustomizer 
        onApplyPreset={handleApplyPreset} 
        activePreset={activePreset} 
      />

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by candidate, phone, campaign, ad..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Module Filter */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              aria-label="Filter leads by course module"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Modules</option>
              {dropdownSettings.modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter leads by status"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {dropdownSettings.statuses.map(st => (
                <option key={st.key} value={st.label}>{st.label}</option>
              ))}
            </select>

            {/* HR Filter */}
            <select
              value={filterHr}
              onChange={(e) => setFilterHr(e.target.value)}
              aria-label="Filter leads by HR counselor"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All HR Counselors</option>
              {dropdownSettings.hrNames.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO VIEW MODE */}
      {viewMode === 'kanban' && (
        <MetaKanban filteredLeads={filteredLeads} />
      )}

      {viewMode === 'cards' && (
        <MetaCardsView filteredLeads={filteredLeads} />
      )}

      {viewMode === 'table' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 pl-4 pr-1 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      title={isAllSelected ? 'Deselect All' : 'Select All'}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : isSomeSelected ? (
                        <div className="h-4 w-4 rounded border-2 border-indigo-600 bg-indigo-50 flex items-center justify-center">
                          <div className="h-1.5 w-2 bg-indigo-600 rounded-xs" />
                        </div>
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3">Lead</th>
                  {columnVisibility.showDate && <th className="py-3.5 px-3">Date & Time</th>}
                  <th className="py-3.5 px-3">Phone / WhatsApp</th>
                  {columnVisibility.showEmail && <th className="py-3.5 px-3">Email</th>}
                  {columnVisibility.showModule && <th className="py-3.5 px-3">Module</th>}
                  {(columnVisibility.showCampaign || columnVisibility.showAdset || columnVisibility.showAdName) && (
                    <th className="py-3.5 px-3">Meta Ad Attribution</th>
                  )}
                  {columnVisibility.showHr && <th className="py-3.5 px-3">Counselor (HR)</th>}
                  {columnVisibility.showStatus && <th className="py-3.5 px-3">Status</th>}
                  {columnVisibility.showCallBack && <th className="py-3.5 px-3">Call Back Time</th>}
                  {columnVisibility.showCallsCount && <th className="py-3.5 px-3 text-center">Calls</th>}
                  <th className="py-3.5 pr-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-14 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                        <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                          {leads.length === 0 ? 'No leads in database yet' : 'No leads matching current filters'}
                        </div>
                        <p className="text-xs text-slate-400">
                          {leads.length === 0 
                            ? 'Fresh leads from Meta Lead Ads and Google Sheets will stream into Untouched Leads first.' 
                            : 'Try adjusting your search query or module filters.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const statusStyle = getStatusStyle(lead.status);
                    const waPhone = cleanPhoneForWhatsApp(lead.phone);
                    const cbUrgency = getCallBackUrgency(lead.callBackTime);
                    const isSelected = selectedLeadIds.includes(lead.id);

                    return (
                      <tr 
                        key={lead.id}
                        className={`transition group ${
                          isSelected 
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40' 
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 pl-4 pr-1 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectLead(lead.id)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3">
                          <div 
                            onClick={() => { setLeadToEdit(lead); setIsLeadModalOpen(true); }}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer"
                          >
                            {lead.name}
                          </div>
                        </td>

                        {/* Date & Time of Lead */}
                        {columnVisibility.showDate && (
                          <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {formatDate(lead.dateOfLead)}
                            </div>
                            <div className="flex items-center space-x-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                              <Clock className="h-2.5 w-2.5 text-indigo-500" />
                              <span>{lead.timeOfLead || formatLeadTime(lead.timeOfLead, lead.createdAt)}</span>
                            </div>
                          </td>
                        )}

                        {/* Phone & Instant Calling Buttons */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            {lead.phone}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <a
                              href={`tel:${lead.phone}`}
                              title="Call Lead"
                              className="inline-flex items-center space-x-1 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition"
                            >
                              <PhoneCall className="h-3 w-3" />
                              <span>Call</span>
                            </a>

                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20this%20is%20${encodeURIComponent(lead.hrName || 'our admissions team')}%20regarding%20your%20interest%20in%20our%20${encodeURIComponent(lead.module)}%20program.`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="inline-flex items-center space-x-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Email */}
                        {columnVisibility.showEmail && (
                          <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                            {lead.email || '—'}
                          </td>
                        )}

                        {/* Module */}
                        {columnVisibility.showModule && (
                          <td className="py-3 px-3">
                            <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                              {lead.module}
                            </span>
                          </td>
                        )}

                        {/* Meta Attribution */}
                        {(columnVisibility.showCampaign || columnVisibility.showAdset || columnVisibility.showAdName) && (
                          <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                            {lead.campaignName ? (
                              <div className="space-y-0.5">
                                {columnVisibility.showCampaign && (
                                  <div className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={lead.campaignName}>
                                    {lead.campaignName}
                                  </div>
                                )}
                                {columnVisibility.showAdset && lead.adsetName && (
                                  <div className="text-[10px] text-slate-400 truncate" title={lead.adsetName}>
                                    Set: {lead.adsetName}
                                  </div>
                                )}
                                {columnVisibility.showAdName && lead.adName && (
                                  <div className="text-[10px] text-slate-400 truncate" title={lead.adName}>
                                    Ad: {lead.adName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                        )}

                        {/* HR Counselor */}
                        {columnVisibility.showHr && (
                          <td className="py-3 px-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {lead.hrName}
                          </td>
                        )}

                        {/* Status Badge */}
                        {columnVisibility.showStatus && (
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold border ${statusStyle.bg}`}>
                              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                              {lead.status}
                            </span>
                          </td>
                        )}

                        {/* Call Back Time */}
                        {columnVisibility.showCallBack && (
                          <td className="py-3 px-3">
                            {lead.status === 'Call Back' && lead.callBackTime ? (
                              <div className={`text-xs ${cbUrgency.isOverdue ? 'text-rose-600 font-bold dark:text-rose-400' : cbUrgency.isToday ? 'text-amber-600 font-bold dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{formatDateTime(lead.callBackTime)}</span>
                                </div>
                                {cbUrgency.isOverdue && (
                                  <span className="text-[10px] text-rose-500 uppercase font-extrabold tracking-wider">
                                    Overdue
                                  </span>
                                )}
                                {cbUrgency.isToday && !cbUrgency.isOverdue && (
                                  <span className="text-[10px] text-amber-600 uppercase font-extrabold tracking-wider">
                                    Due Today
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        )}

                        {/* Calls Count */}
                        {columnVisibility.showCallsCount && (
                          <td className="py-3 px-3 text-center">
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                              {lead.callReports?.length || 0}
                            </span>
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-3 pr-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setLeadToLogCall(lead)}
                              className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition active:scale-95"
                            >
                              <PhoneCall className="h-3 w-3" />
                              <span>Log Call</span>
                            </button>

                            <button
                              onClick={() => { setLeadToEdit(lead); setIsLeadModalOpen(true); }}
                              title="Edit Lead"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {canDeleteLeads(currentUser.role) && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete lead ${lead.name}?`)) {
                                    deleteLead(lead.id);
                                  }
                                }}
                                title="Delete Lead"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
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
      )}

      {/* Floating Bulk Actions Toolbar */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-2xl bg-slate-900 px-4 py-3 shadow-2xl text-white dark:bg-slate-800 border border-slate-700">
            <div className="flex items-center space-x-2 pr-2 border-r border-slate-700 text-xs font-bold">
              <CheckSquare className="h-4 w-4 text-indigo-400" />
              <span>{selectedLeadIds.length} Selected</span>
            </div>

            {/* Bulk Assign to Telecaller */}
            {canAssignLeads(currentUser.role) && (
              <div className="flex items-center space-x-1">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkAssignLeads(selectedLeadIds, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="rounded-xl bg-slate-800 dark:bg-slate-700 text-xs font-semibold px-2.5 py-1.5 border border-slate-600 focus:outline-none text-slate-200 cursor-pointer"
                >
                  <option value="" disabled>Assign To HR...</option>
                  {dropdownSettings.hrNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Bulk Update Status */}
            <div className="flex items-center space-x-1">
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    bulkUpdateStatus(selectedLeadIds, e.target.value);
                    e.target.value = '';
                  }
                }}
                className="rounded-xl bg-slate-800 dark:bg-slate-700 text-xs font-semibold px-2.5 py-1.5 border border-slate-600 focus:outline-none text-slate-200 cursor-pointer"
              >
                <option value="" disabled>Change Status...</option>
                {dropdownSettings.statuses.map((st) => (
                  <option key={st.key} value={st.key}>{st.label}</option>
                ))}
              </select>
            </div>

            {/* Bulk Delete */}
            {canDeleteLeads(currentUser.role) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Permanently delete ${selectedLeadIds.length} selected leads? This cannot be undone.`)) {
                    bulkDeleteLeads(selectedLeadIds);
                  }
                }}
                className="flex items-center space-x-1 rounded-xl bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected</span>
              </button>
            )}

            {/* Export Selected CSV */}
            <button
              type="button"
              onClick={() => {
                const selected = leads.filter(l => selectedLeadIds.includes(l.id));
                const csv = MetaStorageService.exportLeadsToCSV(selected);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `selected-leads-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="hidden sm:flex items-center space-x-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition border border-slate-700 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={clearSelectedLeads}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
