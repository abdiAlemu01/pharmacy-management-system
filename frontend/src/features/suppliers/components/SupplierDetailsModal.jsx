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
  ExternalLink,
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
    <Dialog isOpen={isOpen} onClose={onClose} title="Supplier Business Profile">
      <div className="space-y-4 text-xs">
        {/* Header banner */}
        <div className="p-4 bg-linear-to-r from-slate-50 to-emerald-50/30 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{supplier.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {supplier.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-mono mt-0.5">ID: {supplier.id}</p>
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
                className="text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-slate-600" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Purchase Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] text-slate-400 font-medium block">Total Purchases</span>
            <span className="font-black text-slate-900 text-base">
              {supplier.totalPurchases || 0} orders
            </span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] text-slate-400 font-medium block">Total Spend</span>
            <span className="font-black text-emerald-700 text-sm whitespace-nowrap">
              {formatBirr(supplier.totalSpend)}
            </span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium block">Last Order</span>
            <span className="font-bold text-slate-700 text-xs">
              {supplier.lastPurchaseDate
                ? new Date(supplier.lastPurchaseDate).toLocaleDateString()
                : 'No orders yet'}
            </span>
          </div>
        </div>

        {/* Contact & Business Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Contact Details Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Contact Details
            </h4>

            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Contact Person:</span>
                <span className="font-semibold text-slate-800">{supplier.contactPerson || 'Not specified'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Phone:</span>
                <a
                  href={`tel:${supplier.phone}`}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  {supplier.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Email:</span>
                {supplier.email ? (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    {supplier.email}
                  </a>
                ) : (
                  <span className="text-slate-500">None</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Address / Location:</span>
                <span className="font-medium text-slate-700">{supplier.address || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Business & Commercial Terms */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Commercial Terms
            </h4>

            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Payment Terms:</span>
                <span className="font-semibold text-slate-800">{supplier.paymentTerms || 'Net 30 Days'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">TIN / Tax Number:</span>
                <span className="font-mono font-medium text-slate-700">{supplier.taxNumber || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Registered On:</span>
                <span className="text-slate-600">
                  {new Date(supplier.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {supplier.notes && (
              <div className="pt-1 border-t border-slate-200/60">
                <span className="text-slate-400 text-[11px] block font-medium">Notes:</span>
                <p className="text-slate-600 italic text-[11px]">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock It Supplies Highlight Box */}
        <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Package className="w-4 h-4 text-emerald-700 shrink-0" />
            <h4 className="font-bold text-emerald-900 text-xs">Stock It Supplies:</h4>
          </div>
          <p className="text-slate-700 font-medium pl-6">
            {supplier.stockSupplied || 'General Pharmaceuticals'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          {onViewPurchases ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onViewPurchases(supplier);
              }}
              className="text-xs py-2 px-3.5 flex items-center gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>View Purchase History ({supplier.totalPurchases || 0})</span>
            </Button>
          ) : <div />}

          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

