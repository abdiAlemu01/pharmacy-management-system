import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { useAppDate } from '@/shared/lib/date-utils';
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
  const { formatDate } = useAppDate();
  if (!supplier) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Supplier Business Profile"
      className="max-w-3xl"
    >
      <div className="space-y-4 sm:space-y-6 text-sm sm:text-lg">
        {/* Header banner */}
        <div className="p-3.5 sm:p-6 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/20 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl flex flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-xl sm:text-3xl flex items-center justify-center shrink-0 shadow-sm ring-4 ring-emerald-500/10">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg sm:text-3xl tracking-tight truncate">
                {supplier.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(supplier);
                }}
                className="text-xs sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 font-bold flex items-center gap-1.5 sm:gap-2 rounded-xl cursor-pointer shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 transition-all shrink-0"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Contact & Business Information - Side by Side on all screen sizes */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {/* Contact Details Card */}
          <div className="p-3.5 sm:p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3.5 sm:space-y-5 shadow-xs">
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-base uppercase tracking-wider pb-2 sm:pb-3 border-b border-slate-100 dark:border-slate-700/80 flex items-center gap-1.5 sm:gap-2">
              Contact Details
            </h4>

            <div className="flex items-start gap-2.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-base font-semibold block leading-tight">Contact Person</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-xl break-words block mt-0.5">
                  {supplier.contactPerson || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-base font-semibold block leading-tight">Phone Number</span>
                <a
                  href={`tel:${supplier.phone}`}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline text-sm sm:text-xl break-all transition-colors block mt-0.5"
                >
                  {supplier.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-base font-semibold block leading-tight">Address / Location</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-xl break-words block mt-0.5">
                  {supplier.address || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Business & Commercial Terms */}
          <div className="p-3.5 sm:p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3.5 sm:space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3.5 sm:space-y-5">
              <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-base uppercase tracking-wider pb-2 sm:pb-3 border-b border-slate-100 dark:border-slate-700/80 flex items-center gap-1.5 sm:gap-2">
                Commercial Terms
              </h4>

              <div className="flex items-start gap-2.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-base font-semibold block leading-tight">Registered On</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-xl block mt-0.5">
                    {supplier.createdAt ? formatDate(supplier.createdAt) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {supplier.notes && (
              <div className="p-2.5 sm:p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl mt-2 sm:mt-3">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-base font-bold block mb-0.5">Notes:</span>
                <p className="text-slate-700 dark:text-slate-300 italic text-xs sm:text-lg font-medium leading-relaxed">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock It Supplies Highlight Box */}
        <div className="p-3.5 sm:p-6 bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-black text-emerald-900 dark:text-emerald-300 text-xs sm:text-base tracking-wider truncate">
              Medicine {supplier.name || 'Not specified'} Supplies
            </h4>
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-black pl-9 sm:pl-12 text-sm sm:text-2xl leading-relaxed">
            {supplier.stockSupplied || 'General Pharmaceuticals'}
          </p>
        </div>

        {/* Bottom Actions - Side by Side on both small and large screens */}
        <div className="pt-3 sm:pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-row items-center justify-between gap-2.5 sm:gap-3">
          {onViewPurchases ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onViewPurchases(supplier);
              }}
              className="flex-1 text-xs sm:text-lg py-2.5 sm:py-3 px-3 sm:px-5 font-bold flex items-center justify-center gap-1.5 sm:gap-2.5 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5.5 sm:h-5.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">View Purchase History</span>
                <span className="sm:hidden">Purchases</span> ({supplier.totalPurchases || 0})
              </span>
            </Button>
          ) : <div />}

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-4 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-lg font-bold rounded-xl cursor-pointer shadow-xs transition-colors shrink-0"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
