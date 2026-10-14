import React from 'react';
import { Eye, Edit, Trash2, ShoppingBag, Phone, Mail, Building2, Package, MapPin } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export const SupplierTable = ({
  suppliers = [],
  isLoading = false,
  onViewDetails,
  onEdit,
  onViewPurchases,
  onDelete,
}) => {
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Supplier Name</th>
              <th className="px-4 py-3.5">Contact Person</th>
              <th className="px-4 py-3.5">Phone & Email</th>
              <th className="px-5 py-3.5">Stock It Supplies</th>
              <th className="px-3 py-3.5 text-center">Status</th>
              <th className="px-4 py-3.5 text-right">Orders (Total Spend)</th>
              <th className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-2" />
                  <p className="text-xs font-medium">Loading suppliers...</p>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-base">No suppliers found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search criteria, or click &quot;+ Add Supplier&quot; to register a new vendor.
                  </p>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => {
                const isActive = supplier.status === 'ACTIVE';
                return (
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

                    {/* Phone & Email */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <a
                        href={`tel:${supplier.phone}`}
                        className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        {supplier.phone}
                      </a>
                      {supplier.email && (
                        <a
                          href={`mailto:${supplier.email}`}
                          className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-0.5"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          {supplier.email}
                        </a>
                      )}
                    </td>

                    {/* Stock It Supplies */}
                    <td className="px-5 py-4">
                      <div className="max-w-xs">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <Package className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{supplier.stockSupplied || 'General Supplies'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    {/* Orders (Total Spend) */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="font-black text-slate-900 block text-xs">
                        {formatBirr(supplier.totalSpend)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {supplier.totalPurchases || 0} purchase order{supplier.totalPurchases === 1 ? '' : 's'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(supplier)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View Supplier Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* View Purchase History */}
                        <button
                          type="button"
                          onClick={() => onViewPurchases(supplier)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Purchase History"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>

                        {/* Edit Supplier */}
                        <button
                          type="button"
                          onClick={() => onEdit(supplier)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Supplier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete / Deactivate Supplier */}
                        <button
                          type="button"
                          onClick={() => onDelete(supplier)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete / Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

