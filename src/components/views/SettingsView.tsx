import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { DEFAULT_THRESHOLDS, DEFAULT_WEIGHTS } from '../../engine/riskEngine';
import {
  Settings2,
  Sliders,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { thresholds, weights, updateThresholds, updateWeights, resetAllData } = useRisk();

  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [localWeights, setLocalWeights] = useState(weights);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds(localThresholds);
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    updateWeights(localWeights);
  };

  const handleRestoreDefaults = () => {
    setLocalThresholds(DEFAULT_THRESHOLDS);
    setLocalWeights(DEFAULT_WEIGHTS);
    updateThresholds(DEFAULT_THRESHOLDS);
    updateWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Risk Scoring Engine Configuration & Thresholds
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              v1.4 Ruleset
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate decision cutoffs, factor weights, and risk model sensitivity
          </p>
        </div>

        <button
          onClick={handleRestoreDefaults}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Engine Defaults</span>
        </button>
      </div>

      {/* Fintech Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-start space-x-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-300">Prototype Configurable Rules Notice</h4>
          <p className="text-slate-300 leading-relaxed">
            These thresholds and scoring multipliers are project-specific configurable simulation rules for the RiskGuard AI demonstration platform. They do not represent proprietary production bank or Razorpay production models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Decision Cutoff Thresholds */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Decision Boundary Cutoffs
            </h3>
            <span className="text-[11px] font-mono text-cyan-300">0–100 Scale</span>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            {/* Approve Threshold */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">APPROVE Range (0 – {localThresholds.approveMax})</span>
                <span className="font-mono text-xs text-slate-300">{localThresholds.approveMax} pts</span>
              </div>
              <input
                type="range"
                min={10}
                max={45}
                value={localThresholds.approveMax}
                onChange={(e) =>
                  setLocalThresholds((prev) => ({ ...prev, approveMax: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-emerald-500"
              />
              <p className="text-[11px] text-slate-400">Low-friction auto-clear for trusted parameters.</p>
            </div>

            {/* Verify Threshold */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">VERIFY Range ({localThresholds.approveMax + 1} – {localThresholds.verifyMax})</span>
                <span className="font-mono text-xs text-slate-300">{localThresholds.verifyMax} pts</span>
              </div>
              <input
                type="range"
                min={45}
                max={70}
                value={localThresholds.verifyMax}
                onChange={(e) =>
                  setLocalThresholds((prev) => ({ ...prev, verifyMax: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-amber-500"
              />
              <p className="text-[11px] text-slate-400">Triggers step-up 2FA or biometric verification.</p>
            </div>

            {/* Hold Threshold */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-orange-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-400">HOLD Range ({localThresholds.verifyMax + 1} – {localThresholds.holdMax})</span>
                <span className="font-mono text-xs text-slate-300">{localThresholds.holdMax} pts</span>
              </div>
              <input
                type="range"
                min={70}
                max={85}
                value={localThresholds.holdMax}
                onChange={(e) =>
                  setLocalThresholds((prev) => ({ ...prev, holdMax: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-orange-500"
              />
              <p className="text-[11px] text-slate-400">Temporary payment hold for manual analyst triage.</p>
            </div>

            {/* Block Threshold */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400">BLOCK Range ({localThresholds.holdMax + 1} – 100)</span>
                <span className="font-mono text-xs text-slate-300">Auto-Decline</span>
              </div>
              <p className="text-[11px] text-slate-400">Immediate authorization denial & card lock.</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Save Decision Thresholds
            </button>
          </form>
        </div>

        {/* Card 2: Factor Scoring Weights */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Risk Factor Weight Multipliers
            </h3>
            <span className="text-[11px] font-mono text-indigo-300">Attribution Points</span>
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-3.5 text-xs">
            {/* Amount Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Amount Spike Penalty:</span>
                <span className="font-mono text-cyan-300">+{localWeights.amountDeviationWeight} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={35}
                value={localWeights.amountDeviationWeight}
                onChange={(e) =>
                  setLocalWeights((prev) => ({ ...prev, amountDeviationWeight: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Velocity Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Velocity Burst Penalty:</span>
                <span className="font-mono text-cyan-300">+{localWeights.velocityWeight} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={35}
                value={localWeights.velocityWeight}
                onChange={(e) =>
                  setLocalWeights((prev) => ({ ...prev, velocityWeight: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-cyan-500"
              />
            </div>

            {/* New Device Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>New Device Penalty:</span>
                <span className="font-mono text-cyan-300">+{localWeights.newDeviceWeight} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={localWeights.newDeviceWeight}
                onChange={(e) =>
                  setLocalWeights((prev) => ({ ...prev, newDeviceWeight: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Location Mismatch Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Location Mismatch / Proxy Penalty:</span>
                <span className="font-mono text-cyan-300">+{localWeights.locationMismatchWeight} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={localWeights.locationMismatchWeight}
                onChange={(e) =>
                  setLocalWeights((prev) => ({ ...prev, locationMismatchWeight: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Failed Attempts Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Failed Authorization Attempts Penalty:</span>
                <span className="font-mono text-cyan-300">+{localWeights.failedAttemptsWeight} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={localWeights.failedAttemptsWeight}
                onChange={(e) =>
                  setLocalWeights((prev) => ({ ...prev, failedAttemptsWeight: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors mt-4"
            >
              Calibrate Factor Weights
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
