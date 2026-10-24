import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '../hooks/use-suppliers';
import { SupplierTable } from '../components/SupplierTable';
import { SupplierForm } from '../components/SupplierForm';
import { SupplierDetailsModal } from '../components/SupplierDetailsModal';
import { SupplierPurchaseHistory } from '../components/SupplierPurchaseHistory';

export const SuppliersPage = () => {
  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [detailsSupplier, setDetailsSupplier] = useState(null);
  const [historySupplier, setHistorySupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);

  // Success alert message
  const [alertMessage, setAlertMessage] = useState(null);

  // Data fetching
  const { data, isLoading } = useSuppliers({
    search: searchTerm,
    status: statusFilter,
  });

  // Mutations
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const suppliersList = data?.data?.suppliers || [];
  const summary = data?.data?.summary || {
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
    totalPurchasesCount: 0,
    totalPurchasesAmount: 0,
  };

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Handlers
  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData, callback) => {
    if (editingSupplier) {
      updateSupplierMutation.mutate(
        { id: editingSupplier.id, ...formData },
        {
          onSuccess: () => {
            showAlert(`Supplier "${formData.name}" updated successfully!`);
            callback();
          },
          onError: (err) => {
            alert(err.response?.data?.message || err.message || 'Failed to update supplier');
          },
        }
      );
    } else {
      createSupplierMutation.mutate(formData, {
        onSuccess: () => {
          showAlert(`Supplier "${formData.name}" registered successfully!`);
          callback();
        },
        onError: (err) => {
          alert(err.response?.data?.message || err.message || 'Failed to register supplier');
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingSupplier) return;
    deleteSupplierMutation.mutate(deletingSupplier.id, {
      onSuccess: (res) => {
        showAlert(res.message || 'Supplier deleted successfully.');
        setDeletingSupplier(null);
      },
      onError: (err) => {
        alert(err.response?.data?.message || err.message || 'Failed to delete supplier');
        setDeletingSupplier(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-emerald-600" />
            <span>Suppliers Page </span>
          </h1>
          
        </div>

        {/* Add Supplier Button */}
        <Button
          type="button"
          variant="primary"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 self-start sm:self-auto py-2.5 px-4 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
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
      {/* Search Bar */}
      <div className="relative w-full max-w-md sm:max-w-lg">
        <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Company/Supplier name...."
          className="w-full pl-12 pr-10 py-3 text-sm sm:text-base bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all font-medium shadow-2xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Supplier Table */}
      <SupplierTable
        suppliers={suppliersList}
        isLoading={isLoading}
        onViewDetails={(sup) => setDetailsSupplier(sup)}
        onEdit={(sup) => handleOpenEdit(sup)}
        onViewPurchases={(sup) => setHistorySupplier(sup)}
        onDelete={(sup) => setDeletingSupplier(sup)}
      />

      {/* Supplier Register / Edit Modal */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSupplier(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingSupplier}
        isLoading={createSupplierMutation.isPending || updateSupplierMutation.isPending}
      />

      {/* View Supplier Details Modal */}
      <SupplierDetailsModal
        isOpen={Boolean(detailsSupplier)}
        onClose={() => setDetailsSupplier(null)}
        supplier={detailsSupplier}
        onEdit={(sup) => handleOpenEdit(sup)}
        onViewPurchases={(sup) => setHistorySupplier(sup)}
      />

      {/* View Supplier Purchase History Modal */}
      <SupplierPurchaseHistory
        isOpen={Boolean(historySupplier)}
        onClose={() => setHistorySupplier(null)}
        supplier={historySupplier}
      />

      {/* Delete / Deactivate Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingSupplier)}
        onClose={() => setDeletingSupplier(null)}
        title="Confirm Supplier Deletion / Deactivation"
      >
        {deletingSupplier && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">
                  Are you sure you want to remove &quot;{deletingSupplier.name}&quot;?
                </p>
                <p className="text-xs text-rose-700 mt-1">
                  If this supplier has recorded purchase orders or deliveries, their status will safely be updated to{' '}
                  <strong>INACTIVE</strong> to preserve financial and inventory records.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingSupplier(null)}
                disabled={deleteSupplierMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleteSupplierMutation.isPending}
              >
                {deleteSupplierMutation.isPending ? 'Processing...' : 'Confirm Delete / Deactivate'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default SuppliersPage;

