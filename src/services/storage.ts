import { 
  MetaLead, 
  DropdownSettings, 
  MetaStats, 
  ViewMode, 
  ColumnVisibility, 
  MetaIntegrationConfig,
  MetaCampaignInsight,
  MetaMarketingApiConfig,
  CRMSettings,
  GoogleSheetConfig,
  MultiSheetConfig,
  CRMUser
} from '../types/crm';
import { INITIAL_LEADS, DEFAULT_DROPDOWN_SETTINGS, DEFAULT_USERS } from './mockData';
import { 
  DEFAULT_MARKETING_CONFIG, 
  DEFAULT_CRM_SETTINGS, 
  INITIAL_CAMPAIGN_INSIGHTS,
  META_DEFAULT_PAGE_TOKEN,
  META_DEFAULT_PAGE_ID
} from './metaAdsService';
import { DEFAULT_MULTI_SHEET_CONFIG } from './googleSheetsService';

export const STORAGE_KEYS = {
  LEADS: 'nexus_meta_leads_v2',
  SETTINGS: 'nexus_meta_dropdown_settings_v2',
  VIEW_MODE: 'nexus_meta_view_mode_v2',
  COLUMNS: 'nexus_meta_columns_v2',
  META_INTEGRATION: 'nexus_meta_integration_v2',
  MARKETING_CONFIG: 'nexus_meta_marketing_config_v2',
  CRM_SETTINGS: 'nexus_crm_settings_v2',
  CAMPAIGN_INSIGHTS: 'nexus_meta_campaign_insights_v2',
  GOOGLE_SHEET: 'nexus_google_sheet_config_v2',
  MULTI_SHEET: 'nexus_multi_sheet_config_v2',
  USERS: 'nexus_crm_users_v1',
  ACTIVE_USER: 'nexus_crm_active_user_v1',
};

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  showEmail: true,
  showDate: true,
  showModule: true,
  showCampaign: true,
  showAdset: true,
  showAdName: true,
  showHr: true,
  showStatus: true,
  showCallBack: true,
  showCallsCount: true,
};

export const DEFAULT_META_CONFIG: MetaIntegrationConfig = {
  pageId: META_DEFAULT_PAGE_ID,
  appId: '',
  appSecret: '',
  accessToken: META_DEFAULT_PAGE_TOKEN,
  verifyToken: 'immek_meta_leads_verify_2026',
  webhookEndpoint: 'https://api.immeksoftech.com/webhooks/meta-leadgen',
  isConnected: true,
  lastSyncAt: new Date().toISOString(),
};

export const DEFAULT_GOOGLE_SHEET_CONFIG: GoogleSheetConfig = {
  sheetUrl: '',
  sheetId: '',
  gid: '0',
  sheetName: '',
  autoSync: true,
  syncInterval: 2,
  isConnected: false,
  lastSyncStatus: 'idle',
  totalSyncedCount: 0,
  newLeadsFound: 0,
  lastFetchedRows: 0,
};

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);

    // Notify same window components & other tabs immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('crm-storage-update', { detail: { key, value } }));
      
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('crm_sync_channel');
          bc.postMessage({ key, value });
          bc.close();
        }
      } catch (bcError) {
        // BroadcastChannel optional fallback
      }
    }
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// AUTO-PREWIRE & INITIALIZATION:
// Connects user's real Meta ad accounts and marketing configuration into localStorage automatically.
const PREWIRED_FLAG = 'crm_meta_accounts_prewired_v1';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(PREWIRED_FLAG) !== 'true') {
      localStorage.setItem(STORAGE_KEYS.MARKETING_CONFIG, JSON.stringify(DEFAULT_MARKETING_CONFIG));
      localStorage.setItem(STORAGE_KEYS.META_INTEGRATION, JSON.stringify(DEFAULT_META_CONFIG));
      localStorage.setItem(PREWIRED_FLAG, 'true');
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

export class MetaStorageService {
  static getLeads(): MetaLead[] {
    const raw = getFromStorage<MetaLead[]>(STORAGE_KEYS.LEADS, []);
    const normalized = raw.map(l => ({
      ...l,
      timeOfLead: l.timeOfLead || (l.createdAt ? new Date(l.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '10:00 AM'),
      isProcessed: l.isProcessed !== undefined 
        ? l.isProcessed 
        : ((l.callReports && l.callReports.length > 0) || (!!l.hrName && l.status !== 'Untouched')),
    }));

    return normalized;
  }

  static saveLeads(leads: MetaLead[]): void {
    saveToStorage(STORAGE_KEYS.LEADS, leads);
  }

  static getDropdownSettings(): DropdownSettings {
    const stored = getFromStorage<DropdownSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_DROPDOWN_SETTINGS);
    const existing = new Set(stored.modules || []);
    const mergedModules = [...(stored.modules || [])];
    for (const mod of DEFAULT_DROPDOWN_SETTINGS.modules) {
      if (!existing.has(mod)) {
        mergedModules.push(mod);
      }
    }
    return {
      ...stored,
      modules: mergedModules.length > 0 ? mergedModules : DEFAULT_DROPDOWN_SETTINGS.modules,
      hrNames: stored.hrNames?.length > 0 ? stored.hrNames : DEFAULT_DROPDOWN_SETTINGS.hrNames,
      statuses: stored.statuses?.length > 0 ? stored.statuses : DEFAULT_DROPDOWN_SETTINGS.statuses,
    };
  }

  static saveDropdownSettings(settings: DropdownSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  static getViewMode(): ViewMode {
    return getFromStorage<ViewMode>(STORAGE_KEYS.VIEW_MODE, 'table');
  }

  static saveViewMode(mode: ViewMode): void {
    saveToStorage(STORAGE_KEYS.VIEW_MODE, mode);
  }

  static getColumnVisibility(): ColumnVisibility {
    return getFromStorage<ColumnVisibility>(STORAGE_KEYS.COLUMNS, DEFAULT_COLUMN_VISIBILITY);
  }

  static saveColumnVisibility(columns: ColumnVisibility): void {
    saveToStorage(STORAGE_KEYS.COLUMNS, columns);
  }

  static getMetaIntegrationConfig(): MetaIntegrationConfig {
    return getFromStorage<MetaIntegrationConfig>(STORAGE_KEYS.META_INTEGRATION, DEFAULT_META_CONFIG);
  }

  static saveMetaIntegrationConfig(config: MetaIntegrationConfig): void {
    saveToStorage(STORAGE_KEYS.META_INTEGRATION, config);
  }

  static getMarketingConfig(): MetaMarketingApiConfig {
    return getFromStorage<MetaMarketingApiConfig>(STORAGE_KEYS.MARKETING_CONFIG, DEFAULT_MARKETING_CONFIG);
  }

  static saveMarketingConfig(config: MetaMarketingApiConfig): void {
    saveToStorage(STORAGE_KEYS.MARKETING_CONFIG, config);
  }

  static getCrmSettings(): CRMSettings {
    return getFromStorage<CRMSettings>(STORAGE_KEYS.CRM_SETTINGS, DEFAULT_CRM_SETTINGS);
  }

  static saveCrmSettings(settings: CRMSettings): void {
    saveToStorage(STORAGE_KEYS.CRM_SETTINGS, settings);
  }

  static getCampaignInsights(): MetaCampaignInsight[] {
    return getFromStorage<MetaCampaignInsight[]>(STORAGE_KEYS.CAMPAIGN_INSIGHTS, INITIAL_CAMPAIGN_INSIGHTS);
  }

  static saveCampaignInsights(insights: MetaCampaignInsight[]): void {
    saveToStorage(STORAGE_KEYS.CAMPAIGN_INSIGHTS, insights);
  }

  static getGoogleSheetConfig(): GoogleSheetConfig {
    return getFromStorage<GoogleSheetConfig>(STORAGE_KEYS.GOOGLE_SHEET, DEFAULT_GOOGLE_SHEET_CONFIG);
  }

  static saveGoogleSheetConfig(config: GoogleSheetConfig): void {
    saveToStorage(STORAGE_KEYS.GOOGLE_SHEET, config);
  }

  static getMultiSheetConfig(): MultiSheetConfig {
    return getFromStorage<MultiSheetConfig>(STORAGE_KEYS.MULTI_SHEET, DEFAULT_MULTI_SHEET_CONFIG);
  }

  static saveMultiSheetConfig(config: MultiSheetConfig): void {
    saveToStorage(STORAGE_KEYS.MULTI_SHEET, config);
  }

  static getUsers(): CRMUser[] {
    return getFromStorage<CRMUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  static saveUsers(users: CRMUser[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  static getActiveUser(): CRMUser {
    return getFromStorage<CRMUser>(STORAGE_KEYS.ACTIVE_USER, DEFAULT_USERS[0]);
  }

  static saveActiveUser(user: CRMUser): void {
    saveToStorage(STORAGE_KEYS.ACTIVE_USER, user);
  }

  static resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_DROPDOWN_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, JSON.stringify('table'));
    localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(DEFAULT_COLUMN_VISIBILITY));
    localStorage.setItem(STORAGE_KEYS.META_INTEGRATION, JSON.stringify(DEFAULT_META_CONFIG));
    localStorage.setItem(STORAGE_KEYS.MARKETING_CONFIG, JSON.stringify(DEFAULT_MARKETING_CONFIG));
    localStorage.setItem(STORAGE_KEYS.CRM_SETTINGS, JSON.stringify(DEFAULT_CRM_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.CAMPAIGN_INSIGHTS, JSON.stringify(INITIAL_CAMPAIGN_INSIGHTS));
    localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET, JSON.stringify(DEFAULT_GOOGLE_SHEET_CONFIG));
    localStorage.setItem(STORAGE_KEYS.MULTI_SHEET, JSON.stringify(DEFAULT_MULTI_SHEET_CONFIG));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(DEFAULT_USERS[0]));
  }

  static calculateStats(leads: MetaLead[]): MetaStats {
    const totalLeads = leads.length;
    const untouchedCount = leads.filter(l => !l.isProcessed).length;
    const processedCount = leads.filter(l => l.isProcessed).length;
    const registeredCount = leads.filter(l => l.isProcessed && l.status === 'Registration').length;
    const pitchedCount = leads.filter(l => l.isProcessed && l.status === 'Pitched').length;
    const callBackCount = leads.filter(l => l.isProcessed && l.status === 'Call Back').length;
    const interestedCount = leads.filter(l => l.isProcessed && l.status === 'Interested').length;
    const notInterestedCount = leads.filter(l => l.isProcessed && l.status === 'Not Interested').length;
    
    const conversionRate = processedCount > 0 
      ? Math.round((registeredCount / processedCount) * 100) 
      : 0;

    const totalCallsLogged = leads.reduce((sum, l) => sum + (l.callReports?.length || 0), 0);

    return {
      totalLeads,
      untouchedCount,
      processedCount,
      registeredCount,
      pitchedCount,
      callBackCount,
      interestedCount,
      notInterestedCount,
      conversionRate,
      totalCallsLogged,
    };
  }

  static exportAllData(): string {
    const exportData = {
      version: '3.0-meta-crm',
      exportedAt: new Date().toISOString(),
      leads: this.getLeads(),
      dropdownSettings: this.getDropdownSettings(),
      metaConfig: this.getMetaIntegrationConfig(),
      marketingConfig: this.getMarketingConfig(),
      crmSettings: this.getCrmSettings(),
      campaignInsights: this.getCampaignInsights(),
      googleSheetConfig: this.getGoogleSheetConfig(),
      multiSheetConfig: this.getMultiSheetConfig(),
      columnVisibility: this.getColumnVisibility(),
    };
    return JSON.stringify(exportData, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.leads)) this.saveLeads(parsed.leads);
      if (parsed.dropdownSettings) this.saveDropdownSettings(parsed.dropdownSettings);
      if (parsed.metaConfig) this.saveMetaIntegrationConfig(parsed.metaConfig);
      if (parsed.marketingConfig) this.saveMarketingConfig(parsed.marketingConfig);
      if (parsed.crmSettings) this.saveCrmSettings(parsed.crmSettings);
      if (Array.isArray(parsed.campaignInsights)) this.saveCampaignInsights(parsed.campaignInsights);
      if (parsed.googleSheetConfig) this.saveGoogleSheetConfig(parsed.googleSheetConfig);
      if (parsed.multiSheetConfig) this.saveMultiSheetConfig(parsed.multiSheetConfig);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  static exportLeadsToCSV(leads: MetaLead[]): string {
    const headers = [
      'ID',
      'Name',
      'Phone',
      'Email',
      'Module',
      'Date of Lead',
      'Time of Lead',
      'Campaign Name',
      'Adset Name',
      'Ad Name',
      'HR Name',
      'Lead Status',
      'Call Back Time',
      'Total Calls Logged',
      'Notes'
    ];

    const rows = leads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.module || '').replace(/"/g, '""')}"`,
      l.dateOfLead || '',
      `"${l.timeOfLead || ''}"`,
      `"${(l.campaignName || '').replace(/"/g, '""')}"`,
      `"${(l.adsetName || '').replace(/"/g, '""')}"`,
      `"${(l.adName || '').replace(/"/g, '""')}"`,
      `"${(l.hrName || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      l.callBackTime || '',
      l.callReports?.length || 0,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Parses official Meta Ads Manager Leads CSV / TSV Exports
   * Handles:
   * - UTF-16LE / UTF-8, null-byte cleaning
   * - Delimiters: Tab (\t), Comma (,), Semicolon (;)
   * - Meta phone format: removes 'p:' prefix, formats cleanly
   * - Automatic Module inference from course questions, campaign names, form names
   * - Captures custom form questions (which_sap_course, status, timeline, city, education)
   */
  static parseMetaAdsCSV(rawContent: string, defaultModule: string = 'SAP'): MetaLead[] {
    if (!rawContent) return [];
    
    // 1. Clean null bytes from UTF-16 LE copy-pastes
    const cleanContent = rawContent.replace(/\0/g, '');
    const lines = cleanContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // 2. Detect delimiter (tab vs comma vs semicolon)
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    
    let delimiter = ',';
    if (tabCount >= commaCount && tabCount >= semicolonCount && tabCount > 0) {
      delimiter = '\t';
    } else if (semicolonCount > commaCount && semicolonCount > 0) {
      delimiter = ';';
    }

    // 3. Row parser handling quotes and specified delimiter
    const parseRow = (text: string): string[] => {
      const p: string[] = [];
      let cur = '';
      let inQuote = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
          if (inQuote && text[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuote = !inQuote;
          }
        } else if (c === delimiter && !inQuote) {
          p.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      p.push(cur.trim());
      return p;
    };

    // 4. Clean and normalize headers
    const rawHeaders = parseRow(lines[0]);
    const normalizedHeaders = rawHeaders.map(h => h.toLowerCase().replace(/["'\s_-]+/g, ''));

    const findIdx = (keywords: string[]): number => {
      for (const k of keywords) {
        const idx = normalizedHeaders.findIndex(h => h.includes(k));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idIdx = findIdx(['id', 'leadid']);
    const nameIdx = findIdx(['fullname', 'name', 'first_name']);
    const phoneIdx = findIdx(['phonenumber', 'phone', 'mobile']);
    const emailIdx = findIdx(['email', 'emailaddress']);
    const campIdx = findIdx(['campaignname', 'campaign']);
    const adsetIdx = findIdx(['adsetname', 'adset']);
    const adIdx = findIdx(['adname', 'ad']);
    const dateIdx = findIdx(['createdtime', 'date', 'created_at']);
    const formIdx = findIdx(['formname', 'form']);
    const platformIdx = findIdx(['platform']);
    const cityIdx = findIdx(['city', 'location', 'town']);

    // Find custom question indexes
    const customQuestionIndices: { header: string; idx: number }[] = [];
    rawHeaders.forEach((h, idx) => {
      const norm = normalizedHeaders[idx];
      const isStandard = ['id', 'createdtime', 'adid', 'adname', 'adsetid', 'adsetname', 'campaignid', 'campaignname', 'formid', 'formname', 'isorganic', 'platform', 'fullname', 'email', 'phonenumber', 'inboxurl', 'leadstatus'].includes(norm);
      if (!isStandard && h.trim()) {
        customQuestionIndices.push({ header: h.replace(/^["']|["']$/g, '').trim(), idx });
      }
    });

    const importedLeads: MetaLead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseRow(lines[i]);
      if (cols.length === 0 || !cols.some(c => c)) continue;

      let rawName = nameIdx !== -1 ? cols[nameIdx] : cols[0] || 'Meta Prospect';
      let rawPhone = phoneIdx !== -1 ? cols[phoneIdx] : '';
      let rawEmail = emailIdx !== -1 ? cols[emailIdx] : '';
      const rawCamp = campIdx !== -1 ? cols[campIdx] : 'Meta Campaign';
      const rawAdset = adsetIdx !== -1 ? cols[adsetIdx] : '';
      const rawAd = adIdx !== -1 ? cols[adIdx] : '';
      
      let rawDate = new Date().toISOString().slice(0, 10);
      let rawTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      if (dateIdx !== -1 && cols[dateIdx]) {
        const rawDateVal = cols[dateIdx].replace(/^["']|["']$/g, '').trim();
        if (rawDateVal.includes('T')) {
          rawDate = rawDateVal.slice(0, 10);
          try {
            const parsedD = new Date(rawDateVal);
            if (!isNaN(parsedD.getTime())) {
              rawTime = parsedD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
          } catch {}
        } else if (rawDateVal.length >= 10) {
          rawDate = rawDateVal.slice(0, 10);
          if (rawDateVal.length > 11) {
            rawTime = rawDateVal.slice(11, 19).trim();
          }
        }
      }

      const rawCity = cityIdx !== -1 ? cols[cityIdx] : '';
      const rawForm = formIdx !== -1 ? cols[formIdx] : '';
      const rawPlatform = platformIdx !== -1 ? cols[platformIdx] : 'fb';

      // Clean quotes and prefixes
      rawName = rawName.replace(/^["']|["']$/g, '').trim();
      rawEmail = rawEmail.replace(/^["']|["']$/g, '').trim();
      
      // Clean Meta 'p:' phone prefix (e.g. p:+919600723986 -> +91 96007 23986)
      rawPhone = rawPhone.replace(/^["']|["']$/g, '').replace(/^p:\s*/i, '').trim();
      if (rawPhone.startsWith('+91') && rawPhone.length === 13) {
        rawPhone = `+91 ${rawPhone.slice(3, 8)} ${rawPhone.slice(8)}`;
      }

      if (!rawPhone && !rawEmail && !rawName) continue;

      // Extract custom question Q&A pairs
      const qaParts: string[] = [];
      let detectedCourse = '';

      customQuestionIndices.forEach(({ header, idx }) => {
        const val = cols[idx]?.replace(/^["']|["']$/g, '').trim();
        if (val) {
          if (header.toLowerCase().includes('course') || header.toLowerCase().includes('sap')) {
            detectedCourse = val.replace(/_/g, ' ').toUpperCase();
          }
          const shortHeader = header
            .replace(/^which_sap_course_are_you_interested_in\??/i, 'Course')
            .replace(/^which_option_best_describes_your_current_status\??/i, 'Status')
            .replace(/^when_are_you_planning_to_start_your_sap_training\??/i, 'Start')
            .replace(/^education_level/i, 'Education')
            .replace(/_/g, ' ');
          qaParts.push(`${shortHeader}: ${val.replace(/_/g, ' ')}`);
        }
      });

      // Module Auto-Detection from Campaign, Adset, Form, or Course question
      const contextText = `${rawCamp} ${rawAdset} ${rawAd} ${rawForm} ${detectedCourse} ${qaParts.join(' ')}`.toLowerCase();
      let module = defaultModule;
      if (contextText.includes('sap')) {
        module = 'SAP';
      } else if (contextText.includes('aws')) {
        module = 'AWS';
      } else if (contextText.includes('cloud')) {
        module = 'CLOUD COMPUTING SUITE';
      } else if (contextText.includes('data science')) {
        module = 'DATA SCIENCE';
      } else if (contextText.includes('data analytics') || contextText.includes('power bi') || contextText.includes('analytics')) {
        module = 'DATA ANALYTICS';
      } else if (contextText.includes('ai') || contextText.includes('llm') || contextText.includes('generative')) {
        module = 'AI';
      }

      const customQuestionsSummary = qaParts.join(' • ');
      const rawLeadId = idIdx !== -1 && cols[idIdx] ? cols[idIdx].replace(/^["']|["']$/g, '').replace(/^l:\s*/i, '') : '';

      importedLeads.push({
        id: rawLeadId ? `meta-${rawLeadId}` : `meta-import-${Date.now()}-${i}`,
        name: rawName || 'Meta Prospect',
        phone: rawPhone,
        email: rawEmail,
        module,
        dateOfLead: rawDate,
        timeOfLead: rawTime,
        campaignName: rawCamp.replace(/^["']|["']$/g, '').trim(),
        adsetName: rawAdset.replace(/^["']|["']$/g, '').trim(),
        adName: rawAd.replace(/^["']|["']$/g, '').trim(),
        hrName: '', // Counselor is unassigned initially
        status: 'Untouched', // Fresh untouched lead from Meta
        callBackTime: '',
        city: rawCity ? rawCity.replace(/^["']|["']$/g, '').trim() : undefined,
        formName: rawForm ? rawForm.replace(/^["']|["']$/g, '').trim() : undefined,
        platform: rawPlatform,
        customQuestions: customQuestionsSummary,
        notes: customQuestionsSummary ? `Meta Form Responses: ${customQuestionsSummary}` : 'Autofilled from Meta Ads Lead export.',
        createdAt: new Date().toISOString(),
        isProcessed: false,
        callReports: [],
      });
    }

    return importedLeads;
  }
}
