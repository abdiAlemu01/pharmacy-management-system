import React, { useState } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  ShoppingBag,
  Phone,
  Building2,
  Package,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const SupplierTable = ({
  suppliers = [],
  isLoading = false,
  onViewDetails,
  onEdit,
  onViewPurchases,
  onDelete,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [noSelectionPrompt, setNoSelectionPrompt] = useState(false);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || null;

  const handleToggleSelect = (id) => {
    setSelectedSupplierId((prev) => (prev === id ? null : id));
    setNoSelectionPrompt(false);
  };

  const handleActionClick = (actionType) => {
    if (!selectedSupplier) {
      setNoSelectionPrompt(true);
      setTimeout(() => setNoSelectionPrompt(false), 5000);
      return;
    }

    setNoSelectionPrompt(false);
    switch (actionType) {
      case 'viewDetails':
        onViewDetails(selectedSupplier);
        break;
      case 'purchases':
        onViewPurchases(selectedSupplier);
        break;
      case 'edit':
        onEdit(selectedSupplier);
        break;
      case 'delete':
        onDelete(selectedSupplier);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Action Header Bar */}
      <div className="p-3 sm:p-4 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleActionClick('viewDetails')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-2xs ${
              selectedSupplier
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs active:scale-95'
                : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer'
            }`}
            title={selectedSupplier ? `View Details for ${selectedSupplier.name}` : 'Click to select a supplier first'}
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>

          {/* View Purchase History */}
          <button
            type="button"
            onClick={() => handleActionClick('purchases')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold 
              text-xs sm:text-sm transition-all shadow-2xs ${
              selectedSupplier
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs active:scale-95'
                : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer'
            }`}
            title={selectedSupplier ? `View Purchases for ${selectedSupplier.name}` : 'Click to select a supplier first'}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Purchase History</span>
          </button>

          {/* Edit Supplier */}
          <button
            type="button"
            onClick={() => handleActionClick('edit')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-2xs ${
              selectedSupplier
                ? 'bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-xs active:scale-95'
                : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer'
            }`}
            title={selectedSupplier ? `Edit ${selectedSupplier.name}` : 'Click to select a supplier first'}
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>

          {/* Delete Supplier */}
          <button
            type="button"
            onClick={() => handleActionClick('delete')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-2xs ${
              selectedSupplier
                ? 'bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs active:scale-95'
                : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer'
            }`}
            title={selectedSupplier ? `Delete ${selectedSupplier.name}` : 'Click to select a supplier first'}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Selection Banner / Status */}
        {selectedSupplier && (
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <div className="inline-flex items-center gap-2 bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs sm:text-sm font-bold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate max-w-[220px]">
                Selected: <strong className="font-extrabold">{selectedSupplier.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSupplierId(null)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white font-bold ml-1.5 p-0.5 rounded cursor-pointer"
                title="Deselect"
                aria-label="Deselect"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helpful prompt when an action is clicked without a selection */}
      {noSelectionPrompt && (
        <div className="p-3 px-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Please select an existing supplier from the list below to perform this action.</span>
          </div>
          <button
            type="button"
            onClick={() => setNoSelectionPrompt(false)}
            className="text-amber-800 dark:text-amber-300 hover:text-amber-950 font-bold cursor-pointer text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3.5 text-center w-12">Select</th>
              <th className="px-5 py-3.5">Supplier Name</th>
              <th className="px-4 py-3.5">Contact Person</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Stock It Supplies</th>
              <th className="px-4 py-3.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-2" />
                  <p className="text-xs font-medium">Loading suppliers...</p>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-base">No suppliers found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search criteria, or click &quot;+ Add Supplier&quot; to register a new vendor.
                  </p>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => {
                const isSelected = selectedSupplierId === supplier.id;
                return (
                  <tr
                    key={supplier.id}
                    onClick={() => handleToggleSelect(supplier.id)}
                    onDoubleClick={() => onViewDetails(supplier)}
                    className={`group transition-all cursor-pointer select-none border-b border-slate-100 dark:border-slate-800/80 ${
                      isSelected
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-l-emerald-600 shadow-2xs'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Toggle Select Button */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(supplier.id);
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500 shadow-2xs'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                          title={isSelected ? `Click to unselect ${supplier.name}` : `Click to select ${supplier.name}`}
                          aria-label={isSelected ? `Unselect ${supplier.name}` : `Select ${supplier.name}`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                      </div>
                    </td>

                    {/* Supplier Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`font-bold block text-sm leading-snug ${
                              isSelected
                                ? 'text-emerald-950 dark:text-emerald-100 font-extrabold'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {supplier.name}
                          </span>
                          
                        </div>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block">
                        {supplier.contactPerson || '—'}
                      </span>
                      {supplier.address && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {supplier.address}
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <a
                        href={`tel:${supplier.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{supplier.phone}</span>
                      </a>
                    </td>

                    {/* Stock It Supplies */}
                    <td className="px-5 py-4">
                      <div className="max-w-xs">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60">
                          <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{supplier.stockSupplied || 'General Supplies'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Selection Status Badge */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {isSelected ? (
                        <span
                          title="Click row to unselect"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs hover:bg-emerald-200/80 dark:hover:bg-emerald-900 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition-colors">
                          Click to select
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

