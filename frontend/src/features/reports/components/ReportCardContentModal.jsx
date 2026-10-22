import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  Boxes,
  AlertTriangle,
  Clock,
  Ban,
  Truck,
  CheckCircle2,
  AlertCircle,
  Award,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useAppDate } from '@/shared/lib/date-utils';

export const ReportCardContentModal = ({
  isOpen,
  onClose,
  cardKey,
  cardData = {},
  currencySymbol = 'Birr',
}) => {
  const { formatDate, calendarType } = useAppDate();
  const [search, setSearch] = useState('');

  if (!isOpen || !cardKey) return null;

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Determine modal title, subtitle, icon, and items list
  const modalConfig = useMemo(() => {
    switch (cardKey) {
      // SALES
      case 'SALES_REVENUE':
      case 'SALES_TRANSACTIONS':
        return {
          title: 'Sales Receipts & Orders in Period',
          subtitle: 'Individual customer checkout transactions issued during this period',
          icon: ShoppingCart,
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
          items: cardData.transactions || [],
          type: 'transactions',
        };

      case 'SALES_UNITS':
        return {
          title: 'Sales Volume by Date',
          subtitle: 'Daily medicines dispensed count and sales revenue',
          icon: Package,
          iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60',
          items: cardData.salesByDate || [],
          type: 'salesByDate',
        };

      case 'SALES_AVG':
        return {
          title: 'Average Order Performance',
          subtitle: 'Checkout receipts and ticket size details',
          icon: Receipt,
          iconColor: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
          items: cardData.transactions || [],
          type: 'transactions',
        };

      // FINANCIAL
      case 'FIN_TODAY':
      case 'FIN_WEEK':
      case 'FIN_MONTH':
      case 'FIN_NET':
        return {
          title: 'Financial Performance & Profit Audit',
          subtitle: 'Daily financial ledger breakdown (Revenue, COGS, Expenses, Net Profit)',
          icon: DollarSign,
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
          items: cardData.dailyBreakdown || [],
          type: 'financialDaily',
        };

      // INVENTORY
      case 'INV_VALUATION':
      case 'INV_RETAIL':
        return {
          title: 'Medicines Inventory Valuation & Stock List',
          subtitle: 'Stock quantities, purchase cost value, and selling value per medicine',
          icon: Boxes,
          iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60',
          items: cardData.medicinesList || cardData.lowStockList || [],
          type: 'inventoryStock',
        };

      case 'INV_LOW_STOCK':
        return {
          title: 'Low & Out-of-Stock Medicines Alert',
          subtitle: 'Medicines with 10 or fewer units remaining on pharmacy shelves',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60',
          items: cardData.lowStockList || [],
          type: 'inventoryLowStock',
        };

      case 'INV_EXPIRY':
        return {
          title: 'Expired & Soon-to-Expire Inventory Risk',
          subtitle: 'Medicines requiring immediate dispensing priority or quarantine disposal',
          icon: Clock,
          iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60',
          items: [...(cardData.expiredList || []), ...(cardData.soonExpiringList || [])],
          type: 'inventoryExpiry',
        };

      // PURCHASES
      case 'PUR_TOTAL':
      case 'PUR_PAID':
      case 'PUR_DEBT':
        return {
          title: 'Purchase Orders & Cash Obligations',
          subtitle: 'Complete list of purchase orders placed with suppliers',
          icon: ShoppingBag,
          iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60',
          items: cardData.orders || [],
          type: 'purchaseOrders',
        };

      case 'PUR_SUPPLIERS':
        return {
          title: 'Purchases by Supplier & Outstanding Balances',
          subtitle: 'Summary of orders, total spending, and outstanding debts per vendor',
          icon: Truck,
          iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60',
          items: cardData.suppliers || [],
          type: 'purchaseSuppliers',
        };

      // EXPENSES
      case 'EXP_TOTAL':
      case 'EXP_PAID':
      case 'EXP_DUE':
        return {
          title: 'Operating Expenses Audit List',
          subtitle: 'Recorded pharmacy operating bills, invoices, and payments',
          icon: Receipt,
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
          items: cardData.expenses || [],
          type: 'expensesList',
        };

      case 'EXP_CATEGORIES':
        return {
          title: 'Expenses by Category Distribution',
          subtitle: 'Breakdown of operating costs across operational categories',
          icon: DollarSign,
          iconColor: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
          items: cardData.byCategory || [],
          type: 'expenseCategories',
        };

      // MEDICINE PERFORMANCE
      case 'PERF_UNITS':
      case 'PERF_REVENUE':
      case 'PERF_PROFIT':
      case 'PERF_TURNOVER':
      default:
        return {
          title: 'Medicine Sales & Margin Performance',
          subtitle: 'Detailed turnover, revenue, and gross profit generated per medicine',
          icon: Award,
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
          items: cardData.allMedicines || cardData.bestSelling || [],
          type: 'medicinePerformance',
        };
    }
  }, [cardKey, cardData]);

  const Icon = modalConfig.icon;

  // Filter items in memory by search query
  const filteredItems = useMemo(() => {
    if (!search.trim()) return modalConfig.items;
    const q = search.toLowerCase();

    return modalConfig.items.filter((item) => {
      return (
        item.medicineName?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.saleNumber?.toLowerCase().includes(q) ||
        item.purchaseOrderNo?.toLowerCase().includes(q) ||
        item.expenseNumber?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.supplierName?.toLowerCase().includes(q) ||
        item.cashierName?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    });
  }, [modalConfig.items, search]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 pt-16 sm:pt-20 pb-16"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${modalConfig.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {modalConfig.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredItems.length} {filteredItems.length === 1 ? 'Record' : 'Records'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {calendarType === 'ethiopian' ? 'Ethiopian (E.C.)' : 'Gregorian (G.C.)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {modalConfig.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 shrink-0">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter contents in this modal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <span className="text-[11px] text-slate-400 font-medium shrink-0">
            Click table rows for full context
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No matching records found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                {/* 1. Transactions Table */}
                {modalConfig.type === 'transactions' && (
                  <>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Receipt #</th>
                        <th className="py-2.5 px-3">Date & Time ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                        <th className="py-2.5 px-3">Cashier</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3 text-center">Items</th>
                        <th className="py-2.5 px-3 text-right">Total ({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {tx.saleNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                            {tx.cashierName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{tx.customerName}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{tx.itemsCount}</td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100">
                            {formatAmount(tx.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 2. Sales by Date Table */}
                {modalConfig.type === 'salesByDate' && (
                  <>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                        <th className="py-2.5 px-3 text-center">Receipts / Orders</th>
                        <th className="py-2.5 px-3 text-center">Units Sold</th>
                        <th className="py-2.5 px-3 text-right">Daily Revenue ({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {formatDate(row.date, { showMonthName: true })}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{row.transactionsCount}</td>
                          <td className="py-2.5 px-3 text-center">{row.unitsSold} units</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                            {formatAmount(row.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 3. Financial Daily Ledger Table */}
                {modalConfig.type === 'financialDaily' && (
                  <>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                        <th className="py-2.5 px-3 text-right">Revenue ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right">COGS ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right">Gross Profit ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right">Expenses ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right font-black">Net Profit ({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {formatDate(row.date, { showMonthName: true })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatAmount(row.revenue)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">
                            {row.cogs > 0 ? `- ${formatAmount(row.cogs)}` : '0.00'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-700 dark:text-blue-400">
                            {formatAmount(row.grossProfit)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                            {row.expenses > 0 ? `- ${formatAmount(row.expenses)}` : '0.00'}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-black ${
                              row.netProfit >= 0
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {formatAmount(row.netProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 4. Purchase Orders Table */}
                {modalConfig.type === 'purchaseOrders' && (
                  <>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">PO Number</th>
                        <th className="py-2.5 px-3">Date ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3 text-right">Total ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right">Paid ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right">Due ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {o.purchaseOrderNo}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{formatDate(o.orderDate)}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {o.supplierName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100">
                            {formatAmount(o.totalCost)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                            {formatAmount(o.amountPaid)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-bold ${
                              o.amountDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                            }`}
                          >
                            {formatAmount(o.amountDue)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[10px]">{o.paymentStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 5. Expenses Table */}
                {modalConfig.type === 'expensesList' && (
                  <>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Expense #</th>
                        <th className="py-2.5 px-3">Date ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                        <th className="py-2.5 px-3">Title & Payee</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Amount ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {e.expenseNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(e.expenseDate)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">{e.title}</span>
                            {e.payee && <span className="text-[10px] text-slate-400 block">To: {e.payee}</span>}
                          </td>
                          <td className="py-2.5 px-3">{e.category}</td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100">
                            {formatAmount(e.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[10px]">{e.paymentStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 6. Medicine Performance & Inventory Table */}
                {(modalConfig.type === 'medicinePerformance' ||
                  modalConfig.type === 'inventoryStock' ||
                  modalConfig.type === 'inventoryLowStock' ||
                  modalConfig.type === 'inventoryExpiry') && (
                  <>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3 text-center">Stock</th>
                        <th className="py-2.5 px-3 text-right">Cost Price ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right">Selling Price ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-center">Units Sold</th>
                        <th className="py-2.5 px-3 text-right">Revenue ({currencySymbol})</th>
                        <th className="py-2.5 px-3 text-right font-black">Profit ({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                            {m.medicineName || m.name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{m.currentStock ?? m.quantity ?? 0}</td>
                          <td className="py-2.5 px-3 text-right text-slate-500">
                            {formatAmount(m.purchasePrice || m.purchaseCost)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                            {formatAmount(m.sellingPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{m.quantitySold || 0}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                            {formatAmount(m.totalRevenue || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-blue-700 dark:text-blue-400">
                            {formatAmount(m.totalProfit || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">
            Showing {filteredItems.length} of {modalConfig.items.length} records
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
