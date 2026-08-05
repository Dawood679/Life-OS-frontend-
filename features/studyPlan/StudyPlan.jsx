// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import Input from "../../src/components/ui/Input";
// import Select from "../../src/components/ui/Select";
// import { deleteStudyPlan, generateStudyPlan, getStudyPlans } from "./StudyPlanService";

// const LEVEL_OPTIONS = [
//   { value: "Beginner", label: "Beginner" },
//   { value: "Intermediate", label: "Intermediate" },
//   { value: "Advanced", label: "Advanced" },
// ];

// export default function StudyPlan() {
//   const navigate = useNavigate();

//   const [subject, setSubject] = useState("");
//   const [currentLevel, setCurrentLevel] = useState("");
//   const [formError, setFormError] = useState("");
//   const [generating, setGenerating] = useState(false);

//   const [plans, setPlans] = useState([]);
//   const [loadingPlans, setLoadingPlans] = useState(true);
//   const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
//   const [listError, setListError] = useState("");
//   const [deletingId, setDeletingId] = useState(null);
//   const [isCreatingNew, setIsCreatingNew] = useState(false);

//   const loadPlans = async () => {
//     setLoadingPlans(true);
//     setListError("");
//     try {
//       const data = await getStudyPlans();
//       const loadedPlans = data.studyPlans || [];
//       setPlans(loadedPlans);
//       if (loadedPlans.length > 0) {
//         setSelectedPlanIndex(0);
//       }
//     } catch (err) {
//       setListError(err.message || "Could not load your study plans.");
//     } finally {
//       setLoadingPlans(false);
//     }
//   };

//   useEffect(() => {
//     loadPlans();
//   }, []);

//   const handleGenerate = async (e) => {
//     e?.preventDefault();
//     setFormError("");

//     if (!subject.trim() || !currentLevel) {
//       setFormError("Add a subject and pick your current level to continue.");
//       return;
//     }

//     setGenerating(true);
//     try {
//       const data = await generateStudyPlan({
//         subject: subject.trim(),
//         currentLevel,
//       });
//       const newPlan = data.studyPlan;
//       setPlans((prev) => [newPlan, ...prev]);
//       setSubject("");
//       setCurrentLevel("");
//       setIsCreatingNew(false);
//       setSelectedPlanIndex(0);
//     } catch (err) {
//       setFormError(
//         err.message || "Something went wrong generating the plan. Try again."
//       );
//     } finally {
//       setGenerating(false);
//     }
//   };

//   const handleDelete = async (id, e) => {
//     e?.stopPropagation();
//     setDeletingId(id);
//     try {
//       await deleteStudyPlan(id);
//       setPlans((prev) => {
//         const next = prev.filter((p) => p._id !== id);
//         if (selectedPlanIndex >= next.length) {
//           setSelectedPlanIndex(Math.max(0, next.length - 1));
//         }
//         return next;
//       });
//     } catch (err) {
//       setListError(err.message || "Could not delete that plan.");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const activePlan = plans[selectedPlanIndex];

//   // Initial Loading Screen
//   if (loadingPlans) {
//     return (
//       <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
//         <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//         <p className="text-xs font-semibold text-slate-500 animate-pulse">
//           Retrieving LifeOS Study Plans...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen w-full bg-surface-pink/30 p-4 md:p-8 font-sans text-slate-800">
//       <div className="max-w-6xl mx-auto space-y-8">
        
//         {/* TOP HEADER SECTION */}
//         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-sky-50/30 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
//               <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
//                 LearningOS Hub
//               </span>
//             </div>
//             <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
//               AI Study Planner
//             </h1>
//             <p className="text-xs text-slate-500 mt-1">
//               Powered by LifeOS AI • Day-by-Day Adaptive Learning Strategy
//             </p>
//           </div>

//           {plans.length > 0 && !isCreatingNew && (
//             <button
//               onClick={() => setIsCreatingNew(true)}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200/80 transition shadow-xs cursor-pointer"
//             >
//               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//               </svg>
//               New Study Plan
//             </button>
//           )}
//         </header>

//         {/* ERROR BANNER */}
//         {listError && (
//           <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
//             <span>{listError}</span>
//             <button onClick={() => setListError("")} className="font-bold text-red-800 cursor-pointer">
//               ×
//             </button>
//           </div>
//         )}

//         {/* CONDITION 1: GENERATE FORM (When no plans exist or user clicked "New Study Plan") */}
//         {(plans.length === 0 || isCreatingNew) && !generating && (
//           <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
//             <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

//             <div className="max-w-xl mx-auto text-center space-y-3 relative z-10">
//               <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
//                 ✦
//               </div>
//               <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
//                 What are you studying and where are you starting from?
//               </h2>
//               <p className="text-xs text-slate-500 leading-relaxed">
//                 LifeOS AI will design a targeted curriculum complete with daily tasks, weekly targets, and key learning tips.
//               </p>

//               <form onSubmit={handleGenerate} className="mt-6 space-y-4 text-left">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
//                       Subject or Topic
//                     </label>
//                     <Input
//                       type="text"
//                       value={subject}
//                       onChange={(e) => setSubject(e.target.value)}
//                       placeholder="e.g. Organic Chemistry, IELTS Writing..."
//                       disabled={generating}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
//                       Current Level
//                     </label>
//                     <Select
//                       value={currentLevel}
//                       onChange={(e) => setCurrentLevel(e.target.value)}
//                       options={LEVEL_OPTIONS}
//                       placeholder="Select a level"
//                       disabled={generating}
//                     />
//                   </div>
//                 </div>

//                 {formError && (
//                   <p className="text-xs font-semibold text-red-500">{formError}</p>
//                 )}

//                 <div className="flex gap-2 justify-end pt-2">
//                   {isCreatingNew && (
//                     <button
//                       type="button"
//                       onClick={() => setIsCreatingNew(false)}
//                       className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
//                     >
//                       Cancel
//                     </button>
//                   )}
//                   <button
//                     type="submit"
//                     disabled={generating || !subject.trim() || !currentLevel}
//                     className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
//                   >
//                     <span>Generate Study Plan</span>
//                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                     </svg>
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* CONDITION 2: GENERATING SKELETON */}
//         {generating && (
//           <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-slate-200 text-center space-y-6 shadow-xl">
//             <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
//               <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
//               <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
//                 ✦
//               </div>
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-slate-800">
//                 Crafting Your Custom Study Schedule
//               </h3>
//               <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
//                 Analyzing difficulty, breaking down concepts into daily tasks, and curating weekly milestones...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* CONDITION 3: TWO-COLUMN STUDY PLAN DISPLAY */}
//         {plans.length > 0 && !generating && !isCreatingNew && (
//           <div className="space-y-6">
            
//             {/* HERO HEADER BANNER FOR CURRENTLY ACTIVE PLAN */}
//             {activePlan && (
//               <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
//                 <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

//                 <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
//                   <div className="space-y-2">
//                     <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase">
//                       Active Study Focus
//                     </span>
//                     <h2 className="text-2xl md:text-3xl font-serif font-bold">
//                       {activePlan.planTitle || activePlan.subject}
//                     </h2>
//                     <p className="text-xs text-indigo-100">
//                       Subject: <span className="font-semibold text-white">{activePlan.subject}</span>
//                     </p>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3">
//                       <div>
//                         <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">
//                           Current Level
//                         </p>
//                         <p className="text-xs font-bold text-white">{activePlan.currentLevel}</p>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => navigate(`/learning/study-plan/${activePlan._id}`)}
//                       className="px-5 py-3.5 rounded-2xl bg-white text-indigo-600 text-xs font-bold hover:bg-slate-50 transition shadow-md flex items-center gap-2 cursor-pointer"
//                     >
//                       <span>Open Detail View</span>
//                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* TWO-COLUMN LAYOUT: PLAN SELECTOR (LEFT) + ACTIVE PLAN SUMMARY (RIGHT) */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
//               {/* LEFT SIDEBAR: STUDY PLANS LIST */}
//               <div className="lg:col-span-4 space-y-3">
//                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
//                   Your Plans ({plans.length})
//                 </h3>

//                 <div className="space-y-2">
//                   {plans.map((plan, idx) => {
//                     const isSelected = selectedPlanIndex === idx;

//                     return (
//                       <div
//                         key={plan._id || idx}
//                         onClick={() => setSelectedPlanIndex(idx)}
//                         className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
//                           isSelected
//                             ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
//                             : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
//                         }`}
//                       >
//                         <div className="flex items-center gap-3 overflow-hidden pr-2">
//                           <span
//                             className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
//                               isSelected
//                                 ? "bg-orange-500 text-white shadow-xs"
//                                 : "bg-orange-100/70 text-orange-800"
//                             }`}
//                           >
//                             {idx + 1}
//                           </span>
//                           <div className="truncate">
//                             <p className="text-xs font-bold text-slate-800 truncate">
//                               {plan.planTitle || plan.subject}
//                             </p>
//                             <p className="text-[10px] text-slate-400 mt-0.5">
//                               {plan.currentLevel} • {plan.dailyPlan?.length || 0} Days Plan
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-1 shrink-0">
//                           <button
//                             onClick={(e) => handleDelete(plan._id, e)}
//                             disabled={deletingId === plan._id}
//                             className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
//                             title="Delete Plan"
//                           >
//                             {deletingId === plan._id ? (
//                               <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-red-600 rounded-full animate-spin"></div>
//                             ) : (
//                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                               </svg>
//                             )}
//                           </button>

//                           <svg
//                             className={`w-4 h-4 transition-transform ${
//                               isSelected ? "rotate-90 text-orange-600" : "text-slate-400"
//                             }`}
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
//                           </svg>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* RIGHT DISPLAY: ACTIVE PLAN PREVIEW */}
//               <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
//                 {activePlan && (
//                   <>
//                     {/* PLAN SUMMARY */}
//                     <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
//                       <div>
//                         <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
//                           Overview
//                         </span>
//                         <h3 className="text-xl font-bold text-slate-800 mt-0.5">
//                           {activePlan.planTitle || activePlan.subject}
//                         </h3>
//                       </div>
//                       <span className="px-3 py-1 bg-orange-50/80 border border-orange-200/80 text-orange-700 rounded-full text-[11px] font-semibold">
//                         {activePlan.currentLevel}
//                       </span>
//                     </div>

//                     {activePlan.summary && (
//                       <p className="text-xs text-slate-600 leading-relaxed">
//                         {activePlan.summary}
//                       </p>
//                     )}

//                     {/* WEEKLY TARGETS HIGHLIGHT */}
//                     {activePlan.weeklyTargets && activePlan.weeklyTargets.length > 0 && (
//                       <div className="space-y-3">
//                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                           Key Targets
//                         </h4>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                           {activePlan.weeklyTargets.slice(0, 4).map((target, tIdx) => (
//                             <div
//                               key={tIdx}
//                               className="p-3.5 rounded-2xl bg-orange-50/30 border border-slate-200/70 flex items-start gap-2.5"
//                             >
//                               <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
//                                 {tIdx + 1}
//                               </div>
//                               <p className="text-xs text-slate-700 font-medium leading-snug">
//                                 {typeof target === "string" ? target : target.title || target.target}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* DAILY PLAN PREVIEW NODES */}
//                     {activePlan.dailyPlan && activePlan.dailyPlan.length > 0 && (
//                       <div className="space-y-3 pt-2">
//                         <div className="flex items-center justify-between">
//                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                             Daily Schedule ({activePlan.dailyPlan.length} Days)
//                           </h4>
//                           <button
//                             onClick={() => navigate(`/learning/study-plan/${activePlan._id}`)}
//                             className="text-xs font-bold text-indigo-600 hover:underline"
//                           >
//                             View All Days →
//                           </button>
//                         </div>

//                         <div className="space-y-3">
//                           {activePlan.dailyPlan.slice(0, 3).map((day, dIdx) => (
//                             <div
//                               key={dIdx}
//                               className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
//                             >
//                               <div className="flex items-center justify-between">
//                                 <span className="text-[10px] font-bold text-indigo-600 uppercase">
//                                   {day.day || `Day ${dIdx + 1}`}
//                                 </span>
//                               </div>
//                               {day.topic && (
//                                 <p className="text-xs font-bold text-slate-800">
//                                   {day.topic}
//                                 </p>
//                               )}
//                               {day.description && (
//                                 <p className="text-[11px] text-slate-500 line-clamp-2">
//                                   {day.description}
//                                 </p>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>

//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


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

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDeleteIndex, setPlanToDeleteIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

  const loadPlans = async () => {
    setInitialFetching(true);
    setListError("");
    try {
      const data = await getStudyPlans();
      const loadedPlans = data.studyPlans || [];
      setPlans(loadedPlans);
      if (loadedPlans.length > 0) {
        setSelectedPlanIndex(0);
      }
    } catch (err) {
      setListError(err.message || "Could not load your study plans.");
    } finally {
      setInitialFetching(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

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
      const data = await generateStudyPlan({
        subject: subject.trim(),
        currentLevel,
      });
      const newPlan = data.studyPlan;
      setPlans((prev) => [newPlan, ...prev]);
      setSubject("");
      setCurrentLevel("");
      setIsCreatingNew(false);
      setSelectedPlanIndex(0);
    } catch (err) {
      setFormError(
        err.message || "Something went wrong generating the plan. Try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Open Delete Confirmation Modal
  const confirmDeletePlan = (e, index) => {
    e.stopPropagation();
    setPlanToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  // Handle Delete Target Plan
  const handleDeletePlan = async () => {
    if (planToDeleteIndex === null) return;

    const targetPlan = plans[planToDeleteIndex];
    if (!targetPlan?._id) return;

    setIsDeleting(true);
    try {
      await deleteStudyPlan(targetPlan._id);
      setPlans((prev) => {
        const next = prev.filter((_, idx) => idx !== planToDeleteIndex);
        if (selectedPlanIndex >= next.length) {
          setSelectedPlanIndex(Math.max(0, next.length - 1));
        }
        return next;
      });
      setShowDeleteModal(false);
      setPlanToDeleteIndex(null);
    } catch (err) {
      setListError(err.message || "Could not delete that plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const activePlan = plans[selectedPlanIndex] || null;

  // Tab Definitions
  const tabs = [
    { key: "daily", label: "Daily Tasks" },
    { key: "weekly", label: "Weekly Targets" },
  ];

  /* -------------------------------------------------------------------------- */
  /*                              RENDER SLOTS                                  */
  /* -------------------------------------------------------------------------- */

  // 1. INPUT FORM
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
            {plans.length > 0 && isCreatingNew && (
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

  // 2. HERO BANNER (Compact & Cleaned Up)
  const renderHero = () => (
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
    )
  );

  // 3. SIDEBAR (LIST OF ALL STUDY PLANS)
  const renderSidebar = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          My Study Plans ({plans.length})
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

              {/* Individual Delete Button */}
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

  // 4. MAIN CONTENT (DAILY TASKS & WEEKLY TARGETS)
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
                    {day.day || `Day ${idx + 1}`}
                  </span>
                  <h5 className="text-xs font-bold text-slate-800">{day.topic}</h5>
                  {day.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{day.description}</p>
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
        hasItems={plans.length > 0}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        renderTabContent={renderTabContent}
      />

      {/* DELETE CONFIRMATION MODAL */}
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