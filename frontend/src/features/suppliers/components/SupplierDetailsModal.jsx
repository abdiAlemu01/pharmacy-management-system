import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { useAppDate } from '@/shared/lib/date-utils';
import {
  Building2,
  User,
  Phone ,
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
  const { formatDate } = useAppDate();
  if (!supplier) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Supplier Business Profile"
      className="max-w-3xl"
    >
      <div className="space-y-6 text-base sm:text-lg">
        {/* Header banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/20 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-3xl flex items-center justify-center shrink-0 shadow-sm ring-4 ring-emerald-500/10">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-2xl sm:text-3xl tracking-tight">
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
                className="text-base sm:text-lg py-2.5 px-4 font-bold flex items-center gap-2 rounded-xl cursor-pointer shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 transition-all"
              >
                <Edit className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Contact & Business Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Contact Details Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-5 shadow-xs">
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-700/80 flex items-center gap-2">
              Contact Details
            </h4>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <User className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold block mb-0.5">Contact Person</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-xl break-words">
                  {supplier.contactPerson || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold block mb-0.5">Phone Number</span>
                <a
                  href={`tel:${supplier.phone}`}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline text-lg sm:text-xl break-all transition-colors"
                >
                  {supplier.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold block mb-0.5">Address / Location</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-xl break-words">
                  {supplier.address || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Business & Commercial Terms */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-5">
              <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-700/80 flex items-center gap-2">
                Commercial Terms
              </h4>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5.5 h-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold block mb-0.5">Registered On</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-xl">
                    {supplier.createdAt ? formatDate(supplier.createdAt) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {supplier.notes && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl mt-3">
                <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-bold block mb-1">Notes:</span>
                <p className="text-slate-700 dark:text-slate-300 italic text-base sm:text-lg font-medium leading-relaxed">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock It Supplies Highlight Box */}
        <div className="p-5 sm:p-6 bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="font-black text-emerald-900 dark:text-emerald-300 text-sm sm:text-base  tracking-wider">
              Medicine {supplier.name || 'Not specified'} Supplies
            </h4>
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-black pl-12 text-lg sm:text-2xl leading-relaxed">
            {supplier.stockSupplied || 'General Pharmaceuticals'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onViewPurchases ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onViewPurchases(supplier);
              }}
              className="text-base sm:text-lg py-3 px-5 font-bold flex items-center justify-center gap-2.5 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              <ShoppingBag className="w-5.5 h-5.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>View Purchase History ({supplier.totalPurchases || 0})</span>
            </Button>
          ) : <div />}

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-7 py-3 text-base sm:text-lg font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
