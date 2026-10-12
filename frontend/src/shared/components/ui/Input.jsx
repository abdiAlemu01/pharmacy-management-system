import React from 'react';

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
          error ? 'border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};

