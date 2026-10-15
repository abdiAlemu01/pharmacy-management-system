import React from 'react';
import { Eye, Edit, Trash2, ShoppingBag, Phone, Building2, Package, MapPin } from 'lucide-react';

export const SupplierTable = ({
  suppliers = [],
  isLoading = false,
  onViewDetails,
  onEdit,
  onViewPurchases,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Supplier Name</th>
              <th className="px-4 py-3.5">Contact Person</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Stock It Supplies</th>
              <th className="px-5 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-2" />
                  <p className="text-xs font-medium">Loading suppliers...</p>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-base">No suppliers found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search criteria, or click &quot;+ Add Supplier&quot; to register a new vendor.
                  </p>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Supplier Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 border border-emerald-100">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-sm leading-snug">
                          {supplier.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {supplier.taxNumber ? `TIN: ${supplier.taxNumber}` : `ID: ${supplier.id.slice(0, 8)}`}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact Person */}
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-800 text-xs block">
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
                      className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{supplier.phone}</span>
                    </a>
                  </td>

                  {/* Stock It Supplies */}
                  <td className="px-5 py-4">
                    <div className="max-w-xs">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{supplier.stockSupplied || 'General Supplies'}</span>
                      </span>
                    </div>
                  </td>

                  {/* Actions (Only Icons) */}
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 justify-center">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(supplier)}
                        className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105"
                        title="View Supplier Details"
                        aria-label="View Supplier Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* View Purchase History */}
                      <button
                        type="button"
                        onClick={() => onViewPurchases(supplier)}
                        className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105"
                        title="View Purchase History"
                        aria-label="View Purchase History"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>

                      {/* Edit Supplier */}
                      <button
                        type="button"
                        onClick={() => onEdit(supplier)}
                        className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105"
                        title="Edit Supplier"
                        aria-label="Edit Supplier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete / Deactivate Supplier */}
                      <button
                        type="button"
                        onClick={() => onDelete(supplier)}
                        className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105"
                        title="Delete Supplier"
                        aria-label="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
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
