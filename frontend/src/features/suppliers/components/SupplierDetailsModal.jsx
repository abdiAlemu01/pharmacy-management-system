import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import {
  Building2,
  User,
  Phone,
  MapPin,
  Package,
  Calendar,
  ShoppingBag,
  Edit,
} from 'lucide-react';

export const SupplierDetailsModal = ({
  isOpen,
  onClose,
  supplier,
  onEdit,
  onViewPurchases,
}) => {
  if (!supplier) return null;

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Supplier Business Profile"
      className="max-w-2xl"
    >
      <div className="space-y-5 text-base">
        {/* Header banner */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-slate-50 to-emerald-50/40 dark:from-slate-800 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-xl sm:text-2xl tracking-tight">
                {supplier.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(supplier);
                }}
                className="text-sm sm:text-base py-2.5 px-4 font-semibold flex items-center gap-2 rounded-xl cursor-pointer shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Edit className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Purchase Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs">
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Total Purchases
            </span>
            <span className="font-black text-slate-900 dark:text-slate-100 text-xl sm:text-2xl">
              {supplier.totalPurchases || 0} orders
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shadow-2xs">
            <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1.5">
              Total Spend
            </span>
            <span className="font-black text-emerald-800 dark:text-emerald-300 text-lg sm:text-2xl whitespace-nowrap">
              {formatBirr(supplier.totalSpend)}
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Last Order
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-base sm:text-lg">
              {supplier.lastPurchaseDate
                ? new Date(supplier.lastPurchaseDate).toLocaleDateString()
                : 'No orders yet'}
            </span>
          </div>
        </div>

        {/* Contact & Business Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact Details Card */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3.5 shadow-2xs">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
              Contact Details
            </h4>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold block mb-0.5">Contact Person:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {supplier.contactPerson || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold block mb-0.5">Phone:</span>
                <a
                  href={`tel:${supplier.phone}`}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline text-base"
                >
                  {supplier.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold block mb-0.5">Address / Location:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {supplier.address || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Business & Commercial Terms */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3.5 shadow-2xs">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
              Commercial Terms
            </h4>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold block mb-0.5">Registered On:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {new Date(supplier.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {supplier.notes && (
              <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold block mb-1">Notes:</span>
                <p className="text-slate-700 dark:text-slate-300 italic text-sm sm:text-base font-medium">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock It Supplies Highlight Box */}
        <div className="p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2">
            <Package className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm uppercase tracking-wider">
              Medicine it Supplies:
            </h4>
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-bold pl-7.5 text-base sm:text-lg leading-relaxed">
            {supplier.stockSupplied || 'General Pharmaceuticals'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {onViewPurchases ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onViewPurchases(supplier);
              }}
              className="text-sm sm:text-base py-2.5 px-5 font-semibold flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer shadow-2xs"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>View Purchase History ({supplier.totalPurchases || 0})</span>
            </Button>
          ) : <div />}

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-6 py-2.5 text-sm sm:text-base font-semibold rounded-xl cursor-pointer shadow-2xs"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
