import React from 'react';
import { useRisk } from '../../context/RiskContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useRisk();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40 bg-emerald-950/80 shadow-[0_4px_20px_rgba(16,185,129,0.15)]';
      case 'error':
        return 'border-rose-500/40 bg-rose-950/80 shadow-[0_4px_20px_rgba(239,68,68,0.15)]';
      case 'warning':
        return 'border-amber-500/40 bg-amber-950/80 shadow-[0_4px_20px_rgba(245,158,11,0.15)]';
      default:
        return 'border-cyan-500/40 bg-slate-900/90 shadow-[0_4px_20px_rgba(6,182,212,0.15)]';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-md text-slate-100 ${getBorder()}`}
      >
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.desc}</p>
        </div>
      </div>
    </div>
  );
};
