import React from 'react';
import { useCRM, NavigationTab } from '../../context/CRMContext';
import { 
  LayoutDashboard,
  Sparkles,
  Megaphone, 
  Clock, 
  PhoneCall, 
  Award, 
  Sliders, 
  Zap, 
  Flame,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  dotColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stats, metaConfig, googleSheetConfig, exportCSV, exportDatabase } = useCRM();

  const navItems: NavItem[] = [
    {
      id: 'untouched',
      label: 'Untouched Leads',
      icon: Flame,
      badge: stats.untouchedCount > 0 ? stats.untouchedCount : undefined,
      badgeColor: 'bg-amber-500 text-white font-extrabold',
    },
    {
      id: 'leads',
      label: 'All Meta Leads',
      icon: Megaphone,
      badge: stats.processedCount,
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold',
    },
    {
      id: 'campaigns',
      label: 'Meta Campaigns & Spend',
      icon: BarChart3,
    },
    {
      id: 'calls',
      label: 'Calls & Reports',
      icon: PhoneCall,
      badge: stats.totalCallsLogged > 0 ? stats.totalCallsLogged : undefined,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold',
    },
    {
      id: 'callbacks',
      label: 'Call Backs Queue',
      icon: Clock,
      badge: stats.callBackCount > 0 ? stats.callBackCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 font-bold',
    },
    {
      id: 'dashboard',
      label: 'Analytics Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'google_sheets',
      label: 'Google Sheets Live',
      icon: FileSpreadsheet,
      dotColor: googleSheetConfig.isConnected ? 'bg-emerald-500' : 'bg-slate-400',
    },
    {
      id: 'integration',
      label: 'Meta Instant Form Sync',
      icon: Zap,
      dotColor: metaConfig.isConnected ? 'bg-emerald-500' : 'bg-slate-400',
    },
    {
      id: 'settings',
      label: 'CRM Settings Hub',
      icon: Sliders,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between hidden md:flex transition-colors">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Telecalling Hub
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950/50 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.dotColor && (
                      <span className={`h-2 w-2 rounded-full ${item.dotColor}`} title="Connected" />
                    )}
                    {item.badge !== undefined && (
                      <span className={`rounded-full px-2 py-0.5 text-xs ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Telecalling Snapshot Card */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4 dark:border-blue-950/60 dark:from-blue-950/30 dark:to-slate-900">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <span className="flex items-center space-x-1">
              <Award className="h-3.5 w-3.5 mr-1" />
              Registration Rate
            </span>
            <span className="text-emerald-600 font-extrabold">{stats.conversionRate}%</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {stats.registeredCount} Enrolled
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Out of {stats.totalLeads} Meta Leads
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-blue-200/50 dark:border-blue-900/40">
            <span className="text-slate-500">Fresh Untouched:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{stats.untouchedCount}</span>
          </div>
        </div>
      </div>

      {/* Footer export actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={exportCSV}
          className="flex w-full items-center justify-center space-x-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
        >
          <span>Export All Leads (CSV)</span>
        </button>
        <button
          onClick={exportDatabase}
          className="flex w-full items-center justify-center space-x-1.5 rounded-lg border border-dashed border-slate-200 px-3 py-1.5 text-[11px] text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 transition"
        >
          <span>Backup JSON Database</span>
        </button>
      </div>
    </aside>
  );
};
