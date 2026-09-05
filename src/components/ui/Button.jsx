import React from 'react';

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyle =
    'inline-flex items-center justify-center font-mono font-bold transition-all duration-150 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm tracking-wide',
  };

  const variantStyles = {
    default:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/10 shadow-sm',
    bull:
      'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 border border-emerald-400/50',
    bear:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 border border-rose-400/50',
    gold:
      'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/50',
    outline:
      'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/10 hover:text-white',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
