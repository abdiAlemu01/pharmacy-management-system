import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  CreditCard,
  FileText,
  ShoppingBag,
  Plus,
  Edit,
  DollarSign,
  PackageCheck,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import {
  useSupplier,
  useSupplierPurchases,
  useUpdateSupplier,
} from '../hooks/use-suppliers';
import { SupplierForm } from '../components/SupplierForm';
import { SupplierPurchaseHistory } from '../components/SupplierPurchaseHistory';

export const SupplierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);

  const { data: supplierData, isLoading: isLoadingSupplier, isError } = useSupplier(id);
  const { data: purchasesData, isLoading: isLoadingPurchases } = useSupplierPurchases(id);
  const updateSupplierMutation = useUpdateSupplier();

  const supplier = supplierData?.data;
  const purchases = purchasesData?.data?.purchases || [];
  const purchaseSummary = purchasesData?.data?.summary || {
    totalPurchasesCount: supplier?.totalPurchasesCount || 0,
    totalPurchasesAmount: supplier?.totalPurchasesAmount || 0,
  };

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const handleEditSubmit = (formData, callback) => {
    updateSupplierMutation.mutate(
      { id, ...formData },
      {
        onSuccess: () => {
          callback();
        },
        onError: (err) => {
          alert(err.response?.data?.message || err.message || 'Failed to update supplier');
        },
      }
    );
  };

  if (isLoadingSupplier) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Loading supplier details...
        </div>
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Supplier Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested supplier could not be loaded or may have been deleted.
        </p>
        <Button variant="primary" onClick={() => navigate('/suppliers')}>
          Back to Suppliers
        </Button>
      </div>
    );
  }

  const isActive = supplier.status === 'ACTIVE';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/suppliers')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              {supplier.name}
            </h1>
            <p className="text-xs text-slate-500">
              Supplier ID: <span className="font-mono text-slate-700">{supplier.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Edit Supplier
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPurchaseHistoryOpen(true)}
            className="flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Purchase History & Orders
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {supplier.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Purchases</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {purchaseSummary.totalPurchasesCount || 0} Orders
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cumulative Spent</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {formatBirr(purchaseSummary.totalPurchasesAmount)}
            </h3>
          </div>
        </div>
      </div>

      {/* Supplier Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Business Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Primary Contact Person</p>
                  <p className="font-semibold text-slate-800">{supplier.contactPerson || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Phone Number</p>
                  <a
                    href={`tel:${supplier.phone}`}
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    {supplier.phone || 'N/A'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Email Address</p>
                  {supplier.email ? (
                    <a
                      href={`mailto:${supplier.email}`}
                      className="font-semibold text-emerald-600 hover:underline"
                    >
                      {supplier.email}
                    </a>
                  ) : (
                    <span className="text-slate-400">None provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Physical / Warehouse Address</p>
                  <p className="font-medium text-slate-700">{supplier.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Commercial Terms
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">TIN / Tax Identification</p>
                  <p className="font-mono font-medium text-slate-700">{supplier.taxNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Payment Terms</p>
                  <p className="font-medium text-slate-700">{supplier.paymentTerms || 'Net 30 Days'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Partner Since</p>
                  <p className="font-medium text-slate-700">
                    {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stock Supplied & Purchase History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Supplied Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Stock Supplied / Product Portfolio
              </h3>
            </div>
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {supplier.stockSupplied || 'No specific product categories listed.'}
              </p>
            </div>
            {supplier.notes && (
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700">Internal Remarks: </span>
                {supplier.notes}
              </div>
            )}
          </div>

          {/* Recent Purchases List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Purchase Order History</h3>
                <p className="text-xs text-slate-500">
                  Detailed ledger of all pharmacy stock acquisitions from this supplier.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPurchaseHistoryOpen(true)}
                className="text-xs"
              >
                View Full Log ({purchases.length})
              </Button>
            </div>

            {isLoadingPurchases ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading purchases...</p>
            ) : purchases.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No purchases recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click &apos;Purchase History &amp; Orders&apos; to register new inventory deliveries.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.slice(0, 5).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {new Date(p.purchaseDate || p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{p.purchaseOrderNo || p.id?.slice(0, 8)}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {p.items ? p.items.length : 0} items
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatBirr(p.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Supplier Modal */}
      <SupplierForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={supplier}
        isLoading={updateSupplierMutation.isPending}
      />

      {/* Purchase History / Record Order Modal */}
      <SupplierPurchaseHistory
        isOpen={isPurchaseHistoryOpen}
        onClose={() => setIsPurchaseHistoryOpen(false)}
        supplier={supplier}
      />
    </div>
  );
};

export default SupplierDetailsPage;

