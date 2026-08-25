import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { RiskScorePill, RiskLevelBadge } from '../common/RiskBadge';
import {
  Store,
  Search,
  AlertTriangle,
  TrendingDown,
  Percent,
  CreditCard,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const MerchantsView: React.FC = () => {
  const { merchants, transactions, setSelectedTransaction, triggerCopilotWithPrompt } = useRisk();

  const [search, setSearch] = useState<string>('');
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState<boolean>(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('MERCH-501');

  const filteredMerchants = merchants.filter((m) => {
    if (filterSuspiciousOnly && !m.isSuspicious && m.fraudRate < 2.0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeMerchant =
    merchants.find((m) => m.id === selectedMerchantId) || filteredMerchants[0] || merchants[0];

  const merchantTransactions = transactions.filter((t) => t.merchantId === activeMerchant?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Merchant Risk Profiles & Fraud Exposure
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {merchants.length} merchants
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time chargeback velocity, refund frequency, and synthetic merchant risk scoring
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterSuspiciousOnly(!filterSuspiciousOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
              filterSuspiciousOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Risk Merchants Only</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Directory (Left) & Profile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Merchant List (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredMerchants.map((merch) => {
              const isSelected = activeMerchant?.id === merch.id;
              return (
                <div
                  key={merch.id}
                  onClick={() => setSelectedMerchantId(merch.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border-indigo-500/50 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{merch.name}</span>
                      {merch.fraudRate > 3.0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {merch.category} • Fraud: <strong className={merch.fraudRate > 3.0 ? 'text-rose-400' : 'text-slate-300'}>{merch.fraudRate}%</strong>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RiskScorePill score={merch.riskScore} size="sm" />
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Merchant Profile Deep-Dive (8 cols) */}
        {activeMerchant ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Top Merchant Hero Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{activeMerchant.name}</h3>
                      <span className="text-xs font-mono text-slate-400 font-medium">
                        {activeMerchant.id}
                      </span>
                      <RiskLevelBadge level={activeMerchant.riskLevel} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Category: <strong className="text-slate-300">{activeMerchant.category}</strong> • Base Hub: {activeMerchant.location}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Merchant Risk Score</div>
                  <div className="mt-0.5">
                    <RiskScorePill score={activeMerchant.riskScore} size="lg" />
                  </div>
                </div>
              </div>

              {/* Financial Risk & Chargeback Rates Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Fraud Rate
                  </span>
                  <div className="text-base font-bold font-mono text-rose-400 mt-1">
                    {activeMerchant.fraudRate}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Target SLA: &lt; 1.0%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-orange-400" /> Chargeback Rate
                  </span>
                  <div className="text-base font-bold font-mono text-orange-300 mt-1">
                    {activeMerchant.chargebackRate}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Visa/Mastercard SLA
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Refund Rate
                  </span>
                  <div className="text-base font-bold font-mono text-amber-300 mt-1">
                    {activeMerchant.refundRate}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Dispute index normal
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Volume
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    ₹{(activeMerchant.totalVolume / 100000).toFixed(1)}L
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Avg: ₹{activeMerchant.averageAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Merchant Transactions Timeline */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Recent Transactions Processed at {activeMerchant.name} ({merchantTransactions.length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {merchantTransactions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No transactions captured for this merchant in active view window.
                  </div>
                ) : (
                  merchantTransactions.map((txn) => (
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
                            <span className="text-slate-200 font-medium">{txn.customerName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {txn.location} • {txn.paymentMethod} • {new Date(txn.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 font-mono">
                        <span className="font-bold text-white">
                          ₹{txn.amount.toLocaleString('en-IN')}
                        </span>
                        <RiskLevelBadge level={txn.riskLevel} />
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-300" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
