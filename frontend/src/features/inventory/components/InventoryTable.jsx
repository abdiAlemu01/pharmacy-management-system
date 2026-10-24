import React from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { StockStatusBadge } from './StockStatusBadge';
import { useAppDate } from '@/shared/lib/date-utils';

export const InventoryTable = ({
  items = [],
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
}) => {
  const { formatDate } = useAppDate();
  const formatAmount = (val) => {
    const num = parseFloat(val || 0);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Items' },
    { id: 'LOW_STOCK', label: 'Low Stock (1-10)' },
    { id: 'EXCESS_STOCK', label: 'Excess Stock (> 50)' },
    { id: 'NORMAL', label: 'Normal (11-50)' },
  ];

  // Client-side filtering by status if user clicks tabs
  const filteredItems = items.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.stockStatus === statusFilter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search Bar & Filters Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Compact Search Bar based on medicine name */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search medicine by name...."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3.5">Medicine Name</th>
              <th scope="col" className="px-4 py-3.5 text-center">Stock Level & Status</th>
              <th scope="col" className="px-4 py-3.5 text-right">Purchase Price (Birr)</th>
              <th scope="col" className="px-4 py-3.5 text-right">Selling Price (Birr)</th>
              <th scope="col" className="px-5 py-3.5 text-right bg-emerald-50/50 text-emerald-800">
                Individual Total Cost (Birr)
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">Purchase Date</th>
              <th scope="col" className="px-4 py-3.5 text-center">Expiry Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
                  <p className="mt-2 text-xs font-medium">Loading inventory records...</p>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No medicines found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchTerm
                      ? `No inventory items matched "${searchTerm}".`
                      : 'No items found in inventory for the selected filter.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Medicine Name */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800 text-sm block">
                      {item.name}
                    </span>
                  </td>

                  {/* Stock Level & Status Badge */}
                  <td className="px-4 py-4 text-center">
                    <StockStatusBadge quantity={item.quantity} />
                  </td>

                  {/* Unit Purchase Price */}
                  <td className="px-4 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                    {formatAmount(item.purchaseCost)}
                  </td>

                  {/* Unit Selling Price */}
                  <td className="px-4 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                    {formatAmount(item.sellingPrice)}
                  </td>

                  {/* Individual Total Cost */}
                  <td className="px-5 py-4 text-right whitespace-nowrap bg-emerald-50/30">
                    <span className="font-extrabold text-emerald-900 text-sm block">
                      {formatAmount(item.totalCost)}
                    </span>
                  </td>

                  {/* Purchase Date */}
                  <td className="px-4 py-4 text-center text-xs text-slate-500 whitespace-nowrap">
                    {item.purchaseDate ? formatDate(item.purchaseDate) : '—'}
                  </td>

                  {/* Expiry Date */}
                  <td className="px-4 py-4 text-center text-xs whitespace-nowrap">
                    {item.expiryDate ? (
                      (() => {
                        const exp = new Date(item.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
                        if (diffDays <= 0) {
                          return (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                              {formatDate(item.expiryDate)} (Expired)
                            </span>
                          );
                        }
                        if (diffDays <= 90) {
                          return (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              {formatDate(item.expiryDate)}
                            </span>
                          );
                        }
                        return (
                          <span className="font-medium text-slate-700">
                            {formatDate(item.expiryDate)}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
