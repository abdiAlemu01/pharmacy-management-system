import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { POSTerminal } from '../components/POSTerminal';
import { ReceiptModal } from '../components/ReceiptModal';
import { usePOSMedicines, useCreatePOSSale } from '../hooks/use-pos';

export const POSPage = () => {
  const [completedSale, setCompletedSale] = useState(null);
  const [notification, setNotification] = useState(null);

  const {
    data: posMedsData,
    isLoading,
    refetch,
    isFetching,
  } = usePOSMedicines();

  const createSaleMutation = useCreatePOSSale();
  const posMedicines = posMedsData?.data || [];

  const handleCheckout = async (salePayload, onSuccessCallback) => {
    try {
      setNotification(null);
      const res = await createSaleMutation.mutateAsync(salePayload);
      if (onSuccessCallback) onSuccessCallback();
      setCompletedSale(res.data);
      setNotification({
        type: 'success',
        message: `Sale successfully completed! Total: ${res.data.total} Birr, Net Profit: +${res.data.totalProfit} Birr.`,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to process checkout. Please verify available stock.';
      setNotification({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Point of Sale (POS)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/sales">
            <Button
              variant="outline"
              className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:px-4 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Sales History</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:px-4 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh Stock</span>
          </Button>
        </div>
      </div>

      {/* Checkout Alert Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm transition-all shadow-2xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-semibold text-xs sm:text-sm">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold px-2 py-1 hover:opacity-75 cursor-pointer"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* POS Terminal Dispensary Interface */}
      <POSTerminal
        medicines={posMedicines}
        isLoading={isLoading}
        onCheckout={handleCheckout}
        isCheckingOut={createSaleMutation.isPending}
      />

      {/* Receipt Modal on Successful Checkout */}
      <ReceiptModal
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
      />
    </div>
  );
};

export default POSPage;

