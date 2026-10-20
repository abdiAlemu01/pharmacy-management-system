import React from 'react';
import { Plus, Minus, Edit, Search, X, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { StockStatusBadge } from './StockStatusBadge';
import { useAppDate } from '@/shared/lib/date-utils';

export const InventoryTable = ({
  items = [],
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  onAddStock,
  onReduceStock,
  onEditMedicine,
}) => {
  const { formatDate } = useAppDate();
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Items' },
    { id: 'LOW_STOCK', label: 'Low Stock (1-10)' },
    { id: 'EXCESS_STOCK', label: 'Excess Stock (≥ 100)' },
    { id: 'OUT_OF_STOCK', label: 'Out of Stock (0)' },
    { id: 'NORMAL', label: 'Normal' },
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
              <th scope="col" className="px-4 py-3.5 text-right">Purchase Price </th>
              <th scope="col" className="px-4 py-3.5 text-right">Selling Price </th>
              <th scope="col" className="px-5 py-3.5 text-right bg-emerald-50/50 text-emerald-800">
                Individual Total Cost
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">Purchase Date</th>
              <th scope="col" className="px-6 py-3.5 text-center">Stock Actions</th>
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
                  className="hover:bg-slate-50/60 transition-colors group"
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
                    {formatBirr(item.purchaseCost)}
                  </td>

                  {/* Unit Selling Price */}
                  <td className="px-4 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                    {formatBirr(item.sellingPrice)}
                  </td>

                  {/* Individual Total Cost */}
                  <td className="px-5 py-4 text-right whitespace-nowrap bg-emerald-50/30">
                    <span className="font-extrabold text-emerald-900 text-sm block">
                      {formatBirr(item.totalCost)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {item.quantity} × {item.purchaseCost.toFixed(2)} Birr
                    </span>
                  </td>

                  {/* Purchase Date */}
                  <td className="px-4 py-4 text-center text-xs text-slate-500 whitespace-nowrap">
                    {item.purchaseDate ? formatDate(item.purchaseDate) : '—'}
                  </td>

                  {/* Actions: Add (+), Subtract (-), Edit */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Add (+) Button */}
                      <button
                        type="button"
                        onClick={() => onAddStock(item)}
                        title={`Add stock to ${item.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add</span>
                      </button>

                      {/* Subtract (-) Button */}
                      <button
                        type="button"
                        onClick={() => onReduceStock(item)}
                        title={`Reduce stock from ${item.name}`}
                        disabled={item.quantity <= 0}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Reduce</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEditMedicine(item)}
                        title={`Edit ${item.name}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
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

