import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { usePurchaseDetails } from '../hooks/use-purchases';
import { DeliveryStatusBadge, PaymentStatusBadge } from './PurchaseStatusBadge';
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
        <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/20 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm ring-4 ring-emerald-500/10">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-slate-900 dark:text-slate-100 text-xl tracking-tight">
                  {activePurchase.purchaseOrderNo}
                </span>
                {activePurchase.invoiceNo && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                    Inv: {activePurchase.invoiceNo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ordered on {new Date(activePurchase.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
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
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${activePurchase.supplierPhone}`} className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                  {activePurchase.supplierPhone}
                </a>
              </div>
            )}

            {activePurchase.supplierEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
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

          {/* Financial Breakdown card */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 shadow-2xs flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-100" />
                <span>Financial Breakdown</span>
              </h4>

              
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 block">Total Cost</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                </span>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">Amount Paid</span>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                  {amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                </span>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">Remaining Due</span>
                <span className="text-sm font-black text-rose-700 dark:text-rose-300">
                  {amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Items Ordered & Delivery status */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Ordered Medicine Items ({activePurchase.items ? activePurchase.items.length : 0})</span>
          </h4>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
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
                      {it.expiryDate ? new Date(it.expiryDate).toLocaleDateString() : '-'}
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
              <span>Payment Installments Log ({activePurchase.payments.length})</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Method</th>
                    <th className="py-2 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activePurchase.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                        {p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                      </td>
                      <td className="py-2 px-3 font-semibold">{p.paymentMethod}</td>
                      <td className="py-2 px-3 text-slate-500">{p.notes || '-'}</td>
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
              <table className="w-full text-left">
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
                      <td className="py-2 px-3">{new Date(r.returnDate).toLocaleDateString()}</td>
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
          <div className="flex flex-wrap items-center gap-2">
            {canReceive && (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onClose();
                  onOpenReceive(activePurchase);
                }}
                className="flex items-center gap-1.5 text-xs py-2 px-3"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Receive Medicines</span>
              </Button>
            )}

            {canPay && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenPayment(activePurchase);
                }}
                className="flex items-center gap-1.5 text-xs py-2 px-3 text-emerald-700 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </Button>
            )}

            {canReturn && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenReturn(activePurchase);
                }}
                className="flex items-center gap-1.5 text-xs py-2 px-3 text-purple-700 dark:text-purple-400 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return Medicines</span>
              </Button>
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

