import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Sliders,
  Radio,
  ShieldAlert,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bell,
  Globe,
  Lock,
  UserCheck,
  UserX,
  Trash2,
  Zap,
  Briefcase,
  BookOpen,
  Award,
  Bot,
  Activity,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSystem() {
  const [activeTab, setActiveTab] = useState('flags'); // 'flags' | 'broadcast' | 'audit'

  // Tab 1: Feature Flags State
  const [flags, setFlags] = useState({});
  const [globalMaintenance, setGlobalMaintenance] = useState({ isEnabled: false, message: '' });
  const [isFlagsLoading, setIsFlagsLoading] = useState(true);
  const [isSavingFlags, setIsSavingFlags] = useState(false);

  // Tab 2: Broadcast State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'normal',
    link: '',
    targetDomain: 'all',
  });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [isLoadingBroadcasts, setIsLoadingBroadcasts] = useState(false);

  // Tab 3: Audit Log State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPagination, setAuditPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 15,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  // Fetch Feature Flags
  const fetchFlags = async () => {
    try {
      setIsFlagsLoading(true);
      const res = await fetch(`${BACKEND_URL}/admin/system/flags`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch flags');
      setFlags(data.flags || {});
      setGlobalMaintenance(data.globalMaintenanceMode || { isEnabled: false, message: '' });
    } catch (err) {
      toast.error(err.message || 'Error loading feature flags');
    } finally {
      setIsFlagsLoading(false);
    }
  };

  // Fetch Broadcast History
  const fetchBroadcastHistory = async () => {
    try {
      setIsLoadingBroadcasts(true);
      const res = await fetch(`${BACKEND_URL}/admin/system/broadcasts`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch broadcast history');
      setBroadcastHistory(data.broadcasts || []);
    } catch (err) {
      toast.error(err.message || 'Error loading broadcasts');
    } finally {
      setIsLoadingBroadcasts(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async (page = 1) => {
    try {
      setIsLoadingAudit(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        action: auditActionFilter,
        search: auditSearch,
      });

      const res = await fetch(`${BACKEND_URL}/admin/system/audit-logs?${queryParams.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch audit logs');
      setAuditLogs(data.logs || []);
      setAuditPagination(data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalCount: 0,
        limit: 15,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      toast.error(err.message || 'Error loading audit logs');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'flags') fetchFlags();
    if (activeTab === 'broadcast') fetchBroadcastHistory();
    if (activeTab === 'audit') fetchAuditLogs(1);
  }, [activeTab]);

  // Handle Save Flags
  const handleSaveFlags = async () => {
    try {
      setIsSavingFlags(true);
      const res = await fetch(`${BACKEND_URL}/admin/system/flags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          flags,
          globalMaintenanceMode: globalMaintenance,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save feature flags');
      toast.success('Feature flags & maintenance status saved successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSavingFlags(false);
    }
  };

  // Handle Send Broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      return toast.error('Please enter both title and message');
    }

    try {
      setIsSendingBroadcast(true);
      const res = await fetch(`${BACKEND_URL}/admin/system/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(broadcastForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send broadcast');
      toast.success(data.message);
      setBroadcastForm({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal',
        link: '',
        targetDomain: 'all',
      });
      fetchBroadcastHistory();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const featureMeta = {
    mock_interview: { label: 'AI Mock Interview Studio', icon: Briefcase, color: 'text-sky-500' },
    roadmap_generator: { label: '90-Day Roadmap Engine', icon: Activity, color: 'text-indigo-500' },
    study_planner: { label: 'Study Planner & Micro-Quizzes', icon: BookOpen, color: 'text-emerald-500' },
    quiz_center: { label: 'AI Quiz & Certification Center', icon: Award, color: 'text-purple-500' },
    daily_briefing: { label: 'Daily AI Audio Briefings', icon: Zap, color: 'text-amber-500' },
    copilot_assistant: { label: 'Chief of Staff Copilot', icon: Bot, color: 'text-violet-500' },
    prescription_scanner: { label: 'Prescription OCR Scanner', icon: Layers, color: 'text-rose-500' },
    resume_analyzer: { label: 'Resume & Pitch Analyzer', icon: FileText, color: 'text-blue-500' },
  };

  const getActionBadgeColor = (act) => {
    switch (act) {
      case 'ROLE_UPDATE':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'USER_SUSPENDED':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'USER_ACTIVATED':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'USER_DELETED':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'FEATURE_FLAGS_UPDATED':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      case 'BROADCAST_SENT':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <AdminLayout
      title="System Operations & Platform Governance"
      subtitle="Zero-downtime feature flags, global system-wide notifications, and security audit logs."
    >
      {/* 3-Tab Header Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 w-full sm:w-fit overflow-x-auto custom-scrollbar mb-6">
        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'flags'
              ? 'bg-white dark:bg-purple-600 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-white" />
          <span>Feature Flags Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-white dark:bg-purple-600 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-purple-600 dark:text-white" />
          <span>System Broadcast Center</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-purple-600 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-white" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FEATURE FLAGS MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'flags' && (
        <div className="space-y-6">
          {/* Global Maintenance Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Platform-Wide Global Maintenance Mode
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  When enabled, all non-admin users will see an infrastructure maintenance splash screen.
                </p>
                {globalMaintenance.isEnabled && (
                  <input
                    type="text"
                    value={globalMaintenance.message}
                    onChange={(e) =>
                      setGlobalMaintenance((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Custom maintenance message for users..."
                    className="mt-2 w-full sm:w-96 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-400/40 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                )}
              </div>
            </div>

            <button
              onClick={() =>
                setGlobalMaintenance((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs shrink-0 ${
                globalMaintenance.isEnabled
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {globalMaintenance.isEnabled ? 'Disable Maintenance' : 'Enable Maintenance'}
            </button>
          </div>

          {/* Module Grid Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Individual Module Switches
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly disable specific AI engines if downstream APIs experience outage or rate limits.
              </p>
            </div>

            <button
              onClick={handleSaveFlags}
              disabled={isSavingFlags}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSavingFlags ? 'Saving...' : 'Save Flags Configuration'}</span>
            </button>
          </div>

          {/* Module Feature Cards Grid */}
          {isFlagsLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Querying platform settings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(featureMeta).map((key) => {
                const meta = featureMeta[key];
                const flag = flags[key] || { isEnabled: true, maintenanceMessage: '' };
                const Icon = meta.icon;

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      flag.isEnabled
                        ? 'bg-white dark:bg-[#0f1422] border-slate-200/80 dark:border-white/10'
                        : 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-300 dark:border-white/5 opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {meta.label}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{key}</div>
                        </div>
                      </div>

                      {/* Switch Button */}
                      <button
                        onClick={() =>
                          setFlags((prev) => ({
                            ...prev,
                            [key]: { ...flag, isEnabled: !flag.isEnabled },
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          flag.isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            flag.isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {!flag.isEnabled && (
                      <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                          Notice Shown to Users when clicked:
                        </label>
                        <input
                          type="text"
                          value={flag.maintenanceMessage}
                          onChange={(e) =>
                            setFlags((prev) => ({
                              ...prev,
                              [key]: { ...flag, maintenanceMessage: e.target.value },
                            }))
                          }
                          placeholder="Maintenance reason message..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SYSTEM BROADCAST CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Broadcast Composer Form */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Compose System-Wide In-App Notification
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Instant Dispatch
              </span>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Broadcast Title *
                </label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) =>
                    setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. 🚀 AI Mock Interview Voice Studio is now live!"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              {/* Message */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={broadcastForm.message}
                  onChange={(e) =>
                    setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Write a clear announcement description for users..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Type */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Notification Type
                  </label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) =>
                      setBroadcastForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="announcement">Announcement (General)</option>
                    <option value="system_update">System Update</option>
                    <option value="alert">Critical Alert</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) =>
                      setBroadcastForm((prev) => ({ ...prev, priority: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Cohort
                  </label>
                  <select
                    value={broadcastForm.targetDomain}
                    onChange={(e) =>
                      setBroadcastForm((prev) => ({ ...prev, targetDomain: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="all">All Registered Users</option>
                    <option value="tech">Tech & Software Users</option>
                    <option value="business">Business & Finance</option>
                    <option value="academic">Academic & Science</option>
                    <option value="creative">Creative & Design</option>
                  </select>
                </div>
              </div>

              {/* Action Link */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  1-Click Action Route (Optional)
                </label>
                <input
                  type="text"
                  value={broadcastForm.link}
                  onChange={(e) =>
                    setBroadcastForm((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="e.g. /career/mock-interview or /learning/roadmap"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSendingBroadcast}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center gap-2 shadow-sm shadow-purple-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingBroadcast ? 'Dispatching...' : 'Dispatch Broadcast Now'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live User Notification Preview */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>Live User Preview</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {broadcastForm.type}
                  </span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {broadcastForm.title || 'Notification Title Preview'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3">
                  {broadcastForm.message || 'The full announcement body preview will appear here...'}
                </p>
                {broadcastForm.link && (
                  <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 underline">
                    Action link: {broadcastForm.link}
                  </div>
                )}
              </div>
            </div>

            {/* Broadcast History Ledger */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Past Broadcasts</h4>
                <button
                  onClick={fetchBroadcastHistory}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {isLoadingBroadcasts ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading history...</div>
                ) : broadcastHistory.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">No broadcast records yet</div>
                ) : (
                  broadcastHistory.map((b) => (
                    <div
                      key={b._id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="truncate">{b.title}</span>
                        <span className="text-[9px] text-purple-600 shrink-0">
                          {b.recipientCount} users
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>Cohort: {b.targetDomain}</span>
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs(1)}
                  placeholder="Search audit descriptions..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => {
                  setAuditActionFilter(e.target.value);
                  setTimeout(() => fetchAuditLogs(1), 50);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="all">All Actions</option>
                <option value="ROLE_UPDATE">Role Updates</option>
                <option value="USER_SUSPENDED">Suspensions</option>
                <option value="USER_ACTIVATED">Reactivations</option>
                <option value="USER_DELETED">Deletions</option>
                <option value="FEATURE_FLAGS_UPDATED">Feature Flags</option>
                <option value="BROADCAST_SENT">Broadcasts</option>
              </select>

              <button
                onClick={() => fetchAuditLogs(1)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
              >
                Filter
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
              <button
                onClick={() => fetchAuditLogs(auditPagination.currentPage)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin text-purple-600' : ''}`} />
              </button>
              <span>
                Total <b>{auditPagination.totalCount}</b> Audit Events
              </span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
            {isLoadingAudit ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500">Querying security audit ledger...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No audit events found</div>
                <p className="text-xs text-slate-400">Any administrative action will be recorded here automatically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Admin</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Details & Target</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                        {/* Admin */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                              {log.admin?.name ? log.admin.name.charAt(0) : 'A'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {log.admin?.name || 'Admin'}
                              </div>
                              <div className="text-[10px] text-slate-400">{log.admin?.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Details */}
                        <td className="py-3 px-4 max-w-xs sm:max-w-md">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">
                            {log.description}
                          </div>
                          {log.targetUserName && (
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                              Target: {log.targetUserName}
                            </div>
                          )}
                        </td>

                        {/* IP Address */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {log.ipAddress || '127.0.0.1'}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {auditPagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5">
                <div>
                  Page <b>{auditPagination.currentPage}</b> of <b>{auditPagination.totalPages}</b>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!auditPagination.hasPrevPage}
                    onClick={() => fetchAuditLogs(auditPagination.currentPage - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    disabled={!auditPagination.hasNextPage}
                    onClick={() => fetchAuditLogs(auditPagination.currentPage + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
