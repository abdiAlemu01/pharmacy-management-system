import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  AlertOctagon,
  Clock,
  Truck,
  CreditCard,
  RotateCcw,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const BusinessInsightsAndPendingTasks = ({
  insights = {},
  currencySymbol = 'Birr',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('bestSellers');

  const {
    bestSelling = [],
    slowMoving = [],
    unpaidInvoices = [],
    pendingDeliveries = [],
    unpaidExpenses = [],
    recentReturns = [],
  } = insights;

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  };

  const categories = [
    { id: 'bestSellers', label: 'Best Sellers', count: bestSelling.length, icon: TrendingUp, color: 'emerald' },
    { id: 'slowMoving', label: 'Dead / Slow Stock', count: slowMoving.length, icon: AlertOctagon, color: 'rose' },
    { id: 'unpaidInvoices', label: 'Unpaid Suppliers', count: unpaidInvoices.length, icon: Truck, color: 'amber' },
    { id: 'pendingDeliveries', label: 'Pending Deliveries', count: pendingDeliveries.length, icon: Clock, color: 'blue' },
    { id: 'unpaidExpenses', label: 'Unpaid Expenses', count: unpaidExpenses.length, icon: CreditCard, color: 'purple' },
    { id: 'recentReturns', label: 'Returns & Write-Offs', count: recentReturns.length, icon: RotateCcw, color: 'slate' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Business Insights & Pending Tasks
            </h3>
            <p className="text-xs text-slate-400">
              Proactive alerts and tasks owners often overlook
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          {categories.map((c) => {
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{c.label}</span>
                {c.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    {c.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category 1: Best Selling Medicines */}
      {activeCategory === 'bestSellers' && (
        <div className="space-y-2">
          {bestSelling.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-xs">No sales recorded in this period.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {bestSelling.map((med, idx) => (
                <div
                  key={med.medicineId}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {med.medicineName}
                      </h5>
                      <span className="text-[11px] text-slate-400 block">
                        {med.unitsSold} units sold &bull; Stock: {med.currentStock}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                      {formatBirr(med.revenue)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      +{formatBirr(med.profit)} profit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category 2: Dead Stock / Slow-Moving Medicines */}
      {activeCategory === 'slowMoving' && (
        <div className="space-y-2">
          {slowMoving.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-xs">
              Excellent inventory velocity! No dead stock detected in the last 30 days.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  The following medicines have sitting stock with <strong>zero customer sales in 30+ days</strong>. Consider promotions or returning to supplier to unlock trapped capital.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {slowMoving.map((m) => (
                  <div
                    key={m.medicineId}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                        {m.name}
                      </h5>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {m.currentStock} units in stock &bull; Unit cost: {formatBirr(m.unitCost)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Trapped Capital</span>
                      <span className="text-xs font-black text-rose-600">
                        {formatBirr(m.trappedCapital)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category 3: Unpaid Supplier Invoices */}
      {activeCategory === 'unpaidInvoices' && (
        <div className="space-y-2">
          {unpaidInvoices.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-xs">All supplier invoices are paid in full! No outstanding debt.</p>
          ) : (
            <div className="space-y-2">
              {unpaidInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">{inv.supplierName}</strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Invoice: {inv.invoiceNo || inv.purchaseOrderNo} &bull; Total: {formatBirr(inv.totalCost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">Balance Due</span>
                      <strong className="text-xs text-rose-600">{formatBirr(inv.amountDue)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/purchases')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Pay Bill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category 4: Pending Deliveries */}
      {activeCategory === 'pendingDeliveries' && (
        <div className="space-y-2">
          {pendingDeliveries.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-xs">No purchase orders currently awaiting delivery.</p>
          ) : (
            <div className="space-y-2">
              {pendingDeliveries.map((del) => (
                <div
                  key={del.id}
                  className="p-3 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">{del.supplierName}</strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Order: {del.purchaseOrderNo || del.invoiceNo} &bull; Total Value: {formatBirr(del.totalCost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950">
                      Awaiting Shipment
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/purchases')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Receive Batch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category 5: Unpaid Expenses */}
      {activeCategory === 'unpaidExpenses' && (
        <div className="space-y-2">
          {unpaidExpenses.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-xs">All recorded operating expenses have been settled.</p>
          ) : (
            <div className="space-y-2">
              {unpaidExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">{exp.title || exp.category}</strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Category: {exp.category} &bull; Payee: {exp.payee || 'Vendor'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase block">Due</span>
                      <strong className="text-xs text-rose-600">{formatBirr(exp.amountDue)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/expenses')}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Settle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category 6: Recent Returns & Write-Offs */}
      {activeCategory === 'recentReturns' && (
        <div className="space-y-2">
          {recentReturns.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-xs">No damaged, returned, or written-off stock records.</p>
          ) : (
            <div className="space-y-1.5">
              {recentReturns.map((ret) => (
                <div
                  key={ret.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">{ret.medicineName}</strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Reason: {ret.reason || 'Inventory Adjustment'} &bull; Logged by: {ret.userName || 'Staff'}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950">
                    -{ret.quantity} units ({ret.type})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

