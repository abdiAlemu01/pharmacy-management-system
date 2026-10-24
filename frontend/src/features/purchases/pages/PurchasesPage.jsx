import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  PackageCheck,
  CreditCard,
  RotateCcw,
  Trash2,
  Calendar,
  Building2,
  ChevronDown,
  Check,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';
import { useAppDate } from '@/shared/lib/date-utils';
import { useSuppliers } from '@/features/suppliers';
import {
  usePurchases,
  usePurchasesSummary,
  useCreatePurchase,
  useReceiveMedicines,
  useRecordPayment,
  useReturnMedicines,
  useDeletePurchase,
} from '../hooks/use-purchases';
import { DeliveryStatusBadge, PaymentStatusBadge } from '../components/PurchaseStatusBadge';
import { PurchaseOrderModal } from '../components/PurchaseOrderModal';
import { ReceiveMedicinesModal } from '../components/ReceiveMedicinesModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { ReturnMedicinesModal } from '../components/ReturnMedicinesModal';
import { PurchaseDetailsModal } from '../components/PurchaseDetailsModal';
import { PurchasesSummaryCards } from '../components/PurchasesSummaryCards';
import { PurchaseCardContentModal } from '../components/PurchaseCardContentModal';

const DropdownSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between text-left transition-colors cursor-pointer bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 text-slate-800 dark:text-slate-100 font-semibold hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs ${
          buttonClassName || 'px-3 py-2.5 rounded-xl text-xs'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-300 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-40 left-0 right-0 mt-1 min-w-[190px] max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const isSelected = String(value) === String(opt.value);
            return (
              <button
                key={opt.value ?? 'empty'}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PurchasesPage = () => {
  const { formatDate } = useAppDate();
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailsPurchase, setDetailsPurchase] = useState(null);
  const [receivePurchase, setReceivePurchase] = useState(null);
  const [paymentPurchase, setPaymentPurchase] = useState(null);
  const [returnPurchase, setReturnPurchase] = useState(null);
  const [deletingPurchase, setDeletingPurchase] = useState(null);
  const [selectedCardModal, setSelectedCardModal] = useState({ isOpen: false, cardType: 'TODAY' });
  const [activeCardFilter, setActiveCardFilter] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-action-menu]')) {
        setActiveActionMenuId(null);
      }
    };
    if (activeActionMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeActionMenuId]);

  const handleCardClick = (cardKey) => {
    setSelectedCardModal({ isOpen: true, cardType: cardKey });
  };

  const handleApplyCardFilter = (cardKey, config) => {
    setActiveCardFilter(cardKey);
    setSearchTerm('');
    setSupplierFilter('');
    setStatusFilter('');
    setPage(1);

    if (cardKey === 'TODAY' || cardKey === 'MONTH' || cardKey === 'YEAR') {
      setStartDate(config.startDate);
      setEndDate(config.endDate);
      setPaymentStatusFilter('');
    } else if (cardKey === 'PAID') {
      setStartDate('');
      setEndDate('');
      setPaymentStatusFilter('PAID');
    } else if (cardKey === 'OUTSTANDING') {
      setStartDate('');
      setEndDate('');
      setPaymentStatusFilter('OUTSTANDING');
    } else {
      setStartDate('');
      setEndDate('');
      setPaymentStatusFilter('');
    }
  };

  const handleClearCardFilter = () => {
    setActiveCardFilter(null);
    setStartDate('');
    setEndDate('');
    setPaymentStatusFilter('');
    setStatusFilter('');
    setSupplierFilter('');
    setSearchTerm('');
    setPage(1);
  };

  // Alert
  const [alertMessage, setAlertMessage] = useState(null);

  // Suppliers for filter
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const suppliers = suppliersData?.data?.suppliers || [];

  const supplierOptions = [
    { value: '', label: 'All Suppliers' },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ];

  const statusOptions = [
    { value: '', label: 'Delivery Status' },
    { value: 'ORDERED', label: 'Ordered' },
    { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
    { value: 'RECEIVED', label: 'Received' },
    { value: 'RETURNED', label: 'Returned' },
  ];

  const paymentStatusOptions = [
    { value: '', label: 'All Payments' },
    { value: 'UNPAID', label: 'Unpaid' },
    { value: 'PARTIAL', label: 'Partial' },
    { value: 'PAID', label: 'Paid' },
  ];

  // Data queries
  const { data: purchasesData, isLoading } = usePurchases({
    search: searchTerm,
    supplierId: supplierFilter,
    status: statusFilter,
    paymentStatus: paymentStatusFilter,
    startDate,
    endDate,
    page,
    limit: 15,
  });

  const { data: summaryData } = usePurchasesSummary();

  // Mutations
  const createPurchaseMutation = useCreatePurchase();
  const receiveMedicinesMutation = useReceiveMedicines();
  const recordPaymentMutation = useRecordPayment();
  const returnMedicinesMutation = useReturnMedicines();
  const deletePurchaseMutation = useDeletePurchase();

  const purchasesList = purchasesData?.data?.purchases || [];
  const pagination = purchasesData?.data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const summary = summaryData?.data || null;

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Handlers
  const handleCreateSubmit = (payload, callback) => {
    createPurchaseMutation.mutate(payload, {
      onSuccess: (res) => {
        showAlert(`Purchase Order "${res.data.purchaseOrderNo}" created successfully!`);
        callback();
      },
      onError: (err) => {
        alert(err.response?.data?.message || err.message || 'Failed to create purchase order');
      },
    });
  };

  const handleReceiveSubmit = (id, payload, callback) => {
    receiveMedicinesMutation.mutate(
      { id, ...payload },
      {
        onSuccess: (res) => {
          showAlert(`Medicines received for ${res.data.purchaseOrderNo}! Inventory updated.`);
          callback();
        },
        onError: (err) => {
          alert(err.response?.data?.message || err.message || 'Failed to receive medicines');
        },
      }
    );
  };

  const handlePaymentSubmit = (id, payload, callback) => {
    recordPaymentMutation.mutate(
      { id, ...payload },
      {
        onSuccess: (res) => {
          showAlert(`Payment of ${payload.amount} Birr recorded for ${res.data.purchaseOrderNo}!`);
          callback();
        },
        onError: (err) => {
          alert(err.response?.data?.message || err.message || 'Failed to record payment');
        },
      }
    );
  };

  const handleReturnSubmit = (id, payload, callback) => {
    returnMedicinesMutation.mutate(
      { id, ...payload },
      {
        onSuccess: (res) => {
          showAlert(`Return processed for ${res.data.purchaseOrderNo}! Inventory adjusted.`);
          callback();
        },
        onError: (err) => {
          alert(err.response?.data?.message || err.message || 'Failed to process return');
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingPurchase) return;
    deletePurchaseMutation.mutate(deletingPurchase.id, {
      onSuccess: () => {
        showAlert('Purchase order deleted successfully.');
        setDeletingPurchase(null);
      },
      onError: (err) => {
        alert(err.response?.data?.message || err.message || 'Failed to delete purchase');
        setDeletingPurchase(null);
      },
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSupplierFilter('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm || supplierFilter || statusFilter || paymentStatusFilter || startDate || endDate
  );

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 sm:gap-2.5">
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
            <span>Purchases Page</span>
          </h1>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 shadow-xs shrink-0 ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </Button>
      </div>

      {/* Success Notification Alert */}
      {alertMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Purchase Summary KPI Cards and Activity Reports */}
      <PurchasesSummaryCards
        summary={summary}
        onCardClick={handleCardClick}
        activeFilter={activeCardFilter}
      />

      {/* Active Card Filter Banner */}
      {activeCardFilter && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 px-4 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 font-medium">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <span>Filtered by card: </span>
              <strong className="font-bold underline decoration-emerald-500">
                {activeCardFilter === 'TODAY'
                  ? 'Purchases Today'
                  : activeCardFilter === 'MONTH'
                  ? 'Purchases This Month'
                  : activeCardFilter === 'YEAR'
                  ? 'Purchases This Year'
                  : activeCardFilter === 'PAID'
                  ? 'Paid to Suppliers'
                  : 'Outstanding Balance Due'}
              </strong>
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold ml-2">
                ({pagination.total} {pagination.total === 1 ? 'order' : 'orders'} found)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Clear Filter / Show All
            </button>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by supplier"
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Supplier filter */}
        <div className="w-full sm:w-64">
          <DropdownSelect
            value={supplierFilter}
            onChange={(val) => {
              setSupplierFilter(val);
              setPage(1);
            }}
            options={supplierOptions}
            placeholder="All Suppliers"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="self-end sm:self-auto px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer shrink-0"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 4. Purchases Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs">
              <tr>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Medicine  Name</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-emerald-700 dark:text-emerald-400">Paid</th>
                <th className="py-3 px-4 text-rose-600 dark:text-rose-400">Balance Due</th>
                <th className="py-3 px-3 text-center">Delivery</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading purchase orders...
                  </td>
                </tr>
              ) : purchasesList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No purchase orders found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hasActiveFilters
                        ? 'Try clearing your search or status filters.'
                        : 'Create your first medicine purchase order to get started.'}
                    </p>
                    {!hasActiveFilters && (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setIsAddOpen(true)}
                        className="mt-3 text-xs py-2 px-3.5"
                      >
                        Create Purchase Order
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                purchasesList.map((p, index) => {
                  return (
                    <tr
                      key={p.id}
                      onDoubleClick={() => setDetailsPurchase(p)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      {/* Supplier */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {p.supplierName}
                        </span>
                        {p.supplierPhone && (
                          <span className="text-[11px] text-slate-400">{p.supplierPhone}</span>
                        )}
                      </td>

                      {/* Medicine Name */}
                      <td className="py-3 px-4">
                        {p.items && p.items.length > 0 ? (
                          <div className="max-w-[180px] sm:max-w-[220px]">
                            <span
                              className="font-bold text-slate-900 dark:text-slate-100 block truncate"
                              title={p.items.map((it) => `${it.medicineName} (${it.quantity})`).join(', ')}
                            >
                              {p.items.map((it) => it.medicineName).join(', ')}
                            </span>
                            {p.items.length > 1 ? (
                              <span className="text-[10px] text-slate-400 block font-medium">
                                +{p.items.length - 1} more
                              </span>
                            ) : p.items[0]?.batchNumber ? (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Batch: {p.items[0].batchNumber}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">-</span>
                        )}
                      </td>

                      {/* Order Date */}
                      <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {p.orderDate ? formatDate(p.orderDate) : '-'}
                      </td>

                      {/* Items */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {p.itemCount}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {Math.round(p.totalCost || 0).toLocaleString('en-US')}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {Math.round(p.amountPaid || 0).toLocaleString('en-US')}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {Math.round(p.amountDue || 0).toLocaleString('en-US')}
                      </td>

                      {/* Delivery Status Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <DeliveryStatusBadge status={p.status} />
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <PaymentStatusBadge status={p.paymentStatus} />
                      </td>

                      {/* Actions Column (Three-dot Kebab Menu) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="relative inline-block text-left" data-action-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(activeActionMenuId === p.id ? null : p.id);
                            }}
                            className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer ${
                              activeActionMenuId === p.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-2 ring-emerald-500/20' : ''
                            }`}
                            title="Actions"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeActionMenuId === p.id && (
                            <div
                              className={`absolute right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in zoom-in-95 duration-100 ${
                                index >= purchasesList.length - 2 && purchasesList.length > 2
                                  ? 'bottom-full mb-1'
                                  : 'top-full mt-1'
                              }`}
                            >
                              {/* 1. View Details */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  setDetailsPurchase(p);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left font-medium cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>View Details</span>
                              </button>

                              {/* 2. Receive Medicines */}
                              <button
                                type="button"
                                disabled={p.status === 'RECEIVED'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (p.status === 'RECEIVED') return;
                                  setActiveActionMenuId(null);
                                  setReceivePurchase(p);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left font-medium transition-colors ${
                                  p.status === 'RECEIVED'
                                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                                }`}
                                title={p.status === 'RECEIVED' ? 'All items already received' : 'Receive medicines'}
                              >
                                <PackageCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Receive Medicines</span>
                              </button>

                              {/* 3. Record Payment */}
                              <button
                                type="button"
                                disabled={p.amountDue <= 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (p.amountDue <= 0) return;
                                  setActiveActionMenuId(null);
                                  setPaymentPurchase(p);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left font-medium transition-colors ${
                                  p.amountDue <= 0
                                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                                }`}
                                title={p.amountDue <= 0 ? 'Payment settled in full' : 'Record payment'}
                              >
                                <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                                <span>Record Payment</span>
                              </button>

                              {/* 4. Return Medicines */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  setReturnPurchase(p);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left font-medium cursor-pointer"
                              >
                                <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span>Return Medicines</span>
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                              {/* 5. Delete Order */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  setDeletingPurchase(p);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-medium cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1 px-2.5 text-xs"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="py-1 px-2.5 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Modal: Add Purchase */}
      <PurchaseOrderModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createPurchaseMutation.isPending}
      />

      {/* 2. Modal: Receive Medicines */}
      <ReceiveMedicinesModal
        isOpen={Boolean(receivePurchase)}
        onClose={() => setReceivePurchase(null)}
        purchase={receivePurchase}
        onSubmit={handleReceiveSubmit}
        isLoading={receiveMedicinesMutation.isPending}
      />

      {/* 3. Modal: Record Supplier Payment */}
      <RecordPaymentModal
        isOpen={Boolean(paymentPurchase)}
        onClose={() => setPaymentPurchase(null)}
        purchase={paymentPurchase}
        onSubmit={handlePaymentSubmit}
        isLoading={recordPaymentMutation.isPending}
      />

      {/* 4. Modal: View Details */}
      <PurchaseDetailsModal
        isOpen={Boolean(detailsPurchase)}
        onClose={() => setDetailsPurchase(null)}
        purchase={detailsPurchase}
        onOpenReceive={(p) => setReceivePurchase(p)}
        onOpenPayment={(p) => setPaymentPurchase(p)}
        onOpenReturn={(p) => setReturnPurchase(p)}
      />

      {/* 5. Modal: Return Medicines */}
      <ReturnMedicinesModal
        isOpen={Boolean(returnPurchase)}
        onClose={() => setReturnPurchase(null)}
        purchase={returnPurchase}
        onSubmit={handleReturnSubmit}
        isLoading={returnMedicinesMutation.isPending}
      />

      {/* 6. Modal: Delete Purchase Confirmation */}
      <Dialog
        isOpen={Boolean(deletingPurchase)}
        onClose={() => setDeletingPurchase(null)}
        title="Confirm Purchase Deletion"
      >
        {deletingPurchase && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">
                  Are you sure you want to delete purchase &quot;{deletingPurchase.purchaseOrderNo}&quot;?
                </p>
                <p className="text-xs text-rose-700 mt-1">
                  Supplier: <strong>{deletingPurchase.supplierName}</strong> ({deletingPurchase.totalCost} Birr).
                  This will remove this order and its payment logs.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingPurchase(null)}
                disabled={deletePurchaseMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deletePurchaseMutation.isPending}
              >
                {deletePurchaseMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* 7. Modal: Card Content Breakdown */}
      <PurchaseCardContentModal
        isOpen={selectedCardModal.isOpen}
        cardType={selectedCardModal.cardType}
        onClose={() => setSelectedCardModal({ isOpen: false, cardType: 'TODAY' })}
        onViewDetails={(p) => {
          setSelectedCardModal({ isOpen: false, cardType: 'TODAY' });
          setDetailsPurchase(p);
        }}
        onApplyFilterToTable={(cardKey, config) => {
          handleApplyCardFilter(cardKey, config);
        }}
      />
    </div>
  );
};

export default PurchasesPage;

