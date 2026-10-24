import React, { useState } from 'react';
import { Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { MedicineTable } from '../components/MedicineTable';
import { MedicineFilters } from '../components/MedicineFilters';
import { MedicineForm } from '../components/MedicineForm';
import { MedicineDetails } from '../components/MedicineDetails';
import { useMedicines, useCreateMedicine, useUpdateMedicine } from '../hooks/use-medicines';

export const MedicinesPage = () => {
  // Query state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [viewingMedicine, setViewingMedicine] = useState(null);

  // Notifications
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // Handlers for filter/search updates (resets page to 1 as required)
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  const handleThresholdChange = (val) => {
    const num = Number(val);
    if (!isNaN(num) && num >= 1) {
      setLowStockThreshold(num);
      setPage(1);
    }
  };

  const handleSortToggle = (col) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Queries & Mutations
  const { data, isLoading, isError, error, refetch, isFetching } = useMedicines({
    search,
    status,
    sortBy,
    sortOrder,
    page,
    limit,
    lowStockThreshold,
  });

  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();

  const handleCreate = async (formData) => {
    try {
      setNotification(null);
      await createMutation.mutateAsync(formData);
      setIsAddModalOpen(false);
      setNotification({
        type: 'success',
        message: `Medicine "${formData.name}" was added successfully!`,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add medicine.';
      setNotification({ type: 'error', message: msg });
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingMedicine) return;
    try {
      setNotification(null);
      const res = await updateMutation.mutateAsync({
        id: editingMedicine.id,
        data: formData,
      });

      // Update active viewing medicine if open
      if (viewingMedicine && viewingMedicine.id === editingMedicine.id) {
        setViewingMedicine(res.data);
      }

      setEditingMedicine(null);
      setNotification({
        type: 'success',
        message: `Medicine "${formData.name}" was updated successfully!`,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update medicine.';
      setNotification({ type: 'error', message: msg });
    }
  };

  const medicines = data?.data?.items || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medicines</h1>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={() => {
              setNotification(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-semibold hover:opacity-75 cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters, Search, Sort Controls */}
      <MedicineFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        lowStockThreshold={lowStockThreshold}
        onThresholdChange={handleThresholdChange}
      />

      {/* Error state */}
      {isError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error?.response?.data?.message || 'Error loading medicines from server.'}</span>
        </div>
      )}

      {/* Medicines Table */}
      <MedicineTable
        medicines={medicines}
        loading={isLoading}
        onViewDetails={(med) => setViewingMedicine(med)}
        onEditMedicine={(med) => setEditingMedicine(med)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortToggle={handleSortToggle}
      />

      {/* Pagination Controls */}
      {!isLoading && medicines.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalRecords={pagination.total}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Add Medicine Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Medicine"
      >
        <MedicineForm
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
          loading={createMutation.isPending}
        />
      </Dialog>

      {/* Edit Medicine Modal */}
      <Dialog
        isOpen={Boolean(editingMedicine)}
        onClose={() => setEditingMedicine(null)}
        title={`Edit Medicine: ${editingMedicine?.name || ''}`}
      >
        <MedicineForm
          initialData={editingMedicine}
          onSubmit={handleUpdate}
          onCancel={() => setEditingMedicine(null)}
          loading={updateMutation.isPending}
        />
      </Dialog>

      {/* View Medicine Details Modal */}
      <Dialog
        isOpen={Boolean(viewingMedicine)}
        onClose={() => setViewingMedicine(null)}
        title="Medicine Details"
      >
        <MedicineDetails
          medicine={viewingMedicine}
          onEdit={(med) => {
            setViewingMedicine(null);
            setEditingMedicine(med);
          }}
          onClose={() => setViewingMedicine(null)}
        />
      </Dialog>
    </div>
  );
};
