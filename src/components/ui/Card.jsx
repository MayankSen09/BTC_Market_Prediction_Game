import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`command-panel p-4 flex flex-col gap-3 text-slate-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between border-b border-white/5 pb-2 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xs font-mono font-bold uppercase tracking-wider text-slate-300 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>;
}
