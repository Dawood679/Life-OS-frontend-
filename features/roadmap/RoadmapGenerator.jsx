import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureLayout from "../../src/components/FeatureLayout";

export default function RoadmapGenerator() {
  const navigate = useNavigate();

  // State Management
  const [goal, setGoal] = useState("");
  const [roadmaps, setRoadmaps] = useState([]); // Array for all separate roadmaps
  const [activeRoadmapIndex, setActiveRoadmapIndex] = useState(0); // Selected Roadmap index
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Delete Roadmap Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roadmapToDeleteIndex, setRoadmapToDeleteIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch All Existing Roadmaps
  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/roadmap`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.roadmaps) {
        // Backend should return array of roadmaps: { roadmaps: [...] }
        setRoadmaps(Array.isArray(data.roadmaps) ? data.roadmaps : [data.roadmaps]);
      }
    } catch {
      // Error handling
    } finally {
      setInitialFetching(false);
    }
  };

  // Generate NEW Separate Roadmap
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!goal.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goal: goal.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate roadmap.");
        return;
      }

      // Append new roadmap to the array
      const newRoadmap = data.roadmap;
      const updatedList = [newRoadmap, ...roadmaps];
      
      setRoadmaps(updatedList);
      setActiveRoadmapIndex(0); // Select the newly created roadmap
      setIsCreatingNew(false);
      setGoal("");
    } catch {
      setError("Unable to connect to AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open Confirm Delete Modal
  const confirmDeleteRoadmap = (e, index) => {
    e.stopPropagation();
    setRoadmapToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  // Delete Specific Roadmap
  const handleDeleteRoadmap = async () => {
    if (roadmapToDeleteIndex === null) return;

    setIsDeleting(true);
    setError("");

    const targetRoadmap = roadmaps[roadmapToDeleteIndex];

    try {
      if (targetRoadmap?._id) {
        await fetch(`${BACKEND_URL}/roadmap/${targetRoadmap._id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      const updatedList = roadmaps.filter((_, idx) => idx !== roadmapToDeleteIndex);
      setRoadmaps(updatedList);

      if (activeRoadmapIndex >= updatedList.length) {
        setActiveRoadmapIndex(Math.max(0, updatedList.length - 1));
      }

      setShowDeleteModal(false);
      setRoadmapToDeleteIndex(null);
    } catch {
      setError("Failed to delete roadmap.");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeRoadmap = roadmaps[activeRoadmapIndex] || null;

  /* -------------------------------------------------------------------------- */
  /*                            RENDER SLOTS                                    */
  /* -------------------------------------------------------------------------- */

  // 1. INPUT FORM
  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="max-w-xl mx-auto text-center space-y-3 relative z-10">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Create a New AI Roadmap
        </h2>
        <p className="text-xs text-slate-500">
          Enter any career objective or skill path to generate a complete learning plan.
        </p>

        <form onSubmit={handleGenerate} className="mt-6 space-y-4 text-left">
          <input
            type="text"
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Data Analyst, React Native Developer..."
            disabled={loading}
            className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />

          <div className="flex gap-2 justify-end pt-2">
            {roadmaps.length > 0 && isCreatingNew && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !goal.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition"
            >
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 2. HERO BANNER
  const renderHero = () => (
    <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase">
          Selected Roadmap
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold">
          {activeRoadmap?.title || activeRoadmap?.goal}
        </h2>
        <p className="text-xs text-indigo-100">
          Goal: <span className="font-semibold text-white">{activeRoadmap?.goal}</span>
        </p>
      </div>
    </div>
  );

  // 3. SIDEBAR (LIST OF ALL ROADMAPS)
  const renderSidebar = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          My Roadmaps ({roadmaps.length})
        </h3>
        <button
          onClick={() => setIsCreatingNew(true)}
          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          + New
        </button>
      </div>

      <div className="space-y-2">
        {roadmaps.map((item, idx) => {
          const isSelected = activeRoadmapIndex === idx;

          return (
            <div
              key={item._id || idx}
              onClick={() => {
                setActiveRoadmapIndex(idx);
                setIsCreatingNew(false);
              }}
              className={`group relative w-full p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-indigo-50 border-indigo-200 shadow-xs ring-2 ring-indigo-200"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="pr-6">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {item.title || item.goal}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.phases?.length || 0} Phases / Modules
                </p>
              </div>

              {/* Delete Button for each Roadmap */}
              <button
                type="button"
                onClick={(e) => confirmDeleteRoadmap(e, idx)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 4. MAIN CONTENT (PHASES/MILESTONES OF SELECTED ROADMAP)
  const renderTabContent = () => {
    if (!activeRoadmap) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-3">
          Modules & Milestones
        </h3>

        <div className="space-y-4">
          {activeRoadmap.phases?.map((phase, pIdx) => (
            <div key={pIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-indigo-700">
                Phase {pIdx + 1}: {phase.phaseTitle}
              </h4>
              <div className="space-y-2 pl-4">
                {phase.milestones?.map((m, mIdx) => (
                  <div key={mIdx} className="text-xs text-slate-700">
                    • <span className="font-semibold">{m.title}</span> - {m.description}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <FeatureLayout
        badgeText="LearningOS Hub"
        title="AI Roadmap Generator"
        loading={loading}
        initialFetching={initialFetching}
        error={error}
        setError={setError}
        onBack={() => navigate("/dashboard")}
        isCreatingNew={isCreatingNew}
        setIsCreatingNew={setIsCreatingNew}
        hasItems={roadmaps.length > 0}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        renderTabContent={renderTabContent}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Delete Roadmap?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this roadmap?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoadmap}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}