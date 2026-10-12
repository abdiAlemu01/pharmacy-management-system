import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', disabled, ...props }) => {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50',
  };

  return (
    <button
      disabled={disabled}
      className={`px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

