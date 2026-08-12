import React, { useEffect, useState } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";
import { useNavigate } from "react-router-dom";

export default function NotesSummarizer() {
  const navigate = useNavigate();
  const [lectureText, setLectureText] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "keypoints" | "flashcards"
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Interactive Flashcards State
  const [flippedCards, setFlippedCards] = useState({});

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Fetch all user summaries on initial mount
  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/notes-summarizer`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.summaries) {
        setSummaries(data.summaries);
        if (data.summaries.length > 0) {
          setSelectedSummary(data.summaries[0]);
        }
      }
    } catch {
      setError("Unable to connect to server to load existing summaries.");
    } finally {
      setInitialFetching(false);
    }
  };

  const handleSummarize = async (e) => {
    e?.preventDefault();
    if (!lectureText.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/notes-summarizer/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lectureText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to process and summarize notes.");
        return;
      }

      const newSummary = data.data;
      setSummaries((prev) => [newSummary, ...prev]);
      setSelectedSummary(newSummary);
      setIsCreatingNew(false);
      setLectureText("");
      setActiveTab("overview");
      setFlippedCards({});
    } catch {
      setError("Unable to connect to AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this summary?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/notes-summarizer/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = summaries.filter((s) => s._id !== id);
        setSummaries(updated);
        if (selectedSummary?._id === id) {
          setSelectedSummary(updated[0] || null);
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete summary.");
      }
    } catch {
      setError("Error attempting to delete summary.");
    }
  };

  const toggleCardFlip = (idx) => {
    setFlippedCards((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Dynamic Tabs definition for FeatureLayout
  const tabs = [
    { key: "overview", label: "Overview" },
    {
      key: "keypoints",
      label: `Key Points (${selectedSummary?.keyPoints?.length || 0})`,
    },
    {
      key: "flashcards",
      label: `Flashcards (${selectedSummary?.flashcards?.length || 0})`,
    },
  ];

  // Section 1: Form Render
  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          📝
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Paste your lecture transcript or notes
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          LifeOS AI will transform long-form content into structured overviews, actionable bullet points, and active-recall flashcards.
        </p>

        <form onSubmit={handleSummarize} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Lecture Text / Study Material
            </label>
            <textarea
              rows={8}
              value={lectureText}
              onChange={(e) => setLectureText(e.target.value)}
              placeholder="Paste lecture notes, article excerpts, transcript, or raw study text here..."
              disabled={loading}
              className="w-full p-4 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition resize-y text-slate-800"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {summaries.length > 0 && isCreatingNew && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !lectureText.trim()}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Processing Content...
                </>
              ) : (
                <>
                  <span>Generate Summary</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Section 2: Hero Banner Render
  const renderHero = () => {
    if (!selectedSummary) return null;
    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
              Active Note Summary
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold line-clamp-2">
              {selectedSummary.summary
                ? selectedSummary.summary.slice(0, 70) + (selectedSummary.summary.length > 70 ? "..." : "")
                : "Processed Notes"}
            </h2>
            <p className="text-xs text-indigo-100">
              Created on: {new Date(selectedSummary.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-4 self-start md:self-auto shrink-0">
            <div className="text-center">
              <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Key Points</p>
              <p className="text-base font-bold text-white">{selectedSummary.keyPoints?.length || 0}</p>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="text-center">
              <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Flashcards</p>
              <p className="text-base font-bold text-white">{selectedSummary.flashcards?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section 3: Sidebar Render
  const renderSidebar = () => (
    <>
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
        Saved Summaries ({summaries.length})
      </h3>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {summaries.map((sum) => {
          const isSelected = selectedSummary?._id === sum._id;

          return (
            <div
              key={sum._id}
              onClick={() => {
                setSelectedSummary(sum);
                setIsCreatingNew(false);
                setFlippedCards({});
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
                  : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0">
                <span
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-orange-100/70 text-orange-800"
                  }`}
                >
                  📖
                </span>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {sum.summary || "Summary Record"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {sum.lectureText ? sum.lectureText.slice(0, 40) + "..." : "No preview text"}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(sum._id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 transition cursor-pointer shrink-0"
                title="Delete Summary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  // Section 4: Active Tab Content Render
  const renderTabContent = () => {
    if (!selectedSummary) return null;

    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Executive Summary
            </h4>
            <p className="text-base text-slate-700 leading-relaxed p-5 rounded-2xl bg-orange-50/30 border border-slate-200/70">
              {selectedSummary.summary || "No overview available."}
            </p>
          </div>

          {selectedSummary.lectureText && (
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Original Text Source
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 max-h-48 overflow-y-auto">
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {selectedSummary.lectureText}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "keypoints") {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Core Concepts & Takeaways
          </h4>

          {Array.isArray(selectedSummary.keyPoints) && selectedSummary.keyPoints.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {selectedSummary.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-orange-50/30 border border-slate-200/70 flex items-start gap-3 hover:border-orange-200 transition"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {typeof point === "string" ? point : JSON.stringify(point)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No key points extracted.</p>
          )}
        </div>
      );
    }

    if (activeTab === "flashcards") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Active Recall Cards
            </h4>
            <p className="text-sm text-slate-400 font-medium">
              Click any card to flip between Question and Answer
            </p>
          </div>

          {Array.isArray(selectedSummary.flashcards) && selectedSummary.flashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSummary.flashcards.map((card, idx) => {
                const isFlipped = !!flippedCards[idx];
                const question = card.question || card.q || "Question";
                const answer = card.answer || card.a || "Answer";

                return (
                  <div
                    key={idx}
                    onClick={() => toggleCardFlip(idx)}
                    className={`p-5 rounded-2xl border transition-all duration-300 min-h-[140px] flex flex-col justify-between cursor-pointer relative select-none ${
                      isFlipped
                        ? "bg-gradient-to-br from-indigo-500/80 to-sky-600/80 text-white border-transparent shadow-md"
                        : "bg-white border-slate-200/80 hover:border-orange-300 hover:shadow-xs text-slate-800"
                    }`}
                  >
                    <div className="space-y-2">
                      <span
                        className={`text-sm font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isFlipped
                            ? "bg-white/20 text-white"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {isFlipped ? "Answer" : `Question #${idx + 1}`}
                      </span>
                      <p className="text-sm mt-2 font-semibold leading-relaxed">
                        {isFlipped ? answer : question}
                      </p>
                    </div>

                    <div className="flex justify-end items-center pt-3 mt-2 border-t border-current/10">
                      <span className="text-sm font-medium opacity-70 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Tap to flip
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No flashcards generated for this note.</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <FeatureLayout
      badgeText="LearningOS Hub"
      title="AI Notes & Lecture Summarizer"
      subtitle="Powered by Gemini 2.5 Flash • Smart Summaries, Key Points & Study Flashcards"
      onBack={() => navigate("/dashboard")}
      loading={loading}
      initialFetching={initialFetching}
      error={error}
      setError={setError}
      isCreatingNew={isCreatingNew}
      setIsCreatingNew={setIsCreatingNew}
      hasItems={summaries.length > 0}
      renderForm={renderForm}
      renderHero={renderHero}
      renderSidebar={renderSidebar}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      renderTabContent={renderTabContent}
    />
  );
}