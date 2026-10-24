import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { Printer, CheckCircle2, ShoppingBag, Receipt } from 'lucide-react';
import { useAppDate } from '@/shared/lib/date-utils';
import { useSettings } from '@/features/settings/hooks/use-settings';

export const ReceiptModal = ({ isOpen, onClose, sale }) => {
  const { formatDateTime } = useAppDate();
  const { data: settingsData } = useSettings();

  if (!sale) return null;

  const settings = settingsData?.settings;
  const pharmacyName = settings?.pharmacyName || localStorage.getItem('pharmacy_name') || 'Pharmacy Care Management';
  const pharmacyAddress = settings?.address || 'Dispensary & Pharmaceutical Care';
  const pharmacyPhone = settings?.phone || '';

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Sale Completed Successfully">
      <div className="space-y-4">
        {/* Success Header Banner */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Dispensary Sale Confirmed!</p>
              <p className="text-emerald-700 dark:text-emerald-300 text-xs">
                Inventory deducted and transaction logged successfully.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 rounded-md">
            ID: {sale.id ? sale.id.slice(0, 8).toUpperCase() : 'POS-RECEIPT'}
          </span>
        </div>

        {/* Printable Receipt Card */}
        <div id="printable-pos-receipt" className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 bg-white dark:bg-slate-900 space-y-3.5 text-xs shadow-2xs">
          {/* Pharmacy Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-700 space-y-1">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 tracking-tight flex items-center justify-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>{pharmacyName}</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{pharmacyAddress}</p>
            {pharmacyPhone && (
              <p className="text-slate-400 text-[10px]">Tel: {pharmacyPhone}</p>
            )}
            <div className="pt-1 flex items-center justify-center gap-3 text-[10px] text-slate-500 font-medium">
              <span>Date: {formatDateTime(sale.createdAt || Date.now())}</span>
              {sale.cashierName && (
                <span>• Cashier: {sale.cashierName}</span>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400 uppercase">
                <tr>
                  <th className="py-2">Medicine Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Subtotal</th>
                  <th className="py-2 text-right text-emerald-700 dark:text-emerald-400">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(sale.items || []).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">
                      {item.medicineName || item.medicine?.name}
                    </td>
                    <td className="py-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 text-right">{formatBirr(item.unitPrice)}</td>
                    <td className="py-2 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatBirr(item.itemTotal || item.totalPrice || item.quantity * item.unitPrice)}
                    </td>
                    <td className="py-2 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                      +{formatBirr(item.itemProfit || item.profit || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-1.5">
            {parseFloat(sale.discount || 0) > 0 && (
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Discount Applied:</span>
                <span className="font-semibold text-rose-600">-{formatBirr(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline font-black text-sm text-slate-900 dark:text-slate-100 pt-1">
              <span>Grand Total Paid:</span>
              <span className="text-base text-emerald-700 dark:text-emerald-400 font-black">
                {formatBirr(sale.total)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
              <span>Gross Profit on this Sale:</span>
              <span>+{formatBirr(sale.totalProfit)}</span>
            </div>
          </div>

          {/* Receipt Footer note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 italic">
            Thank you for trusting Pharmacy Care. Keep receipt for returns or queries.
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </Button>
          <Button type="button" variant="primary" onClick={onClose} className="flex items-center gap-1.5 text-xs">
            <ShoppingBag className="w-4 h-4" />
            <span>New POS Sale</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

