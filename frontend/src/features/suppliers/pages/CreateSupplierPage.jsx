import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useCreateSupplier } from '../hooks/use-suppliers';

export const CreateSupplierPage = () => {
  const navigate = useNavigate();
  const createSupplierMutation = useCreateSupplier();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone : '',
    email: '',
    address: '',
    stockSupplied: '',
    status: 'ACTIVE',
    taxNumber: '',
    paymentTerms: 'Net 30 Days',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'phone') {
      finalValue = value.replace(/[^0-9+\-\s()]/g, '');
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Supplier name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{4,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please provide a valid phone number (digits only)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
    }

    if (!formData.stockSupplied.trim()) {
      newErrors.stockSupplied = 'Please specify items/stock categories supplied';
    } else if (formData.stockSupplied.trim().length < 2) {
      newErrors.stockSupplied = 'Supplied medicines must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    createSupplierMutation.mutate(formData, {
      onSuccess: () => {
        navigate('/suppliers', {
          state: { alertMessage: `Supplier "${formData.name}" registered successfully!` },
        });
      },
      onError: (err) => {
        setErrorMessage(
          err.response?.data?.message || err.message || 'Failed to create supplier'
        );
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/suppliers')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Suppliers
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              Register New Supplier
            </h1>
            <p className="text-xs text-slate-500">
              Add a new pharmaceutical vendor, importer, or manufacturer to the system.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Section: Basic Identity */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Company & Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Supplier / Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Cadila Pharmaceuticals Ethiopia"
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Samuel Tesfaye"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.contactPerson ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="ACTIVE">ACTIVE (Accepting Orders)</option>
                <option value="INACTIVE">INACTIVE (Temporarily On Hold)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Contact & Location */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Phone className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Contact & Address
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Backspace' ||
                      e.key === 'Delete' ||
                      e.key === 'Tab' ||
                      e.key === 'Escape' ||
                      e.key === 'Enter' ||
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowRight' ||
                      e.key === 'Home' ||
                      e.key === 'End' ||
                      e.ctrlKey ||
                      e.metaKey
                    ) {
                      return;
                    }
                    if (!/[\d+\-\s()]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="e.g. +251 911 234 567"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.phone ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. orders@cadilapharma.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Physical / Warehouse Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Bole Subcity, Kebele 03, Building #42, Addis Ababa"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.address ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.address && <p className="text-[11px] text-rose-500">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Section: Stock Supply & Commercial Terms */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Package className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Stock Supplied & Terms
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Stock It Supplies / Product Categories <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="stockSupplied"
                rows={2}
                value={formData.stockSupplied}
                onChange={handleChange}
                placeholder="e.g. Antibiotics, Antipyretics, Cardiovascular medications, Medical Syringes"
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.stockSupplied ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.stockSupplied && (
                <p className="text-[11px] text-rose-500">{errors.stockSupplied}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">TIN / Tax Number</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleChange}
                  placeholder="e.g. 0048291044"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Payment Terms</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Advance Payment">100% Advance Payment</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Additional Notes / Remarks</label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional supplier background, special volume discount terms, delivery days..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/suppliers')}
            disabled={createSupplierMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createSupplierMutation.isPending}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {createSupplierMutation.isPending ? 'Registering...' : 'Add Supplier'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupplierPage;

