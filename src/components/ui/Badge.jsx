import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    bull: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
    bear: 'bg-rose-950/80 text-rose-400 border-rose-500/40',
    gold: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    blue: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Progress({ value = 50, bullValue, bearValue, className = '' }) {
  if (bullValue !== undefined && bearValue !== undefined) {
    const total = bullValue + bearValue || 1;
    const bullPct = (bullValue / total) * 100;
    return (
      <div className={`w-full h-2 bg-slate-900 rounded-full overflow-hidden flex border border-white/10 ${className}`}>
        <div
          className="bg-bull transition-all duration-300 h-full"
          style={{ width: `${bullPct}%` }}
        />
        <div
          className="bg-bear transition-all duration-300 h-full"
          style={{ width: `${100 - bullPct}%` }}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10 ${className}`}>
      <div
        className="bg-emerald-500 h-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
