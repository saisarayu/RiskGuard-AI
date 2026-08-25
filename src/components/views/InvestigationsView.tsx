import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { InvestigationCase, InvestigationStatus } from '../../types';
import { RiskScorePill, RiskLevelBadge } from '../common/RiskBadge';
import confetti from 'canvas-confetti';
import {
  FolderSearch,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldX,
  UserCheck,
  Send,
  FileText,
  Sparkles,
  ExternalLink,
  Bot,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

export const InvestigationsView: React.FC = () => {
  const {
    investigations,
    updateInvestigationStatus,
    setSelectedTransaction,
    transactions,
    triggerCopilotWithPrompt,
    showToast,
  } = useRisk();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    investigations[0]?.id || 'CASE-8801'
  );
  const [noteInput, setNoteInput] = useState<string>('');

  const filteredCases = investigations.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const activeCase =
    investigations.find((c) => c.id === selectedCaseId) || filteredCases[0] || investigations[0];

  const caseTxn = transactions.find((t) => t.id === activeCase?.transactionId);

  const handleStatusChange = (newStatus: InvestigationStatus) => {
    if (!activeCase) return;
    updateInvestigationStatus(
      activeCase.id,
      newStatus,
      `Status updated to ${newStatus.replace('_', ' ')} by Risk Analyst.`
    );

    if (newStatus === 'RESOLVED' || newStatus === 'CONFIRMED_FRAUD') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim() || !activeCase) return;
    updateInvestigationStatus(activeCase.id, activeCase.status, noteInput.trim());
    setNoteInput('');
  };

  const getStatusBadge = (status: InvestigationStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'INVESTIGATING':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'CONFIRMED_FRAUD':
        return 'bg-red-500/30 text-red-200 border-red-500/50';
      case 'FALSE_POSITIVE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  // Metrics summary
  const totalExposure = investigations.reduce((acc, c) => acc + c.amount, 0);
  const openCount = investigations.filter((c) => c.status === 'OPEN').length;
  const investigatingCount = investigations.filter((c) => c.status === 'INVESTIGATING').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Metrics Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Risk Analyst Investigation Center
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {investigations.length} cases
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Triage suspected high-risk payment incidents, collaborate on evidence, and close dispositions
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Pending Triage: <span className="text-rose-400 font-bold">{openCount + investigatingCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Total Exposure: <span className="text-amber-300 font-bold">₹{(totalExposure / 100000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-medium mr-1.5 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Case Status:
        </span>
        {[
          { key: 'ALL', label: 'All Cases' },
          { key: 'OPEN', label: 'Open' },
          { key: 'INVESTIGATING', label: 'Investigating' },
          { key: 'CONFIRMED_FRAUD', label: 'Confirmed Fraud' },
          { key: 'FALSE_POSITIVE', label: 'False Positive' },
          { key: 'RESOLVED', label: 'Resolved' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              statusFilter === s.key
                ? 'bg-indigo-600 text-white shadow-md font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Cases List (4 cols) & Case Workspace (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Case Queue (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No investigation cases found for selected status.
            </div>
          ) : (
            filteredCases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/50 to-slate-900 border-indigo-500/60 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white">{c.id}</span>
                      <span className="text-[10px] font-mono text-slate-400">• {c.transactionId}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase border ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {c.summary}
                  </p>

                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-200">₹{c.amount.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400">{c.assignee}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case Workspace (8 cols) */}
        {activeCase ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Top Case Action Bar */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-lg font-bold font-mono text-white">{activeCase.id}</h3>
                    <span
                      className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full uppercase border ${getStatusBadge(
                        activeCase.status
                      )}`}
                    >
                      {activeCase.status.replace('_', ' ')}
                    </span>
                    <RiskLevelBadge level={activeCase.riskLevel} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Linked Transaction: <strong className="text-cyan-400 font-mono">{activeCase.transactionId}</strong> • Assignee: {activeCase.assignee}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {caseTxn && (
                    <button
                      onClick={() => setSelectedTransaction(caseTxn)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect TXN</span>
                    </button>
                  )}
                  <button
                    onClick={() =>
                      triggerCopilotWithPrompt(
                        `Summarize investigation case ${activeCase.id} for transaction ${activeCase.transactionId} with exposure ₹${activeCase.amount}.`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                    <span>Copilot Summary</span>
                  </button>
                </div>
              </div>

              {/* Disposition Action Buttons */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2 font-mono">
                  Update Case Disposition / Status:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <button
                    onClick={() => handleStatusChange('OPEN')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      activeCase.status === 'OPEN'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleStatusChange('INVESTIGATING')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      activeCase.status === 'INVESTIGATING'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Investigating
                  </button>
                  <button
                    onClick={() => handleStatusChange('CONFIRMED_FRAUD')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      activeCase.status === 'CONFIRMED_FRAUD'
                        ? 'bg-red-600 text-white border-red-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Confirmed Fraud
                  </button>
                  <button
                    onClick={() => handleStatusChange('FALSE_POSITIVE')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      activeCase.status === 'FALSE_POSITIVE'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    False Positive
                  </button>
                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      activeCase.status === 'RESOLVED'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Case Summary & AI Context */}
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase font-mono">Incident Summary</span>
                  <p className="text-slate-200 leading-relaxed">{activeCase.summary}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-1.5">
                  <span className="text-indigo-400 font-bold uppercase font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Root Cause Analysis
                  </span>
                  <p className="text-slate-300 leading-relaxed italic">"{activeCase.aiExplanation}"</p>
                </div>
              </div>
            </div>

            {/* Analyst Case Notes & Audit Feed */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Analyst Notes & Activity Trail ({activeCase.notes.length})
              </h4>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {activeCase.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{note.author}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Add case observation, verification notes, or external ticket reference..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Note</span>
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
