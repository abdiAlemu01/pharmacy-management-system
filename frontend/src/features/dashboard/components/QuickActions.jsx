import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Pill,
  Truck,
  Boxes,
  CreditCard,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'newSale',
      title: 'New Sale',
      desc: 'Open POS terminal',
      icon: ShoppingCart,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-teal-600',
      path: '/sales',
      badge: 'POS',
    },
    {
      id: 'addMedicine',
      title: 'Add Medicine',
      desc: 'Register drug catalog item',
      icon: Pill,
      color: 'blue',
      bgGradient: 'from-blue-500 to-indigo-600',
      path: '/medicines',
      badge: 'Catalog',
    },
    {
      id: 'recordPurchase',
      title: 'Record Purchase',
      desc: 'Log supplier purchase order',
      icon: Truck,
      color: 'purple',
      bgGradient: 'from-purple-500 to-pink-600',
      path: '/purchases',
      badge: 'Supplier',
    },
    {
      id: 'addStock',
      title: 'Add Stock',
      desc: 'Receive medicine batches',
      icon: Boxes,
      color: 'amber',
      bgGradient: 'from-amber-500 to-orange-600',
      path: '/inventory',
      badge: 'Batches',
    },
    {
      id: 'recordExpense',
      title: 'Record Expense',
      desc: 'Track operational bills',
      icon: CreditCard,
      color: 'rose',
      bgGradient: 'from-rose-500 to-red-600',
      path: '/expenses',
      badge: 'Finance',
    },
    {
      id: 'viewReports',
      title: 'View Reports',
      desc: 'Sales & profit analytics',
      icon: BarChart3,
      color: 'teal',
      bgGradient: 'from-teal-600 to-cyan-600',
      path: '/reports',
      badge: 'Insights',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
         Quick Actions & Shortcuts
        </h2>
        <span className="text-xs text-slate-400 font-medium">Click operational tasks</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => navigate(act.path)}
              className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${act.bgGradient} text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {act.badge}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {act.desc}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                <span>Launch</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

