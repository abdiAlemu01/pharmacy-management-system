import React from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Calendar, Award, ArrowDownRight } from 'lucide-react';

export const SalesAnalyticsCards = ({ analytics = {}, isLoading = false }) => {
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const daily = analytics.daily || {};
  const monthly = analytics.monthly || {};

  const dailyProfitMargin = daily.totalSell > 0
    ? ((daily.totalProfit / daily.totalSell) * 100).toFixed(1)
    : '0.0';

  const monthlyProfitMargin = monthly.totalSell > 0
    ? ((monthly.totalProfit / monthly.totalSell) * 100).toFixed(1)
    : '0.0';

  const cards = [
    {
      title: 'Total Daily Sell',
      value: formatBirr(daily.totalSell),
      subtext: `${daily.transactions || 0} transactions (${daily.unitsSold || 0} units sold today)`,
      icon: DollarSign,
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderAccent: 'border-emerald-200 bg-linear-to-br from-emerald-50/60 to-white',
      badge: 'Today',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Total Daily Profit',
      value: formatBirr(daily.totalProfit),
      subtext: `Based on units sold (${dailyProfitMargin}% profit margin)`,
      icon: TrendingUp,
      iconBg: 'bg-blue-100 text-blue-700',
      borderAccent: 'border-blue-200 bg-linear-to-br from-blue-50/60 to-white',
      badge: 'Daily Profit',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Total Monthly Sell',
      value: formatBirr(monthly.totalSell),
      subtext: `${monthly.transactions || 0} transactions (${monthly.unitsSold || 0} units sold this month)`,
      icon: Calendar,
      iconBg: 'bg-indigo-100 text-indigo-700',
      borderAccent: 'border-indigo-200 bg-linear-to-br from-indigo-50/60 to-white',
      badge: 'This Month',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Total Monthly Profit',
      value: formatBirr(monthly.totalProfit),
      subtext: `Based on units sold (${monthlyProfitMargin}% profit margin)`,
      icon: Award,
      iconBg: 'bg-purple-100 text-purple-700',
      borderAccent: 'border-purple-200 bg-linear-to-br from-purple-50/60 to-white',
      badge: 'Monthly Profit',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border shadow-xs transition-all hover:shadow-md ${card.borderAccent}`}
          >
            <div className="flex items-start justify-between">
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
                  <>
                    <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {card.subtext}
                    </p>
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

