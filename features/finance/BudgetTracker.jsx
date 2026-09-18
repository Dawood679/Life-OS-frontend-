import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FeatureLayout from "../../src/components/FeatureLayout";
import {
  Sparkles,
  PieChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Plus,
  ShieldCheck,
  Flame,
  Layers,
  X
} from "lucide-react";

export default function BudgetTracker() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Budget Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    overallBudget: 2500,
    savingsGoal: 500,
    alertThresholdPercent: 80,
    categories: [],
  });
  const [saving, setSaving] = useState(false);

  // Calculate remaining days in selected month for burn rate
  const { daysRemaining, totalDays } = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const currentDay = isCurrentMonth ? now.getDate() : 1;
    const remaining = isCurrentMonth ? Math.max(1, lastDay - currentDay + 1) : lastDay;
    return { daysRemaining: remaining, totalDays: lastDay };
  }, [selectedMonth]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/finance/budget?month=${selectedMonth}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBudgetData(json.data);
        setEditForm({
          overallBudget: json.data.overallBudget || 2500,
          savingsGoal: json.data.savingsGoal || 500,
          alertThresholdPercent: json.data.alertThresholdPercent || 80,
          categories: json.data.categories || [],
        });
      }
    } catch (err) {
      console.error("Error fetching budget:", err);
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth]);

  const changeMonth = (delta) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    const newMonthStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonthStr);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${BACKEND_URL}/finance/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          month: selectedMonth,
          overallBudget: Number(editForm.overallBudget),
          savingsGoal: Number(editForm.savingsGoal),
          alertThresholdPercent: Number(editForm.alertThresholdPercent),
          categories: editForm.categories.map((c) => ({
            category: c.category,
            budgeted: Number(c.budgeted) || 0,
            color: c.color || "#0ea5e9",
          })),
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Budget plan updated successfully!");
        setIsEditModalOpen(false);
        fetchBudget();
      } else {
        toast.error(json.message || "Failed to update budget");
      }
    } catch (err) {
      console.error("Save budget error:", err);
      toast.error("Network error while saving budget");
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryBudgetChange = (idx, value) => {
    setEditForm((prev) => {
      const updated = [...prev.categories];
      updated[idx] = { ...updated[idx], budgeted: value };
      return { ...prev, categories: updated };
    });
  };

  const handleAddCategory = () => {
    setEditForm((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { category: "New Category", budgeted: 100, color: "#6366f1" },
      ],
    }));
  };

  const handleRemoveCategory = (idx) => {
    setEditForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== idx),
    }));
  };

  const overallBudget = budgetData?.overallBudget || 0;
  const totalSpent = budgetData?.totalSpent || 0;
  const remainingBudget = overallBudget - totalSpent;
  const percentUsed = budgetData?.percentUsed || 0;
  const safeDailyBurn = daysRemaining > 0 ? Math.max(0, Math.round(remainingBudget / daysRemaining)) : 0;
  const categories = budgetData?.categories || [];

  return (
    <FeatureLayout
      badgeText="Personal Foundation"
      title="Budget Tracker & Spending Limits"
      subtitle="Proactive spending caps, threshold warning alerts, safe daily burn rates, and savings goal targets."
      onBack={() => navigate("/finance/analytics")}
      backTooltip="Back to Financial Overview"
    >
      {/* HEADER & MONTH SELECTOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2 text-xs md:text-sm font-bold text-slate-800 tracking-wide">
            <Calendar className="w-4 h-4 text-emerald-600" />
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
            className="p-1 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/finance/analytics")}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/80 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PieChart className="w-3.5 h-3.5 text-sky-600" />
            <span>Financial Overview</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Configure Budget Plan</span>
          </button>
        </div>
      </div>

      {/* TOP BUDGET HEALTH & BURN RATE HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Budget Progress Hero Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between z-10">
            <div>
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                Monthly Spending Envelope
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 font-serif">
                ${totalSpent.toLocaleString()}{" "}
                <span className="text-sm font-normal text-emerald-100 font-sans">
                  spent of ${overallBudget.toLocaleString()}
                </span>
              </h3>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md ${
                  percentUsed > 100
                    ? "bg-rose-500/80 text-white border border-rose-300"
                    : percentUsed > 80
                    ? "bg-amber-400/80 text-slate-950 border border-amber-200"
                    : "bg-white/20 text-white border border-white/30"
                }`}
              >
                {percentUsed > 100 ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{percentUsed}% Used</span>
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1.5 z-10">
            <div className="w-full bg-white/20 rounded-full h-3 p-0.5 backdrop-blur-sm overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percentUsed > 100
                    ? "bg-rose-400 shadow-md shadow-rose-500/50"
                    : percentUsed > 80
                    ? "bg-amber-300 shadow-md shadow-amber-500/50"
                    : "bg-white shadow-md"
                }`}
                style={{ width: `${Math.min(100, percentUsed)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium">
              <span>
                Remaining:{" "}
                <strong className={remainingBudget < 0 ? "text-rose-200" : "text-white"}>
                  ${remainingBudget.toLocaleString()}
                </strong>
              </span>
              <span>{daysRemaining} days remaining in month</span>
            </div>
          </div>

          {/* Alert Callout */}
          <div className="z-10">
            {percentUsed > 100 ? (
              <div className="p-3 bg-rose-950/40 border border-rose-300/40 rounded-2xl flex items-center gap-2.5 text-xs text-rose-100 backdrop-blur-md">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>
                  You are over your monthly budget limit by <strong>${Math.abs(remainingBudget).toLocaleString()}</strong>. Consider pausing non-essential discretionary expenses.
                </span>
              </div>
            ) : percentUsed > 80 ? (
              <div className="p-3 bg-amber-950/40 border border-amber-300/40 rounded-2xl flex items-center gap-2.5 text-xs text-amber-100 backdrop-blur-md">
                <Flame className="w-4 h-4 shrink-0 text-amber-300" />
                <span>
                  Budget alert: You have reached {percentUsed}% of your envelope. Safe daily burn is <strong>${safeDailyBurn}/day</strong>.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-white/10 border border-white/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-50 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
                <span>
                  Healthy spending pace! You have <strong>${remainingBudget.toLocaleString()}</strong> remaining for the next {daysRemaining} days.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Safe Daily Burn Rate & Savings Goal Cards */}
        <div className="space-y-4">
          {/* Daily Burn Rate Card */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80 p-5 rounded-2xl shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span className="uppercase tracking-wider">Safe Daily Burn Rate</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-2xl font-extrabold text-slate-900 font-serif">
                ${safeDailyBurn} <span className="text-xs font-normal text-slate-500 font-sans">/ day</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                To stay on budget for the remaining {daysRemaining} days
              </p>
            </div>
          </div>

          {/* Savings Target Goal Card */}
          <div className="bg-gradient-to-br from-teal-50/80 via-white to-sky-50/40 border border-teal-200/80 p-5 rounded-2xl shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span className="uppercase tracking-wider">Target Monthly Savings</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-2xl font-extrabold text-teal-700 font-serif">
                ${(budgetData?.savingsGoal || 0).toLocaleString()}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Target wealth retention allocation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY SPENDING CAPS & THRESHOLDS */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 tracking-wide">Category Spending Caps & Limits</h3>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Adjust Caps</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const isOver = cat.spent > cat.budgeted;
            const catPercent = cat.budgeted > 0 ? Math.round((cat.spent / cat.budgeted) * 100) : 0;
            const remaining = cat.budgeted - cat.spent;

            return (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 p-4 rounded-xl space-y-3 transition-all relative overflow-hidden shadow-2xs"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-1"
                  style={{ backgroundColor: cat.color || "#0ea5e9" }}
                />

                <div className="flex items-start justify-between pl-1">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
                      {cat.category}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ${cat.spent.toLocaleString()} of ${cat.budgeted.toLocaleString()}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isOver
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : catPercent > 80
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {catPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="pl-1 space-y-1">
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? "bg-rose-500"
                          : catPercent > 80
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500"
                      }`}
                      style={{ width: `${Math.min(100, catPercent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>
                      {isOver ? (
                        <span className="text-rose-600 font-bold">
                          Over by ${Math.abs(remaining).toLocaleString()}
                        </span>
                      ) : (
                        <span>${remaining.toLocaleString()} left</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIGURE BUDGET MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">Configure Monthly Budget Plan</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Overall Budget & Savings Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Overall Monthly Budget ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.overallBudget}
                    onChange={(e) => setEditForm({ ...editForm, overallBudget: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Monthly Savings ($) *
                  </label>
                  <input
                    type="number"
                    value={editForm.savingsGoal}
                    onChange={(e) => setEditForm({ ...editForm, savingsGoal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Category Spending Caps */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category Spending Caps
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {editForm.categories.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    >
                      <input
                        type="text"
                        value={c.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditForm((prev) => {
                            const updated = [...prev.categories];
                            updated[idx] = { ...updated[idx], category: val };
                            return { ...prev, categories: updated };
                          });
                        }}
                        placeholder="Category Name"
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />

                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                        <input
                          type="number"
                          value={c.budgeted}
                          onChange={(e) => handleCategoryBudgetChange(idx, e.target.value)}
                          placeholder="Budget"
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(idx)}
                        className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove Category"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Budget Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FeatureLayout>
  );
}
