export interface CallReport {
  id: string;
  leadId: string;
  hrName: string;
  statusAtCall: string;
  callBackTime?: string;
  remarks: string;
  createdAt: string;
}

export interface MetaLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  module: string; // e.g. SAP, AWS, CLOUD COMPUTING SUITE, DATA SCIENCE, DATA ANALYTICS, AI
  dateOfLead: string;
  timeOfLead?: string; // Exact time lead was collected / submitted (e.g. '10:30 AM', '14:35')
  campaignName: string;
  adsetName: string;
  adName: string;
  hrName: string; // Empty or unassigned when untouched
  status: string; // 'Untouched' initially, then Pitched, Registration, Not Interested, Call Back, Interested
  callBackTime?: string; // If Status is call back
  callReports: CallReport[];
  notes?: string;
  city?: string;
  formName?: string;
  platform?: string;
  customQuestions?: string;
  isProcessed?: boolean; // false when fresh untouched, true once counselor and status are chosen
  createdAt: string;
  updatedAt?: string;
}

export interface StatusConfig {
  key: string;
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
}

export interface DropdownSettings {
  modules: string[];
  hrNames: string[];
  statuses: StatusConfig[];
}

export interface MetaStats {
  totalLeads: number;
  untouchedCount: number;
  processedCount: number;
  registeredCount: number;
  pitchedCount: number;
  callBackCount: number;
  interestedCount: number;
  notInterestedCount: number;
  conversionRate: number;
  totalCallsLogged: number;
}

export type ViewMode = 'table' | 'kanban' | 'cards';

export interface ColumnVisibility {
  showEmail: boolean;
  showDate: boolean;
  showModule: boolean;
  showCampaign: boolean;
  showAdset: boolean;
  showAdName: boolean;
  showHr: boolean;
  showStatus: boolean;
  showCallBack: boolean;
  showCallsCount: boolean;
}

export interface MetaIntegrationConfig {
  pageId: string;
  appId: string;
  appSecret: string;
  accessToken: string;
  verifyToken: string;
  webhookEndpoint: string;
  isConnected: boolean;
  lastSyncAt?: string;
}

export interface MetaCampaignInsight {
  campaignId: string;
  campaignName: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  dailyBudget: number;
  lifetimeBudget?: number;
  amountSpent: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number; // Click-Through Rate %
  cpm: number; // Cost per 1,000 impressions
  leadsCount: number;
  cpl: number; // Cost Per Lead = amountSpent / leadsCount
  frequency: number;
  currency: string;
  dateRange: string;
  moduleHint?: string;
  adsetsCount?: number;
  adsCount?: number;
  adAccountId?: string;
  adAccountName?: string;
}

export interface MetaAdAccountConfig {
  id: string; // e.g. 'acc_1'
  adAccountId: string; // e.g. 'act_120248848255150533'
  accountName: string; // e.g. 'Primary Growth Account'
  currency: string; // 'INR', 'USD'
  isEnabled: boolean;
  dailyBudget?: number;
  accessToken?: string;
}

export interface AdAccountSummary {
  adAccountId: string;
  accountName: string;
  currency: string;
  totalSpend: number;
  totalBudget: number;
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalLeads: number;
  cpl: number;
  cpm: number;
  ctr: number;
  campaignsCount: number;
  activeCampaignsCount: number;
}

export interface MetaMarketingApiConfig {
  adAccountId: string;
  accessToken: string;
  appId: string;
  appSecret: string;
  pageId: string;
  currency: string; // 'INR', 'USD', etc.
  autoSyncInterval: string;
  isConnected: boolean;
  lastSyncAt?: string;
  tokenPermissions?: string[];
  accountName?: string;
  adAccounts?: MetaAdAccountConfig[];
  selectedAccountId?: string; // 'ALL' or specific adAccountId
}

export interface CRMSettings {
  currency: string;
  defaultCountryCode: string;
  whatsappTemplate: string;
  autoAssignCounselor: boolean;
}

export type TimeFilterPreset = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

export interface GoogleSheetSource {
  id: string;
  name: string; // e.g. "SAP Lead Form - Account 1"
  sheetUrl: string;
  sheetId?: string;
  gid?: string;
  sheetName?: string;
  adAccountName?: string; // e.g. "Primary Growth Account"
  targetModule?: string; // e.g. "SAP", "AWS", "DATA SCIENCE", "AI"
  enabled: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage?: string;
  totalSyncedCount?: number;
  lastFetchedRows?: number;
}

export interface MultiSheetConfig {
  sources: GoogleSheetSource[];
  autoSync: boolean;
  syncInterval: number; // in minutes
  lastSyncAllAt?: string;
}

export interface GoogleSheetConfig {
  sheetUrl: string;
  sheetId?: string;
  gid?: string;
  sheetName?: string;
  autoSync: boolean;
  syncInterval: number; // in minutes, e.g. 1, 2, 5, 15
  isConnected: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage?: string;
  totalSyncedCount?: number;
  newLeadsFound?: number;
  lastFetchedRows?: number;
}

export type NavigationTab = 
  | 'untouched'
  | 'leads'
  | 'campaigns'
  | 'calls'
  | 'callbacks'
  | 'dashboard'
  | 'google_sheets'
  | 'integration'
  | 'settings';

export type UserRole = 'admin' | 'sales_manager' | 'telecaller';

export interface CRMUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export const canDeleteLeads = (role: UserRole): boolean => role === 'admin' || role === 'sales_manager';
export const canAssignLeads = (role: UserRole): boolean => role === 'admin' || role === 'sales_manager';
export const canManageUsers = (role: UserRole): boolean => role === 'admin';
export const canAccessSettings = (role: UserRole): boolean => role === 'admin';
export const isTelecallerOnly = (role: UserRole): boolean => role === 'telecaller';

