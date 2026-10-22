import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const SalesAnalyticsCards = ({
  analytics = {},
  isLoading = false,
  onCardClick,
  activeFilter = null,
}) => {
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const daily = analytics.daily || {};
  const monthly = analytics.monthly || {};

  const cards = [
    {
      key: 'DAILY_SELL',
      title: 'Total Daily Sell',
      value: formatBirr(daily.totalSell),
      borderAccent: 'border-emerald-200 bg-linear-to-br from-emerald-50/60 to-white',
      badge: 'Today',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      activeRing: 'ring-2 ring-emerald-500 shadow-md ring-offset-1 border-emerald-400',
    },
    {
      key: 'DAILY_PROFIT',
      title: 'Total Daily Profit',
      value: formatBirr(daily.totalProfit),
      borderAccent: 'border-blue-200 bg-linear-to-br from-blue-50/60 to-white',
      badge: 'Daily Profit',
      badgeColor: 'bg-blue-100 text-blue-800',
      activeRing: 'ring-2 ring-blue-500 shadow-md ring-offset-1 border-blue-400',
    },
    {
      key: 'MONTHLY_SELL',
      title: 'Total Monthly Sell',
      value: formatBirr(monthly.totalSell),
      borderAccent: 'border-indigo-200 bg-linear-to-br from-indigo-50/60 to-white',
      badge: 'This Month',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      activeRing: 'ring-2 ring-indigo-500 shadow-md ring-offset-1 border-indigo-400',
    },
    {
      key: 'MONTHLY_PROFIT',
      title: 'Total Monthly Profit',
      value: formatBirr(monthly.totalProfit),
      borderAccent: 'border-purple-200 bg-linear-to-br from-purple-50/60 to-white',
      badge: 'Monthly Profit',
      badgeColor: 'bg-purple-100 text-purple-800',
      activeRing: 'ring-2 ring-purple-500 shadow-md ring-offset-1 border-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const isActive = activeFilter === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onCardClick?.(card.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCardClick?.(card.key);
              }
            }}
            title={`${card.title} — Click to view content`}
            className={`p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none ${
              isActive ? card.activeRing : card.borderAccent
            }`}
          >
            <div>
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

            {/* Bottom Action Footer */}
            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                <span>View content</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>

              {isActive ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Filtered</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to open
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
