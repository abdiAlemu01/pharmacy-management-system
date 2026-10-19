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
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';
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
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Selection
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [noSelectionPrompt, setNoSelectionPrompt] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailsPurchase, setDetailsPurchase] = useState(null);
  const [receivePurchase, setReceivePurchase] = useState(null);
  const [paymentPurchase, setPaymentPurchase] = useState(null);
  const [returnPurchase, setReturnPurchase] = useState(null);
  const [deletingPurchase, setDeletingPurchase] = useState(null);

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

  const selectedPurchase = purchasesList.find((p) => p.id === selectedPurchaseId) || null;

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleToggleSelect = (id) => {
    setSelectedPurchaseId((prev) => (prev === id ? null : id));
    setNoSelectionPrompt(false);
  };

  const handleActionClick = (actionType) => {
    if (!selectedPurchase) {
      setNoSelectionPrompt(true);
      setTimeout(() => setNoSelectionPrompt(false), 4000);
      return;
    }

    setNoSelectionPrompt(false);
    switch (actionType) {
      case 'details':
        setDetailsPurchase(selectedPurchase);
        break;
      case 'receive':
        setReceivePurchase(selectedPurchase);
        break;
      case 'pay':
        setPaymentPurchase(selectedPurchase);
        break;
      case 'return':
        setReturnPurchase(selectedPurchase);
        break;
      case 'delete':
        setDeletingPurchase(selectedPurchase);
        break;
      default:
        break;
    }
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
        setSelectedPurchaseId(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-emerald-600" />
            <span>Purchases Management</span>
          </h1>
          
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto py-2.5 px-4 shadow-sm"
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
      <PurchasesSummaryCards summary={summary} />

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Supplier Name, Medicine,....."
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
          <div>
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

          {/* Delivery Status filter */}
          <div>
            <DropdownSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={statusOptions}
              placeholder="Delivery Status"
            />
          </div>
        </div>

        {/* Second Row: Payment Status & Date Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Payment</span>
              <DropdownSelect
                value={paymentStatusFilter}
                onChange={(val) => {
                  setPaymentStatusFilter(val);
                  setPage(1);
                }}
                options={paymentStatusOptions}
                placeholder="All Payments"
                className="min-w-[130px]"
                buttonClassName="px-2.5 py-1.5 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">From </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Action Toolbar for Selected Purchase */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-3 sm:p-4">
        {noSelectionPrompt && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please select a purchase order row from the table below to execute an action.</span>
            </div>
            <button
              type="button"
              onClick={() => setNoSelectionPrompt(false)}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-900 ml-2 font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleActionClick('details')}
              disabled={!selectedPurchase}
              className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                selectedPurchase
                  ? 'border-slate-300 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Eye className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>View Details</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleActionClick('receive')}
              disabled={!selectedPurchase || selectedPurchase.status === 'RECEIVED'}
              className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                selectedPurchase && selectedPurchase.status !== 'RECEIVED'
                  ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer shadow-2xs'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Receive Medicines</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleActionClick('pay')}
              disabled={!selectedPurchase || selectedPurchase.amountDue <= 0}
              className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                selectedPurchase && selectedPurchase.amountDue > 0
                  ? 'border-sky-300 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 cursor-pointer shadow-2xs'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Record Payment</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleActionClick('return')}
              disabled={!selectedPurchase || selectedPurchase.totalQuantityReceived <= 0}
              className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                selectedPurchase && selectedPurchase.totalQuantityReceived > 0
                  ? 'border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer shadow-2xs'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Return Medicines</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleActionClick('delete')}
              disabled={!selectedPurchase}
              className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                selectedPurchase
                  ? 'border-rose-300 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shadow-2xs'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Delete</span>
            </Button>
          </div>
          
        </div>
      </div>

      {/* 5. Purchases Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs">
              <tr>
                <th className="py-3 px-3 text-center w-10">Select</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Medicine  Name</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-emerald-700 dark:text-emerald-400">Paid</th>
                <th className="py-3 px-4 text-rose-600 dark:text-rose-400">Balance Due</th>
                <th className="py-3 px-3 text-center">Delivery</th>
                <th className="py-3 px-3 text-center">Payment</th>
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
                purchasesList.map((p) => {
                  const isSelected = p.id === selectedPurchaseId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleToggleSelect(p.id)}
                      onDoubleClick={() => setDetailsPurchase(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-inset ring-emerald-500/30'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Selection radio/checkbox indicator */}
                      <td className="py-3 px-3 text-center">
                        <div
                          className={`w-4 h-4 mx-auto rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </td>

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
                        {new Date(p.orderDate).toLocaleDateString()}
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
    </div>
  );
};

export default PurchasesPage;

