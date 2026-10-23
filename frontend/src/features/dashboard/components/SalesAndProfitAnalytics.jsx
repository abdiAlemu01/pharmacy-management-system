import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Receipt,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';

export const SalesAndProfitAnalytics = ({
  analytics = {},
  currencySymbol = 'Birr',
  periodLabel = 'Last 7 Days',
  isLoading = false,
}) => {
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'grossProfit' | 'transactions'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const summary = analytics.summary || {};
  const dailyTrend = analytics.dailyTrend || [];

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  };

  // Determine max value for chart scaling
  const maxValue = useMemo(() => {
    if (!dailyTrend.length) return 100;
    const vals = dailyTrend.map((d) => d[activeMetric] || 0);
    const max = Math.max(...vals, 10);
    return max * 1.15; // 15% headroom
  }, [dailyTrend, activeMetric]);

  const activeColor = useMemo(() => {
    if (activeMetric === 'revenue') return { stroke: '#059669', fill: 'rgba(16, 185, 129, 0.15)', bar: 'bg-emerald-500' };
    if (activeMetric === 'grossProfit') return { stroke: '#0d9488', fill: 'rgba(20, 184, 166, 0.15)', bar: 'bg-teal-500' };
    return { stroke: '#2563eb', fill: 'rgba(37, 99, 235, 0.15)', bar: 'bg-blue-500' };
  }, [activeMetric]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Row: Title & Metric Toggle Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Sales & Profit Analytics
              </h3>
              <p className="text-xs text-slate-400">
                Period: <strong>{periodLabel}</strong> &bull; Compared to previous period
              </p>
            </div>
          </div>
        </div>

        {/* Metric Switcher Pills */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold self-start sm:self-auto">
          {[
            { id: 'revenue', label: 'Sales Revenue' },
            { id: 'grossProfit', label: 'Gross Profit' },
            { id: 'transactions', label: 'Transactions' },
          ].map((m) => {
            const isActive = activeMetric === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMetric(m.id)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Comparison Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Period Revenue
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight block mt-1">
            {formatBirr(summary.periodRevenue)}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
            <span
              className={`inline-flex items-center gap-0.5 ${
                summary.revenueGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summary.revenueGrowthPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(summary.revenueGrowthPct || 0)}%
            </span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Period Gross Profit
          </span>
          <span className="text-lg sm:text-xl font-black text-teal-600 dark:text-teal-400 tracking-tight block mt-1">
            {formatBirr(summary.periodGrossProfit)}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
            <span
              className={`inline-flex items-center gap-0.5 ${
                summary.profitGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summary.profitGrowthPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(summary.profitGrowthPct || 0)}%
            </span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Orders
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight block mt-1">
            {summary.periodTransactions || 0}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
            <span
              className={`inline-flex items-center gap-0.5 ${
                summary.transactionsGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summary.transactionsGrowthPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(summary.transactionsGrowthPct || 0)}%
            </span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg. Order Value
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight block mt-1">
            {formatBirr(summary.avgTransactionValue)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {summary.periodUnitsSold || 0} units dispensed
          </span>
        </div>
      </div>

      {/* Interactive Bar Chart Visualization */}
      <div className="pt-2">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-bold">
            Loading analytics graph...
          </div>
        ) : dailyTrend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            No sales recorded in this period.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visual Column / Bar Chart with responsive flex bars */}
            <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              {dailyTrend.map((item, idx) => {
                const val = item[activeMetric] || 0;
                const heightPct = Math.max(8, Math.min(100, Math.round((val / maxValue) * 100)));
                const isHovered = hoveredPoint === idx;

                return (
                  <div
                    key={item.date || idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-20 animate-in fade-in zoom-in-95 duration-100">
                        <span>{item.label}: </span>
                        <strong className="text-emerald-400">
                          {activeMetric === 'transactions' ? `${val} orders` : formatBirr(val)}
                        </strong>
                      </div>
                    )}

                    {/* Bar Pill */}
                    <div className="w-full max-w-[42px] h-full flex items-end justify-center">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 relative ${
                          isHovered
                            ? 'bg-emerald-600 scale-105 shadow-md'
                            : activeMetric === 'grossProfit'
                            ? 'bg-teal-500/85 hover:bg-teal-600'
                            : activeMetric === 'transactions'
                            ? 'bg-blue-500/85 hover:bg-blue-600'
                            : 'bg-emerald-500/85 hover:bg-emerald-600'
                        }`}
                      >
                        {val > 0 && (
                          <span className="hidden group-hover:block absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                            {activeMetric === 'transactions' ? val : Math.round(val)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Label (Day or date) */}
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 truncate w-full text-center">
                      {item.label || item.weekday}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

