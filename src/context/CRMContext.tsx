import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { 
  MetaLead, 
  DropdownSettings, 
  MetaStats, 
  CallReport, 
  StatusConfig, 
  ViewMode, 
  ColumnVisibility, 
  MetaIntegrationConfig,
  MetaCampaignInsight,
  MetaMarketingApiConfig,
  CRMSettings,
  GoogleSheetConfig,
  GoogleSheetSource,
  MultiSheetConfig,
  MetaAdAccountConfig,
  AdAccountSummary,
  NavigationTab
} from '../types/crm';
export type { NavigationTab };

import { 
  MetaStorageService, 
  DEFAULT_COLUMN_VISIBILITY, 
  DEFAULT_META_CONFIG,
  DEFAULT_GOOGLE_SHEET_CONFIG
} from '../services/storage';
import { 
  DEFAULT_MARKETING_CONFIG, 
  DEFAULT_CRM_SETTINGS, 
  DEFAULT_AD_ACCOUNTS,
  MetaAdsService 
} from '../services/metaAdsService';
import { GoogleSheetsService, DEFAULT_MULTI_SHEET_CONFIG } from '../services/googleSheetsService';

interface CRMContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  leads: MetaLead[];
  dropdownSettings: DropdownSettings;
  stats: MetaStats;

  // View Mode & Custom View Options
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  columnVisibility: ColumnVisibility;
  toggleColumn: (key: keyof ColumnVisibility) => void;
  resetColumns: () => void;

  // Meta Integration Config
  metaConfig: MetaIntegrationConfig;
  updateMetaConfig: (updates: Partial<MetaIntegrationConfig>) => void;
  simulateMetaLead: () => void;
  importMetaLeads: (newLeads: MetaLead[]) => void;

  // Google Sheets Live Sync (Single & Multi-Source)
  googleSheetConfig: GoogleSheetConfig;
  updateGoogleSheetConfig: (updates: Partial<GoogleSheetConfig>) => void;
  syncGoogleSheetLeads: (force?: boolean) => Promise<{ success: boolean; count: number; message: string }>;
  isSyncingSheet: boolean;

  multiSheetConfig: MultiSheetConfig;
  updateMultiSheetConfig: (updates: Partial<MultiSheetConfig>) => void;
  addSheetSource: (source: Omit<GoogleSheetSource, 'id' | 'lastSyncStatus' | 'totalSyncedCount' | 'lastFetchedRows'>) => void;
  updateSheetSource: (id: string, updates: Partial<GoogleSheetSource>) => void;
  deleteSheetSource: (id: string) => void;
  syncAllSheetSources: (force?: boolean) => Promise<{ success: boolean; totalNewLeads: number; message: string }>;
  syncSingleSheetSource: (sourceId: string) => Promise<{ success: boolean; newLeads: number; message: string }>;
  isSyncingAllSheets: boolean;

  // Meta Marketing & Campaigns Insights
  campaignInsights: MetaCampaignInsight[];
  marketingConfig: MetaMarketingApiConfig;
  updateMarketingConfig: (updates: Partial<MetaMarketingApiConfig>) => void;
  crmSettings: CRMSettings;
  updateCrmSettings: (updates: Partial<CRMSettings>) => void;
  syncCampaignInsights: () => Promise<boolean>;
  isSyncingCampaigns: boolean;

  // Multi-Ad Account Selection & Summaries
  adAccounts: MetaAdAccountConfig[];
  selectedAdAccountId: string;
  setSelectedAdAccountId: (id: string) => void;
  addAdAccount: (account: Omit<MetaAdAccountConfig, 'id'>) => void;
  updateAdAccount: (id: string, updates: Partial<MetaAdAccountConfig>) => void;
  deleteAdAccount: (id: string) => void;
  adAccountSummaries: AdAccountSummary[];

  // Modals & Selection
  selectedLead: MetaLead | null;
  setSelectedLead: (lead: MetaLead | null) => void;
  leadToLogCall: MetaLead | null;
  setLeadToLogCall: (lead: MetaLead | null) => void;
  isLeadModalOpen: boolean;
  setIsLeadModalOpen: (open: boolean) => void;
  leadToEdit: MetaLead | null;
  setLeadToEdit: (lead: MetaLead | null) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Lead operations
  addLead: (lead: Omit<MetaLead, 'id' | 'createdAt' | 'callReports'>) => void;
  updateLead: (id: string, updates: Partial<MetaLead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStatus: (leadId: string, newStatus: string) => void;
  processLead: (leadId: string, details: { hrName: string; status: string; callBackTime?: string; remarks?: string }) => void;
  logCallReport: (leadId: string, report: { hrName: string; statusAtCall: string; callBackTime?: string; remarks: string }) => void;

  // Dropdown Customization operations
  addModule: (moduleName: string) => void;
  editModule: (oldName: string, newName: string) => void;
  deleteModule: (moduleName: string) => void;

  addHrName: (hrName: string) => void;
  editHrName: (oldName: string, newName: string) => void;
  deleteHrName: (hrName: string) => void;

  addStatus: (status: StatusConfig) => void;
  deleteStatus: (key: string) => void;

  // System
  resetAllData: () => void;
  exportDatabase: () => void;
  exportCSV: () => void;
  importDatabase: (jsonString: string) => boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('untouched');
  const [searchQuery, setSearchQuery] = useState('');

  const [leads, setLeads] = useState<MetaLead[]>(() => MetaStorageService.getLeads());
  const [dropdownSettings, setDropdownSettings] = useState<DropdownSettings>(() => MetaStorageService.getDropdownSettings());
  
  // Custom View State
  const [viewMode, setViewModeState] = useState<ViewMode>(() => MetaStorageService.getViewMode());
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => MetaStorageService.getColumnVisibility());

  // Meta Integration Config
  const [metaConfig, setMetaConfig] = useState<MetaIntegrationConfig>(() => MetaStorageService.getMetaIntegrationConfig());

  // Meta Marketing & Campaigns Config & Insights
  const [marketingConfig, setMarketingConfig] = useState<MetaMarketingApiConfig>(() => MetaStorageService.getMarketingConfig());
  const [crmSettings, setCrmSettings] = useState<CRMSettings>(() => MetaStorageService.getCrmSettings());
  const [campaignInsights, setCampaignInsights] = useState<MetaCampaignInsight[]>(() => MetaStorageService.getCampaignInsights());
  const [isSyncingCampaigns, setIsSyncingCampaigns] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [selectedLead, setSelectedLead] = useState<MetaLead | null>(null);
  const [leadToLogCall, setLeadToLogCall] = useState<MetaLead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<MetaLead | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Persist handlers
  useEffect(() => {
    MetaStorageService.saveLeads(leads);
  }, [leads]);

  useEffect(() => {
    MetaStorageService.saveDropdownSettings(dropdownSettings);
  }, [dropdownSettings]);

  useEffect(() => {
    MetaStorageService.saveViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    MetaStorageService.saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  useEffect(() => {
    MetaStorageService.saveMetaIntegrationConfig(metaConfig);
  }, [metaConfig]);

  useEffect(() => {
    MetaStorageService.saveMarketingConfig(marketingConfig);
  }, [marketingConfig]);

  useEffect(() => {
    MetaStorageService.saveCrmSettings(crmSettings);
  }, [crmSettings]);

  useEffect(() => {
    MetaStorageService.saveCampaignInsights(campaignInsights);
  }, [campaignInsights]);

  // Google Sheet Integration Config & Sync State
  const [googleSheetConfig, setGoogleSheetConfig] = useState<GoogleSheetConfig>(() => MetaStorageService.getGoogleSheetConfig());
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const leadsRef = useRef(leads);
  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  useEffect(() => {
    MetaStorageService.saveGoogleSheetConfig(googleSheetConfig);
  }, [googleSheetConfig]);

  const updateGoogleSheetConfig = (updates: Partial<GoogleSheetConfig>) => {
    setGoogleSheetConfig(prev => ({ ...prev, ...updates }));
  };

  const syncGoogleSheetLeads = async (force: boolean = false): Promise<{ success: boolean; count: number; message: string }> => {
    if (!googleSheetConfig.sheetUrl) {
      return { success: false, count: 0, message: 'Please provide a valid Google Sheet URL.' };
    }

    setIsSyncingSheet(true);
    setGoogleSheetConfig(prev => ({ ...prev, lastSyncStatus: 'syncing' }));

    try {
      const { leads: fetchedLeads, totalRows } = await GoogleSheetsService.fetchLatestLeads(googleSheetConfig);

      // Deduplication based on cleaned phone digits, email, and ID
      const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
      const currentLeads = leadsRef.current;
      const existingPhones = new Set(currentLeads.map(l => cleanDigits(l.phone)).filter(Boolean));
      const existingEmails = new Set(currentLeads.map(l => (l.email || '').toLowerCase().trim()).filter(Boolean));
      const existingIds = new Set(currentLeads.map(l => l.id));

      const newLeads = fetchedLeads.filter(fl => {
        const ph = cleanDigits(fl.phone);
        const em = (fl.email || '').toLowerCase().trim();

        if (fl.id && existingIds.has(fl.id)) return false;
        if (ph && existingPhones.has(ph)) return false;
        if (em && existingEmails.has(em)) return false;

        return true;
      });

      if (newLeads.length > 0) {
        setLeads(prev => [...newLeads, ...prev]);
      }

      const syncTime = new Date().toISOString();
      const successMessage = newLeads.length > 0
        ? `Synced ${newLeads.length} new leads from Google Sheet! (Total sheet rows: ${totalRows})`
        : `Connected to Google Sheet (${totalRows} rows). All leads are already synced.`;

      setGoogleSheetConfig(prev => ({
        ...prev,
        isConnected: true,
        lastSyncAt: syncTime,
        lastSyncStatus: 'success',
        lastSyncMessage: successMessage,
        lastFetchedRows: totalRows,
        newLeadsFound: newLeads.length,
        totalSyncedCount: (prev.totalSyncedCount || 0) + newLeads.length,
      }));

      return { success: true, count: newLeads.length, message: successMessage };
    } catch (err: any) {
      const errMsg = err.message || 'Failed to sync with Google Sheet. Please check sheet permissions.';
      setGoogleSheetConfig(prev => ({
        ...prev,
        lastSyncStatus: 'error',
        lastSyncMessage: errMsg,
      }));
      return { success: false, count: 0, message: errMsg };
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Auto-sync polling timer
  useEffect(() => {
    if (!googleSheetConfig.autoSync || !googleSheetConfig.isConnected || !googleSheetConfig.sheetUrl) {
      return;
    }

    const intervalMinutes = Math.max(1, googleSheetConfig.syncInterval || 2);
    const intervalMs = intervalMinutes * 60 * 1000;

    const timer = setInterval(() => {
      syncGoogleSheetLeads();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [googleSheetConfig.autoSync, googleSheetConfig.isConnected, googleSheetConfig.sheetUrl, googleSheetConfig.syncInterval]);

  // Multi-Google Sheets Integration Config & State
  const [multiSheetConfig, setMultiSheetConfig] = useState<MultiSheetConfig>(() => MetaStorageService.getMultiSheetConfig());
  const [isSyncingAllSheets, setIsSyncingAllSheets] = useState(false);

  useEffect(() => {
    MetaStorageService.saveMultiSheetConfig(multiSheetConfig);
  }, [multiSheetConfig]);

  const updateMultiSheetConfig = (updates: Partial<MultiSheetConfig>) => {
    setMultiSheetConfig(prev => ({ ...prev, ...updates }));
  };

  const addSheetSource = (source: Omit<GoogleSheetSource, 'id' | 'lastSyncStatus' | 'totalSyncedCount' | 'lastFetchedRows'>) => {
    const newSource: GoogleSheetSource = {
      ...source,
      id: `sheet_${Date.now()}`,
      lastSyncStatus: 'idle',
      totalSyncedCount: 0,
      lastFetchedRows: 0,
    };
    setMultiSheetConfig(prev => ({
      ...prev,
      sources: [...prev.sources, newSource],
    }));
  };

  const updateSheetSource = (id: string, updates: Partial<GoogleSheetSource>) => {
    setMultiSheetConfig(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteSheetSource = (id: string) => {
    setMultiSheetConfig(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s.id !== id),
    }));
  };

  const syncAllSheetSources = async (force: boolean = false): Promise<{ success: boolean; totalNewLeads: number; message: string }> => {
    setIsSyncingAllSheets(true);
    try {
      const { combinedLeads, sourceResults } = await GoogleSheetsService.fetchAllSources(multiSheetConfig.sources);

      // Deduplication based on cleaned phone digits, email, and ID
      const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
      const currentLeads = leadsRef.current;
      const existingPhones = new Set(currentLeads.map(l => cleanDigits(l.phone)).filter(Boolean));
      const existingEmails = new Set(currentLeads.map(l => (l.email || '').toLowerCase().trim()).filter(Boolean));
      const existingIds = new Set(currentLeads.map(l => l.id));

      const newLeads = combinedLeads.filter(fl => {
        const ph = cleanDigits(fl.phone);
        const em = (fl.email || '').toLowerCase().trim();

        if (fl.id && existingIds.has(fl.id)) return false;
        if (ph && existingPhones.has(ph)) return false;
        if (em && existingEmails.has(em)) return false;

        return true;
      });

      if (newLeads.length > 0) {
        setLeads(prev => [...newLeads, ...prev]);
      }

      const now = new Date().toISOString();
      setMultiSheetConfig(prev => ({
        ...prev,
        lastSyncAllAt: now,
        sources: prev.sources.map(s => {
          const res = sourceResults[s.id];
          if (!res) return s;
          return {
            ...s,
            lastSyncAt: now,
            lastSyncStatus: res.success ? 'success' : 'error',
            lastSyncMessage: res.message,
            lastFetchedRows: res.rows,
            totalSyncedCount: res.success ? (s.totalSyncedCount || 0) + (res.rows > 0 ? 1 : 0) : s.totalSyncedCount,
          };
        }),
      }));

      const msg = newLeads.length > 0
        ? `Synced ${newLeads.length} new untouched leads across ${Object.keys(sourceResults).length} Google Sheets!`
        : `All ${Object.keys(sourceResults).length} Google Sheets checked. All leads are already in the CRM.`;

      return { success: true, totalNewLeads: newLeads.length, message: msg };
    } catch (err: any) {
      return { success: false, totalNewLeads: 0, message: err.message || 'Failed to sync Google Sheets.' };
    } finally {
      setIsSyncingAllSheets(false);
    }
  };

  const syncSingleSheetSource = async (sourceId: string): Promise<{ success: boolean; newLeads: number; message: string }> => {
    const source = multiSheetConfig.sources.find(s => s.id === sourceId);
    if (!source || !source.sheetUrl) {
      return { success: false, newLeads: 0, message: 'Source not found or missing URL.' };
    }

    updateSheetSource(sourceId, { lastSyncStatus: 'syncing' });
    try {
      const { leads: fetchedLeads, totalRows } = await GoogleSheetsService.fetchLeadsFromSource(source);

      const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
      const currentLeads = leadsRef.current;
      const existingPhones = new Set(currentLeads.map(l => cleanDigits(l.phone)).filter(Boolean));
      const existingEmails = new Set(currentLeads.map(l => (l.email || '').toLowerCase().trim()).filter(Boolean));
      const existingIds = new Set(currentLeads.map(l => l.id));

      const newLeads = fetchedLeads.filter(fl => {
        const ph = cleanDigits(fl.phone);
        const em = (fl.email || '').toLowerCase().trim();

        if (fl.id && existingIds.has(fl.id)) return false;
        if (ph && existingPhones.has(ph)) return false;
        if (em && existingEmails.has(em)) return false;

        return true;
      });

      if (newLeads.length > 0) {
        setLeads(prev => [...newLeads, ...prev]);
      }

      const now = new Date().toISOString();
      updateSheetSource(sourceId, {
        lastSyncAt: now,
        lastSyncStatus: 'success',
        lastSyncMessage: `Synced ${newLeads.length} new leads (${totalRows} total rows in sheet).`,
        lastFetchedRows: totalRows,
        totalSyncedCount: (source.totalSyncedCount || 0) + newLeads.length,
      });

      return {
        success: true,
        newLeads: newLeads.length,
        message: `Successfully synced ${newLeads.length} new leads from "${source.name}".`,
      };
    } catch (err: any) {
      updateSheetSource(sourceId, {
        lastSyncStatus: 'error',
        lastSyncMessage: err.message || 'Sync failed.',
      });
      return { success: false, newLeads: 0, message: err.message || 'Sync failed.' };
    }
  };

  // Multi-Sheet Auto-Sync Polling Timer
  useEffect(() => {
    if (!multiSheetConfig.autoSync || multiSheetConfig.sources.length === 0) return;
    const intervalMs = Math.max(1, multiSheetConfig.syncInterval || 2) * 60 * 1000;
    const timer = setInterval(() => {
      syncAllSheetSources();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [multiSheetConfig.autoSync, multiSheetConfig.syncInterval, multiSheetConfig.sources]);

  // Multi-Ad Account Configuration & Summaries
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string>(() => marketingConfig.selectedAccountId || 'ALL');

  const adAccounts = marketingConfig.adAccounts && marketingConfig.adAccounts.length > 0
    ? marketingConfig.adAccounts
    : DEFAULT_AD_ACCOUNTS;

  const addAdAccount = (account: Omit<MetaAdAccountConfig, 'id'>) => {
    const newAcc: MetaAdAccountConfig = {
      ...account,
      id: `acc_${Date.now()}`,
    };
    const updated = [...(marketingConfig.adAccounts || DEFAULT_AD_ACCOUNTS), newAcc];
    setMarketingConfig(prev => ({
      ...prev,
      adAccounts: updated,
    }));
  };

  const updateAdAccount = (id: string, updates: Partial<MetaAdAccountConfig>) => {
    const updated = (marketingConfig.adAccounts || DEFAULT_AD_ACCOUNTS).map(a => a.id === id ? { ...a, ...updates } : a);
    setMarketingConfig(prev => ({
      ...prev,
      adAccounts: updated,
    }));
  };

  const deleteAdAccount = (id: string) => {
    const updated = (marketingConfig.adAccounts || DEFAULT_AD_ACCOUNTS).filter(a => a.id !== id);
    setMarketingConfig(prev => ({
      ...prev,
      adAccounts: updated,
    }));
  };

  const adAccountSummaries = useMemo(() => {
    return MetaAdsService.calculateAccountSummaries(campaignInsights, adAccounts);
  }, [campaignInsights, adAccounts]);

  const updateMarketingConfig = (updates: Partial<MetaMarketingApiConfig>) => {
    setMarketingConfig(prev => ({ ...prev, ...updates }));
  };

  const updateCrmSettings = (updates: Partial<CRMSettings>) => {
    setCrmSettings(prev => ({ ...prev, ...updates }));
  };

  const syncCampaignInsights = async (): Promise<boolean> => {
    setIsSyncingCampaigns(true);
    try {
      const liveData = await MetaAdsService.fetchCampaignInsights(marketingConfig, 'last_7d', leadsRef.current);
      setCampaignInsights(liveData);
      setMarketingConfig(prev => ({ ...prev, lastSyncAt: new Date().toISOString() }));
      return true;
    } catch (err) {
      console.error('Failed to sync campaign insights:', err);
      return false;
    } finally {
      setIsSyncingCampaigns(false);
    }
  };

  const stats = MetaStorageService.calculateStats(leads);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
  };

  const toggleColumn = (key: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetColumns = () => {
    setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
  };

  const updateMetaConfig = (updates: Partial<MetaIntegrationConfig>) => {
    setMetaConfig(prev => ({ ...prev, ...updates }));
  };

  const importMetaLeads = (newLeads: MetaLead[]) => {
    setLeads(prev => [...newLeads, ...prev]);
    setMetaConfig(prev => ({ ...prev, lastSyncAt: new Date().toISOString() }));
  };

  // Simulate incoming Meta webhook lead (real-time Facebook/Instagram lead)
  const simulateMetaLead = () => {
    const randomModules = dropdownSettings.modules;
    const pickedModule = randomModules[Math.floor(Math.random() * randomModules.length)] || 'DATA SCIENCE';
    const sampleNames = ['Aditya Rao', 'Meera Kapoor', 'Tanmay Sen', 'Deepak Nair', 'Riya Sengupta', 'Gaurav Joshi'];
    const pickedName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomPhone = `+91 ${Math.floor(90000 + Math.random() * 9999)} ${Math.floor(10000 + Math.random() * 89999)}`;
    const randomAd = ['Ad_Reel_LiveDemo_V3', 'Ad_Video_CareerSalaryHike_V1', 'Ad_Carousel_CloudMastery'][Math.floor(Math.random() * 3)];
    const randomCampaign = ['Meta_DataScience_Sept26', 'Meta_Cloud_AWS_Leads_Sept', 'Meta_GenerativeAI_LeadGen'][Math.floor(Math.random() * 3)];
    const randomHr = dropdownSettings.hrNames[Math.floor(Math.random() * dropdownSettings.hrNames.length)] || 'Priya Sharma';

    const incomingLead: MetaLead = {
      id: `meta-live-${Date.now()}`,
      name: pickedName,
      phone: randomPhone,
      email: `${pickedName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      module: pickedModule,
      dateOfLead: new Date().toISOString().slice(0, 10),
      timeOfLead: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      campaignName: randomCampaign,
      adsetName: 'Audience_Tech_Graduates',
      adName: randomAd,
      hrName: '', // Counselor is unassigned initially
      status: 'Untouched', // Fresh untouched lead from Meta Ads
      callBackTime: '',
      notes: 'Captured live via Meta Instant Form Webhook event (leadgen). Awaiting counselor assignment.',
      createdAt: new Date().toISOString(),
      isProcessed: false,
      callReports: [],
    };

    setLeads(prev => [incomingLead, ...prev]);
    setMetaConfig(prev => ({ ...prev, lastSyncAt: new Date().toISOString() }));
  };

  // Lead operations
  const addLead = (data: Omit<MetaLead, 'id' | 'createdAt' | 'callReports'>) => {
    const newLead: MetaLead = {
      ...data,
      timeOfLead: data.timeOfLead || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isProcessed: !!data.hrName && data.status !== 'Untouched',
      callReports: [],
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLead = (id: string, updates: Partial<MetaLead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)));
    if (selectedLead?.id === id) {
      setSelectedLead(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  const moveLeadStatus = (leadId: string, newStatus: string) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;

    if (newStatus === 'Call Back') {
      // If moving to Call Back, open Call Report modal so user specifies the Call Back Time!
      setLeadToLogCall({
        ...targetLead,
        status: 'Call Back',
      });
      return;
    }

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: newStatus,
          callBackTime: '',
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    }));
  };

  /**
   * Processes an untouched lead:
   * Sets counselor (hrName), updates status, sets callback time (if applicable),
   * creates initial call report, and graduates the lead to All Leads.
   */
  const processLead = (
    leadId: string, 
    details: { hrName: string; status: string; callBackTime?: string; remarks?: string }
  ) => {
    const newReport: CallReport = {
      id: `cr-${Date.now()}`,
      leadId,
      hrName: details.hrName,
      statusAtCall: details.status,
      callBackTime: details.status === 'Call Back' ? details.callBackTime : undefined,
      remarks: details.remarks?.trim() || `Counselor assigned: ${details.hrName}. Status updated to ${details.status}.`,
      createdAt: new Date().toISOString(),
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const updated: MetaLead = {
          ...l,
          hrName: details.hrName,
          status: details.status,
          callBackTime: details.status === 'Call Back' ? (details.callBackTime || '') : '',
          notes: details.remarks ? `${details.remarks}\n${l.notes || ''}`.trim() : l.notes,
          isProcessed: true, // Graduated from Untouched to All Leads!
          callReports: [newReport, ...(l.callReports || [])],
          updatedAt: new Date().toISOString(),
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return l;
    }));
  };

  const logCallReport = (leadId: string, reportData: { hrName: string; statusAtCall: string; callBackTime?: string; remarks: string }) => {
    const newReport: CallReport = {
      id: `cr-${Date.now()}`,
      leadId,
      hrName: reportData.hrName,
      statusAtCall: reportData.statusAtCall,
      callBackTime: reportData.callBackTime,
      remarks: reportData.remarks,
      createdAt: new Date().toISOString(),
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const updated: MetaLead = {
          ...l,
          status: reportData.statusAtCall,
          callBackTime: reportData.statusAtCall === 'Call Back' ? (reportData.callBackTime || l.callBackTime) : '',
          hrName: reportData.hrName || l.hrName,
          isProcessed: true,
          callReports: [newReport, ...(l.callReports || [])],
          updatedAt: new Date().toISOString(),
        };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return l;
    }));
  };

  // Dropdown management
  const addModule = (moduleName: string) => {
    const trimmed = moduleName.trim();
    if (!trimmed || dropdownSettings.modules.includes(trimmed)) return;
    setDropdownSettings(prev => ({ ...prev, modules: [...prev.modules, trimmed] }));
  };

  const editModule = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setDropdownSettings(prev => ({
      ...prev,
      modules: prev.modules.map(m => (m === oldName ? trimmed : m)),
    }));
    setLeads(prev => prev.map(l => (l.module === oldName ? { ...l, module: trimmed } : l)));
  };

  const deleteModule = (moduleName: string) => {
    setDropdownSettings(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m !== moduleName),
    }));
  };

  const addHrName = (hrName: string) => {
    const trimmed = hrName.trim();
    if (!trimmed || dropdownSettings.hrNames.includes(trimmed)) return;
    setDropdownSettings(prev => ({ ...prev, hrNames: [...prev.hrNames, trimmed] }));
  };

  const editHrName = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setDropdownSettings(prev => ({
      ...prev,
      hrNames: prev.hrNames.map(h => (h === oldName ? trimmed : h)),
    }));
    setLeads(prev => prev.map(l => (l.hrName === oldName ? { ...l, hrName: trimmed } : l)));
  };

  const deleteHrName = (hrName: string) => {
    setDropdownSettings(prev => ({
      ...prev,
      hrNames: prev.hrNames.filter(h => h !== hrName),
    }));
  };

  const addStatus = (statusObj: StatusConfig) => {
    setDropdownSettings(prev => ({
      ...prev,
      statuses: [...prev.statuses.filter(s => s.key !== statusObj.key), statusObj],
    }));
  };

  const deleteStatus = (key: string) => {
    setDropdownSettings(prev => ({
      ...prev,
      statuses: prev.statuses.filter(s => s.key !== key),
    }));
  };

  // System
  const resetAllData = () => {
    MetaStorageService.resetToDefault();
    setLeads(MetaStorageService.getLeads());
    setDropdownSettings(MetaStorageService.getDropdownSettings());
    setViewModeState('table');
    setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
    setMetaConfig(DEFAULT_META_CONFIG);
    setMarketingConfig(DEFAULT_MARKETING_CONFIG);
    setCrmSettings(DEFAULT_CRM_SETTINGS);
    setCampaignInsights(MetaStorageService.getCampaignInsights());
    setGoogleSheetConfig(DEFAULT_GOOGLE_SHEET_CONFIG);
    setMultiSheetConfig(DEFAULT_MULTI_SHEET_CONFIG);
    setSelectedAdAccountId('ALL');
  };

  const exportDatabase = () => {
    const json = MetaStorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta-leads-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const csv = MetaStorageService.exportLeadsToCSV(leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta-ads-leads-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonString: string): boolean => {
    const ok = MetaStorageService.importData(jsonString);
    if (ok) {
      setLeads(MetaStorageService.getLeads());
      setDropdownSettings(MetaStorageService.getDropdownSettings());
      setMetaConfig(MetaStorageService.getMetaIntegrationConfig());
      setMarketingConfig(MetaStorageService.getMarketingConfig());
      setCrmSettings(MetaStorageService.getCrmSettings());
      setCampaignInsights(MetaStorageService.getCampaignInsights());
      setGoogleSheetConfig(MetaStorageService.getGoogleSheetConfig());
      setMultiSheetConfig(MetaStorageService.getMultiSheetConfig());
      return true;
    }
    return false;
  };

  return (
    <CRMContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        leads,
        dropdownSettings,
        stats,
        viewMode,
        setViewMode,
        columnVisibility,
        toggleColumn,
        resetColumns,
        metaConfig,
        updateMetaConfig,
        simulateMetaLead,
        importMetaLeads,
        googleSheetConfig,
        updateGoogleSheetConfig,
        syncGoogleSheetLeads,
        isSyncingSheet,
        multiSheetConfig,
        updateMultiSheetConfig,
        addSheetSource,
        updateSheetSource,
        deleteSheetSource,
        syncAllSheetSources,
        syncSingleSheetSource,
        isSyncingAllSheets,
        adAccounts,
        selectedAdAccountId,
        setSelectedAdAccountId,
        addAdAccount,
        updateAdAccount,
        deleteAdAccount,
        adAccountSummaries,
        campaignInsights,
        marketingConfig,
        updateMarketingConfig,
        crmSettings,
        updateCrmSettings,
        syncCampaignInsights,
        isSyncingCampaigns,
        selectedLead,
        setSelectedLead,
        leadToLogCall,
        setLeadToLogCall,
        isLeadModalOpen,
        setIsLeadModalOpen,
        leadToEdit,
        setLeadToEdit,
        isDarkMode,
        toggleDarkMode,
        addLead,
        updateLead,
        deleteLead,
        moveLeadStatus,
        processLead,
        logCallReport,
        addModule,
        editModule,
        deleteModule,
        addHrName,
        editHrName,
        deleteHrName,
        addStatus,
        deleteStatus,
        resetAllData,
        exportDatabase,
        exportCSV,
        importDatabase,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = (): CRMContextType => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
