import React from 'react';
import { useRisk } from '../../context/RiskContext';
import {
  TrendingUp,
  Sliders,
  Percent,
  ShieldAlert,
  Layers,
  Activity,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

export const RiskAnalysisView: React.FC = () => {
  const { kpis, weights, thresholds } = useRisk();

  // Synthetic Feature Importance (SHAP-style point contribution)
  const featureImportance = [
    { feature: 'Amount Deviation vs Avg', weight: weights.amountDeviationWeight, importance: 28, color: '#f43f5e' },
    { feature: 'Burst Velocity (10m)', weight: weights.velocityWeight, importance: 22, color: '#fb7185' },
    { feature: 'New Device Novelty', weight: weights.newDeviceWeight, importance: 18, color: '#f97316' },
    { feature: 'Failed Auth History', weight: weights.failedAttemptsWeight, importance: 14, color: '#f59e0b' },
    { feature: 'Location / IP Mismatch', weight: weights.locationMismatchWeight, importance: 11, color: '#38bdf8' },
    { feature: 'Merchant Category Risk', weight: weights.highRiskCategoryWeight, importance: 7, color: '#818cf8' },
  ];

  // False Positive vs Fraud Catch Rate Trade-Off Curve (ROC Curve)
  const tradeOffCurve = [
    { threshold: 'Score > 90', fraudCatchRate: 72, falsePositiveRate: 1.2 },
    { threshold: 'Score > 80', fraudCatchRate: 88, falsePositiveRate: 3.8 },
    { threshold: 'Score > 70', fraudCatchRate: 94, falsePositiveRate: 6.5 },
    { threshold: 'Score > 60', fraudCatchRate: 97, falsePositiveRate: 11.2 },
    { threshold: 'Score > 50', fraudCatchRate: 99, falsePositiveRate: 18.4 },
    { threshold: 'Score > 30', fraudCatchRate: 99.8, falsePositiveRate: 34.0 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          AI Risk Engine Architecture & Model Analytics
          <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            Explainable AI Studio
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Feature contribution breakdown, threshold optimization trade-offs, and statistical telemetry
        </p>
      </div>

      {/* Model Architecture Flow Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            End-to-End Decision Pipeline Architecture
          </h3>
          <span className="text-[11px] font-mono text-cyan-300">Deterministic & Explainable</span>
        </div>

        {/* Pipeline Diagram */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          {[
            { step: '1. Ingestion', desc: 'Raw Payment & Telemetry', color: 'border-cyan-500/40 text-cyan-300' },
            { step: '2. Baseline Match', desc: 'Customer & Merchant Profiles', color: 'border-blue-500/40 text-blue-300' },
            { step: '3. Feature Extraction', desc: 'Velocity, Device, Geo, Amount', color: 'border-indigo-500/40 text-indigo-300' },
            { step: '4. Scoring Engine', desc: 'Rule-Weighted Aggregation', color: 'border-purple-500/40 text-purple-300' },
            { step: '5. Risk Score', desc: 'Normalized 0–100 Scale', color: 'border-amber-500/40 text-amber-300' },
            { step: '6. Explainable AI', desc: 'Factor Attribution & Narrative', color: 'border-teal-500/40 text-teal-300' },
            { step: '7. Triage Boundary', desc: 'Approve / Verify / Hold / Block', color: 'border-rose-500/40 text-rose-300' },
            { step: '8. Analyst Override', desc: 'Human in the loop & Audit Log', color: 'border-emerald-500/40 text-emerald-300' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl bg-slate-900/80 border ${item.color} flex flex-col justify-between space-y-1.5`}
            >
              <span className="font-mono font-bold text-[11px] uppercase">{item.step}</span>
              <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Feature Importance vs Trade-off Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Global Feature Importance Attribution (%)
            </h3>
            <p className="text-xs text-slate-400">
              Normalized impact on transaction risk score calculation
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImportance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureImportance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* False Positive vs Fraud Catch Rate Trade-Off Curve */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              Fraud Detection vs. False Positive Trade-Off Curve
            </h3>
            <p className="text-xs text-slate-400">
              Balancing financial loss prevention with customer checkout friction
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={tradeOffCurve}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="threshold" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="fraudCatchRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Fraud Catch Rate (%)"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="falsePositiveRate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="False Positive Rate (%)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
