import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';
import {
  Zap,
  DollarSign,
  Clock,
  Cpu,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Search,
  Server,
  Award,
  BookOpen,
  Briefcase,
  Bot
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAiAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const fetchMetrics = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${BACKEND_URL}/admin/metrics/ai-usage`, {
        credentials: 'include',
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to fetch AI metrics');
      setData(resData.metrics);
      if (showToast) toast.success('AI Token economics synchronized');
    } catch (err) {
      toast.error(err.message || 'Error loading AI economics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatTokens = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const getModuleIcon = (mod) => {
    switch (mod) {
      case 'mock_interview':
        return Briefcase;
      case 'roadmap':
        return Activity;
      case 'study_plan':
        return BookOpen;
      case 'quiz':
        return Award;
      case 'copilot':
        return Bot;
      default:
        return Sparkles;
    }
  };

  return (
    <AdminLayout
      title="AI Token Economics & Cost Intelligence"
      subtitle="Track Gemini & Groq token burn rates, unit economics ($ USD), latency telemetry, and module consumption."
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last sync: {new Date().toLocaleTimeString()}</span>
        </div>

        <button
          onClick={() => fetchMetrics(true)}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh AI Telemetry</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Synthesizing AI Token Economics & Cost Ledger...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4 Hero KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Tokens Burned */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Tokens Burned</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatTokens(data?.summary?.totalTokens)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Prompt: {formatTokens(data?.summary?.promptTokens)}</span>
                <span>•</span>
                <span>Output: {formatTokens(data?.summary?.candidateTokens)}</span>
              </div>
            </div>

            {/* 2. Estimated USD Cost */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Estimated AI Cost</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                ${data?.summary?.totalCostUsd?.toFixed(4) || '0.0000'} <span className="text-xs font-semibold text-slate-400">USD</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Across {data?.summary?.totalRequests || 0} API invocations</span>
              </div>
            </div>

            {/* 3. Average Response Latency */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg AI Latency</span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {data?.summary?.avgLatencyMs || 0} <span className="text-xs font-semibold text-slate-400">ms</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                <Server className="w-3.5 h-3.5" />
                <span>Gemini 2.5 Flash Fast Path</span>
              </div>
            </div>

            {/* 4. Fallback Engine Rate */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Fallback Rate</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {data?.summary?.fallbackRate || 0}%
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                <Activity className="w-3.5 h-3.5" />
                <span>Auto-switched to Groq</span>
              </div>
            </div>
          </div>

          {/* Module Consumption & Daily Timeline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Module Breakdown List */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Usage by AI Module</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {data?.moduleBreakdown?.length || 0} Modules
                </span>
              </div>

              <div className="space-y-3.5">
                {data?.moduleBreakdown && data.moduleBreakdown.length > 0 ? (
                  data.moduleBreakdown.map((item, idx) => {
                    const maxTokens = data.moduleBreakdown[0]?.tokens || 1;
                    const percent = Math.min(100, Math.round((item.tokens / maxTokens) * 100));
                    const Icon = getModuleIcon(item.module);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                            <Icon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {formatTokens(item.tokens)}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              ${item.costUsd?.toFixed(4)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 italic py-6 text-center">No module breakdown recorded yet</div>
                )}
              </div>
            </div>

            {/* Daily Token Burn Timeline */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Token Burn Timeline</h3>
                </div>
                <span className="text-xs text-slate-400">Past 7–14 Days</span>
              </div>

              {/* Bar Timeline Visual */}
              <div className="space-y-3">
                <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
                  {data?.dailyTimeline && data.dailyTimeline.length > 0 ? (
                    data.dailyTimeline.map((day, idx) => {
                      const maxDaily = Math.max(...data.dailyTimeline.map(d => d.tokens)) || 1;
                      const barHeight = Math.max(12, Math.round((day.tokens / maxDaily) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                          {/* Hover Tooltip */}
                          <div className="absolute -top-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20 shadow-lg">
                            <span className="font-bold">{day.tokens.toLocaleString()} tokens</span> (${day.costUsd})
                          </div>
                          {/* Bar */}
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-sky-400 group-hover:from-purple-500 group-hover:to-sky-300 transition-all duration-300"
                            style={{ height: `${barHeight}%` }}
                          ></div>
                          {/* Label */}
                          <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
                            {day.date.split('-').slice(1).join('/')}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-xs text-slate-400 italic py-12 text-center">No timeline data available</div>
                  )}
                </div>

                {/* Provider Distribution Chips */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Engine Allocation:</span>
                  <div className="flex items-center gap-3">
                    {data?.providerBreakdown && data.providerBreakdown.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${p.provider === 'gemini' ? 'bg-sky-500' : 'bg-purple-500'}`}></span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{p.label} ({p.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top AI Consumers / Spenders Leaderboard */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top AI Spenders & Heavy Consumers Leaderboard
                </h3>
              </div>
              <span className="text-xs text-slate-400">Unit Economics Telemetry</span>
            </div>

            <div className="overflow-x-auto w-full custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Rank & User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">API Requests</th>
                    <th className="py-3 px-4 text-center">Tokens Burned</th>
                    <th className="py-3 px-4 text-right">Est. Cost ($ USD)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data?.topConsumers && data.topConsumers.length > 0 ? (
                    data.topConsumers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                              idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                              idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                              'text-slate-400'
                            }`}>
                              #{idx + 1}
                            </span>
                            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                              {u.name ? u.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {u.requestsCount} calls
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                          {formatTokens(u.totalTokens)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${u.estimatedCostUsd?.toFixed(4)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedUserId(u.userId)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400 italic">
                        No AI consumer records available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Inspection Modal */}
      {selectedUserId && (
        <AdminUserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUserUpdated={() => fetchMetrics()}
        />
      )}
    </AdminLayout>
  );
}
