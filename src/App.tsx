import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { UntouchedLeadsView } from './components/leads/UntouchedLeadsView';
import { LeadTable } from './components/leads/LeadTable';
import { CallsView } from './components/calls/CallsView';
import { CallBackQueue } from './components/callbacks/CallBackQueue';
import { MetaIntegrationView } from './components/integration/MetaIntegrationView';
import { GoogleSheetsSyncView } from './components/integration/GoogleSheetsSyncView';
import { MetaCampaignsView } from './components/campaigns/MetaCampaignsView';
import { SettingsView } from './components/settings/SettingsView';
import { CallReportModal } from './components/leads/CallReportModal';
import { LeadModal } from './components/leads/LeadModal';
import { 
  LayoutDashboard,
  Flame,
  Megaphone, 
  PhoneCall, 
  Clock, 
  Sliders, 
  Zap,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

const CRMMainContent: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useCRM();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Scrollable Center Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'untouched' && <UntouchedLeadsView />}
          {activeTab === 'leads' && <LeadTable />}
          {activeTab === 'campaigns' && <MetaCampaignsView />}
          {activeTab === 'calls' && <CallsView />}
          {activeTab === 'callbacks' && <CallBackQueue />}
          {activeTab === 'google_sheets' && <GoogleSheetsSyncView />}
          {activeTab === 'integration' && <MetaIntegrationView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Drawer for Secondary Modules */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="rounded-t-2xl border-t border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                All CRM Modules
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => { setActiveTab('campaigns'); setIsMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 rounded-xl p-3 border transition ${
                  activeTab === 'campaigns' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-bold' 
                    : 'border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <span>Meta Campaigns</span>
              </button>

              <button
                onClick={() => { setActiveTab('google_sheets'); setIsMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 rounded-xl p-3 border transition ${
                  activeTab === 'google_sheets' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold' 
                    : 'border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Google Sheets</span>
              </button>

              <button
                onClick={() => { setActiveTab('integration'); setIsMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 rounded-xl p-3 border transition ${
                  activeTab === 'integration' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-bold' 
                    : 'border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Meta Form Sync</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 rounded-xl p-3 border transition ${
                  activeTab === 'settings' 
                    ? 'border-slate-500 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-bold' 
                    : 'border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                <Sliders className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                <span>Settings Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="flex md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 justify-around py-2 z-20">
        <button
          onClick={() => setActiveTab('untouched')}
          className={`flex flex-col items-center text-[10px] relative ${activeTab === 'untouched' ? 'text-amber-600 font-bold dark:text-amber-400' : 'text-slate-500'}`}
        >
          <Flame className="h-5 w-5 mb-0.5" />
          Untouched
          {stats.untouchedCount > 0 && (
            <span className="absolute top-0 right-1 rounded-full bg-amber-500 text-white text-[9px] px-1 font-bold">
              {stats.untouchedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex flex-col items-center text-[10px] ${activeTab === 'leads' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <Megaphone className="h-5 w-5 mb-0.5" />
          All Leads
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center text-[10px] ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`flex flex-col items-center text-[10px] ${activeTab === 'calls' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <PhoneCall className="h-5 w-5 mb-0.5" />
          Calls
        </button>
        <button
          onClick={() => setActiveTab('callbacks')}
          className={`flex flex-col items-center text-[10px] ${activeTab === 'callbacks' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <Clock className="h-5 w-5 mb-0.5" />
          Callbacks
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center text-[10px] ${['campaigns', 'google_sheets', 'integration', 'settings'].includes(activeTab) ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <Sliders className="h-5 w-5 mb-0.5" />
          More
        </button>
      </nav>

      {/* Global Telecalling Modals */}
      <CallReportModal />
      <LeadModal />
    </div>
  );
};

export function App() {
  return (
    <CRMProvider>
      <CRMMainContent />
    </CRMProvider>
  );
}

export default App;
