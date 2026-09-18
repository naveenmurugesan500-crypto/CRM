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
  NavigationTab,
  CRMUser,
  UserRole
} from '../types/crm';
export type { NavigationTab, CRMUser, UserRole };

import { 
  MetaStorageService, 
  STORAGE_KEYS,
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
import { DEFAULT_MODULES } from '../services/mockData';

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
  importMetaLeads: (newLeads: MetaLead[]) => void;
  syncMetaLeadForms: () => Promise<{ success: boolean; newLeads: number; message: string }>;
  isSyncingMetaForms: boolean;

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
  syncCampaignInsights: (datePreset?: string) => Promise<boolean>;
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
  processLead: (leadId: string, details: { hrName: string; status: string; callBackTime?: string; remarks?: string; recordingUrl?: string; recordingDuration?: number; recordingName?: string }) => void;
  logCallReport: (leadId: string, report: { hrName: string; statusAtCall: string; callBackTime?: string; remarks: string; recordingUrl?: string; recordingDuration?: number; recordingName?: string }) => void;

  // Dropdown Customization operations
  addModule: (moduleName: string) => void;
  editModule: (oldName: string, newName: string) => void;
  deleteModule: (moduleName: string) => void;
  resetModulesToDefault: () => void;

  addHrName: (hrName: string) => void;
  editHrName: (oldName: string, newName: string) => void;
  deleteHrName: (hrName: string) => void;

  addStatus: (status: StatusConfig) => void;
  deleteStatus: (key: string) => void;

  // User Management & RBAC
  users: CRMUser[];
  currentUser: CRMUser;
  setCurrentUser: (user: CRMUser) => void;
  addUser: (user: Omit<CRMUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<CRMUser>) => void;
  deleteUser: (id: string) => void;
  isMobileAppMode: boolean;
  setIsMobileAppMode: (mode: boolean) => void;

  // Bulk Operations
  selectedLeadIds: string[];
  setSelectedLeadIds: (ids: string[]) => void;
  toggleSelectLead: (id: string) => void;
  selectAllLeads: (ids: string[]) => void;
  clearSelectedLeads: () => void;
  bulkDeleteLeads: (ids: string[]) => void;
  bulkAssignLeads: (ids: string[], hrName: string) => void;
  bulkUpdateStatus: (ids: string[], status: string) => void;

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

  // User Management & RBAC
  const [users, setUsers] = useState<CRMUser[]>(() => MetaStorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<CRMUser>(() => MetaStorageService.getActiveUser());
  const [isMobileAppMode, setIsMobileAppMode] = useState<boolean>(() => currentUser?.role === 'telecaller');

  // Bulk Operations
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  useEffect(() => {
    MetaStorageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    MetaStorageService.saveActiveUser(currentUser);
    if (currentUser?.role === 'telecaller') {
      setIsMobileAppMode(true);
    }
  }, [currentUser]);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Real-time synchronization across browser tabs and views (Telecaller <-> Manager <-> Admin)
  useEffect(() => {
    // 1. Native window storage event (fired across different tabs/windows)
    const handleNativeStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LEADS && e.newValue) {
        try {
          const freshLeads: MetaLead[] = JSON.parse(e.newValue);
          setLeads(freshLeads);
        } catch (err) {
          // Ignore JSON parse error
        }
      }
    };

    // 2. Custom window event (fired within the same tab/window)
    const handleCustomStorage = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: any }>;
      if (customEvent.detail?.key === STORAGE_KEYS.LEADS && Array.isArray(customEvent.detail.value)) {
        setLeads(customEvent.detail.value);
      }
    };

    // 3. BroadcastChannel (fast modern cross-tab sync)
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('crm_sync_channel');
        broadcastChannel.onmessage = (event) => {
          if (event.data?.key === STORAGE_KEYS.LEADS && Array.isArray(event.data.value)) {
            setLeads(event.data.value);
          }
        };
      }
    } catch (bcErr) {
      // Ignore broadcast channel errors
    }

    window.addEventListener('storage', handleNativeStorage);
    window.addEventListener('crm-storage-update', handleCustomStorage);

    return () => {
      window.removeEventListener('storage', handleNativeStorage);
      window.removeEventListener('crm-storage-update', handleCustomStorage);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

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

  const [isSyncingMetaForms, setIsSyncingMetaForms] = useState(false);

  const syncCampaignInsights = async (datePreset: string = 'Last 30 Days'): Promise<boolean> => {
    setIsSyncingCampaigns(true);
    try {
      const liveData = await MetaAdsService.fetchCampaignInsights(marketingConfig, datePreset, leadsRef.current);
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

  const syncMetaLeadForms = async (): Promise<{ success: boolean; newLeads: number; message: string }> => {
    setIsSyncingMetaForms(true);
    try {
      const token = metaConfig.accessToken || marketingConfig.accessToken;
      const pageId = metaConfig.pageId || marketingConfig.pageId;
      const fetchedLeads = await MetaAdsService.fetchMetaFormLeads(token, pageId);

      if (fetchedLeads.length === 0) {
        return { success: true, newLeads: 0, message: 'No new leads found in Meta Instant Forms.' };
      }

      let newCount = 0;
      setLeads(prev => {
        const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
        const existingIds = new Set(prev.map(l => l.id));
        const existingPhones = new Set(prev.map(l => cleanDigits(l.phone)).filter(Boolean));
        const existingEmails = new Set(prev.map(l => (l.email || '').toLowerCase().trim()).filter(Boolean));

        const freshLeads: MetaLead[] = [];
        for (const lead of fetchedLeads) {
          const ph = cleanDigits(lead.phone);
          const em = (lead.email || '').toLowerCase().trim();

          if (existingIds.has(lead.id)) continue;
          if (ph && existingPhones.has(ph)) continue;
          if (em && existingEmails.has(em)) continue;

          freshLeads.push(lead);
          existingIds.add(lead.id);
          if (ph) existingPhones.add(ph);
          if (em) existingEmails.add(em);
        }

        newCount = freshLeads.length;
        return [...freshLeads, ...prev];
      });

      setMetaConfig(prev => ({ ...prev, lastSyncAt: new Date().toISOString() }));
      return {
        success: true,
        newLeads: newCount,
        message: newCount > 0 
          ? `Successfully synced ${newCount} fresh leads from Meta Instant Forms into Untouched Leads!` 
          : 'All Meta form leads are already synchronized.'
      };
    } catch (err: any) {
      console.error('Failed to sync Meta Form leads:', err);
      return { success: false, newLeads: 0, message: err.message || 'Failed to sync Meta lead forms.' };
    } finally {
      setIsSyncingMetaForms(false);
    }
  };

  // Auto-sync initial campaigns if pre-wired and empty
  useEffect(() => {
    if (marketingConfig.isConnected && marketingConfig.accessToken && campaignInsights.length === 0) {
      syncCampaignInsights('Last 30 Days');
    }
  }, []);

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
    details: { hrName: string; status: string; callBackTime?: string; remarks?: string; recordingUrl?: string; recordingDuration?: number; recordingName?: string }
  ) => {
    const newReport: CallReport = {
      id: `cr-${Date.now()}`,
      leadId,
      hrName: details.hrName,
      statusAtCall: details.status,
      callBackTime: details.status === 'Call Back' ? details.callBackTime : undefined,
      remarks: details.remarks?.trim() || `Counselor assigned: ${details.hrName}. Status updated to ${details.status}.`,
      recordingUrl: details.recordingUrl,
      recordingDuration: details.recordingDuration,
      recordingName: details.recordingName,
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
          lastRecordingUrl: details.recordingUrl || l.lastRecordingUrl,
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

  const logCallReport = (leadId: string, reportData: { hrName: string; statusAtCall: string; callBackTime?: string; remarks: string; recordingUrl?: string; recordingDuration?: number; recordingName?: string }) => {
    const newReport: CallReport = {
      id: `cr-${Date.now()}`,
      leadId,
      hrName: reportData.hrName,
      statusAtCall: reportData.statusAtCall,
      callBackTime: reportData.callBackTime,
      remarks: reportData.remarks,
      recordingUrl: reportData.recordingUrl,
      recordingDuration: reportData.recordingDuration,
      recordingName: reportData.recordingName,
      createdAt: new Date().toISOString(),
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const updated: MetaLead = {
          ...l,
          status: reportData.statusAtCall,
          callBackTime: reportData.statusAtCall === 'Call Back' ? (reportData.callBackTime || l.callBackTime) : '',
          hrName: reportData.hrName || l.hrName,
          lastRecordingUrl: reportData.recordingUrl || l.lastRecordingUrl,
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

  const resetModulesToDefault = () => {
    setDropdownSettings(prev => ({
      ...prev,
      modules: DEFAULT_MODULES,
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

  // User Management & RBAC operations
  const addUser = (userData: Omit<CRMUser, 'id' | 'createdAt'>) => {
    const newUser: CRMUser = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    if (newUser.name && !dropdownSettings.hrNames.includes(newUser.name)) {
      addHrName(newUser.name);
    }
  };

  const updateUser = (id: string, updates: Partial<CRMUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      const remaining = users.filter(u => u.id !== id);
      if (remaining.length > 0) {
        setCurrentUser(remaining[0]);
      }
    }
  };

  // Bulk Operations
  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllLeads = (ids: string[]) => {
    setSelectedLeadIds(ids);
  };

  const clearSelectedLeads = () => {
    setSelectedLeadIds([]);
  };

  const bulkDeleteLeads = (ids: string[]) => {
    if (ids.length === 0) return;
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    setSelectedLeadIds([]);
  };

  const bulkAssignLeads = (ids: string[], hrName: string) => {
    if (ids.length === 0) return;
    setLeads(prev => prev.map(l => {
      if (ids.includes(l.id)) {
        return {
          ...l,
          hrName,
          isProcessed: true,
          status: l.status === 'Untouched' ? 'Interested' : l.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    }));
    setSelectedLeadIds([]);
  };

  const bulkUpdateStatus = (ids: string[], status: string) => {
    if (ids.length === 0) return;
    setLeads(prev => prev.map(l => {
      if (ids.includes(l.id)) {
        return {
          ...l,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    }));
    setSelectedLeadIds([]);
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
    setUsers(MetaStorageService.getUsers());
    setCurrentUser(MetaStorageService.getActiveUser());
    setSelectedLeadIds([]);
    setIsMobileAppMode(false);
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
        importMetaLeads,
        syncMetaLeadForms,
        isSyncingMetaForms,
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
        resetModulesToDefault,
        addHrName,
        editHrName,
        deleteHrName,
        addStatus,
        deleteStatus,
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        isMobileAppMode,
        setIsMobileAppMode,
        selectedLeadIds,
        setSelectedLeadIds,
        toggleSelectLead,
        selectAllLeads,
        clearSelectedLeads,
        bulkDeleteLeads,
        bulkAssignLeads,
        bulkUpdateStatus,
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
