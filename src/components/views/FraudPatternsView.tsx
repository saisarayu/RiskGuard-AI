import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { RiskScorePill, DecisionBadge } from '../common/RiskBadge';
import {
  Fingerprint,
  Zap,
  Smartphone,
  MapPin,
  ShieldX,
  AlertTriangle,
  ExternalLink,
  Bot,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const FraudPatternsView: React.FC = () => {
  const {
    fraudPatterns,
    transactions,
    setSelectedTransaction,
    triggerCopilotWithPrompt,
    showToast,
  } = useRisk();

  const [selectedPatternId, setSelectedPatternId] = useState<string>('PAT-VELOCITY-01');

  const activePattern =
    fraudPatterns.find((p) => p.id === selectedPatternId) || fraudPatterns[0];

  const affectedTransactions = transactions.filter((t) =>
    t.patternTags?.some((tag) => activePattern?.name.includes(tag) || tag.includes(activePattern?.name))
  );

  const getPatternIcon = (code: string) => {
    switch (code) {
      case 'VELOCITY_BURST':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'NEW_DEVICE_HIGH_TICKET':
        return <Smartphone className="w-5 h-5 text-rose-400" />;
      case 'LOCATION_ANOMALY':
        return <MapPin className="w-5 h-5 text-indigo-400" />;
      case 'REPEATED_FAILED_ATTEMPTS':
        return <ShieldX className="w-5 h-5 text-orange-400" />;
      default:
        return <Fingerprint className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            AI Fraud Pattern & Cluster Detection
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {fraudPatterns.length} Active Signatures
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthetic multi-entity behavioral clusters detected across payment streams
          </p>
        </div>

        <button
          onClick={() =>
            triggerCopilotWithPrompt(
              `Summarize active fraud patterns: High Velocity, New Device High Ticket, Location Anomaly, and Repeated Failed Attempts.`
            )
          }
          className="px-3.5 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-violet-400" />
          <span>Ask Copilot to Analyze Patterns</span>
        </button>
      </div>

      {/* Pattern Cards Top Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fraudPatterns.map((pat) => {
          const isSelected = activePattern?.id === pat.id;
          return (
            <div
              key={pat.id}
              onClick={() => setSelectedPatternId(pat.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  {getPatternIcon(pat.code)}
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    pat.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {pat.severity}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white leading-snug">{pat.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {pat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{pat.affectedTxnCount} txns</span>
                <span className="text-amber-300 font-bold">
                  ₹{(pat.totalExposure / 100000).toFixed(1)}L Exp
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive Section for Selected Pattern */}
      {activePattern && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {getPatternIcon(activePattern.code)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{activePattern.name}</h3>
                  <span className="text-xs font-mono text-slate-400 font-medium">
                    {activePattern.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cluster Severity:{' '}
                  <strong className="text-rose-400">{activePattern.severity}</strong> • Total Exposure:{' '}
                  <strong className="text-amber-300">
                    ₹{(activePattern.totalExposure / 100000).toFixed(1)}L
                  </strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(
                  'Mitigation Rule Deployed',
                  `Automated rate-limiting and step-up challenge enforced for signature ${activePattern.id}.`,
                  'success'
                );
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              Deploy Automated Mitigation Rule
            </button>
          </div>

          {/* Synthetic Pattern Analysis Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase font-mono font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Detected Attack Vector & Synthetic Signature
              </span>
              <blockquote className="text-slate-200 text-xs leading-relaxed italic bg-slate-950/80 p-3 rounded-lg border-l-2 border-cyan-500">
                "{activePattern.exampleScenario}"
              </blockquote>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase font-mono font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Recommended Risk Engineering Action
              </span>
              <p className="text-slate-200 text-xs leading-relaxed bg-slate-950/80 p-3 rounded-lg border-l-2 border-amber-500">
                {activePattern.recommendation}
              </p>
            </div>
          </div>

          {/* Sample Flagged Transactions under this Pattern */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Sample Correlated Transactions in Cluster ({affectedTransactions.length || 3})
            </h4>

            <div className="space-y-2">
              {(affectedTransactions.length > 0
                ? affectedTransactions.slice(0, 5)
                : transactions.filter((t) => t.riskScore >= 70).slice(0, 4)
              ).map((txn) => (
                <div
                  key={txn.id}
                  onClick={() => setSelectedTransaction(txn)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <RiskScorePill score={txn.riskScore} size="sm" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white">{txn.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-200">{txn.customerName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{txn.merchantName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {txn.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="font-bold text-white">
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </span>
                    <DecisionBadge decision={txn.finalDecision} size="sm" />
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
