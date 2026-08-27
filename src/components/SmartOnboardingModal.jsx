import { useState } from "react";

export default function SmartOnboardingModal({ isOpen, onClose, onComplete, initialGoal = "" }) {
  const [goal, setGoal] = useState(initialGoal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ambiguousData, setAmbiguousData] = useState(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!goal.trim()) return;

    setError("");
    setLoading(true);
    setAmbiguousData(null);

    try {
      const res = await fetch(`${BACKEND_URL}/onboarding/analyze-goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goal }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.isAmbiguous && data.data?.clarifyingCards?.length > 0) {
          // Show clarifying cards fallback
          setAmbiguousData(data.data);
        } else {
          onComplete && onComplete(data.user);
          onClose();
        }
      } else {
        setError(data.message || "Failed to analyze goal.");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCard = async (card) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/onboarding/select-focus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          focusMode: card.focusMode,
          focusGoal: card.title,
          primaryDomain: card.id,
          widgets: card.widgets,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onComplete && onComplete(data.user);
        onClose();
      }
    } catch (err) {
      console.error("Select focus error:", err);
      setError("Failed to apply focus configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-indigo via-sky-500 to-emerald-400"></div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo animate-pulse"></span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-indigo">
                LifeOS Intelligent Setup
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
              What is your main focus this month?
            </h2>
            <p className="text-xs text-slate-500">
              No boring dropdowns. Write in natural language—our AI will adapt your dashboard and daily habit targets automatically.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm p-1"
          >
            ✕
          </button>
        </div>

        {/* AMBIGUITY FALLBACK: Clarifying Cards */}
        {ambiguousData ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-2">
              <span>💡</span>
              <span>
                Love the ambition! To tailor your OS today, which area should we prioritize first?
              </span>
            </div>

            <div className="space-y-2.5">
              {ambiguousData.clarifyingCards?.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/60 hover:border-brand-indigo/60 transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-indigo transition">
                      {card.title}
                    </h4>
                    <span className="text-xs font-bold text-brand-indigo opacity-0 group-hover:opacity-100 transition">
                      Select ➔
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* STANDARD GOAL INTAKE FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. 'I want to crack a remote React developer job in 60 days', 'Pass my final medical exams', 'Get fit and build a morning hydration streak'..."
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none transition resize-none leading-relaxed"
                autoFocus
              />

              {/* Quick Starter Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "🚀 Crack a remote tech role",
                  "🎓 Pass medical / academic exams",
                  "🌿 Build daily hydration & fitness",
                  "💼 Launch a modern SaaS MVP",
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoal(chip)}
                    className="text-[11px] text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-brand-indigo px-2.5 py-1 rounded-xl transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Skip for now
              </button>

              <button
                type="submit"
                disabled={loading || !goal.trim()}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all flex items-center gap-2 ${
                  loading || !goal.trim()
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-brand-indigo via-indigo-600 to-sky-500 hover:opacity-95"
                }`}
              >
                {loading ? "Analyzing Intent..." : "✦ Setup My OS"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
