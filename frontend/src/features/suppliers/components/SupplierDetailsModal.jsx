import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  CreditCard,
  FileText,
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

  const isActive = supplier.status === 'ACTIVE';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Supplier Business Profile"
      className="max-w-2xl"
    >
      <div className="space-y-5 text-sm">
        {/* Header banner */}
        <div className="p-4 bg-linear-to-r from-slate-50 to-emerald-50/40 dark:from-slate-800 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  {supplier.name}
                </h3>
                
              </div>
              
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
                className="text-sm py-2 px-3.5 flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <Edit className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Purchase Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Total Purchases
            </span>
            <span className="font-black text-slate-900 dark:text-slate-100 text-lg">
              {supplier.totalPurchases || 0} orders
            </span>
          </div>

          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shadow-2xs">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Total Spend
            </span>
            <span className="font-black text-emerald-800 dark:text-emerald-300 text-base whitespace-nowrap">
              {formatBirr(supplier.totalSpend)}
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Last Order
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {supplier.lastPurchaseDate
                ? new Date(supplier.lastPurchaseDate).toLocaleDateString()
                : 'No orders yet'}
            </span>
          </div>
        </div>

        {/* Contact & Business Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact Details Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-2">
              Contact Details
            </h4>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-xs block">Contact Person:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {supplier.contactPerson || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-xs block">Phone:</span>
                <a
                  href={`tel:${supplier.phone}`}
                  className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline text-sm"
                >
                  {supplier.phone}
                </a>
              </div>
            </div>

            
           

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-xs block">Address / Location:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                  {supplier.address || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Business & Commercial Terms */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-2">
              Commercial Terms
            </h4>

           

            <div className="flex items-start gap-2.5">
              
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-xs block">Registered On:</span>
                <span className="text-slate-700 dark:text-slate-300 text-sm">
                  {new Date(supplier.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {supplier.notes && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 text-xs block font-medium">Notes:</span>
                <p className="text-slate-600 dark:text-slate-300 italic text-xs mt-0.5">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock It Supplies Highlight Box */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs uppercase tracking-wider">
              Medicine it Supplies:
            </h4>
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-medium pl-6 text-sm">
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
              className="text-sm py-2 px-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 rounded-xl cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>View Purchase History ({supplier.totalPurchases || 0})</span>
            </Button>
          ) : <div />}

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
