import React from 'react';
import { RiskProvider, useRisk } from './context/RiskContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';
import { OverviewView } from './components/views/OverviewView';
import { TransactionsView } from './components/views/TransactionsView';
import { RiskAnalysisView } from './components/views/RiskAnalysisView';
import { CustomersView } from './components/views/CustomersView';
import { MerchantsView } from './components/views/MerchantsView';
import { FraudPatternsView } from './components/views/FraudPatternsView';
import { InvestigationsView } from './components/views/InvestigationsView';
import { SimulatorView } from './components/views/SimulatorView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionDetailsModal } from './components/views/TransactionDetailsModal';
import { CopilotDrawer } from './components/copilot/CopilotDrawer';

const MainLayout: React.FC = () => {
  const { activeTab } = useRisk();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'transactions':
        return <TransactionsView />;
      case 'risk-analysis':
        return <RiskAnalysisView />;
      case 'customers':
        return <CustomersView />;
      case 'merchants':
        return <MerchantsView />;
      case 'fraud-patterns':
        return <FraudPatternsView />;
      case 'investigations':
        return <InvestigationsView />;
      case 'simulator':
        return <SimulatorView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Fixed Header */}
      <Header />

      {/* Main Container: Sidebar + Content View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Overlays & Drawers */}
      <TransactionDetailsModal />
      <CopilotDrawer />
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <RiskProvider>
      <MainLayout />
    </RiskProvider>
  );
}

export default App;
