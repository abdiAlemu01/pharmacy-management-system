import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  BarChart3,
  Receipt,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SalesAnalyticsCards } from '../components/SalesAnalyticsCards';
import { TopAndLessSellingSection } from '../components/TopAndLessSellingSection';
import { SalesHistoryTable } from '../components/SalesHistoryTable';
import { ReceiptModal } from '../components/ReceiptModal';
import { SaleCardContentModal } from '../components/SaleCardContentModal';
import { useSalesAnalytics, useSalesHistory } from '../hooks/use-sales';

export const SalesPage = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'analytics'

  // History search & pagination
  const [historySearch, setHistorySearch] = useState('');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(15);

  // Completed sale receipt modal for viewing receipt from records
  const [completedSale, setCompletedSale] = useState(null);
  const [notification, setNotification] = useState(null);

  // Auto-dismiss notification after 10 seconds
  React.useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [notification]);

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

  const analytics = analyticsData?.data || {};
  const salesHistory = historyData?.data?.sales || [];
  const historyPagination = historyData?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };

  const handleRefresh = () => {
    refetchAnalytics();
    refetchHistory();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Sales Records & Analytics
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Primary Action Button to Open Dedicated POS Feature */}
          <Link to="/pos">
            <Button
              variant="primary"
              className="flex items-center gap-2 text-xs sm:text-sm py-2 px-3.5 sm:px-4.5 font-bold shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open POS</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetchingAnalytics}
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:px-4 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingAnalytics ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm transition-all shadow-2xs ${
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
      {(activeTab === 'analytics' || activeCardFilter) && (
        <SalesAnalyticsCards
          analytics={analytics}
          isLoading={isAnalyticsLoading}
          onCardClick={handleCardClick}
          activeFilter={activeCardFilter}
        />
      )}

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

      {/* Tab Navigation (Separated from POS) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Sales History & Receipts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Most Selling Medicines Analytics</span>
        </button>
      </div>

      {/* Tab Contents */}
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

      {activeTab === 'analytics' && (
        <TopAndLessSellingSection
          analytics={analytics}
          isLoading={isAnalyticsLoading}
        />
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
