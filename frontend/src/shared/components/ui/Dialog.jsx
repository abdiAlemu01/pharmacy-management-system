import React from 'react';

export const Dialog = ({ isOpen, onClose, title, children, className = '', overlayClassName = '' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 ${overlayClassName}`}
      onClick={onClose}
    >
      <div 
        className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col ${
          className || 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky/Fixed Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 text-sm font-semibold transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 pr-1 -mr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
