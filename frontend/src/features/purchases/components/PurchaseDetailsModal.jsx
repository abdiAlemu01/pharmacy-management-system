import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { usePurchaseDetails } from '../hooks/use-purchases';
import { DeliveryStatusBadge, PaymentStatusBadge } from './PurchaseStatusBadge';
import { useAppDate } from '@/shared/lib/date-utils';
import {
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Package,
  PackageCheck,
  CreditCard,
  RotateCcw,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  Receipt,
} from 'lucide-react';

export const PurchaseDetailsModal = ({
  isOpen,
  onClose,
  purchase,
  onOpenReceive,
  onOpenPayment,
  onOpenReturn,
}) => {
  const { data: detailsData } = usePurchaseDetails(purchase?.id, {
    enabled: Boolean(isOpen && purchase?.id),
  });
  const { formatDate } = useAppDate();

  const activePurchase = detailsData?.data || purchase;
  if (!activePurchase) return null;

  const totalCost = parseFloat(activePurchase.totalCost || 0);
  const amountPaid = parseFloat(activePurchase.amountPaid || 0);
  const amountDue = parseFloat(activePurchase.amountDue || 0);
  const subtotal = parseFloat(activePurchase.subtotal || 0);
  const discount = parseFloat(activePurchase.discount || 0);
  const additionalCharges = parseFloat(activePurchase.additionalCharges || 0);

  const canReceive = activePurchase.status !== 'RECEIVED';
  const canPay = amountDue > 0;
  const canReturn = (activePurchase.items || []).some((it) => (it.quantityReceived || 0) > 0);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Order Details"
      className="max-w-4xl"
    >
      <div className="space-y-6 text-sm">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/20 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-sm ring-4 ring-emerald-500/10">
              <Package className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight">
                  {activePurchase.purchaseOrderNo || `#${activePurchase.id?.slice(0, 8)}`}
                </span>
                {activePurchase.invoiceNo && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                    Inv: {activePurchase.invoiceNo}
                  </span>
                )}
              </div>
              <p className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Ordered on:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {activePurchase.orderDate ? formatDate(activePurchase.orderDate) : '-'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            <DeliveryStatusBadge status={activePurchase.status} />
            <PaymentStatusBadge status={activePurchase.paymentStatus} />
          </div>
        </div>

        {/* 2-Column: Supplier & Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Supplier details card */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3.5 shadow-2xs">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Supplier Information</span>
            </h4>

            <div>
              <span className="text-xs text-slate-400 font-bold block mb-0.5">Supplier Name</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {activePurchase.supplierName}
              </span>
            </div>

            {activePurchase.supplierPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`tel:${activePurchase.supplierPhone}`} className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                  {activePurchase.supplierPhone}
                </a>
              </div>
            )}

            {activePurchase.supplierEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {activePurchase.supplierEmail}
                </span>
              </div>
            )}

            {activePurchase.notes && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-500 block mb-0.5">Order Notes:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">{activePurchase.notes}</p>
              </div>
            )}
          </div>

          {/* Financial Overview card */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs flex flex-col justify-between space-y-3.5">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Financial Overview</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total Cost</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 block">
                  {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-semibold text-slate-400">Br</span>
                </span>
              </div>
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">Amount Paid</span>
                <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400 block">
                  {amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-semibold text-emerald-500">Br</span>
                </span>
              </div>
              <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-0.5">Balance Due</span>
                <span className="text-sm sm:text-base font-black text-rose-700 dark:text-rose-300 block">
                  {amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-semibold text-rose-400">Br</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Items Ordered */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Ordered Medicine Items ({activePurchase.items ? activePurchase.items.length : 0})</span>
          </h4>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3 text-center">Ordered</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700 dark:text-emerald-400">Accepted</th>
                  <th className="py-2.5 px-3 text-center text-rose-600">Rejected</th>
                  <th className="py-2.5 px-3">Unit Price</th>
                  <th className="py-2.5 px-3">Total Cost</th>
                  <th className="py-2.5 px-3">Batch #</th>
                  <th className="py-2.5 px-3">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(activePurchase.items || []).map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {it.medicineName}
                      </span>
                      {it.rejectionReason && (
                        <span className="text-[11px] text-rose-600 font-medium">
                          Rejected note: {it.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {it.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
                      {it.quantityReceived || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-600">
                      {it.quantityRejected || 0}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {it.unitCost.toFixed(2)} Birr
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {it.totalCost.toFixed(2)} Birr
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {it.batchNumber || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {it.expiryDate ? formatDate(it.expiryDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History Log */}
        {activePurchase.payments && activePurchase.payments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Payment Installments ({activePurchase.payments.length})</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <table className="w-full text-left min-w-[320px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activePurchase.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3">{p.paymentDate ? formatDate(p.paymentDate) : '-'}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                        {p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Returns Log */}
        {activePurchase.returns && activePurchase.returns.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>Medicines Returned Log ({activePurchase.returns.length})</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <table className="w-full text-left min-w-[320px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2 px-3">Return Date</th>
                    <th className="py-2 px-3">Medicine</th>
                    <th className="py-2 px-3 text-center">Returned Qty</th>
                    <th className="py-2 px-3">Refund Amount</th>
                    <th className="py-2 px-3">Reason</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activePurchase.returns.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 px-3">{r.returnDate ? formatDate(r.returnDate) : '-'}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{r.medicineName}</td>
                      <td className="py-2 px-3 text-center font-bold text-rose-600">{r.returnQuantity} units</td>
                      <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                        {r.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                      </td>
                      <td className="py-2 px-3">{r.returnReason}</td>
                      <td className="py-2 px-3 font-semibold">{r.refundStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {canReceive && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReceive(activePurchase);
                }}
                className="group inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-bold text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <PackageCheck className="w-3.5 h-3.5" />
                </div>
                <span>Receive Medicines</span>
              </button>
            )}

            {canPay && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPayment(activePurchase);
                }}
                className="group inline-flex items-center gap-2 px-3.5 py-2 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950/70 text-sky-800 dark:text-sky-200 font-bold text-xs rounded-xl border border-sky-300 dark:border-sky-800 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span>Record Payment</span>
              </button>
            )}

            {canReturn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReturn(activePurchase);
                }}
                className="group inline-flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-bold text-xs rounded-xl border border-purple-300 dark:border-purple-800 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <span>Return Medicines</span>
              </button>
            )}
          </div>

          <Button type="button" variant="secondary" onClick={onClose} className="px-6">
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

