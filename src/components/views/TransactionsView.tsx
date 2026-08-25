import React, { useState, useMemo } from 'react';
import { useRisk } from '../../context/RiskContext';
import { Transaction, DecisionType, RiskLevel } from '../../types';
import { RiskScorePill, DecisionBadge, RiskLevelBadge } from '../common/RiskBadge';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  MapPin,
  Clock,
  RotateCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    selectedTransaction,
    setSelectedTransaction,
    searchQuery,
    setSearchQuery,
    overrideTransactionDecision,
    addInvestigationCase,
  } = useRisk();

  // Filters state
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('ALL');
  const [deviceFilter, setDeviceFilter] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          txn.id.toLowerCase().includes(q) ||
          txn.customerName.toLowerCase().includes(q) ||
          txn.customerId.toLowerCase().includes(q) ||
          txn.merchantName.toLowerCase().includes(q) ||
          txn.merchantId.toLowerCase().includes(q) ||
          txn.location.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Decision filter
      if (decisionFilter !== 'ALL' && txn.finalDecision !== decisionFilter) {
        return false;
      }

      // Risk level filter
      if (riskLevelFilter !== 'ALL' && txn.riskLevel !== riskLevelFilter) {
        return false;
      }

      // Device filter
      if (deviceFilter === 'NEW_ONLY' && !txn.isNewDevice) return false;
      if (deviceFilter === 'KNOWN_ONLY' && txn.isNewDevice) return false;

      // Min/Max amount
      if (minAmount && txn.amount < parseFloat(minAmount)) return false;
      if (maxAmount && txn.amount > parseFloat(maxAmount)) return false;

      return true;
    });
  }, [transactions, searchQuery, decisionFilter, riskLevelFilter, deviceFilter, minAmount, maxAmount]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Customer ID',
      'Customer Name',
      'Merchant ID',
      'Merchant Name',
      'Amount (INR)',
      'Location',
      'Device',
      'Is New Device',
      'Risk Score',
      'Risk Level',
      'AI Decision',
      'Final Decision',
      'Is Overridden',
      'Explanation',
    ];

    const rows = filteredTransactions.map((t) => [
      t.id,
      t.timestamp,
      t.customerId,
      `"${t.customerName}"`,
      t.merchantId,
      `"${t.merchantName}"`,
      t.amount,
      `"${t.location}"`,
      `"${t.deviceType}"`,
      t.isNewDevice ? 'Yes' : 'No',
      t.riskScore,
      t.riskLevel,
      t.aiDecision,
      t.finalDecision,
      t.isOverridden ? 'Yes' : 'No',
      `"${t.explanation.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RiskGuard_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Payment Transactions Explorer
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {filteredTransactions.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Granular real-time inspection, risk scoring telemetry, and human analyst overrides
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Decision Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Decision:
            </span>
            {['ALL', 'APPROVE', 'VERIFY', 'HOLD', 'BLOCK'].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDecisionFilter(d);
                  setPage(1);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium transition-all ${
                  decisionFilter === d
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Risk Level Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1.5">Risk Level:</span>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRiskLevelFilter(r);
                  setPage(1);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium uppercase transition-all ${
                  riskLevelFilter === r
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Device Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Device:</span>
              <select
                value={deviceFilter}
                onChange={(e) => {
                  setDeviceFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Devices</option>
                <option value="NEW_ONLY">New Devices Only</option>
                <option value="KNOWN_ONLY">Known Devices Only</option>
              </select>
            </div>

            {/* Min / Max Amount */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Amount (₹):</span>
              <input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value);
                  setPage(1);
                }}
                className="w-20 bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
              />
              <span className="text-slate-600">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value);
                  setPage(1);
                }}
                className="w-20 bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Reset Filters */}
          {(decisionFilter !== 'ALL' ||
            riskLevelFilter !== 'ALL' ||
            deviceFilter !== 'ALL' ||
            minAmount ||
            maxAmount ||
            searchQuery) && (
            <button
              onClick={() => {
                setDecisionFilter('ALL');
                setRiskLevelFilter('ALL');
                setDeviceFilter('ALL');
                setMinAmount('');
                setMaxAmount('');
                setSearchQuery('');
                setPage(1);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Merchant</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Device</th>
                <th className="py-3.5 px-4 font-semibold text-center">Risk Score</th>
                <th className="py-3.5 px-4 font-semibold">Risk Level</th>
                <th className="py-3.5 px-4 font-semibold">Decision</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-slate-500" />
                      <p className="text-sm font-medium text-slate-300">No transactions match your filters</p>
                      <p className="text-xs text-slate-500">Try adjusting your search or resetting active filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => {
                  const isCritical = txn.riskScore >= 81;
                  const isHold = txn.riskScore >= 61 && txn.riskScore <= 80;

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => setSelectedTransaction(txn)}
                      className={`hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                        isCritical ? 'bg-rose-950/10' : isHold ? 'bg-orange-950/10' : ''
                      }`}
                    >
                      {/* TXN ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        <div className="flex items-center space-x-1.5">
                          <span>{txn.id}</span>
                          {txn.patternTags && txn.patternTags.length > 0 && (
                            <span
                              title={txn.patternTags.join(', ')}
                              className="w-2 h-2 rounded-full bg-rose-400"
                            ></span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{txn.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{txn.customerId}</div>
                      </td>

                      {/* Merchant */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{txn.merchantName}</div>
                        <div className="text-[10px] text-slate-400">{txn.merchantCategory}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-100">
                        ₹{txn.amount.toLocaleString('en-IN')}
                        <div className="text-[10px] font-sans font-normal text-slate-400">{txn.paymentMethod}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{txn.location}</span>
                        </div>
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <Smartphone className="w-3 h-3 text-slate-400" />
                          <span>{txn.deviceType}</span>
                        </div>
                        {txn.isNewDevice ? (
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20">
                            New Device
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400/80">Recognized</span>
                        )}
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4 text-center">
                        <RiskScorePill score={txn.riskScore} size="sm" />
                      </td>

                      {/* Risk Level */}
                      <td className="py-3 px-4">
                        <RiskLevelBadge level={txn.riskLevel} />
                      </td>

                      {/* Decision */}
                      <td className="py-3 px-4">
                        <DecisionBadge
                          decision={txn.finalDecision}
                          isOverridden={txn.isOverridden}
                          size="sm"
                        />
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(txn.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(txn);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 transition-colors inline-flex items-center space-x-1"
                        >
                          <span>Analyze</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="text-white font-medium">
              {Math.min(page * pageSize, filteredTransactions.length)}
            </span>{' '}
            of <span className="text-white font-medium">{filteredTransactions.length}</span> transactions
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-200 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
