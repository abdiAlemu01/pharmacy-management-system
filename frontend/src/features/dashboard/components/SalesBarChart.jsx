import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, Calendar, Info } from 'lucide-react';

export const SalesBarChart = ({
  salesTrend,
  currencySymbol = 'ETB',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const daily = salesTrend?.daily || [];
  const total7DaySales = salesTrend?.total7DaySales || 0;
  const avgDailySales = salesTrend?.avgDailySales || 0;
  const highestDay = salesTrend?.highestDay || null;

  const formatCurrency = (val) => {
    return `${currencySymbol} ${parseFloat(Number(val || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Find max sales to scale bars accurately
  const maxSales = Math.max(...daily.map((d) => d.sales), 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      {/* Header with Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              7-Day Daily Sales Trend
            </h3>
            {/* Feature source badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ShoppingBag className="w-3 h-3" />
              <span>Feature source: Sales/POS</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daily revenue performance captured from completed POS terminal sales
          </p>
        </div>

        {/* 7-Day Stats Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] font-medium">7-Day Total</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(total7DaySales)}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] font-medium">Daily Avg</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(avgDailySales)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="py-6">
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
          {daily.map((item, idx) => {
            const heightPercent = maxSales > 0 ? Math.max((item.sales / maxSales) * 100, 4) : 4;
            const isHovered = hoveredIndex === idx;
            const isPeak = highestDay && highestDay.date === item.date && item.sales > 0;

            return (
              <div
                key={item.date || idx}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xl whitespace-nowrap pointer-events-none transition-all animate-in fade-in zoom-in-95">
                    <div className="font-extrabold">{item.formattedDate || item.date}</div>
                    <div className="text-emerald-400 dark:text-emerald-600 font-bold">
                      {formatCurrency(item.sales)}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {item.transactions} {item.transactions === 1 ? 'sale' : 'sales'} • Profit: {formatCurrency(item.profit)}
                    </div>
                  </div>
                )}

                {/* Peak day badge indicator */}
                {isPeak && !isHovered && (
                  <span className="absolute -top-6 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                    Peak
                  </span>
                )}

                {/* The Bar */}
                <div className="w-full max-w-[46px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full transition-all duration-500 rounded-t-xl ${
                      isPeak
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm'
                        : isHovered
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-emerald-500/85 dark:bg-emerald-600/80 group-hover:bg-emerald-600'
                    }`}
                  />
                </div>

                {/* X-axis labels */}
                <div className="mt-3 text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {item.dayName}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {item.formattedDate ? item.formattedDate.split(' ')[1] : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info note */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Hover over any bar to view exact sales count and profit.</span>
        </div>
        {highestDay && highestDay.sales > 0 && (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Peak: {highestDay.dayName} ({formatCurrency(highestDay.sales)})
          </span>
        )}
      </div>
    </div>
  );
};

