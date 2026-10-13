import React from 'react';
import { DollarSign, Package, TrendingUp, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

export const InventorySummaryCards = ({ summary = {}, isLoading = false }) => {
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const cards = [
    {
      title: 'Total Capital Invested (Whole Cost)',
      value: formatBirr(summary.totalInventoryCost),
      subtitle: 'Sum of (Quantity × Purchase Price) across all stock',
      icon: DollarSign,
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderAccent: 'border-emerald-200 bg-linear-to-br from-emerald-50/50 to-white',
      highlight: true,
    },
    {
      title: 'Total Expected Selling Value',
      value: formatBirr(summary.totalSellingValue),
      subtitle: `Est. Gross Return: ${formatBirr(summary.totalEstimatedProfit)}`,
      icon: TrendingUp,
      iconBg: 'bg-blue-100 text-blue-700',
      borderAccent: 'border-blue-100 bg-white',
    },
    {
      title: 'Total Medicines & Units',
      value: `${summary.totalUnits || 0} Units`,
      subtitle: `Across ${summary.totalMedicines || 0} registered medicines`,
      icon: Package,
      iconBg: 'bg-slate-100 text-slate-700',
      borderAccent: 'border-slate-200 bg-white',
    },
    {
      title: 'Stock Health Overview',
      customContent: (
        <div className="flex flex-col gap-1.5 mt-1 text-xs">
          <div className="flex items-center justify-between text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Low Stock (1-10 units)
            </span>
            <span className="font-bold">{summary.lowStockCount || 0}</span>
          </div>
          <div className="flex items-center justify-between text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Excess Stock (≥ 100 units)
            </span>
            <span className="font-bold">{summary.excessStockCount || 0}</span>
          </div>
          <div className="flex items-center justify-between text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock (0 units)
            </span>
            <span className="font-bold">{summary.outOfStockCount || 0}</span>
          </div>
        </div>
      ),
      icon: AlertCircle,
      iconBg: 'bg-amber-100 text-amber-700',
      borderAccent: 'border-slate-200 bg-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border shadow-xs transition-all hover:shadow-md ${card.borderAccent} ${
              card.highlight ? 'ring-1 ring-emerald-500/20' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  {card.title}
                </p>
                {isLoading ? (
                  <div className="h-8 w-28 bg-slate-200 animate-pulse rounded-md mt-2" />
                ) : card.customContent ? (
                  card.customContent
                ) : (
                  <>
                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
                      {card.value}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{card.subtitle}</p>
                  </>
                )}
              </div>
              <div className={`p-2.5 rounded-xl shrink-0 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

