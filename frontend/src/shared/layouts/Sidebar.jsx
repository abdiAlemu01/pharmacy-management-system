import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Pill, Boxes, ShoppingCart, Truck, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings/hooks/use-settings';

export const Sidebar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: settingsData } = useSettings();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const settings = settingsData?.settings;
  const logoUrl = settings?.logoUrl || localStorage.getItem('pharmacy_logo_url') || '';
  const pharmacyName = settings?.pharmacyName || localStorage.getItem('pharmacy_name') || 'Pharmacy Care';

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: t('nav.dashboard', 'Dashboard'),
      icon: LayoutDashboard,
    },
    {
      to: '/medicines',
      label: t('nav.medicines', 'Medicines'),
      icon: Pill,
    },
    {
      to: '/inventory',
      label: t('nav.inventory', 'Inventory'),
      icon: Boxes,
    },
    {
      to: '/suppliers',
      label: t('nav.suppliers', 'Suppliers'),
      icon: Truck,
    },
    {
      to: '/purchases',
      label: t('nav.purchases', 'Purchases'),
      icon: ShoppingBag,
    },
    {
      to: '/sales',
      label: t('nav.sales', 'Sales / POS'),
      icon: ShoppingCart,
    },
    {
      to: '/settings',
      label: t('nav.settings', 'Settings'),
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand logo header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 gap-3 shrink-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={pharmacyName}
            className="w-9 h-9 rounded-full object-cover bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0">
            +
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight block truncate">
            {pharmacyName}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {t('nav.mainMenu', 'Main Menu')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer: User Info & Sign Out Button */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 mt-auto">
        {user && (
          <div className="px-3 py-2 mb-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-2.5 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {(user?.name || user?.firstName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}
              </p>
              <p className="text-[10px] text-slate-400 truncate capitalize font-medium">
                {user?.role || 'Staff'}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
          title={t('nav.signOut', 'Sign Out')}
        >
          <LogOut className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{t('nav.signOut', 'Sign Out')}</span>
        </button>
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
            {t('settings.account.confirmSignOutMsg', 'Are you sure you want to sign out ?')}
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
    </aside>
  );
};
