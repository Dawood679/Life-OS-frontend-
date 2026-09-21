import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';
import {
  Users,
  ShieldCheck,
  Zap,
  Award,
  Briefcase,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  RefreshCw,
  Sparkles,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const fetchStats = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${BACKEND_URL}/admin/stats`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
      setStats(data.stats);
      if (showToast) toast.success('Platform telemetry updated');
    } catch (err) {
      toast.error(err.message || 'Error loading stats');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout
      title="Platform Telemetry & Overview"
      subtitle="Real-time system health, user lifecycle metrics, and operational overview."
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last sync: {new Date().toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/users"
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Synthesizing platform telemetry...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Primary KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats?.totalUsers || 0}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{stats?.newUsersThisWeek || 0} this week</span>
              </div>
            </div>

            {/* Active Today Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Today</span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats?.activeToday || 0}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Daily active footprint</span>
              </div>
            </div>

            {/* Verified Skills Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Verified Skills</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats?.totalVerifiedSkills || 0}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span>80%+ AI quiz verifications</span>
              </div>
            </div>

            {/* Administrators Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Admin Staff</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats?.totalAdmins || 0}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span>{stats?.totalSuspended || 0} accounts suspended</span>
              </div>
            </div>
          </div>

          {/* Secondary Module Cross-Section Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Career Applications</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.totalJobApps || 0}</div>
              </div>
              <Briefcase className="w-5 h-5 text-sky-500" />
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Study Plans Generated</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.totalStudyPlans || 0}</div>
              </div>
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Quizzes Attempted</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.totalQuizzes || 0}</div>
              </div>
              <Award className="w-5 h-5 text-purple-500" />
            </div>
          </div>

          {/* Domain Breakdown & Recent Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Domain Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Primary User Domains</h3>
                <span className="text-xs text-slate-400">{stats?.domainStats?.length || 0} categories</span>
              </div>

              <div className="space-y-3">
                {stats?.domainStats && stats.domainStats.length > 0 ? (
                  stats.domainStats.map((item, idx) => {
                    const percentage = stats.totalUsers > 0 ? Math.round((item.count / stats.totalUsers) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                            {item.domain}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {item.count} users ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 italic py-4 text-center">No domain data yet</div>
                )}
              </div>
            </div>

            {/* Recent Registrations Feed */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Registrations</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Latest
                  </span>
                </div>
                <Link
                  to="/admin/users"
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((u) => (
                    <div
                      key={u._id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-900 transition"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {u.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {u.role}
                            </span>
                            {u.isSuspended && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                Suspended
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {u.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                        </span>
                        <button
                          onClick={() => setSelectedUserId(u._id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic py-6 text-center">No users found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Inspection Modal */}
      {selectedUserId && (
        <AdminUserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUserUpdated={() => fetchStats()}
        />
      )}
    </AdminLayout>
  );
}
