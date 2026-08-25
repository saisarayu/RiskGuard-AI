import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { DecisionType } from '../../types';
import { RiskScorePill, DecisionBadge, RiskLevelBadge } from '../common/RiskBadge';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  Store,
  CreditCard,
  MapPin,
  Smartphone,
  Cpu,
  History,
  Bot,
  Sparkles,
  FileText,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const TransactionDetailsModal: React.FC = () => {
  const {
    selectedTransaction,
    setSelectedTransaction,
    overrideTransactionDecision,
    triggerCopilotWithPrompt,
    addInvestigationCase,
    showToast,
    customers,
  } = useRisk();

  const [isOverriding, setIsOverriding] = useState<boolean>(false);
  const [selectedDecision, setSelectedDecision] = useState<DecisionType>('APPROVE');
  const [analystName, setAnalystName] = useState<string>('Sanjay Deshmukh (Risk Specialist)');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  if (!selectedTransaction) return null;

  const txn = selectedTransaction;
  const customer = customers.find((c) => c.id === txn.customerId);

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      showToast('Reason Required', 'Please provide a valid justification for overriding the AI risk recommendation.', 'warning');
      return;
    }

    overrideTransactionDecision(
      txn.id,
      selectedDecision,
      analystName,
      overrideReason,
      overrideNotes
    );
    setIsOverriding(false);
  };

  const handleOpenInvestigation = () => {
    const caseId = addInvestigationCase(
      txn,
      `Manual investigation initiated by analyst for ${txn.id} (Score: ${txn.riskScore}/100).`
    );
    showToast('Investigation Created', `Case ${caseId} created and queued for triage.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0c111e] border border-slate-700/80 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-xl font-bold font-mono text-white">{txn.id}</h3>
                <RiskLevelBadge level={txn.riskLevel} />
                {txn.isOverridden && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                    MANUALLY OVERRIDDEN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Processed at {new Date(txn.timestamp).toLocaleString()} • IP: {txn.ipAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => triggerCopilotWithPrompt(`Why was ${txn.id} flagged and what are the major risk factors?`)}
              className="px-3 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              <span>Ask Copilot</span>
            </button>
            <button
              onClick={() => setSelectedTransaction(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Top Row: AI Risk Score Summary Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <RiskScorePill score={txn.riskScore} size="xl" />
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  AI Dynamic Risk Score
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  Calculated Risk Level:{' '}
                  <span
                    className={
                      txn.riskScore >= 81
                        ? 'text-rose-400'
                        : txn.riskScore >= 61
                        ? 'text-orange-400'
                        : txn.riskScore >= 31
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {txn.riskLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-cyan-400" />
                  <span>Configured Prototype Model (Rule-Weighted Feature Engine)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-1.5">
              <div className="text-xs text-slate-400 uppercase font-mono">System Recommendation</div>
              <DecisionBadge decision={txn.aiDecision} size="lg" />
              {txn.isOverridden && (
                <div className="text-xs text-cyan-400 font-mono">
                  Final Decision: <span className="font-bold underline">{txn.finalDecision}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Transaction Signals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Payment Amount
              </span>
              <div className="text-base font-bold font-mono text-white mt-1">
                ₹{txn.amount.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{txn.paymentMethod}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Customer Account
              </span>
              <div className="text-sm font-semibold text-white mt-1 truncate">{txn.customerName}</div>
              <span className="text-[11px] text-slate-400 font-mono">{txn.customerId}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Store className="w-3.5 h-3.5 text-cyan-400" /> Merchant
              </span>
              <div className="text-sm font-semibold text-white mt-1 truncate">{txn.merchantName}</div>
              <span className="text-[11px] text-slate-400 truncate">{txn.merchantCategory}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Geolocation
              </span>
              <div className="text-sm font-semibold text-white mt-1">{txn.location}</div>
              <span className="text-[11px] text-slate-400">{txn.deviceType} ({txn.isNewDevice ? 'New' : 'Known'})</span>
            </div>
          </div>

          {/* Section: Explainable AI - Why was this transaction flagged? */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-3.5 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center space-x-2 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold tracking-wide">
                Why was this transaction flagged? (Explainable AI)
              </h4>
            </div>
            <blockquote className="p-4 rounded-xl bg-slate-950/80 border-l-4 border-cyan-500 text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
              "{txn.explanation}"
            </blockquote>
          </div>

          {/* Section: Customer Normal Behavior vs Current Transaction Comparison */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Customer Behavioral Baseline vs. Current Transaction Signals
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Normal Behavior */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono">
                    Customer Historical Baseline
                  </span>
                  <span className="text-[10px] text-slate-400">Profile #{txn.customerId}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Average Transaction:</span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{(customer?.averageAmount || 2500).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Typical Range:</span>
                    <span className="font-mono text-slate-300">
                      ₹{(customer?.typicalAmountRange?.[0] || 500).toLocaleString('en-IN')} – ₹
                      {(customer?.typicalAmountRange?.[1] || 5000).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Usual Location:</span>
                    <span className="text-slate-300 font-medium">
                      {customer?.usualLocations?.join(', ') || txn.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Usual Device(s):</span>
                    <span className="text-slate-300">
                      {customer?.knownDevices?.join(', ') || 'Android Phone'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Typical Txns / Day:</span>
                    <span className="font-mono text-slate-300">
                      {customer?.typicalTxnPerDay || 3} transactions
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Transaction Signals */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase font-mono">
                    Current Transaction Signals
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{txn.id}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Amount:</span>
                    <span className={`font-mono font-bold ${txn.amount > (customer?.averageAmount || 2500) * 3 ? 'text-rose-400' : 'text-slate-200'}`}>
                      ₹{txn.amount.toLocaleString('en-IN')} ({Math.round(txn.amount / (customer?.averageAmount || 2500))}× avg)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Originating Location:</span>
                    <span className={`font-medium ${txn.location !== customer?.usualLocations?.[0] ? 'text-orange-400' : 'text-slate-300'}`}>
                      {txn.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Device Fingerprint:</span>
                    <span className={`font-medium ${txn.isNewDevice ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {txn.deviceType} {txn.isNewDevice ? '(NEW UNSEEN DEVICE)' : '(Recognized)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Velocity in last 10 min:</span>
                    <span className={`font-mono font-bold ${txn.velocityLast10m >= 5 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {txn.velocityLast10m} transactions
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recent Failed Attempts:</span>
                    <span className={`font-mono ${txn.failedAttemptsLast24h >= 2 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {txn.failedAttemptsLast24h} declines in 24h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Major Risk Factors Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Decomposed Risk Factors & Point Attribution
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Simulated Prototype Contributions
              </span>
            </div>

            <div className="space-y-2">
              {txn.riskFactors && txn.riskFactors.length > 0 ? (
                txn.riskFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        +{factor.contribution} pts
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{factor.name}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{factor.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {factor.category}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No elevated anomaly factors triggered. Transaction fits within standard risk tolerances.</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Analyst Override & Decision Engine */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Risk Decision Engine & Analyst Override
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI recommendation: <strong className="text-slate-200">{txn.aiDecision}</strong>. Analysts may manually override based on secondary verification.
                </p>
              </div>

              {!isOverriding ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsOverriding(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    Override AI Decision
                  </button>
                  <button
                    onClick={handleOpenInvestigation}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    Open Investigation Case
                  </button>
                </div>
              ) : null}
            </div>

            {/* Override Form */}
            {isOverriding && (
              <form
                onSubmit={handleApplyOverride}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase font-mono">
                    Apply Manual Risk Override
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOverriding(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Select New Decision */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      New Analyst Decision:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['APPROVE', 'VERIFY', 'HOLD', 'BLOCK'] as DecisionType[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDecision(d)}
                          className={`py-2 rounded-lg font-mono font-bold text-xs border transition-all ${
                            selectedDecision === d
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analyst Name */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Analyst Name / ID:
                    </label>
                    <input
                      type="text"
                      value={analystName}
                      onChange={(e) => setAnalystName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  {/* Override Reason */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Reason for Override (Required for Audit Log):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Video KYC completed, out-of-band phone confirmation, genuine festive purchase"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Additional Investigation Notes:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Optional detailed context or reference tickets..."
                      value={overrideNotes}
                      onChange={(e) => setOverrideNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOverriding(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    Confirm & Record Override
                  </button>
                </div>
              </form>
            )}

            {/* Persistent Audit Log */}
            {txn.isOverridden && txn.overrideDetails && (
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Analyst Override Audit Log Record
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(txn.overrideDetails.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Original AI Decision:</span>{' '}
                    <span className="text-rose-400 font-bold">{txn.overrideDetails.originalDecision}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Analyst Decision:</span>{' '}
                    <span className="text-emerald-400 font-bold">{txn.overrideDetails.analystDecision}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Analyst:</span>{' '}
                    <span className="text-slate-200">{txn.overrideDetails.analystName}</span>
                  </div>
                </div>
                <div className="pt-1 text-slate-300">
                  <strong className="text-slate-400">Reason:</strong> {txn.overrideDetails.reason}
                </div>
                {txn.overrideDetails.notes && (
                  <div className="text-slate-400 text-[11px]">
                    <strong>Notes:</strong> {txn.overrideDetails.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>RiskGuard AI Platform • Transaction ID: {txn.id}</span>
          <button
            onClick={() => setSelectedTransaction(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
