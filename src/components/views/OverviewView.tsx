import React from 'react';
import { useRisk } from '../../context/RiskContext';
import { RiskScorePill, DecisionBadge } from '../common/RiskBadge';
import {
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  DollarSign,
  Percent,
  Activity,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const OverviewView: React.FC = () => {
  const {
    kpis,
    transactions,
    setSelectedTransaction,
    setActiveTab,
    merchants,
    fraudPatterns,
  } = useRisk();

  // Synthetic time-series data for Transactions & Fraud attempts over 24h
  const timeSeriesData = [
    { time: '00:00', total: 4200, fraud: 18 },
    { time: '02:00', total: 2800, fraud: 45 },
    { time: '04:00', total: 1900, fraud: 38 },
    { time: '06:00', total: 3100, fraud: 12 },
    { time: '08:00', total: 6800, fraud: 22 },
    { time: '10:00', total: 9400, fraud: 31 },
    { time: '12:00', total: 11200, fraud: 28 },
    { time: '14:00', total: 10800, fraud: 26 },
    { time: '16:00', total: 12500, fraud: 34 },
    { time: '18:00', total: 14200, fraud: 48 },
    { time: '20:00', total: 13100, fraud: 52 },
    { time: '22:00', total: 8500, fraud: 32 },
  ];

  // Dynamic Risk Score Distribution bins
  const scoreBins = [
    { range: '0-10', count: 48, color: '#10b981' },
    { range: '11-20', count: 82, color: '#10b981' },
    { range: '21-30', count: 64, color: '#10b981' },
    { range: '31-40', count: 32, color: '#f59e0b' },
    { range: '41-50', count: 24, color: '#f59e0b' },
    { range: '51-60', count: 18, color: '#f59e0b' },
    { range: '61-70', count: 14, color: '#f97316' },
    { range: '71-80', count: 12, color: '#f97316' },
    { range: '81-90', count: 19, color: '#ef4444' },
    { range: '91-100', count: 11, color: '#ef4444' },
  ];

  // Decision Breakdown Donut data
  const approveCount = transactions.filter((t) => t.finalDecision === 'APPROVE').length;
  const verifyCount = transactions.filter((t) => t.finalDecision === 'VERIFY').length;
  const holdCount = transactions.filter((t) => t.finalDecision === 'HOLD').length;
  const blockCount = transactions.filter((t) => t.finalDecision === 'BLOCK').length;

  const decisionData = [
    { name: 'Approve (0–30)', value: approveCount || 192, color: '#10b981' },
    { name: 'Verify (31–60)', value: verifyCount || 38, color: '#f59e0b' },
    { name: 'Hold (61–80)', value: holdCount || 16, color: '#f97316' },
    { name: 'Block (81–100)', value: blockCount || 24, color: '#ef4444' },
  ];

  // High-Risk Transactions by Merchant
  const merchantRiskData = merchants.slice(0, 6).map((m) => ({
    name: m.name.length > 16 ? m.name.substring(0, 14) + '...' : m.name,
    fraudRate: m.fraudRate,
    score: m.riskScore,
    flaggedTxns: Math.round(m.totalTransactions * (m.fraudRate / 100)),
  }));

  // Fraud Patterns by Location
  const locationRiskData = [
    { location: 'Hyderabad', fraudScore: 78, attempts: 64 },
    { location: 'Bengaluru', fraudScore: 42, attempts: 38 },
    { location: 'Mumbai', fraudScore: 56, attempts: 49 },
    { location: 'Delhi NCR', fraudScore: 71, attempts: 58 },
    { location: 'Pune', fraudScore: 34, attempts: 22 },
    { location: 'VPN / Overseas', fraudScore: 94, attempts: 82 },
  ];

  // Recent high-risk transactions for the live alerts feed
  const recentAlerts = transactions.filter((t) => t.riskScore >= 60).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Autonomous Risk Scoring Engine Online
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                Active Monitoring
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating live payment streams across velocity, device fingerprints, behavioral deviations, and geolocation anomalies.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Anomaly</span>
          </button>
        </div>
      </div>

      {/* 6 Key Fintech Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Transactions */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Transactions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-extrabold text-white font-mono">
              {kpis.totalTransactions.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-emerald-400 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              <span>+12.4% vs yesterday</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-12 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 2: High Risk Transactions */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">High Risk Txns</span>
            <AlertOctagon className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-extrabold text-orange-400 font-mono">
              {kpis.highRiskTransactions.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-400">
              <span className="text-orange-400 font-semibold mr-1">~1.0%</span> of volume flagged
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-12 bg-orange-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 3: Fraud Detected */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Fraud Blocked</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-extrabold text-rose-400 font-mono">
              {kpis.fraudDetected.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-rose-400 font-medium">
              <span>Saved ₹32.8L in chargebacks</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-12 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 4: Amount at Risk */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Amount at Risk</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-extrabold text-amber-300 font-mono">
              ₹{(kpis.amountAtRisk / 100000).toFixed(1)}L
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-400">
              <span>Under review / held</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-12 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 5: False Positive Rate */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">False Positive Rate</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-extrabold text-indigo-300 font-mono">
              {kpis.falsePositiveRate}%
            </div>
            <div className="mt-1 flex items-center text-[11px] text-emerald-400 font-medium">
              <span>Within &lt; 4.0% SLA target</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 6: Average Risk Score */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Risk Score</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-extrabold text-cyan-300 font-mono">
              {kpis.averageRiskScore}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-400">
              <span className="text-emerald-400 mr-1">Healthy</span> safe baseline
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-12 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* Row 2: Main Velocity & Trend Chart + Decision Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Velocity & Fraud Attempts */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Transaction Volume & Fraud Attempts (24h)
              </h3>
              <p className="text-xs text-slate-400">
                Real-time throughput correlated with anomalous risk bursts
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-cyan-500"></span>
                <span className="text-slate-300">Total Volume</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span className="text-slate-300">Fraud Flagged</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Transactions"
                />
                <Area
                  type="monotone"
                  dataKey="fraud"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFraud)"
                  name="Fraud Attempts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Decision Breakdown Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Decision Recommendation Mix</h3>
            <p className="text-xs text-slate-400">Current triage distribution across thresholds</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Decisions</span>
              <span className="text-lg font-mono font-bold text-white">
                {transactions.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {decisionData.map((d) => (
              <div
                key={d.name}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-slate-300 font-medium text-[11px]">{d.name.split(' ')[0]}</span>
                </div>
                <span className="font-mono font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Risk Score Distribution & High-Risk Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Distribution Histogram */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Risk Score Distribution (0–100)</h3>
              <p className="text-xs text-slate-400">Decile frequencies across current transaction batch</p>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Approve</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Verify</span>
              <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">Hold</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Block</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreBins.map((entry, index) => (
                    <Cell key={`bin-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Risk Merchants Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Merchant Risk Exposure</h3>
              <p className="text-xs text-slate-400">Merchants with highest fraud & chargeback rates</p>
            </div>
            <button
              onClick={() => setActiveTab('merchants')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={merchantRiskData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Fraud Rate']}
                />
                <Bar dataKey="fraudRate" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Critical Alerts & Active Fraud Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts Feed (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Recent High-Risk Transaction Alerts
              </h3>
              <p className="text-xs text-slate-400">Transactions requiring immediate analyst triage</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Explore All Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.map((txn) => (
              <div
                key={txn.id}
                onClick={() => setSelectedTransaction(txn)}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-wrap items-center justify-between gap-3 group"
              >
                <div className="flex items-center space-x-3.5">
                  <RiskScorePill score={txn.riskScore} size="md" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {txn.id}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-300 font-medium">{txn.customerName}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">{txn.merchantName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {txn.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white">
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">{txn.location}</div>
                  </div>
                  <DecisionBadge decision={txn.finalDecision} isOverridden={txn.isOverridden} size="sm" />
                  <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-700 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Fraud Patterns Summary (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Active Fraud Patterns</h3>
              <p className="text-xs text-slate-400">Synthesized cluster detection</p>
            </div>
            <button
              onClick={() => setActiveTab('fraud-patterns')}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Details
            </button>
          </div>

          <div className="space-y-3">
            {fraudPatterns.map((pat) => (
              <div
                key={pat.id}
                onClick={() => setActiveTab('fraud-patterns')}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-indigo-500/40 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{pat.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                      pat.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {pat.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {pat.description}
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
                  <span>{pat.affectedTxnCount} transactions</span>
                  <span className="text-amber-300">₹{(pat.totalExposure / 100000).toFixed(1)}L Exposure</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
