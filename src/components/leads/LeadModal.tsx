import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaLead } from '../../types/crm';
import { X, UserPlus, Phone, Mail, BookOpen, Calendar, Megaphone, Clock } from 'lucide-react';

export const LeadModal: React.FC = () => {
  const { 
    isLeadModalOpen, 
    setIsLeadModalOpen, 
    leadToEdit, 
    setLeadToEdit, 
    addLead, 
    updateLead,
    dropdownSettings 
  } = useCRM();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [module, setModule] = useState('DATA SCIENCE');
  const [dateOfLead, setDateOfLead] = useState(new Date().toISOString().slice(0, 10));
  const [timeOfLead, setTimeOfLead] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [adsetName, setAdsetName] = useState('');
  const [adName, setAdName] = useState('');
  const [hrName, setHrName] = useState('');
  const [status, setStatus] = useState('Interested');
  const [callBackTime, setCallBackTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name || '');
      setPhone(leadToEdit.phone || '');
      setEmail(leadToEdit.email || '');
      setModule(leadToEdit.module || dropdownSettings.modules[0] || 'DATA SCIENCE');
      setDateOfLead(leadToEdit.dateOfLead || new Date().toISOString().slice(0, 10));
      setTimeOfLead(leadToEdit.timeOfLead || (leadToEdit.createdAt ? new Date(leadToEdit.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '10:30 AM'));
      setCampaignName(leadToEdit.campaignName || '');
      setAdsetName(leadToEdit.adsetName || '');
      setAdName(leadToEdit.adName || '');
      setHrName(leadToEdit.hrName || dropdownSettings.hrNames[0] || '');
      setStatus(leadToEdit.status || 'Interested');
      setCallBackTime(leadToEdit.callBackTime || '');
      setNotes(leadToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setModule(dropdownSettings.modules[0] || 'DATA SCIENCE');
      setDateOfLead(new Date().toISOString().slice(0, 10));
      setTimeOfLead(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setCampaignName('Meta_Leads_Sept26');
      setAdsetName('Graduates_Tech_Audience');
      setAdName('Ad_Video_CourseBenefits');
      setHrName(dropdownSettings.hrNames[0] || '');
      setStatus('Interested');
      setCallBackTime('');
      setNotes('');
    }
  }, [leadToEdit, isLeadModalOpen, dropdownSettings]);

  if (!isLeadModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Name and Phone number are required.');
      return;
    }

    if (status === 'Call Back' && !callBackTime) {
      alert('Please specify Call Back Time when status is Call Back.');
      return;
    }

    const leadData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      module,
      dateOfLead,
      timeOfLead: timeOfLead.trim() || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      campaignName: campaignName.trim(),
      adsetName: adsetName.trim(),
      adName: adName.trim(),
      hrName: hrName || '',
      status,
      callBackTime: status === 'Call Back' ? callBackTime : '',
      notes: notes.trim(),
      isProcessed: leadToEdit ? (leadToEdit.isProcessed ?? true) : (!!hrName && status !== 'Untouched'),
    };

    if (leadToEdit) {
      updateLead(leadToEdit.id, leadData);
    } else {
      addLead(leadData);
    }

    setIsLeadModalOpen(false);
    setLeadToEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {leadToEdit ? 'Edit Meta Ads Lead' : 'Add New Meta Ads Lead'}
              </h2>
              <p className="text-xs text-slate-400">Capture lead details, course module, and ad attribution</p>
            </div>
          </div>
          <button
            onClick={() => { setIsLeadModalOpen(false); setLeadToEdit(null); }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Basic Info: Name, Phone, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date of Lead *
              </label>
              <input
                type="date"
                required
                value={dateOfLead}
                onChange={(e) => setDateOfLead(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time of Collection
              </label>
              <input
                type="text"
                placeholder="10:30 AM"
                value={timeOfLead}
                onChange={(e) => setTimeOfLead(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Module (Dropdown) & HR (Dropdown) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Module / Course Track (Dropdown) *
              </label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {dropdownSettings.modules.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned HR / Counselor (Dropdown) *
              </label>
              <select
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {dropdownSettings.hrNames.map(hr => (
                  <option key={hr} value={hr}>{hr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Meta Ads Campaign Tracking Attribution */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Meta Ads Attribution
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Campaign Name</label>
                <input
                  type="text"
                  placeholder="Meta_DataScience_Sept"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Adset Name</label>
                <input
                  type="text"
                  placeholder="Graduates_21_28"
                  value={adsetName}
                  onChange={(e) => setAdsetName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Ad Name</label>
                <input
                  type="text"
                  placeholder="Ad_Video_Hike_V1"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Lead Status (Dropdown) & Conditional Call Back Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lead Status (Dropdown) *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {dropdownSettings.statuses.map(st => (
                  <option key={st.key} value={st.label}>{st.label}</option>
                ))}
              </select>
            </div>

            {status === 'Call Back' ? (
              <div>
                <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Call Back Time (Required) *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={callBackTime}
                  onChange={(e) => setCallBackTime(e.target.value)}
                  className="w-full rounded-lg border-2 border-amber-300 bg-amber-50/50 p-1.5 text-xs font-bold text-slate-900 focus:outline-none dark:border-amber-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Call Back Time
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Select 'Call Back' status to enable"
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Remarks / Requirements
            </label>
            <textarea
              rows={2}
              placeholder="Candidate query, past experience, preferred timing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setIsLeadModalOpen(false); setLeadToEdit(null); }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
            >
              {leadToEdit ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
