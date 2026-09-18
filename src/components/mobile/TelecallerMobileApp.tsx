import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MetaLead, StatusConfig } from '../../types/crm';
import { 
  PhoneCall, 
  MessageCircle, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  LogOut, 
  Sliders, 
  User, 
  Sparkles, 
  RefreshCw,
  Sun,
  Moon,
  AlertCircle,
  BookOpen,
  Send,
  Layers,
  PhoneForwarded,
  Flame,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Volume2,
  Upload,
  Radio
} from 'lucide-react';
import { 
  formatDate, 
  formatDateTime, 
  getStatusStyle, 
  cleanPhoneForWhatsApp, 
  getCallBackUrgency,
  formatLeadTime 
} from '../../utils/formatters';

export const TelecallerMobileApp: React.FC = () => {
  const { 
    leads, 
    currentUser, 
    setCurrentUser, 
    users, 
    dropdownSettings, 
    processLead, 
    logCallReport, 
    updateLead,
    isMobileAppMode,
    setIsMobileAppMode,
    isDarkMode,
    toggleDarkMode,
    crmSettings
  } = useCRM();

  // State
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'callbacks' | 'interested' | 'pitched' | 'registered' | 'not_interested'>('all');
  const [activeModalLead, setActiveModalLead] = useState<MetaLead | null>(null);
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  
  // Status Update Modal state
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [callBackDate, setCallBackDate] = useState('');
  const [callBackTime, setCallBackTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Call Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<any>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Mic Recording
  const startRecording = async () => {
    setRecordingError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingError('Audio recording is not supported in this browser environment.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordedAudioUrl(base64data);
        };
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setRecordingError(err.message || 'Could not access microphone. Please allow mic permission.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Discard Recording
  const discardRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  // Handle local audio file upload (fallback for external recording)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRecordedAudioUrl(event.target?.result as string);
      setRecordingDuration(Math.round(file.size / 16000) || 15);
    };
    reader.readAsDataURL(file);
  };

  // Determine effective telecaller name:
  // If current user is telecaller, strictly their name. If admin/manager, allows previewing any telecaller or all assigned
  const [previewHrName, setPreviewHrName] = useState<string>(
    currentUser.role === 'telecaller' ? currentUser.name : (dropdownSettings.hrNames[0] || currentUser.name)
  );

  const effectiveHrName = currentUser.role === 'telecaller' ? currentUser.name : previewHrName;

  // Filter leads strictly assigned to this telecaller
  const assignedLeads = useMemo(() => {
    return leads.filter(l => l.hrName && l.hrName.toLowerCase() === effectiveHrName.toLowerCase());
  }, [leads, effectiveHrName]);

  // Telecaller metrics
  const stats = useMemo(() => {
    const total = assignedLeads.length;
    const callbacks = assignedLeads.filter(l => l.status === 'Call Back');
    const todayStr = new Date().toISOString().slice(0, 10);
    const callbacksToday = callbacks.filter(l => l.callBackTime && l.callBackTime.startsWith(todayStr));
    const pending = assignedLeads.filter(l => !l.callReports || l.callReports.length === 0 || l.status === 'Untouched');
    const interested = assignedLeads.filter(l => l.status === 'Interested' || l.status === 'Pitched');
    const registered = assignedLeads.filter(l => l.status === 'Registration');

    return {
      total,
      pending: pending.length,
      callbacksToday: callbacksToday.length,
      callbacksTotal: callbacks.length,
      interested: interested.length,
      registered: registered.length,
    };
  }, [assignedLeads]);

  // Filtered leads based on search and status chips
  const filteredLeads = useMemo(() => {
    return assignedLeads.filter(l => {
      // Status filter
      if (selectedFilter === 'pending') {
        if (l.callReports && l.callReports.length > 0 && l.status !== 'Untouched') return false;
      } else if (selectedFilter === 'callbacks') {
        if (l.status !== 'Call Back') return false;
      } else if (selectedFilter === 'interested') {
        if (l.status !== 'Interested') return false;
      } else if (selectedFilter === 'pitched') {
        if (l.status !== 'Pitched') return false;
      } else if (selectedFilter === 'registered') {
        if (l.status !== 'Registration') return false;
      } else if (selectedFilter === 'not_interested') {
        if (l.status !== 'Not Interested') return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (l.name || '').toLowerCase().includes(q);
        const matchPhone = (l.phone || '').toLowerCase().includes(q);
        const matchModule = (l.module || '').toLowerCase().includes(q);
        const matchNotes = (l.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchModule && !matchNotes) return false;
      }

      return true;
    });
  }, [assignedLeads, selectedFilter, search]);

  // Handle opening status modal
  const openStatusModal = (lead: MetaLead) => {
    setActiveModalLead(lead);
    setStatusToUpdate(lead.status === 'Untouched' ? 'Interested' : lead.status);
    if (lead.callBackTime) {
      const parts = lead.callBackTime.split('T');
      setCallBackDate(parts[0] || '');
      setCallBackTime(parts[1]?.slice(0, 5) || '');
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCallBackDate(tomorrow.toISOString().slice(0, 10));
      setCallBackTime('11:00');
    }
    setRemarks('');
    // Reset recording state
    discardRecording();
    setRecordingError(null);
  };

  // Handle 1-tap call & auto open logger
  const handleCallLead = (lead: MetaLead) => {
    // Open dialer
    window.location.href = `tel:${lead.phone}`;
    // Open call logger modal
    openStatusModal(lead);
  };

  // Save Call & Status Update
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalLead) return;

    // If currently recording, stop it first
    if (isRecording) {
      stopRecording();
    }

    let finalCallBack: string | undefined = undefined;
    if (statusToUpdate === 'Call Back' && callBackDate) {
      finalCallBack = callBackTime ? `${callBackDate}T${callBackTime}` : `${callBackDate}T10:00`;
    }

    const recName = recordedAudioUrl ? `Call_${activeModalLead.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.webm` : undefined;

    // Process & log call report
    processLead(activeModalLead.id, {
      hrName: effectiveHrName,
      status: statusToUpdate,
      callBackTime: finalCallBack,
      remarks: remarks.trim() || `Call logged by ${effectiveHrName}`,
      recordingUrl: recordedAudioUrl || undefined,
      recordingDuration: recordingDuration > 0 ? recordingDuration : undefined,
      recordingName: recName,
    });

    logCallReport(activeModalLead.id, {
      hrName: effectiveHrName,
      statusAtCall: statusToUpdate,
      callBackTime: finalCallBack,
      remarks: remarks.trim() || `Status updated to ${statusToUpdate}`,
      recordingUrl: recordedAudioUrl || undefined,
      recordingDuration: recordingDuration > 0 ? recordingDuration : undefined,
      recordingName: recName,
    });

    setActiveModalLead(null);
    discardRecording();
    setSuccessToast(`Saved status & call details for ${activeModalLead.name}!`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Banner if Admin or Sales Manager is previewing */}
      {currentUser.role !== 'telecaller' && (
        <div className="bg-indigo-700 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm z-30">
          <div className="flex items-center space-x-2">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Telecaller Mobile App Preview
            </span>
            <span className="text-indigo-200 hidden sm:inline">|</span>
            <div className="flex items-center space-x-1">
              <span className="text-indigo-200">Viewing as:</span>
              <select
                value={previewHrName}
                onChange={(e) => setPreviewHrName(e.target.value)}
                className="bg-indigo-800 text-white font-bold rounded px-2 py-0.5 text-xs border border-indigo-500 focus:outline-none"
              >
                {dropdownSettings.hrNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsMobileAppMode(false)}
            className="rounded bg-white/20 hover:bg-white/30 px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>Back to Full CRM</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Main Container constrained to clean mobile view */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-white dark:bg-slate-900 shadow-xl min-h-screen">
        {/* Sticky Mobile App Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                {effectiveHrName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    {effectiveHrName}
                  </h1>
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.2 border border-indigo-200 dark:border-indigo-800">
                    Telecaller App
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Calls & Messaging Queue
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </button>

              <button
                onClick={() => setIsSwitchUserOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Switch User / Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Carousel */}
          <div className="grid grid-cols-4 gap-2 pt-3">
            <div 
              onClick={() => setSelectedFilter('all')}
              className={`rounded-xl p-2 text-center cursor-pointer transition border ${
                selectedFilter === 'all' 
                  ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/50 dark:border-indigo-800' 
                  : 'bg-slate-50 border-slate-100 dark:bg-slate-800/60 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{stats.total}</span>
            </div>

            <div 
              onClick={() => setSelectedFilter('pending')}
              className={`rounded-xl p-2 text-center cursor-pointer transition border ${
                selectedFilter === 'pending' 
                  ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:border-amber-800' 
                  : 'bg-slate-50 border-slate-100 dark:bg-slate-800/60 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block uppercase">To Call</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">{stats.pending}</span>
            </div>

            <div 
              onClick={() => setSelectedFilter('callbacks')}
              className={`rounded-xl p-2 text-center cursor-pointer transition border ${
                selectedFilter === 'callbacks' 
                  ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/50 dark:border-rose-800' 
                  : 'bg-slate-50 border-slate-100 dark:bg-slate-800/60 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Callback</span>
              <span className="text-base font-black text-rose-600 dark:text-rose-400">{stats.callbacksTotal}</span>
            </div>

            <div 
              onClick={() => setSelectedFilter('registered')}
              className={`rounded-xl p-2 text-center cursor-pointer transition border ${
                selectedFilter === 'registered' 
                  ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800' 
                  : 'bg-slate-50 border-slate-100 dark:bg-slate-800/60 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Enrolled</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{stats.registered}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assigned leads by name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-1.5 overflow-x-auto py-2 scrollbar-none text-[11px] font-semibold">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All Leads ({stats.total})
            </button>
            <button
              onClick={() => setSelectedFilter('pending')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'pending' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Pending First Call ({stats.pending})
            </button>
            <button
              onClick={() => setSelectedFilter('callbacks')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'callbacks' 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Callbacks ({stats.callbacksTotal})
            </button>
            <button
              onClick={() => setSelectedFilter('interested')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'interested' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Interested ({stats.interested})
            </button>
            <button
              onClick={() => setSelectedFilter('registered')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                selectedFilter === 'registered' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Enrolled ({stats.registered})
            </button>
          </div>
        </header>

        {/* Leads Scroll Area */}
        <main className="flex-1 p-3 space-y-3 pb-24">
          {filteredLeads.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  {assignedLeads.length === 0 
                    ? `No leads assigned to ${effectiveHrName} yet` 
                    : 'No leads found in this filter'}
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {assignedLeads.length === 0 
                    ? 'When your sales manager assigns incoming leads to you, they will appear right here.' 
                    : 'Try selecting a different filter tab or clearing your search.'}
                </p>
              </div>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const statusStyle = getStatusStyle(lead.status);
              const waPhone = cleanPhoneForWhatsApp(lead.phone);
              const cbUrgency = getCallBackUrgency(lead.callBackTime);
              const hasCalls = lead.callReports && lead.callReports.length > 0;
              const latestReport = hasCalls ? lead.callReports[lead.callReports.length - 1] : null;

              return (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 hover:border-indigo-300 transition"
                >
                  {/* Card Header: Candidate Name, Module, and Inbound Date */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {lead.name}
                        </h2>
                        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold border border-indigo-100 dark:border-indigo-900">
                          {lead.module}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-medium">{formatDate(lead.dateOfLead)}</span>
                        <span>•</span>
                        <span>{lead.timeOfLead || formatLeadTime(lead.timeOfLead, lead.createdAt)}</span>
                        {lead.city && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 font-semibold">{lead.city}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${statusStyle.bg}`}>
                      {lead.status}
                    </span>
                  </div>

                  {/* Callback Alert Badge if Call Back */}
                  {lead.status === 'Call Back' && lead.callBackTime && (
                    <div className={`rounded-xl p-2 text-xs flex items-center justify-between font-semibold ${
                      cbUrgency.isOverdue 
                        ? 'bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300' 
                        : 'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
                    }`}>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Callback: {formatDateTime(lead.callBackTime)}</span>
                      </div>
                      {cbUrgency.isOverdue && (
                        <span className="bg-rose-600 text-white rounded px-1.5 py-0.2 text-[9px] font-bold uppercase">
                          Overdue
                        </span>
                      )}
                    </div>
                  )}

                  {/* Previous Call Remark / Note */}
                  {latestReport?.remarks && (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block text-[10px] uppercase text-indigo-500">
                          Last Remark ({formatDate(latestReport.createdAt)}):
                        </span>
                        {latestReport?.recordingUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Volume2 className="h-3 w-3" />
                            <span>Audio Recorded</span>
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2">{latestReport.remarks}</p>

                      {/* Embedded Audio Player for past recording */}
                      {latestReport?.recordingUrl && (
                        <div className="pt-1">
                          <audio
                            src={latestReport.recordingUrl}
                            controls
                            className="w-full h-7 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Primary Touch Actions: CALL & WHATSAPP & UPDATE STATUS */}
                  <div className="pt-1 flex items-center gap-2">
                    {/* 1-Tap Direct Call */}
                    <button
                      type="button"
                      onClick={() => handleCallLead(lead)}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Call Now</span>
                    </button>

                    {/* 1-Tap Direct WhatsApp */}
                    {waPhone ? (
                      <a
                        href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20this%20is%20${encodeURIComponent(effectiveHrName)}%20from%20iMMEK%20Softech%20regarding%20your%20interest%20in%20our%20${encodeURIComponent(lead.module)}%20training%20program.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center space-x-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                      >
                        <span>No Phone</span>
                      </button>
                    )}

                    {/* Update Status & Remarks */}
                    <button
                      type="button"
                      onClick={() => openStatusModal(lead)}
                      title="Update Status & Log Note"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                    >
                      <Sliders className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* Quick Status Update Modal */}
      {activeModalLead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                  Update Lead Status
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeModalLead.name} ({activeModalLead.phone})
                </h3>
              </div>
              <button
                onClick={() => setActiveModalLead(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-3">
              {/* Select Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Call Outcome / Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dropdownSettings.statuses.map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setStatusToUpdate(st.key)}
                      className={`flex items-center space-x-2 rounded-xl p-2.5 text-xs font-bold border transition text-left cursor-pointer ${
                        statusToUpdate === st.key
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.color }} />
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* If Call Back Selected: Date & Time Picker */}
              {statusToUpdate === 'Call Back' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Schedule Follow-up Call Back
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={callBackDate}
                      onChange={(e) => setCallBackDate(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <input
                      type="time"
                      value={callBackTime}
                      onChange={(e) => setCallBackTime(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Call Note / Remark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Discussion Notes &amp; Remarks
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Discussed course syllabus, fee structure, student requested callback."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* ── Call Recorder Widget ── */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-slate-50 p-3 dark:border-indigo-950 dark:bg-slate-800/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Mic className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Call Voice Recording
                    </span>
                  </div>
                  {isRecording && (
                    <span className="flex items-center space-x-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping mr-0.5" />
                      <span>REC {formatSeconds(recordingDuration)}</span>
                    </span>
                  )}
                </div>

                {recordingError && (
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-[11px] text-rose-700 flex items-center gap-1.5 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{recordingError}</span>
                  </div>
                )}

                {/* Recorder Control Buttons */}
                {!recordedAudioUrl ? (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 py-2 text-xs font-bold text-white shadow-sm hover:from-rose-700 hover:to-red-700 active:scale-95 transition cursor-pointer"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition cursor-pointer animate-pulse"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Stop &amp; Save ({formatSeconds(recordingDuration)})</span>
                      </button>
                    )}

                    {/* File Upload Option for external recordings */}
                    <label className="inline-flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer shadow-xs">
                      <Upload className="h-3 w-3 text-slate-500" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  /* Audio Player & Discard Preview */
                  <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Recorded Call Audio {recordingDuration > 0 ? `(${formatSeconds(recordingDuration)})` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={discardRecording}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                        title="Delete recording and record again"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Retake</span>
                      </button>
                    </div>

                    <audio
                      ref={audioPlayerRef}
                      src={recordedAudioUrl}
                      controls
                      className="w-full h-8"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModalLead(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Call Outcome</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Switch User / Logout Modal */}
      {isSwitchUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="h-4 w-4 text-indigo-600" />
                Switch User / Staff Login
              </h3>
              <button
                onClick={() => setIsSwitchUserOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    if (u.role === 'telecaller') {
                      setIsMobileAppMode(true);
                    }
                    setIsSwitchUserOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-xs transition cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400'
                      : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-[11px]">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.phone || u.email}</div>
                    </div>
                  </div>
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase">
                    {u.role.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsMobileAppMode(false);
                  setIsSwitchUserOpen(false);
                }}
                className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 text-center"
              >
                Open Full CRM Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl dark:bg-white dark:text-slate-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
};
