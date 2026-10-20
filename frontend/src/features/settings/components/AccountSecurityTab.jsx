import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  User,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { useAuth } from '@/features/auth';
import { useUpdateAccount, useChangePassword } from '../hooks/use-settings';

export const AccountSecurityTab = ({ user, settings, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // 1. Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    sessionTimeout: 30,
  });

  // 2. Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 3. Feedback messages
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // 4. Logout confirmation dialog
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const updateAccountMutation = useUpdateAccount();
  const changePasswordMutation = useChangePassword();

  useEffect(() => {
    if (user || settings) {
      setProfileData({
        name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || settings?.ownerName || '',
        email: user?.email || '',
        phone: user?.phone || settings?.phone || '',
        sessionTimeout: settings?.sessionTimeout || 30,
      });
    }
  }, [user, settings]);

  // Handle Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!profileData.name.trim()) {
      setProfileError("Owner's name is required");
      return;
    }

    updateAccountMutation.mutate(
      {
        name: profileData.name.trim(),
        email: profileData.email?.trim() || undefined,
        phone: profileData.phone.trim(),
        sessionTimeout: parseInt(profileData.sessionTimeout, 10) || 30,
      },
      {
        onSuccess: () => {
          setProfileSuccess(t('settings.account.profileSuccess', 'Account details and session settings saved.'));
          setTimeout(() => setProfileSuccess(''), 4000);
        },
        onError: (err) => {
          setProfileError(err.response?.data?.message || 'Failed to update account details');
        },
      }
    );
  };

  // Handle Password Change
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (!passwordData.currentPassword) {
      setPwdError('Current password is required to verify your identity');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdError('New password and confirmation do not match');
      return;
    }

    changePasswordMutation.mutate(
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      },
      {
        onSuccess: (res) => {
          setPwdSuccess(res.message || 'Password changed successfully.');
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setTimeout(() => setPwdSuccess(''), 4000);
        },
        onError: (err) => {
          setPwdError(err.response?.data?.message || 'Failed to change password. Verify your current password.');
        },
      }
    );
  };

  // Handle Logout Confirmation
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-slate-200', text: '', percent: 0 };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500', percent: 33 };
    if (score <= 4) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-500', percent: 66 };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', percent: 100 };
  };

  const strength = getPasswordStrength(passwordData.newPassword);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Owner's Name & Profile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.account.title', "Owner's Profile & Account")}
                </h2>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase rounded-full">
              {user?.role || t('settings.owner', 'Owner')}
            </span>
          </div>
        </div>

        {profileSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Owner's Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('settings.account.name', "Owner's Full Name")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. Abdi Alemu"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('settings.account.phone', 'Phone Number')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="e.g. 0901756305"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Session Timeout */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('settings.account.timeout', 'Session Inactivity Timeout')}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={profileData.sessionTimeout}
                  onChange={(e) => setProfileData({ ...profileData, sessionTimeout: e.target.value })}
                  className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors appearance-none cursor-pointer"
                >
                  <option value={15} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('settings.account.min15', '15 Minutes (High Security)')}</option>
                  <option value={30} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('settings.account.min30', '30 Minutes (Recommended)')}</option>
                  <option value={60} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('settings.account.hour1', '1 Hour')}</option>
                  <option value={120} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('settings.account.hour2', '2 Hours')}</option>
                  <option value={240} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('settings.account.hour4', '4 Hours')}</option>
                  <option value={720} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('settings.account.hour12', '12 Hours (End of Shift)')}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                {t('settings.account.timeoutHint', 'Automatically terminates inactive sessions to safeguard sensitive pharmacy data.')}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateAccountMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {updateAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('settings.account.savingBtn', 'Saving Profile...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings.account.saveBtn', 'Save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Password Change & Current Password Verification */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('settings.account.changePassword', 'Change Password')}
              </h2>
            </div>
          </div>
        </div>

        {pwdSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {/* Current Password Verification */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('settings.account.currentPassword', 'Current Password Verification')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter your current password to verify"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('settings.account.newPassword', 'New Password')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter at least 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordData.newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${strength.text}`}>
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('settings.account.confirmPassword', 'Confirm New Password')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordData.confirmPassword && (
                <p
                  className={`text-[11px] font-semibold ${
                    passwordData.newPassword === passwordData.confirmPassword
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {passwordData.newPassword === passwordData.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('settings.account.updatingPasswordBtn', 'Verifying & Updating...')}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{t('settings.account.updatePasswordBtn', 'Update Password')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('settings.account.signOutBtn', 'Sign Out Now')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog for Logout */}
      <Dialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('settings.account.confirmSignOut', 'Confirm Sign Out')}
        className="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            {t('settings.account.confirmSignOutMsg', 'Are you sure you want to sign out of the Pharmacy Management System? You will need to log back in to access the system.')}
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              {t('settings.account.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {t('settings.account.yesSignOut', 'Yes, Sign Out')}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
