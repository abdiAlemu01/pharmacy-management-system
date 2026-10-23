import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  ShoppingCart,
  Boxes,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  RefreshCw,
  Power,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  useUsers,
  useToggleUserStatus,
  useDeleteUser,
} from '../hooks/use-users';
import { AddStaffModal } from './AddStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { Dialog } from '@/shared/components/ui/Dialog';

export const UserManagementTab = () => {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const { data: usersData, isLoading, isFetching, refetch } = useUsers({
    search,
    role: roleFilter,
    status: statusFilter,
  });

  const toggleStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();

  const usersList = useMemo(() => usersData?.data || [], [usersData]);

  // Quick KPI metrics
  const stats = useMemo(() => {
    const total = usersList.length;
    let active = 0;
    let cashiers = 0;
    let inventors = 0;
    let admins = 0;

    for (const u of usersList) {
      if (u.status === 'ACTIVE' || u.isActive) active++;
      const r = (u.role || '').toUpperCase();
      if (r === 'CASHIER') cashiers++;
      else if (r === 'INVENTOR') inventors++;
      else admins++;
    }

    return { total, active, inactive: total - active, cashiers, inventors, admins };
  }, [usersList]);

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) return;
    const isCurrentlyActive = user.status === 'ACTIVE' || user.isActive;
    const nextStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleStatusMutation.mutateAsync({
        id: user.id,
        status: nextStatus,
        isActive: !isCurrentlyActive,
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCloseDeleteModal = () => {
    setSelectedUserForDelete(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;
    setDeleteError('');
    try {
      await deleteUserMutation.mutateAsync(selectedUserForDelete.id);
      handleCloseDeleteModal();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header & KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Staff */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Staff
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight block mt-1">
            {isLoading ? '...' : stats.total}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {stats.active} active accounts
          </span>
        </div>

        {/* Cashiers */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cashiers
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block mt-1">
            {isLoading ? '...' : stats.cashiers}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Sales & POS access
          </span>
        </div>

        {/* Inventors */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inventors
            </span>
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight block mt-1">
            {isLoading ? '...' : stats.inventors}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Inventory & stock access
          </span>
        </div>

        {/* Admins */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Admins
            </span>
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight block mt-1">
            {isLoading ? '...' : stats.admins}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Full system control
          </span>
        </div>
      </div>

      {/* 2. Search, Filter Controls & Action Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone...."
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Filters & Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="CASHIER">Cashiers</option>
              <option value="INVENTOR">Inventors</option>
              <option value="ADMIN">Admins</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh staff list"
              className="p-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Add New Staff Account CTA */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. User Accounts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Role & Permissions</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading staff directory...</span>
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    No staff accounts found matching the criteria.
                  </td>
                </tr>
              ) : (
                usersList.map((staff) => {
                  const isSelf = staff.id === currentUser?.id;
                  const isActive = staff.status === 'ACTIVE' || staff.isActive;
                  const roleUpper = (staff.role || 'CASHIER').toUpperCase();

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Email with Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                              roleUpper === 'CASHIER'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : roleUpper === 'INVENTOR'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {(staff.name || staff.email || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs block truncate flex items-center gap-1.5">
                              <span>{staff.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{staff.email}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{staff.phone || '-'}</span>
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        {roleUpper === 'CASHIER' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <ShoppingCart className="w-3 h-3 text-emerald-600" />
                            <span>Cashier (Sales Only)</span>
                          </span>
                        )}
                        {roleUpper === 'INVENTOR' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Boxes className="w-3 h-3 text-blue-600" />
                            <span>Inventor (Stock Only)</span>
                          </span>
                        )}
                        {roleUpper === 'ADMIN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            <span>Admin (Full Access)</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleToggleStatus(staff)}
                          title={isSelf ? 'Cannot deactivate self' : 'Click to toggle status'}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
                            isSelf ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
                          } ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-slate-500 font-semibold">
                        {formatDate(staff.createdAt)}
                      </td>

                      {/* Action Shortcuts */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle status shortcut button */}
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(staff)}
                            title={isActive ? 'Deactivate account' : 'Activate account'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400'
                                : isActive
                                ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset password button */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserForReset(staff)}
                            title="Reset Password"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserForEdit(staff)}
                            title="Edit Staff Info"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button (disabled for self) */}
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => setSelectedUserForDelete(staff)}
                            title={isSelf ? 'Cannot delete self' : 'Delete staff account'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400'
                                : 'border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modals */}
      {/* Create Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditStaffModal
        isOpen={!!selectedUserForEdit}
        user={selectedUserForEdit}
        currentUserId={currentUser?.id}
        onClose={() => setSelectedUserForEdit(null)}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!selectedUserForReset}
        user={selectedUserForReset}
        onClose={() => setSelectedUserForReset(null)}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!selectedUserForDelete}
        onClose={handleCloseDeleteModal}
        title="Delete Staff Account"
        className="max-w-md"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {deleteError}
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete this account ?
          </p>
          

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCloseDeleteModal}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteUserMutation.isPending}
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {deleteUserMutation.isPending ? (
                <span>Deleting...</span>
              ) : (
                <span>Delete Account</span>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

