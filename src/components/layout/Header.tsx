import React from 'react';
import { useRisk } from '../../context/RiskContext';
import {
  ShieldAlert,
  Search,
  Bot,
  PlayCircle,
  Activity,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setActiveTab,
    setIsCopilotOpen,
    resetAllData,
    kpis,
    triggerCopilotWithPrompt,
  } = useRisk();

  return (
    <header className="sticky top-0 z-30 bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Section */}
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-700 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              RiskGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">AI</span>
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> FASTAPI • SCIKIT-LEARN ML
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            AI-Powered Payment Risk Management & Fraud Detection
          </p>
        </div>
      </div>

      {/* Center Search & Real-time Indicator */}
      <div className="flex-1 max-w-md hidden lg:flex items-center space-x-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search TXN-ID, customer, merchant, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[10px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-medium whitespace-nowrap">
            Live Stream
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => setActiveTab('simulator')}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 flex items-center space-x-1.5 transition-all transform active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Simulate Transaction</span>
        </button>

        <button
          onClick={() => setIsCopilotOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-violet-500/40 text-violet-300 hover:text-violet-200 text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-all"
        >
          <Bot className="w-4 h-4 text-violet-400" />
          <span>RiskGuard Copilot</span>
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
        </button>

        <button
          onClick={resetAllData}
          title="Reset synthetic data to defaults"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
