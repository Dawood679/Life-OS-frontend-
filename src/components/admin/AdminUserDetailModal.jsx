import { useState, useEffect } from 'react';
import {
  X,
  Shield,
  UserCheck,
  UserX,
  Award,
  CheckCircle2,
  Briefcase,
  BookOpen,
  Calendar,
  Zap,
  Clock,
  HeartPulse,
  Flame,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUserDetailModal({ userId, onClose, onUserUpdated }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`${BACKEND_URL}/admin/users/${userId}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user details');
        return res.json();
      })
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => {
        toast.error(err.message || 'Error loading user');
        onClose();
      })
      .finally(() => setIsLoading(false));
  }, [userId, BACKEND_URL, onClose]);

  const handleRoleToggle = async () => {
    if (!data?.user) return;
    const newRole = data.user.role === 'admin' ? 'user' : 'admin';
    setIsUpdating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update role');
      toast.success(result.message);
      setData((prev) => ({ ...prev, user: { ...prev.user, role: newRole } }));
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!data?.user) return;
    const newSuspended = !data.user.isSuspended;
    setIsUpdating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isSuspended: newSuspended,
          suspendedReason: newSuspended ? 'Suspended by admin' : '',
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update status');
      toast.success(result.message);
      setData((prev) => ({ ...prev, user: { ...prev.user, isSuspended: newSuspended } }));
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#0f1422] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                User Inspection & Activity Ledger
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                User ID: <span className="font-mono text-[11px]">{userId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gathering cross-module records...</p>
            </div>
          ) : !data?.user ? (
            <div className="py-12 text-center text-slate-500">User not found or deleted.</div>
          ) : (
            <>
              {/* Profile Card Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0 uppercase">
                    {data.user.name ? data.user.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {data.user.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          data.user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                            : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        {data.user.role}
                      </span>
                      {data.user.isSuspended ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{data.user.email}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" /> Domain: <b className="text-slate-700 dark:text-slate-200 capitalize">{data.user.primaryDomain || 'General'}</b>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" /> Focus: <b className="text-slate-700 dark:text-slate-200 capitalize">{data.user.focusMode || 'Balanced'}</b>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" /> Streak: <b className="text-slate-700 dark:text-slate-200">{data.user.streak?.current || 0} days</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    disabled={isUpdating}
                    onClick={handleRoleToggle}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span>{data.user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}</span>
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={handleStatusToggle}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      data.user.isSuspended
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    {data.user.isSuspended ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reactivate Account</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Suspend Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cross-Module Activity Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  LifeOS Footprint & Cross-Module Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">To-Dos</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.completedTodosCount || 0}
                      <span className="text-xs font-normal text-slate-400">/{data.activitySummary?.todosCount || 0} done</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Job Applications</span>
                      <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.jobAppsCount || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Study Plans</span>
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.studyPlansCount || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Life Score</span>
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.latestLifeScore !== undefined && data.activitySummary?.latestLifeScore !== null
                        ? `${data.activitySummary.latestLifeScore}/100`
                        : '0/100'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Quizzes Passed</span>
                      <Award className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.quizzesCount || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">90-Day Roadmaps</span>
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.roadmapsCount || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">AI Mock Interviews</span>
                      <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.interviewsCount || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Wellness Logs</span>
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.activitySummary?.wellnessLogsCount || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Joined Date</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
                      {data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Skills Ledger */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Verified Skill Badges ({data.user.verifiedSkills?.length || 0})
                  </h4>
                </div>
                {data.user.verifiedSkills && data.user.verifiedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.user.verifiedSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 flex items-center gap-2"
                      >
                        <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{sk.skill}</span>
                        <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded-full">
                          {sk.score}% ({sk.source})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                    No verified skill badges recorded yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-end bg-slate-50/50 dark:bg-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
