import React from 'react';
import { useRisk } from '../../context/RiskContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Store,
  Fingerprint,
  FolderSearch,
  Cpu,
  Settings2,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, transactions, investigations, fraudPatterns } = useRisk();

  const highRiskCount = transactions.filter((t) => t.riskScore >= 61).length;
  const openCasesCount = investigations.filter(
    (i) => i.status === 'OPEN' || i.status === 'INVESTIGATING'
  ).length;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      badge: highRiskCount > 0 ? `${highRiskCount} High Risk` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'risk-analysis',
      label: 'Risk Analysis',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'merchants',
      label: 'Merchants',
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: 'fraud-patterns',
      label: 'Fraud Patterns',
      icon: <Fingerprint className="w-4 h-4" />,
      badge: `${fraudPatterns.length} Active`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'investigations',
      label: 'Investigations',
      icon: <FolderSearch className="w-4 h-4" />,
      badge: openCasesCount > 0 ? `${openCasesCount} Open` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'simulator',
      label: 'Simulate Transaction',
      icon: <Cpu className="w-4 h-4" />,
      highlight: true,
    },
    {
      id: 'settings',
      label: 'Settings & Rules',
      icon: <Settings2 className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#090d18] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Platform Menu
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : item.highlight
                  ? 'bg-slate-900/60 hover:bg-slate-800/80 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fintech Trust & Disclaimer Banner */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-2">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Risk Decision Guard</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            AI risk scores estimate transaction anomaly probabilities. Human analyst overrides take ultimate precedence.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
            <span>Engine v1.4 (Sandbox)</span>
            <span className="text-emerald-400 font-medium">99.98% Uptime</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
