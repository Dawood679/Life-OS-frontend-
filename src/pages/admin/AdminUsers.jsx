import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';
import DeleteModal from '../../components/DeleteModal';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Flame,
  Award,
  Globe,
  SlidersHorizontal,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [inspectUserId, setInspectUserId] = useState(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setIsRefreshing(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchQuery,
        role: selectedRole,
        domain: selectedDomain,
        status: selectedStatus,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`${BACKEND_URL}/admin/users?${queryParams.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');

      setUsers(data.users || []);
      setPagination(data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      toast.error(err.message || 'Error loading users');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [BACKEND_URL, searchQuery, selectedRole, selectedDomain, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${user._id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update role');
      toast.success(result.message);
      fetchUsers(pagination.currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusToggle = async (user) => {
    const newSuspended = !user.isSuspended;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isSuspended: newSuspended,
          suspendedReason: newSuspended ? 'Suspended by administrator' : '',
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update user status');
      toast.success(result.message);
      fetchUsers(pagination.currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${deleteTargetUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete user');
      toast.success('User and linked records deleted permanently');
      setDeleteTargetUser(null);
      fetchUsers(pagination.currentPage);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="User Directory & Lifecycle Controls"
      subtitle="Search, filter, inspect cross-module footprints, and manage account privileges."
    >
      {/* Top Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs mb-6 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchUsers(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Dropdown Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold sm:col-span-3 lg:col-auto">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Domains</option>
              <option value="tech">Tech & Software</option>
              <option value="business">Business & Finance</option>
              <option value="academic">Academic & Science</option>
              <option value="creative">Creative & Design</option>
              <option value="general">General</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              Showing <b>{users.length}</b> of <b>{pagination.totalCount}</b> users
            </span>
            <button
              onClick={() => fetchUsers(pagination.currentPage)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shrink-0"
              title="Refresh User List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Querying user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No users found</div>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Domain & Focus</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-center">Skills</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <div className="min-w-0 max-w-[180px] sm:max-w-[220px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          u.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                            : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      {u.isSuspended ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Domain & Focus */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium capitalize">
                        {u.primaryDomain || 'General'}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {u.focusMode || 'Balanced'}
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{u.streak?.current || 0}</span>
                      </div>
                    </td>

                    {/* Verified Skills */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                        <Award className="w-3.5 h-3.5" />
                        <span>{u.verifiedSkills?.length || 0}</span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inspect */}
                        <button
                          onClick={() => setInspectUserId(u._id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-950/60 text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-300 transition"
                          title="Inspect Details"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Role */}
                        <button
                          onClick={() => handleRoleToggle(u)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                          title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Suspend */}
                        <button
                          onClick={() => handleStatusToggle(u)}
                          className={`p-1.5 rounded-lg transition ${
                            u.isSuspended
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                          title={u.isSuspended ? 'Activate User' : 'Suspend User'}
                        >
                          {u.isSuspended ? (
                            <UserCheck className="w-3.5 h-3.5" />
                          ) : (
                            <UserX className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => setDeleteTargetUser(u)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5">
            <div>
              Page <b>{pagination.currentPage}</b> of <b>{pagination.totalPages}</b>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => fetchUsers(pagination.currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => fetchUsers(pagination.currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {inspectUserId && (
        <AdminUserDetailModal
          userId={inspectUserId}
          onClose={() => setInspectUserId(null)}
          onUserUpdated={() => fetchUsers(pagination.currentPage)}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <DeleteModal
          isOpen={true}
          title="Permanently Delete User Account?"
          message={`Are you sure you want to delete "${deleteTargetUser.name}" (${deleteTargetUser.email})? This action is permanent and will cascade delete all linked To-Dos, Job Applications, Study Plans, and Quizzes.`}
          onClose={() => setDeleteTargetUser(null)}
          onDelete={handleDeleteUser}
          isLoading={isDeleting}
        />
      )}
    </AdminLayout>
  );
}
