import React, { useState } from 'react';
import { Search, Eye, X, Calendar, AlertCircle } from 'lucide-react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { useAppDate } from '@/shared/lib/date-utils';

export const SalesHistoryTable = ({
  sales = [],
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
}) => {
  const [selectedSale, setSelectedSale] = useState(null);
  const { formatDate, formatDateTime, calendarType } = useAppDate();

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search & Date Filter Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by medicine name....."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date range filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title={`From Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title={`To Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
            />
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'}
          </span>
          {(startDate || endDate) && (
            <span className="text-[11px] font-semibold text-emerald-700">
              ({startDate ? formatDate(startDate) : '...'} &rarr; {endDate ? formatDate(endDate) : '...'})
            </span>
          )}
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
              }}
              className="px-2 py-1.5 text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Receipt #</th>
              <th className="px-4 py-3.5">
                <span className="inline-flex items-center gap-1">
                  <span>Date & Time</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    {calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'}
                  </span>
                </span>
              </th>
              <th className="px-4 py-3.5">Cashier</th>
              <th className="px-4 py-3.5">Medicine Name</th>
              <th className="px-4 py-3.5 text-center">Items (Qty)</th>
              <th className="px-4 py-3.5 text-right font-extrabold text-slate-900">Total Sell</th>
              <th className="px-5 py-3.5 text-right bg-emerald-50/40 text-emerald-800">Total Profit</th>
              <th className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
                  <p className="mt-2 text-xs font-medium">Loading sales history...</p>
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No sales transactions found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Complete sales using POS to view transaction history.
                  </p>
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const medicineNames = (sale.items || [])
                  .map((i) => i.medicineName || i.medicine?.name || i.name)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-slate-800">
                      {sale.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(sale.createdAt, { showSuffix: true })}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {sale.cashierName}
                    </td>
                    <td className="px-4 py-4 max-w-[200px]" title={medicineNames}>
                      <div className="font-semibold text-xs text-slate-800 truncate">
                        {medicineNames || '—'}
                      </div>
                      {(sale.items || []).length > 1 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {(sale.items || []).length} medicines
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                        {(sale.items || []).length} items ({sale.totalQuantity} units)
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatBirr(sale.total)}
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-emerald-700 bg-emerald-50/20 whitespace-nowrap">
                      +{formatBirr(sale.totalProfit)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedSale(sale)}
                        className="text-xs py-1 px-2.5 flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sale Details Dialog */}
      <Dialog
        isOpen={Boolean(selectedSale)}
        onClose={() => setSelectedSale(null)}
        title="Sale Transaction Breakdown"
      >
        {selectedSale && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedSale.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-medium text-slate-800">{formatDateTime(selectedSale.createdAt, { showSuffix: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span className="font-medium text-slate-800">{selectedSale.cashierName}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Medicine</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Sell</th>
                    <th className="p-2.5 text-right">Unit Cost</th>
                    <th className="p-2.5 text-right font-bold">Total</th>
                    <th className="p-2.5 text-right text-emerald-700 font-bold">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedSale.items || []).map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                      <td className="p-2.5 text-center font-semibold">{item.quantity}</td>
                      <td className="p-2.5 text-right">{formatBirr(item.unitPrice)}</td>
                      <td className="p-2.5 text-right text-slate-500">{formatBirr(item.purchaseCost)}</td>
                      <td className="p-2.5 text-right font-black">{formatBirr(item.totalPrice)}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">+{formatBirr(item.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span>{formatBirr(selectedSale.total)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Total Profit:</span>
                <span>+{formatBirr(selectedSale.totalProfit)}</span>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

