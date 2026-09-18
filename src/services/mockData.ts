import { MetaLead, DropdownSettings, StatusConfig } from '../types/crm';

export const DEFAULT_STATUSES: StatusConfig[] = [
  { key: 'Interested', label: 'Interested', color: '#8b5cf6', bgLight: 'bg-purple-50 dark:bg-purple-950/40', borderLight: 'border-purple-200 dark:border-purple-800' },
  { key: 'Pitched', label: 'Pitched', color: '#3b82f6', bgLight: 'bg-blue-50 dark:bg-blue-950/40', borderLight: 'border-blue-200 dark:border-blue-800' },
  { key: 'Call Back', label: 'Call Back', color: '#f59e0b', bgLight: 'bg-amber-50 dark:bg-amber-950/40', borderLight: 'border-amber-200 dark:border-amber-800' },
  { key: 'Registration', label: 'Registration', color: '#10b981', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40', borderLight: 'border-emerald-200 dark:border-emerald-800' },
  { key: 'Not Interested', label: 'Not Interested', color: '#ef4444', bgLight: 'bg-rose-50 dark:bg-rose-950/40', borderLight: 'border-rose-200 dark:border-rose-800' },
];

export const DEFAULT_MODULES: string[] = [
  'SAP',
  'SAP FICO',
  'SAP MM',
  'SAP ABAP',
  'SAP SD',
  'AWS & CLOUD COMPUTING',
  'DATA SCIENCE',
  'DATA ANALYTICS & BI',
  'ARTIFICIAL INTELLIGENCE (AI)',
  'FULL STACK DEVELOPMENT',
  'DIGITAL MARKETING',
  'CYBER SECURITY',
];

export const DEFAULT_HR_NAMES: string[] = [
  'Priya Sharma',
  'Rahul Verma',
  'Ananya Iyer',
  'Vikram Malhotra',
  'Sneha Patel',
];

export const DEFAULT_DROPDOWN_SETTINGS: DropdownSettings = {
  modules: DEFAULT_MODULES,
  hrNames: DEFAULT_HR_NAMES,
  statuses: DEFAULT_STATUSES,
};

// Original Clean State: Zero mock leads. Real leads populate upon connecting Meta or Google Sheets.
export const INITIAL_LEADS: MetaLead[] = [];
