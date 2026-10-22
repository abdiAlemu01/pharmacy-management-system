import React, { useState } from 'react';
import { ShoppingCart, BarChart3, Receipt, RefreshCw, AlertCircle, CheckCircle2, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SalesAnalyticsCards } from '../components/SalesAnalyticsCards';
import { TopAndLessSellingSection } from '../components/TopAndLessSellingSection';
import { POSTerminal } from '../components/POSTerminal';
import { SalesHistoryTable } from '../components/SalesHistoryTable';
import { ReceiptModal } from '../components/ReceiptModal';
import { SaleCardContentModal } from '../components/SaleCardContentModal';
import {
  useSalesAnalytics,
  usePOSMedicines,
  useSalesHistory,
  useCreateSale,
} from '../hooks/use-sales';

export const SalesPage = () => {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'analytics' | 'history'

  // History search & pagination
  const [historySearch, setHistorySearch] = useState('');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(15);

  // Completed sale receipt modal
  const [completedSale, setCompletedSale] = useState(null);
  const [notification, setNotification] = useState(null);

  // Summary Card Modal & Active Filter
  const [selectedCardModal, setSelectedCardModal] = useState({ isOpen: false, cardType: 'DAILY_SELL' });
  const [activeCardFilter, setActiveCardFilter] = useState(null);

  const handleCardClick = (cardKey) => {
    setSelectedCardModal({ isOpen: true, cardType: cardKey });
  };

  const handleApplyCardFilter = (cardKey, config) => {
    setActiveTab('history');
    setActiveCardFilter(cardKey);
    setHistorySearch('');
    setHistoryStartDate(config.startDate);
    setHistoryEndDate(config.endDate);
    setHistoryPage(1);
  };

  const handleClearCardFilter = () => {
    setActiveCardFilter(null);
    setHistoryStartDate('');
    setHistoryEndDate('');
    setHistorySearch('');
    setHistoryPage(1);
  };

  // Queries
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
    isFetching: isFetchingAnalytics,
  } = useSalesAnalytics();

  const {
    data: posMedsData,
    isLoading: isPOSMedsLoading,
    refetch: refetchPOSMeds,
  } = usePOSMedicines();

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useSalesHistory({
    page: historyPage,
    limit: historyLimit,
    search: historySearch,
    startDate: historyStartDate,
    endDate: historyEndDate,
  });

  const createSaleMutation = useCreateSale();

  const analytics = analyticsData?.data || {};
  const posMedicines = posMedsData?.data || [];
  const salesHistory = historyData?.data?.sales || [];
  const historyPagination = historyData?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };

  const handleRefresh = () => {
    refetchAnalytics();
    refetchPOSMeds();
    refetchHistory();
  };

  const handleCheckout = async (salePayload, onSuccessCallback) => {
    try {
      setNotification(null);
      const res = await createSaleMutation.mutateAsync(salePayload);
      if (onSuccessCallback) onSuccessCallback();
      setCompletedSale(res.data);
      setNotification({
        type: 'success',
        message: `Sale completed successfully! Total: ${res.data.total} Birr, Profit: +${res.data.totalProfit} Birr.`,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process sale. Please check available stock.';
      setNotification({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales & Point of Sale 
          </h1>
         
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetchingAnalytics}
            className="flex items-center gap-1.5 text-sm py-2 px-4"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingAnalytics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold px-2 py-1 hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Key Financial Analytics Cards (Daily & Monthly Sell & Profit) */}
      <SalesAnalyticsCards
        analytics={analytics}
        isLoading={isAnalyticsLoading}
        onCardClick={handleCardClick}
        activeFilter={activeCardFilter}
      />

      {/* Active Card Filter Banner */}
      {activeCardFilter && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 px-4 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs shadow-2xs animate-in fade-in duration-150 mb-2">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 font-medium">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <span>Filtered by card: </span>
              <strong className="font-bold underline decoration-emerald-500">
                {activeCardFilter === 'DAILY_SELL'
                  ? 'Total Daily Sell'
                  : activeCardFilter === 'DAILY_PROFIT'
                  ? 'Total Daily Profit'
                  : activeCardFilter === 'MONTHLY_SELL'
                  ? 'Total Monthly Sell'
                  : 'Total Monthly Profit'}
              </strong>
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold ml-2">
                ({historyPagination.total} {historyPagination.total === 1 ? 'sale' : 'sales'} found)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'history' && (
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Go to Sales History
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedCardModal({ isOpen: true, cardType: activeCardFilter })}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              View Content Modal
            </button>
            <button
              type="button"
              onClick={handleClearCardFilter}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              Clear Filter / Show All
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pos')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pos'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Point of Sale (POS Terminal)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Most Selling Medicines Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Sales History & Receipts</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'pos' && (
        <POSTerminal
          medicines={posMedicines}
          isLoading={isPOSMedsLoading}
          onCheckout={handleCheckout}
          isCheckingOut={createSaleMutation.isPending}
        />
      )}

      {activeTab === 'analytics' && (
        <TopAndLessSellingSection
          analytics={analytics}
          isLoading={isAnalyticsLoading}
        />
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <SalesHistoryTable
            sales={salesHistory}
            isLoading={isHistoryLoading}
            searchTerm={historySearch}
            onSearchChange={(val) => {
              setHistorySearch(val);
              setHistoryPage(1);
            }}
            startDate={historyStartDate}
            onStartDateChange={(val) => {
              setHistoryStartDate(val);
              setHistoryPage(1);
            }}
            endDate={historyEndDate}
            onEndDateChange={(val) => {
              setHistoryEndDate(val);
              setHistoryPage(1);
            }}
          />

          {historyPagination.total > 0 && (
            <Pagination
              currentPage={historyPagination.page}
              totalPages={historyPagination.totalPages}
              totalRecords={historyPagination.total}
              pageSize={historyPagination.limit}
              onPageChange={setHistoryPage}
              onPageSizeChange={(newLimit) => {
                setHistoryLimit(newLimit);
                setHistoryPage(1);
              }}
            />
          )}
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
      />

      {/* Sale Card Content Breakdown Modal */}
      <SaleCardContentModal
        isOpen={selectedCardModal.isOpen}
        cardType={selectedCardModal.cardType}
        onClose={() => setSelectedCardModal({ isOpen: false, cardType: 'DAILY_SELL' })}
        onViewReceipt={(sale) => {
          setSelectedCardModal({ isOpen: false, cardType: 'DAILY_SELL' });
          setCompletedSale(sale);
        }}
        onApplyFilterToHistory={(cardKey, config) => {
          handleApplyCardFilter(cardKey, config);
        }}
      />
    </div>
  );
};

export default SalesPage;

