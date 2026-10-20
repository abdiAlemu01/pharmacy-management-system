import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  User,
  Phone,
  MapPin,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useUpdatePharmacy } from '../hooks/use-settings';

export const PharmacyInfoTab = ({ settings, user, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    pharmacyName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const updateMutation = useUpdatePharmacy();

  useEffect(() => {
    if (settings || user) {
      setFormData({
        pharmacyName: settings?.pharmacyName || '',
        ownerName: user?.name || settings?.ownerName || '',
        phone: user?.phone || settings?.phone || '',
        email: settings?.email || user?.email || '',
        address: settings?.address || '',
        logoUrl: settings?.logoUrl || '',
      });
      setLogoPreview(settings?.logoUrl || '');
    }
  }, [settings, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 4MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result;
      setLogoPreview(base64);
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
      setSuccessMsg('');
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.pharmacyName.trim()) {
      setErrorMsg('Pharmacy name is required');
      return;
    }
    if (!formData.ownerName.trim()) {
      setErrorMsg("Owner's name is required");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Phone number is required');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Pharmacy physical address is required');
      return;
    }

    updateMutation.mutate(formData, {
      onSuccess: () => {
        setSuccessMsg(t('settings.pharmacy.successMsg', 'Pharmacy information saved successfully.'));
        setTimeout(() => setSuccessMsg(''), 4000);
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || 'Failed to update pharmacy information');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 md:p-8 space-y-8">
        {/* Section Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('settings.pharmacy.title', 'Pharmacy Information')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings.pharmacy.subtitle', 'Official contact details and legal business address of your pharmacy establishment.')}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Logo Management */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {t('settings.pharmacy.logo', 'Pharmacy Logo')}
          </label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            {/* Logo Preview */}
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-emerald-400/80 dark:border-emerald-600/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative group">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Pharmacy Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 text-center p-2">
                  <ImageIcon className="w-8 h-8 text-emerald-500/70 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-400">No Logo</span>
                </div>
              )}
            </div>

            {/* Logo Actions */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  id="pharmacy-logo-input"
                />
                <label
                  htmlFor="pharmacy-logo-input"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logoPreview ? t('settings.pharmacy.changeLogo', 'Change Logo') : t('settings.pharmacy.uploadLogo', 'Upload Logo')}</span>
                </label>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('settings.pharmacy.removeLogo', 'Remove')}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('settings.pharmacy.logoHint', 'Supported formats: PNG, JPG, WebP, or SVG. Recommended size: 256x256 or 512x512 pixels.')}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Form Grid Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Pharmacy Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('settings.pharmacy.name', 'Pharmacy Name')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleChange}
                placeholder="Pharmacy Name"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </div>
          </div>

          {/* Owner's Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('settings.pharmacy.ownerName', "Owner's Name")} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Owner Full Name"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('settings.pharmacy.phone', 'Phone Number')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 3. Pharmacy Physical Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('settings.pharmacy.address', 'Pharmacy Physical Address')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Pharmacy Physical Address"
              required
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors resize-y"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('settings.pharmacy.savingBtn', 'Saving Pharmacy Details...')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('settings.pharmacy.saveBtn', 'Save Pharmacy Information')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
