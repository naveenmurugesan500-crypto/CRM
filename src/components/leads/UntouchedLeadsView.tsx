import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaLead, canDeleteLeads } from '../../types/crm';
import { 
  Sparkles, 
  PhoneCall, 
  MessageCircle, 
  Search, 
  Calendar, 
  CheckCircle2, 
  User, 
  Zap, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  X, 
  Check, 
  FileSpreadsheet, 
  RefreshCw, 
  Trash2,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { 
  formatDate, 
  cleanPhoneForWhatsApp,
  formatLeadTime 
} from '../../utils/formatters';

export const UntouchedLeadsView: React.FC = () => {
  const { 
    leads, 
    dropdownSettings, 
    processLead,
    setActiveTab,
    stats,
    googleSheetConfig,
    syncGoogleSheetLeads,
    isSyncingSheet,
    multiSheetConfig,
    syncAllSheetSources,
    isSyncingAllSheets,
    syncMetaLeadForms,
    isSyncingMetaForms,
    deleteLead,
    currentUser
  } = useCRM();

  const isSalesManager = currentUser?.role === 'sales_manager';

  const [filterModule, setFilterModule] = useState('all');
  const [search, setSearch] = useState('');
  const [recentGraduation, setRecentGraduation] = useState<string | null>(null);
  const [metaSyncNotice, setMetaSyncNotice] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkHr, setBulkHr] = useState('');
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);


  const handlePullMetaLeads = async () => {
    const res = await syncMetaLeadForms();
    setMetaSyncNotice(res.message);
    setTimeout(() => setMetaSyncNotice(null), 4500);
  };

  // Untouched leads: isProcessed === false
  const untouchedLeads = leads.filter(l => !l.isProcessed);

  // Modal State for taking/processing a lead
  const [leadToProcess, setLeadToProcess] = useState<MetaLead | null>(null);
  const [selectedHr, setSelectedHr] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [callBackTime, setCallBackTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  // Inline row quick-assignment state
  const [inlineAssignments, setInlineAssignments] = useState<Record<string, { hrName: string; status: string }>>({});

  // Sales Manager per-row selected counselor draft state before clicking "Assign"
  const [smSelectedHr, setSmSelectedHr] = useState<Record<string, string>>({});

  const filtered = untouchedLeads.filter(l => {
    if (filterModule !== 'all' && l.module !== filterModule) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = (l.name || '').toLowerCase().includes(q);
      const matchPhone = (l.phone || '').toLowerCase().includes(q);
      const matchEmail = (l.email || '').toLowerCase().includes(q);
      const matchCampaign = (l.campaignName || '').toLowerCase().includes(q);
      const matchAd = (l.adName || '').toLowerCase().includes(q);
      const matchAdset = (l.adsetName || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchCampaign && !matchAd && !matchAdset) return false;
    }
    return true;
  });

  // ── Bulk selection helpers ──────────────────────────────────────────────────
  const isAllSelected = filtered.length > 0 && filtered.every(l => selectedIds.includes(l.id));
  const isSomeSelected = filtered.some(l => selectedIds.includes(l.id));
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () =>
    setSelectedIds(isAllSelected ? [] : filtered.map(l => l.id));
  const clearSelection = () => { setSelectedIds([]); setBulkHr(''); };

  const handleBulkAssign = (hr: string) => {
    if (!hr) return;
    setIsBulkAssigning(true);
    const toAssign = selectedIds.filter(id => filtered.some(l => l.id === id));
    toAssign.forEach(id =>
      processLead(id, {
        hrName: hr,
        status: 'Interested',
        remarks: `Bulk assigned by ${currentUser?.name || 'Manager'}. Counselor: ${hr}.`,
      })
    );
    const count = toAssign.length;
    setRecentGraduation(`✓ ${count} lead${count > 1 ? 's' : ''} assigned to ${hr} and moved to All Leads!`);
    setTimeout(() => setRecentGraduation(null), 5000);
    clearSelection();
    setIsBulkAssigning(false);
  };

  // ── Sales Manager: click Assign button → move to next stage (All Leads) ───────
  const handleSMAssign = (lead: MetaLead) => {
    const hrName = smSelectedHr[lead.id];
    if (!hrName) {
      alert(`Please select a Counselor for ${lead.name} first.`);
      return;
    }
    processLead(lead.id, {
      hrName,
      status: 'Interested',
      remarks: `Assigned by Sales Manager (${currentUser?.name || 'SM'}). Counselor: ${hrName}.`,
    });
    setRecentGraduation(`✓ "${lead.name}" assigned to ${hrName} and moved to All Leads!`);
    setTimeout(() => setRecentGraduation(null), 5000);
  };

  const handleOpenProcessModal = (lead: MetaLead) => {
    setLeadToProcess(lead);
    setSelectedHr('');
    setSelectedStatus('');
    setCallBackTime('');
    setRemarks('');
    setFormError('');
  };

  const handleCloseProcessModal = () => {
    setLeadToProcess(null);
    setFormError('');
  };

  const handleConfirmProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToProcess) return;

    if (!selectedHr.trim()) {
      setFormError('Please select a Counselor Name.');
      return;
    }

    if (!selectedStatus.trim()) {
      setFormError('Please select a Lead Status.');
      return;
    }

    if (selectedStatus === 'Call Back' && !callBackTime) {
      setFormError('Please select the Scheduled Call Back Time.');
      return;
    }

    // Process and graduate lead to All Leads!
    processLead(leadToProcess.id, {
      hrName: selectedHr,
      status: selectedStatus,
      callBackTime: selectedStatus === 'Call Back' ? callBackTime : undefined,
      remarks: remarks.trim() || `Counselor assigned: ${selectedHr}. Status set to ${selectedStatus}.`,
    });

    const leadName = leadToProcess.name;
    const counselorName = selectedHr;
    const statusName = selectedStatus;

    handleCloseProcessModal();
    setRecentGraduation(`✓ "${leadName}" assigned to ${counselorName} as "${statusName}" and moved to All Leads!`);
    setTimeout(() => {
      setRecentGraduation(null);
    }, 5000);
  };

  // Quick inline row graduate
  const handleQuickRowProcess = (lead: MetaLead) => {
    const inline = inlineAssignments[lead.id] || { hrName: '', status: '' };
    if (!inline.hrName) {
      alert(`Please choose a Counselor for ${lead.name} before moving.`);
      return;
    }
    if (!inline.status) {
      alert(`Please choose a Status for ${lead.name} before moving.`);
      return;
    }
    if (inline.status === 'Call Back') {
      // Open modal to specify callback time
      setLeadToProcess(lead);
      setSelectedHr(inline.hrName);
      setSelectedStatus(inline.status);
      return;
    }

    processLead(lead.id, {
      hrName: inline.hrName,
      status: inline.status,
      remarks: `Quick counselor assignment by ${inline.hrName}. Status: ${inline.status}.`,
    });

    setRecentGraduation(`✓ "${lead.name}" moved to All Leads!`);
    setTimeout(() => setRecentGraduation(null), 4000);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Untouched Leads (Inbound Intake)
            </h1>
            <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-xs font-extrabold shadow-sm flex items-center space-x-1 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping mr-0.5" />
              <span>{untouchedLeads.length} Awaiting Counselor</span>
            </span>
            {isSalesManager && (
              <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                Sales Manager View
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isSalesManager
              ? 'Select a counselor to instantly move the lead to All Leads and assign it in the Telecaller App.'
              : 'Incoming Meta Ads leads with autofilled Name, Phone, Email & Campaign details. Manually assign counselor & status to graduate to All Leads.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isSalesManager && (
            <>
              <button
                onClick={() => {
                  if (multiSheetConfig?.sources?.length > 0) {
                    syncAllSheetSources();
                  } else if (googleSheetConfig.sheetUrl) {
                    syncGoogleSheetLeads(true);
                  } else {
                    setActiveTab('google_sheets');
                  }
                }}
                disabled={isSyncingSheet || isSyncingAllSheets}
                className="flex items-center space-x-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${(isSyncingSheet || isSyncingAllSheets) ? 'animate-spin' : ''}`} />
                <span>
                  {(isSyncingSheet || isSyncingAllSheets) 
                    ? 'Syncing Sheets...' 
                    : (multiSheetConfig?.sources?.length > 1) 
                      ? `Sync All (${multiSheetConfig.sources.length}) Sheets` 
                      : 'Sync Google Sheets'}
                </span>
              </button>

              <button
                onClick={handlePullMetaLeads}
                disabled={isSyncingMetaForms}
                className="flex items-center space-x-1.5 rounded-xl border border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 px-3.5 py-2 text-xs font-bold text-purple-900 shadow-sm hover:from-purple-100 hover:to-indigo-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Zap className={`h-3.5 w-3.5 text-purple-600 dark:text-purple-400 ${isSyncingMetaForms ? 'animate-spin' : ''}`} />
                <span>{isSyncingMetaForms ? 'Pulling Meta Leads...' : 'Pull Meta Form Leads'}</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('leads')}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
          >
            <span>All Leads ({stats.processedCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Forms Sync Alert */}
      {metaSyncNotice && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-xs font-semibold text-purple-900 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>{metaSyncNotice}</span>
          </div>
          <button onClick={() => setMetaSyncNotice(null)} className="text-purple-600 hover:text-purple-900 text-xs font-bold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {recentGraduation && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{recentGraduation}</span>
          </div>
          <button onClick={() => setActiveTab('leads')} className="underline hover:text-emerald-900 font-bold ml-4">
            View in All Leads →
          </button>
        </div>
      )}

      {/* Information Helper Alert — role-aware */}
      <div className="rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50/60 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-slate-900 dark:text-amber-300 flex items-start space-x-3 shadow-xs">
        <div className="rounded-lg bg-amber-500 text-white p-1 mt-0.5">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          {isSalesManager ? (
            <>
              <div className="font-bold mb-0.5">Sales Manager: Select Counselor &amp; Click Assign → Moves to All Leads</div>
              <p className="text-amber-800/90 dark:text-amber-400 text-[11px] leading-relaxed">
                Select a counselor for each lead and click <strong>Assign</strong>. The lead will move to <strong>All Leads</strong> and immediately become available in the <strong>Telecaller Mobile App</strong> for that counselor.
              </p>
            </>
          ) : (
            <>
              <div className="font-bold mb-0.5">Intake Protocol: Autofilled Meta Details → Manual Assignment → All Leads</div>
              <p className="text-amber-800/90 dark:text-amber-400 text-[11px] leading-relaxed">
                Meta Ads automates <strong>Name, Phone, Email, Module, and Campaign / Adset / Ad Name</strong>. 
                Before moving to All Leads, a counselor must be selected, the prospect dialed, and lead status set.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Floating Bulk Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-blue-200 bg-white/95 dark:bg-slate-900/95 dark:border-blue-900 shadow-2xl px-5 py-3 backdrop-blur-sm animate-in slide-in-from-bottom-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <select
              value={bulkHr}
              onChange={e => { setBulkHr(e.target.value); if (e.target.value) handleBulkAssign(e.target.value); }}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 focus:outline-none"
              disabled={isBulkAssigning}
            >
              <option value="">⚡ Bulk Assign Counselor...</option>
              {dropdownSettings.hrNames.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <button
            onClick={clearSelection}
            className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" /><span>Clear</span>
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by prospect name, phone, campaign, ad..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Modules ({untouchedLeads.length})</option>
            {dropdownSettings.modules.map(m => {
              const count = untouchedLeads.filter(l => l.module === m).length;
              return (
                <option key={m} value={m}>{m} ({count})</option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Untouched Leads Queue Content */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {leads.length === 0 ? 'Awaiting Inbound Leads' : 'Zero Untouched Leads!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {leads.length === 0 
                ? 'Your CRM is clean and ready. Connect your Meta Lead Ads or Google Sheets to automatically stream fresh leads here.' 
                : 'Every inbound prospect from Meta Ads has been assigned to a counselor and graduated into All Leads.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {leads.length > 0 && (
              <button
                onClick={() => setActiveTab('leads')}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                <span>View All Meta Leads Pipeline ({stats.processedCount})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setActiveTab('google_sheets')}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Connect Google Sheets / Forms</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                    <th className="py-3.5 pl-4 pr-2 w-8">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={el => { if (el) el.indeterminate = isSomeSelected && !isAllSelected; }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <th className="py-3.5 pr-3">Autofilled Prospect</th>
                    <th className="py-3.5 px-3">Date &amp; Time</th>
                    <th className="py-3.5 px-3">Direct Connect</th>
                    <th className="py-3.5 px-3">Module</th>
                    <th className="py-3.5 px-3">Meta Ad Attribution</th>
                    {isSalesManager ? (
                      <>
                        <th className="py-3.5 px-3">Assign Counselor</th>
                        <th className="py-3.5 pr-4 text-right">Action</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3.5 px-3">Counselor (HR)</th>
                        <th className="py-3.5 px-3">Status</th>
                        <th className="py-3.5 pr-4 text-right">Intake Action</th>
                      </>
                    )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((lead) => {
                  const waPhone = cleanPhoneForWhatsApp(lead.phone);
                  const inline = inlineAssignments[lead.id] || { hrName: '', status: '' };
                  const isSelected = selectedIds.includes(lead.id);

                  return (
                    <tr 
                      key={lead.id}
                      className={`hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition group ${isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(lead.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Autofilled Prospect Info */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {lead.name}
                          </span>
                        </div>
                        <div className="ml-4 space-y-0.5">
                          {lead.email && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-[170px]" title={lead.email}>
                              {lead.email}
                            </span>
                          )}
                          {lead.city && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                              📍 {lead.city}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date & Time of Lead Collection */}
                      <td className="py-3.5 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center space-x-1 font-semibold text-slate-800 dark:text-slate-200">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatDate(lead.dateOfLead)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                          <Clock className="h-2.5 w-2.5 text-indigo-500" />
                          <span>{lead.timeOfLead || formatLeadTime(lead.timeOfLead, lead.createdAt)}</span>
                        </div>
                      </td>

                      {/* Phone & Instant Dial/Chat */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {lead.phone}
                        </div>
                        {!isSalesManager && (
                          <div className="flex items-center space-x-1.5 mt-1">
                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center space-x-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                              title="Call directly"
                            >
                              <PhoneCall className="h-2.5 w-2.5" />
                              <span>Call</span>
                            </a>

                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20thank%20you%20for%20your%20inquiry%20regarding%20our%20${encodeURIComponent(lead.module)}%20course.`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="h-2.5 w-2.5" />
                                <span>WA</span>
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Course Module */}
                      <td className="py-3.5 px-3">
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 whitespace-nowrap">
                          {lead.module}
                        </span>
                      </td>

                      {/* Campaign Details Autofilled */}
                      <td className="py-3.5 px-3 text-xs text-slate-500 dark:text-slate-400 max-w-[220px]">
                        <div className="truncate font-semibold text-slate-800 dark:text-slate-200" title={lead.campaignName}>
                          🎯 {lead.campaignName || 'Meta Campaign'}
                        </div>
                        {lead.adsetName && (
                          <div className="text-[10px] text-slate-500 truncate" title={lead.adsetName}>
                            Adset: {lead.adsetName}
                          </div>
                        )}
                        {lead.customQuestions && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5" title={lead.customQuestions}>
                            📋 {lead.customQuestions}
                          </div>
                        )}
                      </td>

                      {/* ── SALES MANAGER: Select Counselor + Click Assign Button ── */}
                      {isSalesManager ? (
                        <>
                          <td className="py-3.5 px-3">
                            <select
                              value={smSelectedHr[lead.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSmSelectedHr(prev => ({ ...prev, [lead.id]: val }));
                              }}
                              className="rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer min-w-[160px]"
                            >
                              <option value="">⚠️ Select Counselor</option>
                              {dropdownSettings.hrNames.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 pr-4 text-right">
                            {smSelectedHr[lead.id] ? (
                              <button
                                type="button"
                                onClick={() => handleSMAssign(lead)}
                                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition active:scale-95 cursor-pointer animate-in fade-in"
                                title={`Assign ${lead.name} to ${smSelectedHr[lead.id]} and move to All Leads`}
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Assign</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Select counselor</span>
                            )}
                          </td>
                        </>
                      ) : (
                        /* ── ADMIN: Full Counselor + Status + Actions ── */
                        <>
                          {/* Counselor Name (HR Name) */}
                          <td className="py-3.5 px-3">
                            <select
                              value={inline.hrName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInlineAssignments(prev => ({
                                  ...prev,
                                  [lead.id]: { ...(prev[lead.id] || { status: '' }), hrName: val }
                                }));
                              }}
                              className={`rounded-lg border px-2 py-1 text-xs font-medium focus:outline-none ${
                                inline.hrName 
                                  ? 'border-indigo-300 bg-indigo-50/50 text-indigo-900 dark:border-indigo-700 dark:bg-slate-800 dark:text-indigo-300' 
                                  : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}
                            >
                              <option value="">⚠️ Select Counselor</option>
                              {dropdownSettings.hrNames.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </td>

                          {/* Lead Status */}
                          <td className="py-3.5 px-3">
                            <select
                              value={inline.status}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInlineAssignments(prev => ({
                                  ...prev,
                                  [lead.id]: { ...(prev[lead.id] || { hrName: '' }), status: val }
                                }));
                              }}
                              className={`rounded-lg border px-2 py-1 text-xs font-medium focus:outline-none ${
                                inline.status 
                                  ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300' 
                                  : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              <option value="">⚡ Select Status</option>
                              {dropdownSettings.statuses.map(s => (
                                <option key={s.key} value={s.label}>{s.label}</option>
                              ))}
                            </select>
                          </td>

                          {/* Intake Action */}
                          <td className="py-3.5 pr-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              {inline.hrName && inline.status && inline.status !== 'Call Back' ? (
                                <button
                                  onClick={() => handleQuickRowProcess(lead)}
                                  className="inline-flex items-center space-x-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 animate-in fade-in"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Move to All Leads</span>
                                </button>
                              ) : null}

                              <button
                                onClick={() => handleOpenProcessModal(lead)}
                                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 transition active:scale-95 cursor-pointer"
                              >
                                <PhoneCall className="h-3 w-3" />
                                <span>Process &amp; Graduate</span>
                              </button>

                              {canDeleteLeads(currentUser?.role || 'admin') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete untouched lead ${lead.name}?`)) {
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
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Process Untouched Meta Lead */}
      {leadToProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Process Untouched Lead
                  </h2>
                  <p className="text-xs text-slate-400">
                    Assign Counselor & Log Call Status to graduate lead into All Leads
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseProcessModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error message */}
            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Section 1: Autofilled Meta Details (Read-only review) */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Autofilled Meta Ads Data</span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Verified Inbound Lead
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {leadToProcess.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {leadToProcess.email || 'No email provided'}
                    </span>
                  </div>
                  <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                    {leadToProcess.module}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    📞 {leadToProcess.phone}
                  </span>
                  <a
                    href={`tel:${leadToProcess.phone}`}
                    className="inline-flex items-center space-x-1 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-700"
                  >
                    <PhoneCall className="h-2.5 w-2.5" />
                    <span>Dial Now</span>
                  </a>
                  {cleanPhoneForWhatsApp(leadToProcess.phone) && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(leadToProcess.phone)}?text=Hi%20${encodeURIComponent(leadToProcess.name)},%20thank%20you%20for%20your%20inquiry%20regarding%20our%20${encodeURIComponent(leadToProcess.module)}%20program.`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-2.5 w-2.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-1 pt-1">
                  <div className="col-span-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 pb-1 mb-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Lead Collected:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatDate(leadToProcess.dateOfLead)}</span>
                    <span>at</span>
                    <span className="font-mono bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300">
                      {leadToProcess.timeOfLead || formatLeadTime(leadToProcess.timeOfLead, leadToProcess.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Campaign: </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{leadToProcess.campaignName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Ad Creative: </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{leadToProcess.adName || 'N/A'}</span>
                  </div>
                  {leadToProcess.adsetName && (
                    <div className="col-span-2">
                      <span className="font-medium text-slate-400">Adset: </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{leadToProcess.adsetName}</span>
                    </div>
                  )}
                  {leadToProcess.city && (
                    <div>
                      <span className="font-medium text-slate-400">City / Location: </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">📍 {leadToProcess.city}</span>
                    </div>
                  )}
                  {leadToProcess.formName && (
                    <div>
                      <span className="font-medium text-slate-400">Form: </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{leadToProcess.formName}</span>
                    </div>
                  )}
                  {leadToProcess.customQuestions && (
                    <div className="col-span-2 rounded-lg bg-indigo-50/70 p-2.5 text-[11px] text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 mt-1 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-bold block mb-0.5 text-indigo-950 dark:text-indigo-100">Applicant Form Responses:</span>
                      <span>{leadToProcess.customQuestions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Telecaller Input Form */}
            <form onSubmit={handleConfirmProcess} className="mt-5 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Manual Telecaller Details
              </div>

              {/* Counselor Name Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Counselor Name (HR Name) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedHr}
                  onChange={(e) => setSelectedHr(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                >
                  <option value="">— Select Assigned Counselor —</option>
                  {dropdownSettings.hrNames.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Lead Status Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                >
                  <option value="">— Select Status Outcome —</option>
                  {dropdownSettings.statuses.map(s => (
                    <option key={s.key} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Call Back Time */}
              {selectedStatus === 'Call Back' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-800 dark:bg-amber-950/40 space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                    Scheduled Call Back Time <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <input
                      type="datetime-local"
                      value={callBackTime}
                      onChange={(e) => setCallBackTime(e.target.value)}
                      className="w-full rounded-lg border border-amber-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-amber-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    This lead will automatically be scheduled into the Call Backs Queue.
                  </p>
                </div>
              )}

              {/* Call Remarks & Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Counseling Notes & Call Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Record call discussion summary, student qualifications, expectations, fees discussed..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseProcessModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                >
                  <span>Complete & Move to All Leads</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
