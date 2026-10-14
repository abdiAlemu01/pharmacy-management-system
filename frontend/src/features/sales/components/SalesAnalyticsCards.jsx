import React from 'react';

export const SalesAnalyticsCards = ({ analytics = {}, isLoading = false }) => {
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const daily = analytics.daily || {};
  const monthly = analytics.monthly || {};

  const cards = [
    {
      title: 'Total Daily Sell',
      value: formatBirr(daily.totalSell),
      borderAccent: 'border-emerald-200 bg-linear-to-br from-emerald-50/60 to-white',
      badge: 'Today',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Total Daily Profit',
      value: formatBirr(daily.totalProfit),
      borderAccent: 'border-blue-200 bg-linear-to-br from-blue-50/60 to-white',
      badge: 'Daily Profit',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Total Monthly Sell',
      value: formatBirr(monthly.totalSell),
      borderAccent: 'border-indigo-200 bg-linear-to-br from-indigo-50/60 to-white',
      badge: 'This Month',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Total Monthly Profit',
      value: formatBirr(monthly.totalProfit),
      borderAccent: 'border-purple-200 bg-linear-to-br from-purple-50/60 to-white',
      badge: 'Monthly Profit',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl border shadow-xs transition-all hover:shadow-md ${card.borderAccent}`}
        >
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">
            {card.title}
          </h4>
          {isLoading ? (
            <div className="h-7 w-28 bg-slate-200 animate-pulse rounded-md mt-1.5" />
          ) : (
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {card.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
