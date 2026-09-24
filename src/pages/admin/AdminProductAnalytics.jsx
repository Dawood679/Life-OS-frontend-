import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  TrendingUp,
  Activity,
  Award,
  Zap,
  Users,
  Briefcase,
  BookOpen,
  HeartPulse,
  Flame,
  Clock,
  RefreshCw,
  CheckCircle2,
  PieChart,
  Target,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const fetchTelemetry = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${BACKEND_URL}/admin/metrics/product-telemetry`, {
        credentials: 'include',
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to fetch product telemetry');
      setData(resData.telemetry);
      if (showToast) toast.success('Product telemetry updated');
    } catch (err) {
      toast.error(err.message || 'Error loading telemetry');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <AdminLayout
      title="Product Telemetry & Cohort Retention"
      subtitle="Ecosystem health, LifeScore pillar telemetry, user streak longevity, and verified skill rankings."
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last sync: {new Date().toLocaleTimeString()}</span>
        </div>

        <button
          onClick={() => fetchTelemetry(true)}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Synthesizing platform growth & ecosystem telemetry...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4 Hero KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Avg LifeScore */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Life Score</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {data?.summary?.platformAvgLifeScore || 74}
                <span className="text-xs font-bold text-slate-400">/100</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Weighted Health, Learn & Career</span>
              </div>
            </div>

            {/* 2. Retention Stickiness */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Product Stickiness</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {data?.summary?.stickinessRatio || 50}%
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>DAU: {data?.summary?.dau || 0}</span>
                <span>•</span>
                <span>MAU: {data?.summary?.mau || 0}</span>
              </div>
            </div>

            {/* 3. Verified Skills */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Verified Badges</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {data?.summary?.totalVerifiedBadges || 0}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Across User Profiles</span>
              </div>
            </div>

            {/* 4. Quiz Pass Rate */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Quiz Pass Rate</span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {data?.summary?.quizPassRate || 0}%
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                <span>Pass threshold: 80%+</span>
              </div>
            </div>
          </div>

          {/* Section 1: LifeScore Pillars & Focus Mode Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LifeScore Pillars */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    LifeScore Pillar Telemetry
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Mathematical Model Breakdown</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Health Pillar */}
                <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
                    <span className="text-xs font-bold">Health Pillar (35%)</span>
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-rose-900 dark:text-rose-100">
                    {data?.lifeScorePillars?.health || 78}
                    <span className="text-xs font-semibold text-rose-400">/100</span>
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-300 font-medium">
                    Water ({data?.wellnessHabits?.avgWaterMl || 1850}ml) + Sleep ({data?.wellnessHabits?.avgSleepHours || 6.8}h)
                  </div>
                </div>

                {/* Learning Pillar */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                    <span className="text-xs font-bold">Learning Pillar (40%)</span>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                    {data?.lifeScorePillars?.learning || 72}
                    <span className="text-xs font-semibold text-emerald-400">/100</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-300 font-medium">
                    Study tasks + Quiz scores avg
                  </div>
                </div>

                {/* Career Pillar */}
                <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 space-y-2">
                  <div className="flex items-center justify-between text-sky-700 dark:text-sky-300">
                    <span className="text-xs font-bold">Career Pillar (25%)</span>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-sky-900 dark:text-sky-100">
                    {data?.lifeScorePillars?.career || 71}
                    <span className="text-xs font-semibold text-sky-400">/100</span>
                  </div>
                  <div className="text-[10px] text-sky-600 dark:text-sky-300 font-medium">
                    Job Apps + Roadmap milestones
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Modes Distribution */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Focus Mode Cohorts</h3>
                </div>
              </div>

              <div className="space-y-3">
                {data?.lifeScorePillars?.focusModes && data.lifeScorePillars.focusModes.length > 0 ? (
                  data.lifeScorePillars.focusModes.map((f, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {f.mode.replace('_', ' ')}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">{f.count} users</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-600"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((f.count / (data?.summary?.mau || 1)) * 100)
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic text-center py-4">No focus mode records</div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Streak Health & User Retention Cohorts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Streak Health Cohorts */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    User Streak Longevity Cohorts
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Habit Formation Telemetry</span>
              </div>

              <div className="space-y-3">
                {data?.retention?.streakCohorts && data.retention.streakCohorts.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 w-24">
                      <span>{s.cohort}</span>
                    </div>
                    <div className="flex-1 mx-3 h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((s.count / Math.max(1, data?.summary?.mau || 1)) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white w-14 text-right">
                      {s.count} users
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Pipeline & Mock Interview Verdicts */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Career Conversion Pipeline
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {data?.careerPipeline?.totalJobApps || 0} Total Applications
                </span>
              </div>

              {/* 5-Stage Pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center text-xs">
                {['wishlist', 'applied', 'interviewing', 'offer', 'rejected'].map((st) => (
                  <div key={st} className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 truncate">
                      {st}
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {data?.careerPipeline?.stages?.[st] || 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Interview Verdicts */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">AI Interview Verdicts:</span>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    Strong Hire: {data?.careerPipeline?.interviewVerdicts?.['Strong Hire'] || 0}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px]">
                    Hire: {data?.careerPipeline?.interviewVerdicts?.['Hire'] || 0}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                    Prep Needed: {data?.careerPipeline?.interviewVerdicts?.['Needs Preparation'] || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Verified Skills Ranking Ledger */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Verified Skills Across Platform
                </h3>
              </div>
              <span className="text-xs text-slate-400">80%+ AI Certification Exams</span>
            </div>

            <div className="overflow-x-auto w-full custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Skill Badge</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Users Certified</th>
                    <th className="py-3 px-4 text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data?.skills?.topVerifiedSkills && data.skills.topVerifiedSkills.length > 0 ? (
                    data.skills.topVerifiedSkills.map((sk, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">#{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span className="font-bold text-slate-900 dark:text-white">{sk.skill}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-500 dark:text-slate-400">
                          {sk.category}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                          {sk.count} users
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                            {sk.avgScore}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400 italic">
                        No verified skill badges recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
