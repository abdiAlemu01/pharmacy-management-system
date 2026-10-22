import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { Printer, CheckCircle2 } from 'lucide-react';
import { useAppDate } from '@/shared/lib/date-utils';

export const ReceiptModal = ({ isOpen, onClose, sale }) => {
  const { formatDateTime } = useAppDate();
  if (!sale) return null;

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
        {/* Success header */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Transaction Confirmed!</p>
            
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div id="printable-receipt" className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 text-xs">
          {/* Pharmacy Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-200 space-y-1">
            <h3 className="font-black text-base text-slate-900 tracking-tight">Pharmacy Care Management</h3>
            <p className="text-slate-500 text-[11px]">Official Pharmacy POS Sales Receipt</p>
            <p className="text-[10px] text-slate-400">Date: {formatDateTime(sale.createdAt || Date.now())}</p>
            
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700">
              <thead className="border-b border-slate-200 font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-1.5">Medicine</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Price</th>
                  <th className="py-1.5 text-right">Total</th>
                  <th className="py-1.5 text-right text-emerald-700">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(sale.items || []).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2 font-medium text-slate-900">{item.medicineName}</td>
                    <td className="py-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 text-right">{formatBirr(item.unitPrice)}</td>
                    <td className="py-2 text-right font-bold">{formatBirr(item.itemTotal || item.totalPrice)}</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">
                      +{formatBirr(item.itemProfit || item.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="pt-3 border-t border-dashed border-slate-200 space-y-1.5">
            <div className="flex justify-between items-baseline font-black text-sm text-slate-900 pt-1">
              <span>Grand Total:</span>
              <span className="text-base text-emerald-700">{formatBirr(sale.total)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
              <span>Total Profit on this Sale:</span>
              <span>+{formatBirr(sale.totalProfit)}</span>
            </div>
          </div>


        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
            <Printer className="w-4 h-4" />
            Print Receipt
          </Button>
          <Button type="button" variant="primary" onClick={onClose} className="text-xs">
            New Sale
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

