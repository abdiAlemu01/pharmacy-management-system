import React from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { PlusCircle, MinusCircle, History, AlertCircle } from 'lucide-react';
import { useInventoryMovements } from '../hooks/use-inventory';

export const InventoryMovementsModal = ({ isOpen, onClose }) => {
  const { data, isLoading } = useInventoryMovements({ page: 1, limit: 30 });
  const movements = data?.data?.items || [];

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Stock Movements History">
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Complete audit trail of all additions (+) and deductions (-) in stock.
        </p>

        <div className="max-h-[60vh] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading stock movements...
            </div>
          ) : movements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <History className="w-6 h-6 mx-auto text-slate-300 mb-1" />
              No stock movements recorded yet.
            </div>
          ) : (
            movements.map((m) => {
              const isAdd = m.type === 'ADD';
              return (
                <div key={m.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isAdd ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isAdd ? (
                        <PlusCircle className="w-4 h-4" />
                      ) : (
                        <MinusCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{m.medicineName}</p>
                      <p className="text-slate-500 mt-0.5">
                        {isAdd ? 'Stock Added' : 'Stock Reduced'} • Reason: <em>{m.reason || 'Manual'}</em>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Date: {m.purchaseDate || m.createdAt?.split('T')[0]} • By: {m.userName || 'Staff'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-extrabold text-sm ${
                        isAdd ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isAdd ? `+${m.quantity}` : `-${m.quantity}`} units
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Total: <strong>{formatBirr(m.totalPrice)}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Unit: {formatBirr(m.purchaseCost)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
};

