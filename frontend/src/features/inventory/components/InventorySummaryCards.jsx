import React from 'react';

export const InventorySummaryCards = ({ summary = {}, isLoading = false }) => {
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const normalStockCount =
    summary.normalStockCount !== undefined
      ? summary.normalStockCount
      : Math.max(
          0,
          (summary.totalMedicines || 0) -
            (summary.lowStockCount || 0) -
            (summary.excessStockCount || 0) -
            (summary.outOfStockCount || 0)
        );

  const cards = [
    {
      title: 'Total Capital Invested',
      value: formatBirr(summary.totalInventoryCost),
      borderAccent: 'border-emerald-200 bg-linear-to-br from-emerald-50/50 to-white',
      highlight: true,
    },
    {
      title: 'Total Expected Selling Value',
      value: formatBirr(summary.totalSellingValue),
      borderAccent: 'border-blue-100 bg-white',
    },
    {
      title: 'Total Medicines & Units',
      value: `${summary.totalUnits || 0} Units`,
      borderAccent: 'border-slate-200 bg-white',
    },
    {
      title: 'Stock Health Overview',
      customContent: (
        <div className="flex flex-col gap-1 sm:gap-1.5 mt-1 text-[11px] sm:text-xs">
          <div className="flex items-center justify-between text-amber-700 bg-amber-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-amber-200 font-medium">
            <span className="truncate mr-1">Low Stock (1-10<span className="hidden sm:inline"> units</span>)</span>
            <span className="font-bold shrink-0">{summary.lowStockCount || 0}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-emerald-200 font-medium">
            <span className="truncate mr-1">Normal Stock (11-50<span className="hidden sm:inline"> units</span>)</span>
            <span className="font-bold shrink-0">{normalStockCount}</span>
          </div>
          <div className="flex items-center justify-between text-indigo-700 bg-indigo-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-indigo-200 font-medium">
            <span className="truncate mr-1">Excess Stock (&gt; 50<span className="hidden sm:inline"> units</span>)</span>
            <span className="font-bold shrink-0">{summary.excessStockCount || 0}</span>
          </div>
        </div>
      ),
      borderAccent: 'border-slate-200 bg-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-3.5 sm:p-5 rounded-2xl border shadow-xs transition-all hover:shadow-md ${card.borderAccent} ${
            card.highlight ? 'ring-1 ring-emerald-500/20' : ''
          }`}
        >
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide uppercase line-clamp-1 sm:line-clamp-none">
            {card.title}
          </p>
          {isLoading ? (
            <div className="h-8 w-28 bg-slate-200 animate-pulse rounded-md mt-2" />
          ) : card.customContent ? (
            card.customContent
          ) : (
            <h4 className="text-base sm:text-2xl font-extrabold text-slate-900 mt-1 sm:mt-1.5 tracking-tight break-words">
              {card.value}
            </h4>
          )}
        </div>
      ))}
    </div>
  );
};
