import React from 'react';
import { DecisionType, RiskLevel } from '../../types';
import { ShieldCheck, ShieldAlert, ShieldX, Clock, AlertTriangle } from 'lucide-react';

interface DecisionBadgeProps {
  decision: DecisionType;
  isOverridden?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  decision,
  isOverridden = false,
  size = 'md',
  showIcon = true,
}) => {
  const getStyle = () => {
    switch (decision) {
      case 'APPROVE':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          label: 'APPROVE',
        };
      case 'VERIFY':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'VERIFY',
        };
      case 'HOLD':
        return {
          bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
          dot: 'bg-orange-400 shadow-[0_0_8px_#f97316]',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'HOLD',
        };
      case 'BLOCK':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
          dot: 'bg-rose-500 shadow-[0_0_8px_#ef4444]',
          icon: <ShieldX className="w-3.5 h-3.5" />,
          label: 'BLOCK',
        };
    }
  };

  const config = getStyle();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs font-semibold px-2.5 py-1 space-x-1.5',
    lg: 'text-sm font-bold px-3.5 py-1.5 space-x-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-wide ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <span className="opacity-90">{config.icon}</span>}
      <span>{config.label}</span>
      {isOverridden && (
        <span
          title="Manually modified by risk analyst"
          className="ml-1 text-[10px] bg-slate-800 text-cyan-400 px-1 py-0.2 rounded border border-cyan-500/30 uppercase font-sans"
        >
          Overridden
        </span>
      )}
    </span>
  );
};

interface RiskScorePillProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const RiskScorePill: React.FC<RiskScorePillProps> = ({
  score,
  size = 'md',
  showLabel = false,
}) => {
  const getColor = () => {
    if (score <= 30) {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        ring: 'ring-emerald-500/20',
        level: 'LOW',
      };
    } else if (score <= 60) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        ring: 'ring-amber-500/20',
        level: 'MEDIUM',
      };
    } else if (score <= 80) {
      return {
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        ring: 'ring-orange-500/20',
        level: 'HIGH',
      };
    } else {
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/40',
        ring: 'ring-rose-500/30',
        level: 'CRITICAL',
      };
    }
  };

  const style = getColor();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-mono font-medium',
    md: 'text-xs px-2.5 py-1 font-mono font-semibold',
    lg: 'text-base px-3.5 py-1.5 font-mono font-bold',
    xl: 'text-2xl px-5 py-2 font-mono font-extrabold',
  }[size];

  return (
    <div className="inline-flex items-center space-x-2">
      <span
        className={`inline-flex items-center justify-center rounded-lg border shadow-sm ${style.bg} ${style.border} ${style.text} ${sizeClasses}`}
      >
        <span className="relative flex h-2 w-2 mr-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              score >= 61 ? 'bg-rose-400' : score >= 31 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              score >= 61 ? 'bg-rose-500' : score >= 31 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
        </span>
        {score}
        <span className="text-[10px] text-slate-400 font-sans ml-0.5 opacity-70">/100</span>
      </span>
      {showLabel && (
        <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
          {style.level}
        </span>
      )}
    </div>
  );
};

export const RiskLevelBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const getStyle = () => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    }
  };

  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getStyle()}`}
    >
      {level}
    </span>
  );
};
