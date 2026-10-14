import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Building2, User, Phone, Mail, MapPin, Package, FileText, CheckCircle2 } from 'lucide-react';

export const SupplierForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    stockSupplied: '',
    status: 'ACTIVE',
    taxNumber: '',
    paymentTerms: 'Net 30 Days',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        contactPerson: initialData.contactPerson || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        stockSupplied: initialData.stockSupplied || '',
        status: initialData.status || 'ACTIVE',
        taxNumber: initialData.taxNumber || '',
        paymentTerms: initialData.paymentTerms || 'Net 30 Days',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        stockSupplied: '',
        status: 'ACTIVE',
        taxNumber: '',
        paymentTerms: 'Net 30 Days',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    }

    if (!formData.stockSupplied.trim()) {
      newErrors.stockSupplied = 'Please specify the stock or medicines supplied';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(formData, () => {
      onClose();
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Supplier Information' : 'Register New Supplier'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Supplier Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Supplier Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ethiopian Pharmaceuticals Supply Agency (EPSA)"
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Contact Person & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Contact Person
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. Ato Daniel Girma"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +251 911 234 567"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.phone}</p>}
          </div>
        </div>

        {/* Stock It Supplies (Crucial Requirement) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Stock It Supplies <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Package className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              name="stockSupplied"
              rows="2"
              value={formData.stockSupplied}
              onChange={handleChange}
              placeholder="e.g. Essential Antibiotics, Analgesics, IV Fluids, Pediatric Syrups, Diabetic Care"
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.stockSupplied ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            List the medication classes, brands, or medical supplies this supplier provides.
          </p>
          {errors.stockSupplied && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.stockSupplied}</p>
          )}
        </div>

        {/* Email & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. orders@epsa.gov.et"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Address / City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Churchill Road, Arada Subcity, Addis Ababa"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Status & Payment Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supplier Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
            >
              <option value="ACTIVE">ACTIVE (Active Business Partner)</option>
              <option value="INACTIVE">INACTIVE (Suspended / Inactive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              placeholder="e.g. Net 30 Days, Cash on Delivery"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Tax Number & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              TIN / Tax Number
            </label>
            <input
              type="text"
              name="taxNumber"
              value={formData.taxNumber}
              onChange={handleChange}
              placeholder="e.g. TIN-001928374"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Internal Notes
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Primary contact for urgent weekend deliveries"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : isEditing ? 'Update Supplier' : 'Register Supplier'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

