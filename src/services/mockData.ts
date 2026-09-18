import { MetaLead, DropdownSettings, StatusConfig, CRMUser } from '../types/crm';

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

export const DEFAULT_USERS: CRMUser[] = [
  {
    id: 'user_admin',
    name: 'Admin User',
    phone: '9999999999',
    email: 'admin@immek.com',
    password: 'admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_manager',
    name: 'Sales Manager',
    phone: '8888888888',
    email: 'manager@immek.com',
    password: 'manager',
    role: 'sales_manager',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_tc1',
    name: 'Priya Sharma',
    phone: '7777777771',
    email: 'priya@immek.com',
    password: '1234',
    role: 'telecaller',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_tc2',
    name: 'Rahul Verma',
    phone: '7777777772',
    email: 'rahul@immek.com',
    password: '1234',
    role: 'telecaller',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_tc3',
    name: 'Ananya Iyer',
    phone: '7777777773',
    email: 'ananya@immek.com',
    password: '1234',
    role: 'telecaller',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_tc4',
    name: 'Vikram Malhotra',
    phone: '7777777774',
    email: 'vikram@immek.com',
    password: '1234',
    role: 'telecaller',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_tc5',
    name: 'Sneha Patel',
    phone: '7777777775',
    email: 'sneha@immek.com',
    password: '1234',
    role: 'telecaller',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

