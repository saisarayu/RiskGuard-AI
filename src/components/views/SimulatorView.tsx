import React, { useState, useEffect } from 'react';
import { useRisk } from '../../context/RiskContext';
import { SimulationPayload, DeviceType, PaymentMethod } from '../../types';
import { evaluateSimulation } from '../../engine/riskEngine';
import { RiskScorePill, DecisionBadge } from '../common/RiskBadge';
import {
  Cpu,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  Activity,
  Smartphone,
  MapPin,
  Clock,
  Send,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const {
    customers,
    merchants,
    thresholds,
    weights,
    injectSimulatedTransaction,
    setActiveTab,
    setSelectedTransaction,
  } = useRisk();

  // Initial simulation payload
  const [formData, setFormData] = useState<SimulationPayload>({
    amount: 75000,
    customerId: 'CUST-102',
    merchantId: 'MERCH-501',
    deviceType: 'Windows',
    isNewDevice: true,
    location: 'Hyderabad',
    previousLocation: 'Hyderabad',
    velocityLast10m: 12,
    averageCustomerTransaction: 2500,
    isNewMerchant: true,
    failedAttemptsLast24h: 3,
    accountAgeDays: 480,
    timeOfDay: '02:30',
    paymentMethod: 'Credit Card',
  });

  // Calculate live dynamic risk score
  const result = evaluateSimulation(formData, weights, thresholds);

  // Sync customer average when customer ID changes
  const handleCustomerChange = (custId: string) => {
    const cust = customers.find((c) => c.id === custId);
    setFormData((prev) => ({
      ...prev,
      customerId: custId,
      averageCustomerTransaction: cust ? cust.averageAmount : 2500,
      previousLocation: cust ? cust.usualLocations[0] : 'Hyderabad',
      location: cust ? cust.usualLocations[0] : 'Hyderabad',
    }));
  };

  // Preset quick scenarios
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'ATO_HIGH_TICKET':
        setFormData({
          amount: 85000,
          customerId: 'CUST-102',
          merchantId: 'MERCH-501',
          deviceType: 'Windows',
          isNewDevice: true,
          location: 'Hyderabad',
          previousLocation: 'Hyderabad',
          velocityLast10m: 12,
          averageCustomerTransaction: 2500,
          isNewMerchant: true,
          failedAttemptsLast24h: 3,
          accountAgeDays: 480,
          timeOfDay: '02:15',
          paymentMethod: 'Credit Card',
        });
        break;

      case 'VELOCITY_BURST':
        setFormData({
          amount: 4800,
          customerId: 'CUST-104',
          merchantId: 'MERCH-508',
          deviceType: 'Android',
          isNewDevice: false,
          location: 'Mumbai',
          previousLocation: 'Mumbai',
          velocityLast10m: 15,
          averageCustomerTransaction: 3800,
          isNewMerchant: false,
          failedAttemptsLast24h: 0,
          accountAgeDays: 310,
          timeOfDay: '18:45',
          paymentMethod: 'UPI',
        });
        break;

      case 'IMPOSSIBLE_TRAVEL':
        setFormData({
          amount: 35000,
          customerId: 'CUST-103',
          merchantId: 'MERCH-506',
          deviceType: 'Linux',
          isNewDevice: true,
          location: 'London (Proxy)',
          previousLocation: 'Bengaluru',
          velocityLast10m: 3,
          averageCustomerTransaction: 6200,
          isNewMerchant: true,
          failedAttemptsLast24h: 1,
          accountAgeDays: 720,
          timeOfDay: '03:40',
          paymentMethod: 'Credit Card',
        });
        break;

      case 'CARD_TESTING_FAILED':
        setFormData({
          amount: 92000,
          customerId: 'CUST-108',
          merchantId: 'MERCH-502',
          deviceType: 'Windows',
          isNewDevice: true,
          location: 'Bucharest (VPN)',
          previousLocation: 'Delhi NCR',
          velocityLast10m: 8,
          averageCustomerTransaction: 14500,
          isNewMerchant: true,
          failedAttemptsLast24h: 6,
          accountAgeDays: 850,
          timeOfDay: '04:10',
          paymentMethod: 'Credit Card',
        });
        break;

      case 'SAFE_GROCERY':
        setFormData({
          amount: 850,
          customerId: 'CUST-105',
          merchantId: 'MERCH-503',
          deviceType: 'iOS',
          isNewDevice: false,
          location: 'Pune',
          previousLocation: 'Pune',
          velocityLast10m: 1,
          averageCustomerTransaction: 1800,
          isNewMerchant: false,
          failedAttemptsLast24h: 0,
          accountAgeDays: 190,
          timeOfDay: '14:20',
          paymentMethod: 'UPI',
        });
        break;
    }
  };

  const handleInject = () => {
    const newTxn = injectSimulatedTransaction(formData);
    setSelectedTransaction(newTxn);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Live Transaction Risk Simulator</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PROTOTYPE RISK ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tweak multidimensional behavioral parameters and observe instant rule-weighted risk factor score updates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleInject}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center space-x-2 transition-all transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Inject into Transactions Stream</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-2">
        <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Load Preset Anomaly Scenarios:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('ATO_HIGH_TICKET')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-rose-300 text-xs font-medium transition-colors"
          >
            🚨 Account Takeover (New Device + 30× Spike)
          </button>
          <button
            onClick={() => applyPreset('VELOCITY_BURST')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-orange-950/50 border border-slate-800 hover:border-orange-500/40 text-orange-300 text-xs font-medium transition-colors"
          >
            ⚡ Velocity Burst (15 txns / 10m)
          </button>
          <button
            onClick={() => applyPreset('IMPOSSIBLE_TRAVEL')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/40 text-indigo-300 text-xs font-medium transition-colors"
          >
            🌍 Impossible Travel (London Proxy)
          </button>
          <button
            onClick={() => applyPreset('CARD_TESTING_FAILED')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/40 text-purple-300 text-xs font-medium transition-colors"
          >
            💳 Card Testing (6 Failures + High Ticket)
          </button>
          <button
            onClick={() => applyPreset('SAFE_GROCERY')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 text-xs font-medium transition-colors"
          >
            ✅ Normal Routine Grocery (₹850)
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) vs Live AI Risk Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Inputs (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Transaction Feature Parameters
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Live Reactive State</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Amount */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transaction Amount (₹ INR):
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono text-sm font-bold"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method:</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as PaymentMethod,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="NetBanking">NetBanking</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>

            {/* Customer ID */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Account:</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) — Avg ₹{c.averageAmount}
                  </option>
                ))}
              </select>
            </div>

            {/* Merchant ID */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Merchant Profile:</label>
              <select
                value={formData.merchantId}
                onChange={(e) => setFormData((prev) => ({ ...prev, merchantId: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Historical Average */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Customer Historical Avg (₹):
              </label>
              <input
                type="number"
                value={formData.averageCustomerTransaction}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    averageCustomerTransaction: parseFloat(e.target.value) || 100,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Velocity in last 10m */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transactions in last 10 min:
              </label>
              <input
                type="number"
                value={formData.velocityLast10m}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    velocityLast10m: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Originating Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Originating Location:
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Previous Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Customer Usual / Prev Location:
              </label>
              <input
                type="text"
                value={formData.previousLocation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, previousLocation: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Device Platform:</label>
              <select
                value={formData.deviceType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deviceType: e.target.value as DeviceType,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
              >
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
                <option value="Windows">Windows</option>
                <option value="macOS">macOS</option>
                <option value="Linux">Linux</option>
              </select>
            </div>

            {/* Failed Attempts in last 24h */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Failed Attempts (Last 24h):
              </label>
              <input
                type="number"
                value={formData.failedAttemptsLast24h}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    failedAttemptsLast24h: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Account Age Days */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Customer Account Age (Days):
              </label>
              <input
                type="number"
                value={formData.accountAgeDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accountAgeDays: parseInt(e.target.value, 10) || 30,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Time of Day */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transaction Time (HH:MM):
              </label>
              <input
                type="time"
                value={formData.timeOfDay}
                onChange={(e) => setFormData((prev) => ({ ...prev, timeOfDay: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs">
            {/* New Device Switch */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isNewDevice}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isNewDevice: e.target.checked }))
                }
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-200 font-medium">New / Unrecognized Device</span>
            </label>

            {/* New Merchant Switch */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isNewMerchant}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isNewMerchant: e.target.checked }))
                }
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-200 font-medium">First-time Merchant</span>
            </label>
          </div>
        </div>

        {/* Right Column: Live Calculated Risk Score (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live AI Risk Evaluation
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                Real-time
              </span>
            </div>

            {/* Large Risk Gauge Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <RiskScorePill score={result.riskScore} size="xl" showLabel={true} />
              <div>
                <div className="text-xs font-mono text-slate-400">Recommended Decision</div>
                <div className="mt-1.5">
                  <DecisionBadge decision={result.decision} size="lg" />
                </div>
              </div>
            </div>

            {/* Explainable AI Narrative Box */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                AI Risk Explanation:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                "{result.explanation}"
              </p>
            </div>

            {/* Decomposed Factor Attribution List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Active Factor Contributions:
              </span>
              {result.riskFactors.length > 0 ? (
                result.riskFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300 truncate pr-2">{f.name}</span>
                    <span className="font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 shrink-0">
                      +{f.contribution} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-emerald-400 p-2 rounded bg-emerald-950/20 border border-emerald-500/20">
                  No risk factor triggers. Score reflects baseline network safety.
                </div>
              )}
            </div>

            {/* Submit / Inject Button */}
            <button
              onClick={handleInject}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Simulate & Ingest into Platform Stream</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
