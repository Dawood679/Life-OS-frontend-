import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import FeatureLayout from "../../src/components/FeatureLayout";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  Plus,
  Search,
  Download,
  Upload,
  Calendar,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Tag,
  ArrowRightLeft
} from "lucide-react";

export default function FinancialOverview() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Selected Month (YYYY-MM)
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Core Data States
  const [summaryData, setSummaryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 15 });
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalMode, setTxModalMode] = useState("create"); // 'create' | 'edit'
  const [editingTxId, setEditingTxId] = useState(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, description: "", amount: 0 });

  // Transaction Form State
  const initialTxForm = {
    type: "expense",
    amount: "",
    category: "Food & Dining",
    account: "",
    toAccount: "",
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    description: "",
    isRecurring: false,
    recurringFrequency: "none",
    tags: "",
  };
  const [txForm, setTxForm] = useState(initialTxForm);

  // Account Form State
  const initialAccountForm = {
    name: "",
    type: "bank",
    balance: "0",
    currency: "USD",
    color: "#0ea5e9",
  };
  const [accountForm, setAccountForm] = useState(initialAccountForm);

  // Available Categories
  const expenseCategories = [
    "Food & Dining",
    "Housing & Rent",
    "Tech & Tools",
    "Learning & Courses",
    "Healthcare",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Personal Care",
    "Travel",
    "Investments",
    "Other",
  ];

  const incomeCategories = [
    "Salary & Wage",
    "Freelance / Client",
    "Investments & Dividends",
    "Side Hustle",
    "Gift / Bonus",
    "Refund",
    "Other Income",
  ];

  // Fetch Financial Summary & Accounts
  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/finance/summary?month=${selectedMonth}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSummaryData(json.data);
        setAccounts(json.data.accounts || []);
        if (!txForm.account && json.data.accounts && json.data.accounts.length > 0) {
          setTxForm((prev) => ({ ...prev, account: json.data.accounts[0].name }));
        }
      }
    } catch (err) {
      console.error("Error fetching financial summary:", err);
      toast.error("Failed to load financial overview");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Transactions List with Filters
  const fetchTransactions = async (page = 1) => {
    try {
      setLoadingTx(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
        month: selectedMonth,
      });

      if (typeFilter !== "all") params.append("type", typeFilter);
      if (accountFilter !== "all") params.append("account", accountFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`${BACKEND_URL}/finance/transactions?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTransactions(json.data.transactions || []);
        setPagination(json.data.pagination || { page: 1, pages: 1, total: 0, limit: 15 });
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth]);

  useEffect(() => {
    fetchTransactions(1);
  }, [selectedMonth, typeFilter, accountFilter, categoryFilter, searchQuery]);

  // Handle Month Step Navigation
  const changeMonth = (delta) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    const newMonthStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonthStr);
  };

  // Create or Update Transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.amount || isNaN(Number(txForm.amount)) || Number(txForm.amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    if (!txForm.account) {
      toast.error("Please select an account");
      return;
    }
    if (txForm.type === "transfer" && (!txForm.toAccount || txForm.toAccount === txForm.account)) {
      toast.error("Please select a distinct destination account for transfer");
      return;
    }

    try {
      const payload = {
        type: txForm.type,
        amount: Number(txForm.amount),
        category: txForm.type === "transfer" ? "Transfer" : txForm.category,
        account: txForm.account,
        toAccount: txForm.type === "transfer" ? txForm.toAccount : undefined,
        date: txForm.date,
        merchant: txForm.merchant,
        description: txForm.description,
        isRecurring: txForm.isRecurring,
        recurringFrequency: txForm.isRecurring ? txForm.recurringFrequency : "none",
        tags: txForm.tags ? txForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      const url = txModalMode === "edit"
        ? `${BACKEND_URL}/finance/transactions/${editingTxId}`
        : `${BACKEND_URL}/finance/transactions`;

      const method = txModalMode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(txModalMode === "edit" ? "Transaction updated!" : "Transaction recorded!");
        setIsTxModalOpen(false);
        setTxForm(initialTxForm);
        fetchSummary();
        fetchTransactions(pagination.page);
      } else {
        toast.error(json.message || "Failed to save transaction");
      }
    } catch (err) {
      console.error("Save transaction error:", err);
      toast.error("Network error while saving transaction");
    }
  };

  // Open Edit Transaction Modal
  const handleEditClick = (tx) => {
    setTxModalMode("edit");
    setEditingTxId(tx._id);
    setTxForm({
      type: tx.type || "expense",
      amount: String(tx.amount || ""),
      category: tx.category || "Food & Dining",
      account: tx.account || "",
      toAccount: tx.toAccount || "",
      date: tx.date ? new Date(tx.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      merchant: tx.merchant || "",
      description: tx.description || "",
      isRecurring: Boolean(tx.isRecurring),
      recurringFrequency: tx.recurringFrequency || "none",
      tags: Array.isArray(tx.tags) ? tx.tags.join(", ") : "",
    });
    setIsTxModalOpen(true);
  };

  // Delete Transaction
  const confirmDeleteTx = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`${BACKEND_URL}/finance/transactions/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Transaction deleted & balance restored");
        setDeleteModal({ isOpen: false, id: null, description: "", amount: 0 });
        fetchSummary();
        fetchTransactions(pagination.page);
      } else {
        toast.error(json.message || "Failed to delete transaction");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting transaction");
    }
  };

  // Create New Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.name.trim()) {
      toast.error("Account name is required");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/finance/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: accountForm.name.trim(),
          type: accountForm.type,
          balance: Number(accountForm.balance) || 0,
          currency: accountForm.currency,
          color: accountForm.color,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Account created successfully!");
        setIsAccountModalOpen(false);
        setAccountForm(initialAccountForm);
        fetchSummary();
      } else {
        toast.error(json.message || "Failed to create account");
      }
    } catch (err) {
      console.error("Create account error:", err);
      toast.error("Network error while creating account");
    }
  };

  // Excel / CSV File Import Parser
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          toast.error("No valid data rows found in the uploaded file");
          return;
        }

        const parsed = rawJson.map((row, idx) => {
          const typeVal = String(row.Type || row.type || "expense").toLowerCase();
          const type = typeVal.includes("inc") ? "income" : typeVal.includes("trans") ? "transfer" : "expense";
          const amount = Math.abs(Number(row.Amount || row.amount || row.Price || 0));
          const category = row.Category || row.category || "Other";
          const account = row.Account || row.account || (accounts[0]?.name || "Cash Wallet");
          const date = row.Date || row.date || new Date().toISOString().split("T")[0];
          const merchant = row.Merchant || row.merchant || row.Payee || "";
          const description = row.Description || row.description || row.Note || "";

          return {
            id: idx,
            type,
            amount,
            category,
            account,
            date,
            merchant,
            description,
          };
        });

        setImportPreviewData(parsed);
        setIsImportModalOpen(true);
        toast.success(`Parsed ${parsed.length} transactions from file!`);
      } catch (err) {
        console.error("File parse error:", err);
        toast.error("Failed to parse Excel/CSV file. Check format.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // Execute Bulk Import
  const handleExecuteImport = async () => {
    if (importPreviewData.length === 0) return;
    try {
      setIsImporting(true);
      const res = await fetch(`${BACKEND_URL}/finance/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transactions: importPreviewData }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Transactions imported successfully!");
        setIsImportModalOpen(false);
        setImportPreviewData([]);
        fetchSummary();
        fetchTransactions(1);
      } else {
        toast.error(json.message || "Import failed");
      }
    } catch (err) {
      console.error("Bulk import error:", err);
      toast.error("Network error during bulk import");
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample Excel Template
  const downloadSampleTemplate = () => {
    const sampleRows = [
      { Date: "2026-09-01", Type: "income", Amount: 3500, Category: "Salary & Wage", Account: "Main Checking", Merchant: "Employer Inc", Description: "Monthly Direct Deposit" },
      { Date: "2026-09-02", Type: "expense", Amount: 1200, Category: "Housing & Rent", Account: "Main Checking", Merchant: "Landlord", Description: "Apartment Rent" },
      { Date: "2026-09-05", Type: "expense", Amount: 85.50, Category: "Food & Dining", Account: "Cash Wallet", Merchant: "Trader Joe's", Description: "Weekly Groceries" },
      { Date: "2026-09-08", Type: "expense", Amount: 20, Category: "Tech & Tools", Account: "Main Checking", Merchant: "OpenAI", Description: "ChatGPT Plus Subscription" },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FinanceTemplate");
    XLSX.writeFile(wb, "LifeOS_Finance_Import_Template.xlsx");
    toast.success("Sample template downloaded!");
  };

  // Export Current Month Data to Excel
  const exportFinanceData = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export for this period");
      return;
    }
    const exportRows = transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Type: t.type.toUpperCase(),
      Amount: t.amount,
      Category: t.category,
      Account: t.account,
      ToAccount: t.toAccount || "",
      Merchant: t.merchant || "",
      Description: t.description || "",
      Recurring: t.isRecurring ? "Yes" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Transactions_${selectedMonth}`);
    XLSX.writeFile(wb, `LifeOS_Finance_${selectedMonth}.xlsx`);
    toast.success("Financial data exported successfully!");
  };

  const metrics = summaryData?.metrics || {
    netWorth: 0,
    liquidSavings: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    runwayMonths: 0,
    avgMonthlyExpense: 0,
  };

  const cashFlowTrend = summaryData?.cashFlowTrend || [];
  const categoryBreakdown = summaryData?.categoryBreakdown || [];

  return (
    <FeatureLayout
      badgeText="Personal Foundation"
      title="Financial Overview & Cash Flow"
      subtitle="Complete wealth tracking, runway intelligence, category distribution, and unified transaction studio."
      onBack={() => navigate("/dashboard")}
    >
      {/* TOP CONTROLS & MONTH SELECTOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        {/* Month Selector Carousel */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl shadow-2xs">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-slate-200/70 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2 text-xs md:text-sm font-bold text-slate-800 dark:text-white tracking-wide">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {new Date(`${selectedMonth}-01T00:00:00Z`).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-slate-200/70 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setTxModalMode("create");
              setTxForm(initialTxForm);
              if (accounts.length > 0) {
                setTxForm((prev) => ({ ...prev, account: accounts[0].name }));
              }
              setIsTxModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>

          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-[#131b2e] hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>New Wallet</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-[#131b2e] hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            title="Import Transactions from CSV or Excel"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Import CSV/XLS</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={exportFinanceData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-[#131b2e] hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            title="Export Month Data to Excel"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Export</span>
          </button>

          <button
            onClick={() => navigate("/finance/budget")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Budget Planner &rarr;</span>
          </button>
        </div>
      </div>

      {/* TOP HUD KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-[#0e131f] dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-500/30 p-5 rounded-2xl shadow-xs dark:shadow-emerald-950/20 backdrop-blur-md hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-emerald-400/90 uppercase tracking-wider">Total Net Worth</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
              ${Number(metrics.netWorth || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">${Number(metrics.liquidSavings || 0).toLocaleString()}</span>
              <span>liquid savings</span>
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-gradient-to-br from-teal-50/90 via-white to-sky-50/50 dark:from-teal-950/40 dark:via-[#0e131f] dark:to-sky-950/30 border border-teal-200/80 dark:border-teal-500/30 p-5 rounded-2xl shadow-xs dark:shadow-teal-950/20 backdrop-blur-md hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-teal-400/90 uppercase tracking-wider">Monthly Income</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 tracking-tight font-serif">
              +${Number(metrics.monthlyIncome || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active cash inflows this month
            </p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="bg-gradient-to-br from-rose-50/90 via-white to-orange-50/50 dark:from-rose-950/40 dark:via-[#0e131f] dark:to-orange-950/30 border border-rose-200/80 dark:border-rose-500/30 p-5 rounded-2xl shadow-xs dark:shadow-rose-950/20 backdrop-blur-md hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-rose-400/90 uppercase tracking-wider">Monthly Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-700 dark:text-rose-300">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight font-serif">
              -${Number(metrics.monthlyExpense || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Net savings:{" "}
              <span className={metrics.netSavings >= 0 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                {metrics.netSavings >= 0 ? "+" : ""}${Number(metrics.netSavings || 0).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Financial Runway & Savings Rate */}
        <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-[#0e131f] dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-500/30 p-5 rounded-2xl shadow-xs dark:shadow-indigo-950/20 backdrop-blur-md hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-indigo-400/90 uppercase tracking-wider">Runway & Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
                {metrics.runwayMonths} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">months</span>
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold rounded-full">
                {metrics.savingsRate}% Saved
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Runway based on avg ${metrics.avgMonthlyExpense}/mo burn
            </p>
          </div>
        </div>
      </div>
      {/* WALLETS & ACCOUNTS GRID */}
      <div className="bg-white/95 dark:bg-[#0e131f]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">Wallets & Financial Accounts</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAccountForm({
                  name: "Emergency Savings Vault",
                  type: "savings",
                  balance: "1000",
                  currency: "USD",
                  color: "#6366f1",
                });
                setIsAccountModalOpen(true);
              }}
              className="text-xs bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PiggyBank className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>+ Add Savings Vault</span>
            </button>
            <button
              onClick={() => {
                setAccountForm(initialAccountForm);
                setIsAccountModalOpen(true);
              }}
              className="text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#131b2e] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Wallet</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {accounts.map((acc) => {
            const isCredit = acc.type === "credit";
            const isSavings = acc.type === "savings";
            return (
              <div
                key={acc._id}
                className="bg-slate-50/90 dark:bg-[#131b2e] border border-slate-200/80 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 p-4 rounded-xl transition-all relative overflow-hidden shadow-2xs flex flex-col justify-between gap-3"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-1"
                  style={{ backgroundColor: acc.color || "#0ea5e9" }}
                />
                <div className="flex items-start justify-between pl-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {acc.type === "savings" ? "Savings Vault" : acc.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[140px]">
                      {acc.name}
                    </h4>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#1a233a] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                    {acc.type === "bank" ? (
                      <Landmark className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    ) : acc.type === "credit" ? (
                      <CreditCard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    ) : acc.type === "savings" ? (
                      <PiggyBank className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                </div>
                <div className="pl-1 flex items-center justify-between">
                  <p className={`text-base font-extrabold font-serif ${isCredit ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                    {isCredit ? "-" : ""}${Number(acc.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  {isSavings && (
                    <button
                      onClick={() => {
                        const fromAcc = accounts.find((a) => a.name !== acc.name)?.name || "";
                        setTxModalMode("create");
                        setTxForm({
                          ...initialTxForm,
                          type: "transfer",
                          account: fromAcc,
                          toAccount: acc.name,
                          description: `Deposit to ${acc.name}`,
                        });
                        setIsTxModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                      title="Deposit money into this savings vault"
                    >
                      ⚡ Deposit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN SECTION: 6-MONTH TREND & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Cash Flow Trend Card */}
        <div className="lg:col-span-2 bg-white/95 dark:bg-[#0e131f]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">6-Month Cash Flow Momentum</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Income vs Expense</span>
          </div>

          <div className="grid grid-cols-6 gap-2 pt-4">
            {cashFlowTrend.map((m, idx) => {
              const maxVal = Math.max(
                ...cashFlowTrend.map((t) => Math.max(t.income, t.expense)),
                1000
              );
              const incomeHeight = Math.max(12, Math.round((m.income / maxVal) * 120));
              const expenseHeight = Math.max(12, Math.round((m.expense / maxVal) * 120));

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  {/* Bars Container */}
                  <div className="h-32 w-full flex items-end justify-center gap-1.5 bg-slate-50 dark:bg-[#131b2e] rounded-xl p-1.5 border border-slate-200/80 dark:border-white/10">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${incomeHeight}px` }}
                      className="w-1/2 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md relative group cursor-pointer transition-all hover:brightness-110 shadow-2xs"
                      title={`Income: $${m.income.toLocaleString()}`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expenseHeight}px` }}
                      className="w-1/2 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-md relative group cursor-pointer transition-all hover:brightness-110 shadow-2xs"
                      title={`Expense: $${m.expense.toLocaleString()}`}
                    />
                  </div>
                  {/* Month Label */}
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {m.month}
                  </span>
                  {/* Net indicator */}
                  <span
                    className={`text-[9px] font-mono font-bold ${
                      m.net >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {m.net >= 0 ? `+$${m.net}` : `-$${Math.abs(m.net)}`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Expense</span>
            </div>
          </div>
        </div>

        {/* Category Expense Breakdown */}
        <div className="bg-white/95 dark:bg-[#0e131f]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">Category Distribution</h3>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
              ${metrics.monthlyExpense.toLocaleString()}
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expense transactions logged for this month.
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {categoryBreakdown.map((cat, idx) => {
                const percent = metrics.monthlyExpense > 0
                  ? Math.round((cat.total / metrics.monthlyExpense) * 100)
                  : 0;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[140px]">
                        {cat._id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{percent}%</span>
                        <span className="text-slate-900 dark:text-white font-bold font-mono">
                          ${cat.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-[#131b2e] rounded-full h-2 overflow-hidden border border-transparent dark:border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TRANSACTIONS MANAGEMENT STUDIO */}
      <div className="bg-white/95 dark:bg-[#0e131f]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-5 rounded-2xl shadow-xs space-y-4">
        {/* Header & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">Transaction Studio</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-[#131b2e] text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full border border-slate-200 dark:border-white/10">
              {pagination.total} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, merchant..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 w-48 sm:w-56"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfers</option>
            </select>

            {/* Account Filter */}
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a._id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0e131f]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#131b2e] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10 text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchant / Payee</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loadingTx ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No transactions found for this period. Click "+ Record Transaction" to add your first entry.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isTransfer = tx.type === "transfer";

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Merchant & Description */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <span>{tx.merchant || tx.description || "Untitled Transaction"}</span>
                          {tx.isRecurring && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-500/30 font-bold">
                              Recurring
                            </span>
                          )}
                        </div>
                        {tx.description && tx.merchant && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {tx.description}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 dark:bg-[#131b2e] text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-medium">
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          {tx.category}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {isTransfer ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <span>{tx.account}</span>
                            <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" />
                            <span>{tx.toAccount || "Account"}</span>
                          </div>
                        ) : (
                          <span>{tx.account}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isTransfer
                              ? "text-sky-600 dark:text-sky-400"
                              : "text-rose-600 dark:text-rose-400"
                          }
                        >
                          {isIncome ? "+" : isTransfer ? "⇄ " : "-"}${Number(tx.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(tx)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: tx._id,
                                description: tx.merchant || tx.description || "Transaction",
                                amount: tx.amount,
                              })
                            }
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Transaction"
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

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchTransactions(pagination.page - 1)}
                className="px-3 py-1 bg-slate-100 dark:bg-[#131b2e] disabled:opacity-40 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchTransactions(pagination.page + 1)}
                className="px-3 py-1 bg-slate-100 dark:bg-[#131b2e] disabled:opacity-40 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECORD / EDIT TRANSACTION MODAL */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#0e131f]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    {txModalMode === "edit" ? "Edit Transaction" : "Record Transaction"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Keep your real-time cash flow and accounts up to date.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-[#0e131f] p-1 rounded-xl border border-slate-200 dark:border-white/10">
                {[
                  { id: "expense", label: "Expense", active: "bg-rose-600 text-white shadow-xs" },
                  { id: "income", label: "Income", active: "bg-emerald-600 text-white shadow-xs" },
                  { id: "transfer", label: "Transfer", active: "bg-sky-600 text-white shadow-xs" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: tab.id })}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      txForm.type === tab.id
                        ? tab.active
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-mono text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Category (if not transfer) */}
              {txForm.type !== "transfer" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                  >
                    {(txForm.type === "income" ? incomeCategories : expenseCategories).map((c) => (
                      <option key={c} value={c} className="dark:bg-[#131b2e] dark:text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Account Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {txForm.type === "transfer" ? "From Account *" : "Account *"}
                  </label>
                  <select
                    value={txForm.account}
                    onChange={(e) => setTxForm({ ...txForm, account: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                  >
                    {accounts.map((a) => (
                      <option key={a._id} value={a.name} className="dark:bg-[#131b2e] dark:text-white">
                        {a.name} (${a.balance})
                      </option>
                    ))}
                  </select>
                </div>

                {txForm.type === "transfer" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      To Account *
                    </label>
                    <select
                      value={txForm.toAccount}
                      onChange={(e) => setTxForm({ ...txForm, toAccount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="" className="dark:bg-[#131b2e] dark:text-white">Select Destination</option>
                      {accounts
                        .filter((a) => a.name !== txForm.account)
                        .map((a) => (
                          <option key={a._id} value={a.name} className="dark:bg-[#131b2e] dark:text-white">
                            {a.name} (${a.balance})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Merchant / Payee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Merchant / Payee / Source
                </label>
                <input
                  type="text"
                  value={txForm.merchant}
                  onChange={(e) => setTxForm({ ...txForm, merchant: e.target.value })}
                  placeholder="e.g. Amazon, Uber, Employer, Landlord"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Description & Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Description
                </label>
                <input
                  type="text"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  placeholder="Optional memo or transaction note"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Recurring Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0e131f] rounded-xl border border-slate-200 dark:border-white/10">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">Recurring Transaction</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Repeats every month (e.g. rent, subscription)</span>
                </div>
                <input
                  type="checkbox"
                  checked={txForm.isRecurring}
                  onChange={(e) =>
                    setTxForm({
                      ...txForm,
                      isRecurring: e.target.checked,
                      recurringFrequency: e.target.checked ? "monthly" : "none",
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0e131f] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {txModalMode === "edit" ? "Update Transaction" : "Record Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ACCOUNT / WALLET MODAL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#0e131f]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-700 dark:text-sky-300">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Create New Wallet / Account</h3>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-4">
              {/* Quick Preset Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Savings Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: "🛡️ 6-Month Emergency Fund", type: "savings", color: "#6366f1" },
                    { name: "📈 High-Yield Savings (HYSA)", type: "savings", color: "#10b981" },
                    { name: "✈️ Travel & Vacation Stash", type: "savings", color: "#0ea5e9" },
                    { name: "🏠 House Downpayment Vault", type: "savings", color: "#f59e0b" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setAccountForm((prev) => ({
                          ...prev,
                          name: preset.name.replace(/^[^\w\s]+\s*/, ""),
                          type: preset.type,
                          color: preset.color,
                        }))
                      }
                      className="text-[11px] font-medium bg-slate-100 dark:bg-[#0e131f] hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="e.g. Chase Freedom, Emergency Fund, Crypto Wallet"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Type
                  </label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-sky-600"
                  >
                    <option value="bank" className="dark:bg-[#131b2e] dark:text-white">Bank Account</option>
                    <option value="cash" className="dark:bg-[#131b2e] dark:text-white">Cash Wallet</option>
                    <option value="savings" className="dark:bg-[#131b2e] dark:text-white">Savings Vault</option>
                    <option value="credit" className="dark:bg-[#131b2e] dark:text-white">Credit Card (Liability)</option>
                    <option value="investment" className="dark:bg-[#131b2e] dark:text-white">Investment Portfolio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Starting Balance ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e131f] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {["#0ea5e9", "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"].map(
                    (col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAccountForm({ ...accountForm, color: col })}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          accountForm.color === col ? "scale-125 ring-2 ring-slate-800 dark:ring-white" : "opacity-70 hover:opacity-100"
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0e131f] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART CSV/EXCEL BULK IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#0e131f]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Bulk Import Preview ({importPreviewData.length} Rows)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review parsed transactions before committing them to your ledger.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Ready to import <strong className="text-emerald-700 dark:text-emerald-400">{importPreviewData.length}</strong> transactions
                </span>
                <button
                  onClick={downloadSampleTemplate}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold underline"
                >
                  Download Format Template
                </button>
              </div>

              {/* Table Preview */}
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#0e131f] text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Merchant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {importPreviewData.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{row.date}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.type === "income" ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20" : "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">${row.amount}</td>
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.category}</td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{row.merchant || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importPreviewData.length > 8 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  + {importPreviewData.length - 8} more transactions will be imported
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0e131f] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isImporting}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isImporting ? "Importing..." : `Confirm Import (${importPreviewData.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Delete Transaction?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete &quot;{deleteModal.description}&quot; (${deleteModal.amount})? Your wallet balance will be restored.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null, description: "", amount: 0 })}
                className="px-4 py-2 bg-slate-100 dark:bg-[#0e131f] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTx}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </FeatureLayout>
  );
}
