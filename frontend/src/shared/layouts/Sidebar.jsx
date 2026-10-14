import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, Boxes, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/medicines',
      label: 'Medicines',
      icon: Pill,
    },
    {
      to: '/inventory',
      label: 'Inventory',
      icon: Boxes,
    },
    {
      to: '/sales',
      label: 'Sales / POS',
      icon: ShoppingCart,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand logo header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
          +
        </div>
        <div>
          <span className="font-bold text-slate-800 text-base leading-tight block">Pharmacy Care</span>
          <span className="text-[11px] text-slate-400 font-medium">Management System</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
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
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
      <div className="p-4 border-t border-slate-100 bg-white shrink-0 mt-auto">
        {user && (
          <div className="px-3 py-2 mb-2.5 bg-slate-50 rounded-xl flex items-center gap-2.5 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {(user?.name || user?.firstName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
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
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 shrink-0 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

