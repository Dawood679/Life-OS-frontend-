import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../src/components/ui/Input";
import Select from "../../src/components/ui/Select";
import { deleteStudyPlan, generateStudyPlan, getStudyPlans } from "./StudyPlanService";
import FeatureLayout from "../../src/components/FeatureLayout";

const LEVEL_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export default function StudyPlan() {
  const navigate = useNavigate();

  // Form State
  const [subject, setSubject] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [formError, setFormError] = useState("");
  const [generating, setGenerating] = useState(false);

  // Data & Layout States
  const [plans, setPlans] = useState([]);
  const [initialFetching, setInitialFetching] = useState(true);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [listError, setListError] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const itemsPerPage = 10;

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDeleteIndex, setPlanToDeleteIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

  // Fetch Study Plans with Pagination
  const loadPlans = async (page = 1) => {
    setInitialFetching(true);
    setListError("");
    try {
      const data = await getStudyPlans(page, itemsPerPage);
      const loadedPlans = data.studyPlans || [];
      setPlans(loadedPlans);
      setSelectedPlanIndex(0);

      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalPlans(data.pagination.totalCount || loadedPlans.length);
      } else {
        setTotalPlans(data.count || loadedPlans.length);
      }
    } catch (err) {
      setListError(err.message || "Could not load your study plans.");
    } finally {
      setInitialFetching(false);
    }
  };

  useEffect(() => {
    loadPlans(currentPage);
  }, [currentPage]);

  const paginationConfig = {
    page: currentPage,
    totalPages: totalPages,
    total: totalPlans,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle Form Submit
  const handleGenerate = async (e) => {
    e?.preventDefault();
    setFormError("");

    if (!subject.trim() || !currentLevel) {
      setFormError("Add a subject and pick your current level to continue.");
      return;
    }

    setGenerating(true);
    try {
      await generateStudyPlan({
        subject: subject.trim(),
        currentLevel,
      });

      setSubject("");
      setCurrentLevel("");
      setIsCreatingNew(false);

      if (currentPage === 1) {
        loadPlans(1);
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      setFormError(
        err.message || "Something went wrong generating the plan. Try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Delete Confirmation Handlers
  const confirmDeletePlan = (e, index) => {
    e.stopPropagation();
    setPlanToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleDeletePlan = async () => {
    if (planToDeleteIndex === null) return;

    const targetPlan = plans[planToDeleteIndex];
    if (!targetPlan?._id) return;

    setIsDeleting(true);
    try {
      await deleteStudyPlan(targetPlan._id);
      setShowDeleteModal(false);
      setPlanToDeleteIndex(null);

      loadPlans(currentPage);
    } catch (err) {
      setListError(err.message || "Could not delete that plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const activePlan = plans[selectedPlanIndex] || null;

  const tabs = [
    { key: "daily", label: "Daily Tasks" },
    { key: "weekly", label: "Weekly Targets" },
  ];

  // 1. Form Section
  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="max-w-xl mx-auto text-center space-y-3 relative z-10">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Create a New Study Plan
        </h2>
        <p className="text-xs text-slate-500">
          LifeOS AI will design a targeted curriculum complete with daily tasks and key targets.
        </p>

        <form onSubmit={handleGenerate} className="mt-6 space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Subject or Topic
              </label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Organic Chemistry, Machine Learning..."
                disabled={generating}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Current Level
              </label>
              <Select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                options={LEVEL_OPTIONS}
                placeholder="Select a level"
                disabled={generating}
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs font-semibold text-red-500">{formError}</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            {totalPlans > 0 && isCreatingNew && (
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
              disabled={generating || !subject.trim() || !currentLevel}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{generating ? "Generating..." : "Generate Study Plan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 2. Hero Section
  const renderHero = () =>
    activePlan && (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase">
              Selected Study Plan
            </span>
            <span className="text-xs font-medium text-indigo-100">
              • {activePlan.currentLevel} level ({activePlan.dailyPlan?.length || 0} Days)
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-bold">
            {activePlan.planTitle || activePlan.subject}
          </h2>

          <p className="text-xs text-indigo-100">
            Subject: <span className="font-semibold text-white">{activePlan.subject}</span>
          </p>
        </div>

        <button
          onClick={() => navigate(`/learning/study-plan/${activePlan._id}`)}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
        >
          Open Full View
        </button>
      </div>
    );

  // 3. Sidebar List
  const renderSidebar = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          My Study Plans ({totalPlans})
        </h3>
        <button
          onClick={() => setIsCreatingNew(true)}
          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          + New
        </button>
      </div>

      <div className="space-y-2">
        {plans.map((plan, idx) => {
          const isSelected = selectedPlanIndex === idx;

          return (
            <div
              key={plan._id || idx}
              onClick={() => {
                setSelectedPlanIndex(idx);
                setIsCreatingNew(false);
              }}
              className={`group relative w-full p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-indigo-50 border-indigo-200 shadow-xs ring-2 ring-indigo-200"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="pr-6 truncate">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {plan.planTitle || plan.subject}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {plan.currentLevel} • {plan.dailyPlan?.length || 0} Days
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => confirmDeletePlan(e, idx)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 4. Tab Content
  const renderTabContent = () => {
    if (!activePlan) return null;

    return (
      <div className="pt-2">
        {activeTab === "daily" && (
          <div className="space-y-3">
            {activePlan.dailyPlan && activePlan.dailyPlan.length > 0 ? (
              activePlan.dailyPlan.map((day, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">
                    {day.day ? `Day ${day.day}` : `Day ${idx + 1}`}
                  </span>
                  <h5 className="text-xs font-bold text-slate-800">{day.topic}</h5>
                  {day.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{day.description}</p>
                  )}
                  {day.tasks && day.tasks.length > 0 && (
                    <ul className="mt-2 space-y-1 pl-4 list-disc text-xs text-slate-600">
                      {day.tasks.map((task, tIdx) => (
                        <li key={tIdx}>{task}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No daily schedule recorded.</p>
            )}
          </div>
        )}

        {activeTab === "weekly" && (
          <div className="space-y-3">
            {activePlan.weeklyTargets && activePlan.weeklyTargets.length > 0 ? (
              activePlan.weeklyTargets.map((target, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-snug">
                    {typeof target === "string" ? target : target.title || target.target}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No weekly targets recorded.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <FeatureLayout
        badgeText="LearningOS Hub"
        title="AI Study Planner"
        subtitle="Powered by LifeOS AI • Day-by-Day Adaptive Learning Strategy"
        onBack={() => navigate("/dashboard")}
        loading={generating}
        initialFetching={initialFetching}
        error={listError}
        setError={setListError}
        isCreatingNew={isCreatingNew}
        setIsCreatingNew={setIsCreatingNew}
        hasItems={totalPlans > 0}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pagination={paginationConfig}
        onPageChange={handlePageChange}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        renderTabContent={renderTabContent}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Delete Study Plan?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this study plan?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition cursor-pointer"
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