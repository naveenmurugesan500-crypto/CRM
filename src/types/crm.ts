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

export type TimeFilterPreset = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

export type NavigationTab = 
  | 'untouched'
  | 'leads'
  | 'calls'
  | 'callbacks'
  | 'dashboard'
  | 'integration'
  | 'settings';
