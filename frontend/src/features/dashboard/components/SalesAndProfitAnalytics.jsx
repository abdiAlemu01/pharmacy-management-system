import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  PieChart,
  Calendar,
  DollarSign,
  Package,
  Receipt,
} from 'lucide-react';

/**
 * Helper to compute nice ceiling and tick marks for the Y-Axis
 */
function getNiceYScale(maxValue, tickCount = 4) {
  const safeMax = Math.max(maxValue || 0, 10);
  const power = Math.pow(10, Math.floor(Math.log10(safeMax)));
  const fraction = safeMax / power;
  let niceFraction;

  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  const ceiling = niceFraction * power;
  const step = ceiling / tickCount;
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push(Math.round(step * i));
  }
  return { ceiling, ticks };
}

/**
 * Generate Catmull-Rom / Cubic Bezier curve path string for smooth SVG graphs
 */
function createBezierPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const SalesAndProfitAnalytics = ({
  analytics = {},
  businessOverview = {},
  currencySymbol = 'Birr',
  periodLabel = 'Last 7 Days',
  isLoading = false,
}) => {
  // Metric toggle: 'combined' | 'revenue' | 'grossProfit' | 'transactions'
  const [activeMetric, setActiveMetric] = useState('combined');
  // Chart visual style: 'wave' (smooth area spline) | 'bars' (rounded columns)
  const [chartType, setChartType] = useState('wave');
  // Hovered data point index for tooltip and tracking line
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const containerRef = useRef(null);

  const summary = analytics.summary || {};
  const dailyTrend = useMemo(() => analytics.dailyTrend || [], [analytics.dailyTrend]);

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  };

  const formatCompactNum = (val) => {
    const num = parseFloat(val || 0);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    return `${Math.round(num)}`;
  };

  // Find Peak Sales Day
  const peakDay = useMemo(() => {
    if (!dailyTrend.length) return null;
    let max = dailyTrend[0];
    for (const d of dailyTrend) {
      if ((d.revenue || 0) > (max.revenue || 0)) {
        max = d;
      }
    }
    return max;
  }, [dailyTrend]);

  // Overall Gross Profit Margin %
  const grossMarginPct = useMemo(() => {
    const rev = summary.periodRevenue || 0;
    const profit = summary.periodGrossProfit || 0;
    if (rev <= 0) return 0;
    return Math.min(100, Math.max(0, parseFloat(((profit / rev) * 100).toFixed(1))));
  }, [summary.periodRevenue, summary.periodGrossProfit]);

  // Medicine Cost (COGS)
  const costOfGoodsSold = useMemo(() => {
    const rev = summary.periodRevenue || 0;
    const profit = summary.periodGrossProfit || 0;
    return Math.max(0, rev - profit);
  }, [summary.periodRevenue, summary.periodGrossProfit]);

  const cogsPct = useMemo(() => {
    const rev = summary.periodRevenue || 0;
    if (rev <= 0) return 0;
    return Math.min(100, Math.max(0, parseFloat(((costOfGoodsSold / rev) * 100).toFixed(1))));
  }, [summary.periodRevenue, costOfGoodsSold]);

  // Daily Average Revenue
  const dailyAverageRevenue = useMemo(() => {
    if (!dailyTrend.length) return 0;
    return (summary.periodRevenue || 0) / dailyTrend.length;
  }, [dailyTrend, summary.periodRevenue]);

  // SVG Chart Geometry Constants
  const svgWidth = 740;
  const svgHeight = 270;
  const padLeft = 60;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 42;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;
  const baselineY = padTop + plotHeight;

  // Compute maximum value based on active metric
  const rawMax = useMemo(() => {
    if (!dailyTrend.length) return 100;
    if (activeMetric === 'transactions') {
      return Math.max(...dailyTrend.map((d) => d.transactions || 0), 5);
    }
    if (activeMetric === 'grossProfit') {
      return Math.max(...dailyTrend.map((d) => d.grossProfit || 0), 20);
    }
    if (activeMetric === 'revenue') {
      return Math.max(...dailyTrend.map((d) => d.revenue || 0), 20);
    }
    // Combined: max of revenue and gross profit
    return Math.max(
      ...dailyTrend.map((d) => Math.max(d.revenue || 0, d.grossProfit || 0)),
      20
    );
  }, [dailyTrend, activeMetric]);

  const { ceiling: yCeiling, ticks: yTicks } = useMemo(() => {
    return getNiceYScale(rawMax, 4);
  }, [rawMax]);

  // Compute plotted coordinates for each day
  const pointCoords = useMemo(() => {
    const n = dailyTrend.length;
    if (n === 0) return [];

    return dailyTrend.map((item, i) => {
      const x = padLeft + (n === 1 ? plotWidth / 2 : (i / (n - 1)) * plotWidth);

      const revVal = item.revenue || 0;
      const profitVal = item.grossProfit || 0;
      const transVal = item.transactions || 0;

      const revY = baselineY - (revVal / yCeiling) * plotHeight;
      const profitY = baselineY - (profitVal / yCeiling) * plotHeight;
      const transY = baselineY - (transVal / yCeiling) * plotHeight;

      return {
        index: i,
        item,
        x,
        revY: Math.max(padTop, Math.min(baselineY, revY)),
        profitY: Math.max(padTop, Math.min(baselineY, profitY)),
        transY: Math.max(padTop, Math.min(baselineY, transY)),
      };
    });
  }, [dailyTrend, yCeiling, baselineY, plotWidth, plotHeight, padLeft, padTop]);

  // Paths for Revenue
  const revPoints = useMemo(() => pointCoords.map((p) => ({ x: p.x, y: p.revY })), [pointCoords]);
  const revLinePath = useMemo(() => createBezierPath(revPoints), [revPoints]);
  const revAreaPath = useMemo(() => {
    if (!revPoints.length) return '';
    return `${revLinePath} L ${revPoints[revPoints.length - 1].x.toFixed(1)} ${baselineY} L ${revPoints[0].x.toFixed(1)} ${baselineY} Z`;
  }, [revLinePath, revPoints, baselineY]);

  // Paths for Gross Profit
  const profitPoints = useMemo(() => pointCoords.map((p) => ({ x: p.x, y: p.profitY })), [pointCoords]);
  const profitLinePath = useMemo(() => createBezierPath(profitPoints), [profitPoints]);
  const profitAreaPath = useMemo(() => {
    if (!profitPoints.length) return '';
    return `${profitLinePath} L ${profitPoints[profitPoints.length - 1].x.toFixed(1)} ${baselineY} L ${profitPoints[0].x.toFixed(1)} ${baselineY} Z`;
  }, [profitLinePath, profitPoints, baselineY]);

  // Paths for Transactions
  const transPoints = useMemo(() => pointCoords.map((p) => ({ x: p.x, y: p.transY })), [pointCoords]);
  const transLinePath = useMemo(() => createBezierPath(transPoints), [transPoints]);
  const transAreaPath = useMemo(() => {
    if (!transPoints.length) return '';
    return `${transLinePath} L ${transPoints[transPoints.length - 1].x.toFixed(1)} ${baselineY} L ${transPoints[0].x.toFixed(1)} ${baselineY} Z`;
  }, [transLinePath, transPoints, baselineY]);

  // Currently hovered item
  const activeHoverPoint = hoveredIndex !== null && pointCoords[hoveredIndex] ? pointCoords[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* 1. Header Row: Title, Metric Toggle & Chart Style Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>Sales & Profit Analytics</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {periodLabel}
              </span>
            </h3>
          </div>
        </div>

        {/* Action Controls: Metrics & Chart Style Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Metric Selector Pills */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
            {[
              { id: 'combined', label: 'Combined (Sales & Profit)' },
              { id: 'revenue', label: 'Sales Revenue' },
              { id: 'grossProfit', label: 'Gross Profit' },
              { id: 'transactions', label: 'Orders' },
            ].map((m) => {
              const isActive = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMetric(m.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Chart Style Switcher (Wave vs Columns) */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartType('wave')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'wave'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Area Wave Trend"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Wave</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bars')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'bars'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Column Bars"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Columns</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Analytics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Period Revenue */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Period Sales Revenue
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight block mt-1">
            {isLoading ? '...' : formatBirr(summary.periodRevenue)}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
            <span
              className={`inline-flex items-center gap-0.5 ${
                (summary.revenueGrowthPct || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(summary.revenueGrowthPct || 0) >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(summary.revenueGrowthPct || 0)}%
            </span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        {/* Total Period Gross Profit */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Period Gross Profit
          </span>
          <span className="text-lg sm:text-xl font-black text-teal-600 dark:text-teal-400 tracking-tight block mt-1">
            {isLoading ? '...' : formatBirr(summary.periodGrossProfit)}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
            <span
              className={`inline-flex items-center gap-0.5 ${
                (summary.profitGrowthPct || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(summary.profitGrowthPct || 0) >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(summary.profitGrowthPct || 0)}%
            </span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        {/* Peak Sales Day */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Peak Sales Day
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight block mt-1 truncate">
            {peakDay ? formatBirr(peakDay.revenue) : '0.00 ' + currencySymbol}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1 truncate">
            {peakDay ? `${peakDay.weekday}, ${peakDay.label}` : 'No sales registered'}
          </span>
        </div>

        {/* Daily Average Revenue */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daily Average Pace
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight block mt-1">
            {formatBirr(dailyAverageRevenue)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Across {dailyTrend.length} tracked days
          </span>
        </div>
      </div>

      {/* 3. Main Chart & Financial Breakdown Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Main SVG Graph (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative">
          {/* Chart Header Legend & Dynamic Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              {(activeMetric === 'combined' || activeMetric === 'revenue') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Sales Revenue</span>
                </div>
              )}
              {(activeMetric === 'combined' || activeMetric === 'grossProfit') && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs" />
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Gross Profit</span>
                </div>
              )}
              {activeMetric === 'transactions' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Sales Transactions</span>
                </div>
              )}
            </div>

            <span className="text-[11px] font-bold text-slate-400">
              Hover over graph points for detailed daily breakdown
            </span>
          </div>

          {/* SVG Chart Area */}
          <div className="relative w-full pt-3" ref={containerRef}>
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Generating precision analytics graph...</span>
              </div>
            ) : dailyTrend.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <span>No sales records found for this period.</span>
              </div>
            ) : (
              <div className="relative">
                {/* Floating Glassmorphic Tooltip on Hover */}
                {activeHoverPoint && (
                  <div
                    className="absolute z-30 pointer-events-none transition-all duration-75"
                    style={{
                      left: `${(activeHoverPoint.x / svgWidth) * 100}%`,
                      top: '10px',
                      transform:
                        activeHoverPoint.x > svgWidth * 0.75
                          ? 'translateX(-95%)'
                          : activeHoverPoint.x < svgWidth * 0.25
                          ? 'translateX(0%)'
                          : 'translateX(-50%)',
                    }}
                  >
                    <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-700/80 text-xs min-w-[190px] space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 font-bold text-[11px] text-slate-300">
                        <span>{activeHoverPoint.item.weekday}, {activeHoverPoint.item.label}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px]">
                          {activeHoverPoint.item.transactions || 0} orders
                        </span>
                      </div>

                      <div className="space-y-1 pt-0.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Revenue:</span>
                          </span>
                          <strong className="text-emerald-400 font-extrabold">
                            {formatBirr(activeHoverPoint.item.revenue)}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span>Gross Profit:</span>
                          </span>
                          <strong className="text-indigo-300 font-extrabold">
                            {formatBirr(activeHoverPoint.item.grossProfit)}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between text-slate-400 text-[10px] pt-0.5 border-t border-slate-800">
                          <span>Medicine Cost (COGS):</span>
                          <span>{formatBirr(Math.max(0, activeHoverPoint.item.revenue - activeHoverPoint.item.grossProfit))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* The Responsive SVG */}
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    {/* Emerald Linear Gradient for Revenue */}
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                      <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Indigo Linear Gradient for Gross Profit */}
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                      <stop offset="70%" stopColor="#6366f1" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Blue Linear Gradient for Transactions */}
                    <linearGradient id="transGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Guidelines and Y-Axis Ticks */}
                  {yTicks.map((tickVal) => {
                    const y = baselineY - (tickVal / yCeiling) * plotHeight;
                    return (
                      <g key={tickVal}>
                        {/* Guideline */}
                        <line
                          x1={padLeft}
                          y1={y}
                          x2={svgWidth - padRight}
                          y2={y}
                          stroke="currentColor"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                          className="text-slate-200 dark:text-slate-800"
                        />
                        {/* Y-Axis Label */}
                        <text
                          x={padLeft - 8}
                          y={y + 3.5}
                          textAnchor="end"
                          className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500"
                        >
                          {formatCompactNum(tickVal)}
                        </text>
                      </g>
                    );
                  })}

                  {/* X-Axis Baseline */}
                  <line
                    x1={padLeft}
                    y1={baselineY}
                    x2={svgWidth - padRight}
                    y2={baselineY}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-slate-300 dark:text-slate-700"
                  />

                  {/* WAVE MODE RENDERING */}
                  {chartType === 'wave' && (
                    <>
                      {/* Revenue Area & Line */}
                      {(activeMetric === 'combined' || activeMetric === 'revenue') && (
                        <g>
                          <path d={revAreaPath} fill="url(#revenueGradient)" />
                          <path
                            d={revLinePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      )}

                      {/* Gross Profit Area & Line */}
                      {(activeMetric === 'combined' || activeMetric === 'grossProfit') && (
                        <g>
                          <path d={profitAreaPath} fill="url(#profitGradient)" />
                          <path
                            d={profitLinePath}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      )}

                      {/* Transactions Area & Line */}
                      {activeMetric === 'transactions' && (
                        <g>
                          <path d={transAreaPath} fill="url(#transGradient)" />
                          <path
                            d={transLinePath}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      )}

                      {/* Data Point Dots */}
                      {pointCoords.map((p) => {
                        const isHovered = hoveredIndex === p.index;
                        return (
                          <g key={p.index}>
                            {/* Revenue Point */}
                            {(activeMetric === 'combined' || activeMetric === 'revenue') && (
                              <circle
                                cx={p.x}
                                cy={p.revY}
                                r={isHovered ? 6 : 3.5}
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 2.5 : 1.5}
                                className="transition-all duration-150"
                              />
                            )}

                            {/* Gross Profit Point */}
                            {(activeMetric === 'combined' || activeMetric === 'grossProfit') && (
                              <circle
                                cx={p.x}
                                cy={p.profitY}
                                r={isHovered ? 5.5 : 3}
                                fill="#6366f1"
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 2 : 1.5}
                                className="transition-all duration-150"
                              />
                            )}

                            {/* Transactions Point */}
                            {activeMetric === 'transactions' && (
                              <circle
                                cx={p.x}
                                cy={p.transY}
                                r={isHovered ? 6 : 3.5}
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 2.5 : 1.5}
                                className="transition-all duration-150"
                              />
                            )}
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* COLUMN BARS MODE RENDERING */}
                  {chartType === 'bars' && (
                    <g>
                      {pointCoords.map((p) => {
                        const isHovered = hoveredIndex === p.index;
                        const availableWidth = plotWidth / pointCoords.length;

                        if (activeMetric === 'combined') {
                          // Dual Bars side-by-side
                          const barWidth = Math.max(4, Math.min(18, availableWidth * 0.32));
                          const revHeight = baselineY - p.revY;
                          const profitHeight = baselineY - p.profitY;

                          return (
                            <g key={p.index}>
                              {/* Revenue Bar */}
                              <rect
                                x={p.x - barWidth - 1}
                                y={p.revY}
                                width={barWidth}
                                height={Math.max(2, revHeight)}
                                rx={4}
                                fill={isHovered ? '#059669' : '#10b981'}
                                className="transition-all duration-150"
                              />
                              {/* Gross Profit Bar */}
                              <rect
                                x={p.x + 1}
                                y={p.profitY}
                                width={barWidth}
                                height={Math.max(2, profitHeight)}
                                rx={4}
                                fill={isHovered ? '#4f46e5' : '#6366f1'}
                                className="transition-all duration-150"
                              />
                            </g>
                          );
                        }

                        // Single Bar Mode
                        const barWidth = Math.max(6, Math.min(32, availableWidth * 0.55));
                        const activeY =
                          activeMetric === 'grossProfit'
                            ? p.profitY
                            : activeMetric === 'transactions'
                            ? p.transY
                            : p.revY;
                        const barHeight = baselineY - activeY;
                        const barColor =
                          activeMetric === 'grossProfit'
                            ? isHovered ? '#4f46e5' : '#6366f1'
                            : activeMetric === 'transactions'
                            ? isHovered ? '#2563eb' : '#3b82f6'
                            : isHovered ? '#059669' : '#10b981';

                        return (
                          <rect
                            key={p.index}
                            x={p.x - barWidth / 2}
                            y={activeY}
                            width={barWidth}
                            height={Math.max(2, barHeight)}
                            rx={5}
                            fill={barColor}
                            className="transition-all duration-150"
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* Active Hover Crosshair Line */}
                  {activeHoverPoint && (
                    <line
                      x1={activeHoverPoint.x}
                      y1={padTop}
                      x2={activeHoverPoint.x}
                      y2={baselineY}
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                      className="text-slate-400 dark:text-slate-500 pointer-events-none"
                    />
                  )}

                  {/* X-Axis Labels (Date & Weekday) */}
                  {pointCoords.map((p, i) => {
                    // In 30-day view, show every other or every 3rd label to avoid crowding
                    const skip = pointCoords.length > 15 ? i % 3 !== 0 && i !== pointCoords.length - 1 : false;
                    if (skip) return null;

                    return (
                      <g key={p.index} transform={`translate(${p.x}, ${baselineY + 14})`}>
                        <text
                          textAnchor="middle"
                          className="text-[10px] font-extrabold fill-slate-700 dark:fill-slate-300"
                        >
                          {p.item.label || p.item.weekday}
                        </text>
                        <text
                          y="11"
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500"
                        >
                          {p.item.weekday}
                        </text>
                      </g>
                    );
                  })}

                  {/* Transparent Interactive Hover Slices across the full chart */}
                  {pointCoords.map((p, i) => {
                    const sliceWidth = plotWidth / pointCoords.length;
                    return (
                      <rect
                        key={i}
                        x={p.x - sliceWidth / 2}
                        y={padTop}
                        width={sliceWidth}
                        height={plotHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Composition & Margin Breakdown Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Financial Distribution</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Period Ratio</span>
            </div>

            {/* Circular Margin Gauge + Status */}
            <div className="pt-3 pb-2 flex items-center justify-center gap-5">
              {/* Circular SVG Ring Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  {/* Active Progress Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 - ((grossMarginPct || 0) / 100) * (2 * Math.PI * 40)
                    }
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">
                    {grossMarginPct}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                    Margin
                  </span>
                </div>
              </div>

              {/* Benchmark Assessment Status */}
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                  Gross Profit Margin
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    grossMarginPct >= 20
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : grossMarginPct >= 10
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {grossMarginPct >= 20
                    ? 'Healthy Margin ✨'
                    : grossMarginPct >= 10
                    ? 'Moderate Margin'
                    : 'Low Margin Attention'}
                </span>
                <span className="text-[11px] text-slate-400 block font-normal">
                  Pharmacy industry benchmark: 18% – 25%
                </span>
              </div>
            </div>

            {/* Revenue Allocation Split Bar Chart */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Revenue Allocation Breakdown</span>
                <span className="text-[11px] font-normal text-slate-400">100% Total</span>
              </div>

              {/* Segmented Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${cogsPct}%` }}
                  className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-500"
                  title={`Medicine Cost (COGS): ${cogsPct}%`}
                />
                <div
                  style={{ width: `${grossMarginPct}%` }}
                  className="h-full bg-emerald-500 transition-all duration-500"
                  title={`Gross Profit: ${grossMarginPct}%`}
                />
              </div>

              {/* Legend with exact amounts */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Medicine Cost:</span>
                  </div>
                  <strong className="text-slate-900 dark:text-slate-100 block mt-0.5 text-xs">
                    {formatBirr(costOfGoodsSold)}
                  </strong>
                  <span className="text-[10px] text-slate-400">{cogsPct}% of revenue</span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Gross Profit:</span>
                  </div>
                  <strong className="text-emerald-700 dark:text-emerald-300 block mt-0.5 text-xs">
                    {formatBirr(summary.periodGrossProfit)}
                  </strong>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                    {grossMarginPct}% retained
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Efficiency Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Avg Order Value
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block mt-0.5">
                {formatBirr(summary.avgTransactionValue)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Units Dispensed
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block mt-0.5">
                {summary.periodUnitsSold || 0} packs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
