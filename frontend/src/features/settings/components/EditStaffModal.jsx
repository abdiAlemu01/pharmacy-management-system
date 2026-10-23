import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Boxes,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { useUpdateUser } from '../hooks/use-users';

export const EditStaffModal = ({ isOpen, onClose, user, currentUserId }) => {
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'CASHIER',
    status: 'ACTIVE',
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'CASHIER',
        status: user.status || (user.isActive ? 'ACTIVE' : 'INACTIVE'),
      });
      setErrorMessage('');
    }
  }, [user]);

  if (!user) return null;

  const isSelf = user.id === currentUserId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleRoleSelect = (role) => {
    if (isSelf && role !== 'ADMIN') {
      setErrorMessage('You cannot remove administrator privileges from your own account.');
      return;
    }
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
      });

      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update user account.';
      setErrorMessage(msg);
    }
  };

  const roles = [
    {
      id: 'CASHIER',
      name: 'Cashier',
      description: 'Access ONLY to Sales & POS',
      icon: ShoppingCart,
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'INVENTOR',
      name: 'Inventor',
      description: 'Access ONLY to Inventory & Stock',
      icon: Boxes,
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800',
    },
    {
      id: 'ADMIN',
      name: 'Admin',
      description: 'Full access to entire system',
      icon: ShieldCheck,
      activeRing: 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800',
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Staff Information"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSelf && (
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-semibold">
            This is your current administrator account. Role and status restrictions apply for security.
          </div>
        )}

        {/* 1. Full Name & Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Staff full name"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 2. Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        {/* 3. Role Assignment */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Role & Access Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = formData.role === r.id;
              const isDisabled = isSelf && r.id !== 'ADMIN';

              return (
                <div
                  key={r.id}
                  onClick={() => !isDisabled && handleRoleSelect(r.id)}
                  className={`p-3 rounded-2xl border transition-all ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } flex flex-col justify-between ${
                    isSelected
                      ? r.activeRing
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        r.id === 'CASHIER'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.id === 'INVENTOR'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="mt-2.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                      {r.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Account Status */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Account Status
            </span>
            <span className="text-[11px] text-slate-400 block">
              Deactivated accounts cannot sign into the system
            </span>
          </div>
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, status: 'ACTIVE' }))}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                formData.status === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              disabled={isSelf}
              onClick={() => !isSelf && setFormData((p) => ({ ...p, status: 'INACTIVE' }))}
              className={`px-3 py-1 rounded-lg transition-all ${
                isSelf ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              } ${
                formData.status === 'INACTIVE'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateUserMutation.isPending}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            {updateUserMutation.isPending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

