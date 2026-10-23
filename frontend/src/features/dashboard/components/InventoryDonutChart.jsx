import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export const InventoryDonutChart = ({ stockDistribution }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const total = stockDistribution?.total || 0;
  const totalUnits = stockDistribution?.totalUnits || 0;
  const excess = stockDistribution?.excess || { count: 0, percentage: 0 };
  const normal = stockDistribution?.normal || { count: 0, percentage: 0 };
  const low = stockDistribution?.low || { count: 0, percentage: 0 };

  // SVG Donut calculations
  // Radius = 60, circumference = 2 * PI * 60 = ~376.99
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  // Compute strokes
  const excessStroke = (excess.percentage / 100) * circumference;
  const normalStroke = (normal.percentage / 100) * circumference;
  const lowStroke = (low.percentage / 100) * circumference;

  // Offsets
  const excessOffset = 0;
  const normalOffset = -(excessStroke);
  const lowOffset = -(excessStroke + normalStroke);

  const activeData = hoveredCategory
    ? stockDistribution[hoveredCategory]
    : { label: 'Total Medicines', count: total, percentage: 100, description: 'All items currently in inventory' };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Inventory Stock Levels
        </h3>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
          {total} Medicines ({totalUnits} Units)
        </span>
      </div>

      {/* Donut Chart & Legend Area */}
      <div className="py-4 flex flex-col md:flex-row items-center justify-center gap-6">
        {/* SVG Donut Circle */}
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="18"
              stroke="currentColor"
              fill="transparent"
            />

            {/* Excess Stock Arc (Indigo) */}
            {excess.count > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#6366f1"
                strokeWidth={hoveredCategory === 'excess' ? '22' : '18'}
                strokeDasharray={`${excessStroke} ${circumference}`}
                strokeDashoffset={excessOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCategory('excess')}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            )}

            {/* Normal Stock Arc (Emerald) */}
            {normal.count > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#10b981"
                strokeWidth={hoveredCategory === 'normal' ? '22' : '18'}
                strokeDasharray={`${normalStroke} ${circumference}`}
                strokeDashoffset={normalOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCategory('normal')}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            )}

            {/* Low Stock Arc (Amber) */}
            {low.count > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#f59e0b"
                strokeWidth={hoveredCategory === 'low' ? '22' : '18'}
                strokeDasharray={`${lowStroke} ${circumference}`}
                strokeDashoffset={lowOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCategory('low')}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            )}
          </svg>

          {/* Center Text Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[110px]">
              {hoveredCategory ? activeData.label : 'In Stock'}
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {hoveredCategory ? activeData.count : totalUnits}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {hoveredCategory ? `${activeData.percentage}% of stock` : `${total} medicines`}
            </span>
          </div>
        </div>

        {/* Legend Cards */}
        <div className="flex-1 space-y-2.5 w-full max-w-sm">
          {/* 1. Excess Stock */}
          <div
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              hoveredCategory === 'excess'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-700 shadow-xs scale-102'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
            }`}
            onMouseEnter={() => setHoveredCategory('excess')}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Stock exceeds &ge; 50 units
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {excess.count}
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  ({excess.percentage}%)
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
              Stock exceeds target level (&gt; 50 units)
            </p>
          </div>

          {/* 2. Normal Stock */}
          <div
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              hoveredCategory === 'normal'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 shadow-xs scale-102'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
            onMouseEnter={() => setHoveredCategory('normal')}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Normal Stock (11-50)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {normal.count}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ({normal.percentage}%)
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
              Safe inventory range (11 - 50 units)
            </p>
          </div>

          {/* 3. Low in Stock */}
          <div
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              hoveredCategory === 'low'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 shadow-xs scale-102'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
            onMouseEnter={() => setHoveredCategory('low')}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Low Stock (1-10)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
                  {low.count}
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  ({low.percentage}%)
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
              At or below reorder threshold (&le; 10 units)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

