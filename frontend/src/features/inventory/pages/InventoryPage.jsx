import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { InventorySummaryCards } from '../components/InventorySummaryCards';
import { InventoryTable } from '../components/InventoryTable';
import { AddStockModal } from '../components/AddStockModal';
import { ReduceStockModal } from '../components/ReduceStockModal';
import { EditStockModal } from '../components/EditStockModal';
import {
  useInventorySummary,
  useInventory,
  useAddStock,
  useReduceStock,
  useEditMedicineInventory,
} from '../hooks/use-inventory';

export const InventoryPage = () => {
  // Query & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReduceModalOpen, setIsReduceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Contextual target item for modals
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Notification feedback
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // Queries
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useInventorySummary();

  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    refetch: refetchInventory,
    isFetching,
  } = useInventory({
    search: searchTerm,
    page,
    limit,
  });

  // Mutations
  const addStockMutation = useAddStock();
  const reduceStockMutation = useReduceStock();
  const editMedicineMutation = useEditMedicineInventory();

  const summary = summaryData?.data || {};
  const items = inventoryData?.data?.items || [];
  const pagination = inventoryData?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Handlers for Add Stock
  const handleOpenAdd = (medicine = null) => {
    setSelectedMedicine(medicine);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      setNotification(null);
      await addStockMutation.mutateAsync(formData);
      setIsAddModalOpen(false);
      setNotification({
        type: 'success',
        message: `Successfully added ${formData.quantity} units of "${formData.name}". Inventory updated!`,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add stock.';
      setNotification({ type: 'error', message: msg });
    }
  };

  // Handlers for Reduce Stock
  const handleOpenReduce = (medicine = null) => {
    setSelectedMedicine(medicine);
    setIsReduceModalOpen(true);
  };

  const handleReduceSubmit = async (formData) => {
    try {
      setNotification(null);
      await reduceStockMutation.mutateAsync(formData);
      setIsReduceModalOpen(false);
      setNotification({
        type: 'success',
        message: `Successfully deducted ${formData.quantity} units from stock.`,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reduce stock.';
      setNotification({ type: 'error', message: msg });
    }
  };

  // Handlers for Edit Medicine
  const handleOpenEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async ({ id, data }) => {
    try {
      setNotification(null);
      await editMedicineMutation.mutateAsync({ id, data });
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: `Medicine "${data.name}" information updated successfully.`,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update medicine.';
      setNotification({ type: 'error', message: msg });
    }
  };

  // Search handler
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleRefresh = () => {
    refetchSummary();
    refetchInventory();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Management
          </h1>
          
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-sm py-2 px-4"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
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

      {/* Whole Investment & Stock Health Summary Cards */}
      <InventorySummaryCards summary={summary} isLoading={isSummaryLoading} />

      {/* Inventory Table with compact search and status pills */}
      <InventoryTable
        items={items}
        isLoading={isInventoryLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalRecords={pagination.total}
          pageSize={pagination.limit}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        initialMedicine={selectedMedicine}
        existingMedicines={items}
        isLoading={addStockMutation.isPending}
      />

      {/* Reduce Stock Modal */}
      <ReduceStockModal
        isOpen={isReduceModalOpen}
        onClose={() => setIsReduceModalOpen(false)}
        onSubmit={handleReduceSubmit}
        selectedMedicine={selectedMedicine}
        medicines={items}
        isLoading={reduceStockMutation.isPending}
      />

      {/* Edit Stock Modal */}
      <EditStockModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        medicine={selectedMedicine}
        isLoading={editMedicineMutation.isPending}
      />
    </div>
  );
};
export default InventoryPage;

