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
  BarChart3 
} from 'lucide-react';

const CRMMainContent: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useCRM();

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
          {activeTab === 'integration' && <MetaIntegrationView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

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
