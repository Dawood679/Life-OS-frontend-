import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Crown,
  Zap,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [kpiSummary, setKpiSummary] = useState({
    totalGrossRevenue: '0.00',
    monthlyMrr: '0.00',
    yearlyPassRevenue: '0.00',
    totalTransactionsCount: 0,
    activePaidSubscribersCount: 0,
    monthlyTransactionsCount: 0,
    yearlyTransactionsCount: 0
  });

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 15,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billingFilter, setBillingFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const fetchPayments = useCallback(
    async (page = 1, showToast = false) => {
      try {
        setIsRefreshing(true);
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(pagination.limit)
        });

        if (searchTerm.trim()) queryParams.append('search', searchTerm.trim());
        if (planFilter !== 'all') queryParams.append('plan', planFilter);
        if (statusFilter !== 'all') queryParams.append('status', statusFilter);
        if (billingFilter !== 'all') queryParams.append('billingCycle', billingFilter);

        const res = await fetch(`${BACKEND_URL}/admin/payments?${queryParams.toString()}`, {
          credentials: 'include'
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch payment records');

        setPayments(data.payments || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.kpiSummary) setKpiSummary(data.kpiSummary);

        if (showToast) toast.success('Payment ledger updated');
      } catch (err) {
        console.error('Fetch payments error:', err);
        toast.error(err.message || 'Error fetching payments');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [BACKEND_URL, pagination.limit, searchTerm, planFilter, statusFilter, billingFilter]
  );

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments(1);
  };

  const copyToClipboard = (text, label = 'ID') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const exportCSV = () => {
    if (payments.length === 0) {
      toast.error('No payment records to export');
      return;
    }

    const headers = ['Date', 'User Name', 'User Email', 'Plan', 'Billing Cycle', 'Amount (USD)', 'Status', 'Gateway', 'Session ID'];
    const rows = payments.map((p) => [
      new Date(p.createdAt).toISOString(),
      `"${p.userName || ''}"`,
      `"${p.userEmail || ''}"`,
      p.plan,
      p.billingCycle,
      (p.amount / 100).toFixed(2),
      p.status,
      p.paymentGateway,
      p.stripeSessionId || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LifeOS_Payments_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  return (
    <AdminLayout
      title="Revenue & Payment Operations"
      subtitle="Monitor live subscription revenue, 1-year access passes, user transaction logs, and Stripe webhooks."
    >
      {/* 1. TOP FINANCIAL KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Gross Revenue */}
        <div className="bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              ${kpiSummary.totalGrossRevenue}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {kpiSummary.totalTransactionsCount} total successful transactions
          </p>
        </div>

        {/* Card 2: Monthly MRR */}
        <div className="bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly MRR
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              ${kpiSummary.monthlyMrr}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">/ mo</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {kpiSummary.monthlyTransactionsCount} recurring monthly subscribers ($19/mo)
          </p>
        </div>

        {/* Card 3: 1-Year Pass Revenue */}
        <div className="bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1-Year Pass Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              ${kpiSummary.yearlyPassRevenue}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {kpiSummary.yearlyTransactionsCount} annual 365-day access passes ($180)
          </p>
        </div>

        {/* Card 4: Active Paid Subscribers */}
        <div className="bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active VIP Members
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {kpiSummary.activePaidSubscribersCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">Users</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Active Pro Monthly & Yearly Members
          </p>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-xs mb-6 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email address, or Stripe session ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="all">All Plan Tiers</option>
              <option value="pro_monthly">Monthly Pro ($19/mo)</option>
              <option value="pro_yearly">1-Year Pass ($180)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Actions */}
            <button
              type="submit"
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>

            <button
              type="button"
              onClick={() => fetchPayments(pagination.currentPage, true)}
              disabled={isRefreshing}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="py-2.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. TRANSACTION HISTORY DATA TABLE */}
      <div className="bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Transaction History & Audit Ledger
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Total {pagination.totalCount} records
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-400 animate-pulse">Loading transaction logs...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No payment transactions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Transactions will automatically appear here once users subscribe via Stripe Checkout or dev simulation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan & Tier</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                {payments.map((p) => {
                  const isYearly = p.billingCycle === 'yearly' || p.plan === 'pro_yearly' || p.plan === 'yearly_pass';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {p.userName ? p.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {p.userName || 'Unnamed Customer'}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{p.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Tier Badge */}
                      <td className="py-3.5 px-4">
                        {isYearly ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400/20 to-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span>1-Year Pass</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            <Zap className="w-3 h-3 text-indigo-500" />
                            <span>Monthly Pro</span>
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          ${(p.amount / 100).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1 uppercase">{p.currency || 'USD'}</span>
                      </td>

                      {/* Payment Gateway */}
                      <td className="py-3.5 px-4">
                        {p.paymentGateway === 'stripe' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Stripe Checkout
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Simulation
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {p.status === 'succeeded' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        ) : p.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                          {new Date(p.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(p.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>

                      {/* Action: Copy ID / Receipt */}
                      <td className="py-3.5 px-4 text-right">
                        {p.stripeSessionId && (
                          <button
                            onClick={() => copyToClipboard(p.stripeSessionId, 'Stripe Session ID')}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition inline-flex items-center gap-1 cursor-pointer"
                            title="Copy Stripe Session ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono truncate max-w-[90px]">
                              {p.stripeSessionId.slice(0, 10)}...
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> (
              {pagination.totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPayments(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || isRefreshing}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchPayments(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || isRefreshing}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
