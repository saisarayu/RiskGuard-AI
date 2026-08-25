import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { Customer } from '../../types';
import { RiskScorePill, RiskLevelBadge } from '../common/RiskBadge';
import {
  Users,
  Search,
  UserCheck,
  ShieldAlert,
  Smartphone,
  MapPin,
  Calendar,
  CreditCard,
  History,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Bot,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const {
    customers,
    transactions,
    selectedCustomer,
    setSelectedCustomer,
    setSelectedTransaction,
    triggerCopilotWithPrompt,
  } = useRisk();

  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCustId, setSelectedCustId] = useState<string>('CUST-102');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const activeCustomer =
    customers.find((c) => c.id === selectedCustId) || filteredCustomers[0] || customers[0];

  const customerTransactions = transactions.filter((t) => t.customerId === activeCustomer?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Customer Risk Profiles & Behavioral Baselines
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {customers.length} profiles
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual transaction velocity norms, trusted hardware fingerprints, and risk history
          </p>
        </div>

        {activeCustomer && (
          <button
            onClick={() =>
              triggerCopilotWithPrompt(
                `What are the major risk factors, behavioral baselines, and historical anomalies for customer ${activeCustomer.name} (${activeCustomer.id})?`
              )
            }
            className="px-3 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-violet-400" />
            <span>Ask Copilot about Customer</span>
          </button>
        )}
      </div>

      {/* Main Grid: Customer List (Left) & Deep Dive Profile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Directory (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer name or ID..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = activeCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustId(cust.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 border-cyan-500/50 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{cust.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{cust.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Avg: ₹{cust.averageAmount.toLocaleString('en-IN')} • {cust.usualLocations[0]}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RiskScorePill score={cust.riskScore} size="sm" />
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Details & Transaction History (8 cols) */}
        {activeCustomer ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Top Customer Hero Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20 font-mono">
                    {activeCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{activeCustomer.name}</h3>
                      <span className="text-xs font-mono text-slate-400 font-medium">
                        {activeCustomer.id}
                      </span>
                      <RiskLevelBadge level={activeCustomer.riskLevel} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeCustomer.email} • {activeCustomer.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 uppercase font-mono">Customer Risk Score</div>
                    <div className="mt-0.5">
                      <RiskScorePill score={activeCustomer.riskScore} size="lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Baseline Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Account Age
                  </span>
                  <div className="text-sm font-bold font-mono text-white mt-1">
                    {activeCustomer.accountAgeDays} days
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Est. {new Date(activeCustomer.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Average Ticket
                  </span>
                  <div className="text-sm font-bold font-mono text-white mt-1">
                    ₹{activeCustomer.averageAmount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Range: ₹{activeCustomer.typicalAmountRange[0]}–₹{activeCustomer.typicalAmountRange[1]}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-cyan-400" /> Total Volume
                  </span>
                  <div className="text-sm font-bold font-mono text-white mt-1">
                    ₹{activeCustomer.totalSpent.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {activeCustomer.totalTransactions} transactions
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> Flagged / Blocked
                  </span>
                  <div className="text-sm font-bold font-mono text-white mt-1">
                    {activeCustomer.blockedTxnCount} Blocked
                  </div>
                  <span className="text-[10px] text-orange-400 font-semibold">
                    {activeCustomer.suspiciousTxnCount} Suspicious
                  </span>
                </div>
              </div>

              {/* Known Devices & Usual Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Known Trusted Devices
                  </span>
                  <div className="space-y-1">
                    {activeCustomer.knownDevices.map((dev, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px]"
                      >
                        {dev}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Usual Geographies
                  </span>
                  <div className="space-y-1">
                    {activeCustomer.usualLocations.map((loc, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-300 font-medium text-[11px]"
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Transaction Timeline */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  Transaction History & Anomaly Timeline ({customerTransactions.length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {customerTransactions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No transactions recorded for this customer in current window.
                  </div>
                ) : (
                  customerTransactions.map((txn) => (
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
                            <span className="text-slate-200 font-medium">{txn.merchantName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {txn.location} • {txn.deviceType} ({txn.isNewDevice ? 'New' : 'Known'}) • {new Date(txn.timestamp).toLocaleString()}
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
