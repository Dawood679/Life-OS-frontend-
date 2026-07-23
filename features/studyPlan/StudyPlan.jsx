// import { useEffect, useRef, useState } from 'react';
// import Input from '../../src/components/ui/Input';
// import Button from '../../src/components/ui/Button';

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
// const THINKING_STAGES = ['Reading your goals', 'Structuring the week', 'Adding tips'];

// // helpers

// async function api(path, options = {}) {
//   const res = await fetch(`${BACKEND_URL}/study-plan${path}`, {
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     ...options,
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok || data.success === false) {
//     throw new Error(data.message || 'Something went wrong. Please try again.');
//   }
//   return data;
// }

// function formatDate(dateString) {
//   if (!dateString) return '';
//   return new Date(dateString).toLocaleDateString(undefined, {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   });
// }

// function asList(items) {
//   if (!Array.isArray(items)) return [];
//   return items.map((item, i) => {
//     if (typeof item === 'string') return { key: i, heading: null, body: item };
//     const heading = item.day ?? item.week ?? item.title ?? item.label ?? null;
//     const body = item.tasks
//       ? Array.isArray(item.tasks)
//         ? item.tasks.join(', ')
//         : item.tasks
//       : item.target || item.description || item.focus || JSON.stringify(item);
//     return { key: i, heading, body };
//   });
// }

// //  ambient background (the "AI field")

// function AuroraField() {
//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
//       <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-brand-indigo/20 blur-[110px] animate-[aurora-drift_16s_ease-in-out_infinite]" />
//       <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-brand-sky/20 blur-[110px] animate-[aurora-drift_20s_ease-in-out_infinite_reverse]" />
//       <div className="absolute bottom-0 left-1/4 w-[24rem] h-[24rem] rounded-full bg-brand-sky-light/15 blur-[100px] animate-[aurora-drift_18s_ease-in-out_infinite]" />
//       <style>{`
//         @keyframes aurora-drift {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           50% { transform: translate(3%, 4%) scale(1.08); }
//         }
//         @keyframes shimmer-sweep {
//           0% { background-position: -400px 0; }
//           100% { background-position: 400px 0; }
//         }
//         @keyframes spin-slow {
//           to { transform: rotate(360deg); }
//         }
//         @keyframes fade-in-up {
//           from { opacity: 0; transform: translateY(6px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>
//     </div>
//   );
// }

// //small UI pieces

// function AITag({ label = 'AI-generated' }) {
//   return (
//     <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-brand-indigo/80">
//       <span className="relative flex h-1.5 w-1.5">
//         <span className="absolute inline-flex h-full w-full rounded-full bg-brand-indigo opacity-60 animate-ping" />
//         <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-indigo" />
//       </span>
//       {label}
//     </span>
//   );
// }

// function LevelBadge({ level }) {
//   const styles = {
//     Beginner: 'bg-success-bg text-success-text border-success-border',
//     Intermediate: 'bg-surface-blue text-brand-link border-surface-blue-border',
//     Advanced: 'bg-purple-50 text-purple-600 border-purple-200',
//   };
//   return (
//     <span
//       className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
//         styles[level] || 'bg-ink-100 text-ink-500 border-ink-200'
//       }`}
//     >
//       {level}
//     </span>
//   );
// }

// function EmptyState({ onFocusForm }) {
//   return (
//     <div className="rounded-2xl border border-dashed border-ink-300 bg-white/50 backdrop-blur-sm py-14 px-6 text-center">
//       <div className="w-11 h-11 rounded-2xl bg-brand-gradient mx-auto mb-3 flex items-center justify-center text-white text-lg shadow-lg shadow-brand-indigo/30">
//         ✦
//       </div>
//       <h3 className="font-serif font-bold text-ink-900 text-base mb-1">No study plans yet</h3>
//       <p className="text-xs text-ink-500 max-w-xs mx-auto mb-4">
//         Tell the assistant what you're studying and your level — it'll lay out a day-by-day plan.
//       </p>
//       <Button variant="outline" className="w-auto px-4" onClick={onFocusForm}>
//         Create your first plan
//       </Button>
//     </div>
//   );
// }

// // generator form

// function ThinkingStatus() {
//   const [stage, setStage] = useState(0);
//   useEffect(() => {
//     const id = setInterval(() => setStage((s) => (s + 1) % THINKING_STAGES.length), 1400);
//     return () => clearInterval(id);
//   }, []);
//   return (
//     <span key={stage} className="font-mono text-[11px] tracking-wide" style={{ animation: 'fade-in-up 0.3s ease' }}>
//       {THINKING_STAGES[stage]}…
//     </span>
//   );
// }

// function GeneratorForm({ onCreated }) {
//   const [subject, setSubject] = useState('');
//   const [currentLevel, setCurrentLevel] = useState('Beginner');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!subject.trim()) {
//       setError('Enter a subject or topic to continue.');
//       return;
//     }
//     setError('');
//     setLoading(true);
//     try {
//       const data = await api('/generate', {
//         method: 'POST',
//         body: JSON.stringify({ subject: subject.trim(), currentLevel }),
//       });
//       setSubject('');
//       onCreated(data.studyPlan);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       id="study-plan-generator"
//       className="relative rounded-2xl p-[1.5px] overflow-hidden"
//       style={
//         loading
//           ? {
//               background:
//                 'conic-gradient(from 0deg, #6366f1, #0ea5e9, #38bdf8, #6366f1)',
//               animation: 'spin-slow 3s linear infinite',
//             }
//           : { background: 'linear-gradient(#dbeafe, #dbeafe)' }
//       }
//     >
//       <form
//         onSubmit={handleSubmit}
//         className="rounded-[15px] bg-surface-blue/90 backdrop-blur-xl p-5"
//       >
//         <div className="flex items-center justify-between mb-1">
//           <h2 className="font-serif font-bold text-ink-900 text-base">Generate a study plan</h2>
//           <span className="text-base leading-none">✦</span>
//         </div>
//         <p className="text-xs text-ink-500 mb-4">
//           We'll build a realistic day-by-day plan matched to your level.
//         </p>

//         <div className="space-y-3">
//           <div>
//             <label htmlFor="subject" className="block font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-1.5">
//               Subject or topic
//             </label>
//             <Input
//               id="subject"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               placeholder="e.g. Organic Chemistry, React fundamentals"
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label className="block font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-1.5">
//               Current level
//             </label>
//             <div className="grid grid-cols-3 gap-2">
//               {LEVELS.map((level) => (
//                 <button
//                   key={level}
//                   type="button"
//                   disabled={loading}
//                   onClick={() => setCurrentLevel(level)}
//                   className={`text-xs font-medium py-2 rounded-lg border transition-all ${
//                     currentLevel === level
//                       ? 'bg-brand-gradient text-white border-transparent shadow-md shadow-brand-indigo/25'
//                       : 'bg-surface-orange border-ink-200 text-ink-600 hover:border-brand-indigo/40'
//                   } disabled:cursor-not-allowed disabled:opacity-60`}
//                 >
//                   {level}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {error && (
//             <p className="text-danger-text text-xs font-medium bg-danger-bg border border-danger-border rounded-lg px-3 py-2">
//               {error}
//             </p>
//           )}

//           {loading && (
//             <div className="flex items-center gap-2 text-brand-indigo px-1">
//               <span className="flex gap-0.5">
//                 <span className="w-1 h-1 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.3s]" />
//                 <span className="w-1 h-1 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.15s]" />
//                 <span className="w-1 h-1 rounded-full bg-brand-indigo animate-bounce" />
//               </span>
//               <ThinkingStatus />
//             </div>
//           )}

//           <Button type="submit" loading={loading} loadingText=" ">
//             {!loading && 'Generate plan'}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

// // plan card

// function PlanCard({ plan, onView, onDelete, deleting }) {
//   return (
//     <div className="group relative rounded-2xl border border-ink-200 bg-white/70 backdrop-blur-md overflow-hidden flex flex-col gap-3 transition-all hover:shadow-xl hover:shadow-brand-indigo/10 hover:-translate-y-0.5 hover:border-brand-indigo/30">
//       <div className="h-1 w-full bg-brand-gradient" />
//       <div className="px-4 pb-4 flex flex-col gap-3 flex-1">
//         <div className="flex items-start justify-between gap-2">
//           <div className="min-w-0">
//             <AITag />
//             <h3 className="font-serif font-bold text-ink-900 text-sm leading-snug truncate mt-1">
//               {plan.planTitle || plan.subject}
//             </h3>
//             <p className="font-mono text-[10px] text-ink-400 mt-0.5">{formatDate(plan.createdAt)}</p>
//           </div>
//           <LevelBadge level={plan.currentLevel} />
//         </div>

//         {plan.summary && <p className="text-xs text-ink-600 leading-relaxed line-clamp-3">{plan.summary}</p>}

//         <div className="flex items-center gap-2 mt-auto pt-1">
//           <Button variant="outline" className="py-1.5 text-xs" onClick={() => onView(plan)}>
//             View plan
//           </Button>
//           <Button
//             variant="outline"
//             className="w-auto px-3 py-1.5 text-xs text-danger-text border-danger-border hover:bg-danger-bg hover:text-danger-text hover:border-danger-border"
//             loading={deleting}
//             loadingText="Deleting..."
//             onClick={() => onDelete(plan._id)}
//           >
//             {!deleting && 'Delete'}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// //  detail panel

// function PlanDetail({ plan, onClose }) {
//   const dailyPlan = asList(plan.dailyPlan);
//   const weeklyTargets = asList(plan.weeklyTargets);
//   const tips = Array.isArray(plan.tips) ? plan.tips : [];

//   return (
//     <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/50 backdrop-blur-md p-4 sm:p-8">
//       <div
//         className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 my-4"
//         style={{ animation: 'fade-in-up 0.25s ease' }}
//       >
//         {/* Header */}
//         <div className="sticky top-0 bg-white/90 backdrop-blur-xl rounded-t-2xl border-b border-ink-100 px-6 py-4 flex items-start justify-between gap-3">
//           <div>
//             <div className="flex items-center gap-2 mb-1.5">
//               <AITag />
//               <LevelBadge level={plan.currentLevel} />
//               <span className="font-mono text-[10px] text-ink-400">{formatDate(plan.createdAt)}</span>
//             </div>
//             <h2 className="font-serif font-bold text-ink-900 text-lg leading-tight">
//               {plan.planTitle || plan.subject}
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             aria-label="Close"
//             className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition"
//           >
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <div className="px-6 py-5 space-y-6">
//           {plan.summary && (
//             <p className="text-sm text-ink-600 leading-relaxed bg-surface-blue border border-surface-blue-border rounded-xl px-4 py-3">
//               {plan.summary}
//             </p>
//           )}

//           {/* Daily plan — pill markers with room to breathe + connecting glow line */}
//           {dailyPlan.length > 0 && (
//             <section>
//               <h3 className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-3">
//                 Daily plan
//               </h3>
//               <ol>
//                 {dailyPlan.map((item, idx) => (
//                   <li key={item.key} className="flex gap-3">
//                     <div className="flex flex-col items-center">
//                       <span className="shrink-0 min-w-[2.5rem] h-7 px-3 rounded-full bg-brand-gradient text-white font-mono text-[10px] font-bold uppercase tracking-wide flex items-center justify-center shadow-sm shadow-brand-indigo/30 whitespace-nowrap">
//                         {item.heading ?? `Day ${idx + 1}`}
//                       </span>
//                       {idx < dailyPlan.length - 1 && (
//                         <span
//                           className="w-px flex-1 my-1"
//                           style={{ background: 'linear-gradient(to bottom, #6366f1aa, #6366f120)' }}
//                           aria-hidden="true"
//                         />
//                       )}
//                     </div>
//                     <div className="flex-1 rounded-xl border border-ink-100 bg-ink-50/80 px-3.5 py-2.5 mb-2.5">
//                       <p className="text-xs text-ink-700 leading-relaxed">{item.body}</p>
//                     </div>
//                   </li>
//                 ))}
//               </ol>
//             </section>
//           )}

//           {weeklyTargets.length > 0 && (
//             <section>
//               <h3 className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">
//                 Weekly targets
//               </h3>
//               <ul className="space-y-1.5">
//                 {weeklyTargets.map((item) => (
//                   <li key={item.key} className="flex gap-2 text-xs text-ink-700">
//                     <span className="text-brand-indigo mt-0.5">◆</span>
//                     <span>
//                       {item.heading && <span className="font-semibold">{item.heading}: </span>}
//                       {item.body}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </section>
//           )}

//           {tips.length > 0 && (
//             <section>
//               <h3 className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">Tips</h3>
//               <ul className="space-y-1.5">
//                 {tips.map((tip, i) => (
//                   <li
//                     key={i}
//                     className="flex gap-2 text-xs text-success-text bg-success-bg border border-success-border rounded-lg px-3 py-2"
//                   >
//                     <span className="mt-0.5">✓</span>
//                     <span className="text-ink-700">{tip}</span>
//                   </li>
//                 ))}
//               </ul>
//             </section>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// //  page

// export default function StudyPlan() {
//   const [plans, setPlans] = useState([]);
//   const [loadingPlans, setLoadingPlans] = useState(true);
//   const [listError, setListError] = useState('');
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);
//   const [confirmId, setConfirmId] = useState(null);

//   const loadPlans = async () => {
//     setLoadingPlans(true);
//     setListError('');
//     try {
//       const data = await api('/');
//       setPlans(data.studyPlans);
//     } catch (err) {
//       setListError(err.message);
//     } finally {
//       setLoadingPlans(false);
//     }
//   };

//   useEffect(() => {
//     loadPlans();
//   }, []);

//   const handleCreated = (plan) => {
//     setPlans((prev) => [plan, ...prev]);
//     setSelectedPlan(plan);
//   };

//   const handleView = async (plan) => {
//     try {
//       const data = await api(`/${plan._id}`);
//       setSelectedPlan(data.studyPlan);
//     } catch (err) {
//       setListError(err.message);
//     }
//   };

//   const handleDelete = async (id) => {
//     setDeletingId(id);
//     try {
//       await api(`/${id}`, { method: 'DELETE' });
//       setPlans((prev) => prev.filter((p) => p._id !== id));
//       setConfirmId(null);
//     } catch (err) {
//       setListError(err.message);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const scrollToForm = () => {
//     document.getElementById('study-plan-generator')?.scrollIntoView({ behavior: 'smooth' });
//   };

//   return (
//     <div className="relative min-h-screen bg-surface-pink/30 px-6 py-8 sm:px-10">
//       <AuroraField />

//       <div className="max-w-5xl mx-auto">
//         <div className="mb-6">
//           <div className="flex items-center gap-2 mb-1.5">
//             <span className="w-5 h-5 rounded-md bg-brand-gradient flex items-center justify-center text-white text-[10px] shadow-sm">
//               ✦
//             </span>
//             <p className="font-mono text-[10px] font-bold text-brand-indigo uppercase tracking-widest">
//               LearningOS · AI Planner
//             </p>
//           </div>
//           <h1 className="font-serif font-bold text-ink-900 text-2xl">Study Planner</h1>
//           <p className="text-sm text-ink-500 mt-1">
//             Generate a day-by-day plan for anything you're learning, and keep every plan on hand.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-6 items-start">
//           <div className="lg:sticky lg:top-6">
//             <GeneratorForm onCreated={handleCreated} />
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-widest">
//                 Your plans {plans.length > 0 && `(${plans.length})`}
//               </h2>
//               {!loadingPlans && (
//                 <button
//                   onClick={loadPlans}
//                   className="font-mono text-[10px] font-medium text-brand-link hover:text-brand-link-hover transition uppercase tracking-widest"
//                 >
//                   Refresh
//                 </button>
//               )}
//             </div>

//             {listError && (
//               <p className="text-danger-text text-xs font-medium bg-danger-bg border border-danger-border rounded-lg px-3 py-2 mb-3">
//                 {listError}
//               </p>
//             )}

//             {loadingPlans ? (
//               <div className="grid sm:grid-cols-2 gap-3">
//                 {[0, 1, 2, 3].map((i) => (
//                   <div
//                     key={i}
//                     className="h-32 rounded-2xl border border-ink-100 bg-white/50 overflow-hidden relative"
//                   >
//                     <div
//                       className="absolute inset-0"
//                       style={{
//                         background:
//                           'linear-gradient(90deg, transparent, rgba(99,102,241,0.10), transparent)',
//                         backgroundSize: '400px 100%',
//                         animation: 'shimmer-sweep 1.4s infinite linear',
//                       }}
//                     />
//                   </div>
//                 ))}
//               </div>
//             ) : plans.length === 0 ? (
//               <EmptyState onFocusForm={scrollToForm} />
//             ) : (
//               <div className="grid sm:grid-cols-2 gap-3">
//                 {plans.map((plan) =>
//                   confirmId === plan._id ? (
//                     <div
//                       key={plan._id}
//                       className="rounded-2xl border border-danger-border bg-danger-bg p-4 flex flex-col justify-between gap-3"
//                     >
//                       <div>
//                         <h3 className="text-sm font-semibold text-ink-900 mb-1">Delete this plan?</h3>
//                         <p className="text-xs text-ink-600">
//                           "{plan.planTitle || plan.subject}" will be removed for good.
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           className="py-1.5 text-xs bg-danger-text hover:opacity-90"
//                           loading={deletingId === plan._id}
//                           loadingText="Deleting..."
//                           onClick={() => handleDelete(plan._id)}
//                         >
//                           {deletingId !== plan._id && 'Delete'}
//                         </Button>
//                         <Button
//                           variant="outline"
//                           className="py-1.5 text-xs"
//                           onClick={() => setConfirmId(null)}
//                         >
//                           Cancel
//                         </Button>
//                       </div>
//                     </div>
//                   ) : (
//                     <PlanCard
//                       key={plan._id}
//                       plan={plan}
//                       onView={handleView}
//                       onDelete={setConfirmId}
//                       deleting={deletingId === plan._id}
//                     />
//                   )
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {selectedPlan && <PlanDetail plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../src/components/ui/Input";
import Select from "../../src/components/ui/Select";
import { deleteStudyPlan, generateStudyPlan, getStudyPlans } from "./StudyPlanService";

const LEVEL_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export default function StudyPlan() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [formError, setFormError] = useState("");
  const [generating, setGenerating] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [listError, setListError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const loadPlans = async () => {
    setLoadingPlans(true);
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
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

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

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    setDeletingId(id);
    try {
      await deleteStudyPlan(id);
      setPlans((prev) => {
        const next = prev.filter((p) => p._id !== id);
        if (selectedPlanIndex >= next.length) {
          setSelectedPlanIndex(Math.max(0, next.length - 1));
        }
        return next;
      });
    } catch (err) {
      setListError(err.message || "Could not delete that plan.");
    } finally {
      setDeletingId(null);
    }
  };

  const activePlan = plans[selectedPlanIndex];

  // Initial Loading Screen
  if (loadingPlans) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Retrieving LifeOS Study Plans...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-orange-50/30 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                LearningOS Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              AI Study Planner
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Powered by LifeOS AI • Day-by-Day Adaptive Learning Strategy
            </p>
          </div>

          {plans.length > 0 && !isCreatingNew && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200/80 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Study Plan
            </button>
          )}
        </header>

        {/* ERROR BANNER */}
        {listError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
            <span>{listError}</span>
            <button onClick={() => setListError("")} className="font-bold text-red-800 cursor-pointer">
              ×
            </button>
          </div>
        )}

        {/* CONDITION 1: GENERATE FORM (When no plans exist or user clicked "New Study Plan") */}
        {(plans.length === 0 || isCreatingNew) && !generating && (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
            <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-xl mx-auto text-center space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
                ✦
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
                What are you studying and where are you starting from?
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                LifeOS AI will design a targeted curriculum complete with daily tasks, weekly targets, and key learning tips.
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
                      placeholder="e.g. Organic Chemistry, IELTS Writing..."
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
                  {isCreatingNew && (
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
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Generate Study Plan</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONDITION 2: GENERATING SKELETON */}
        {generating && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-slate-200 text-center space-y-6 shadow-xl">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                ✦
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Crafting Your Custom Study Schedule
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Analyzing difficulty, breaking down concepts into daily tasks, and curating weekly milestones...
              </p>
            </div>
          </div>
        )}

        {/* CONDITION 3: TWO-COLUMN STUDY PLAN DISPLAY */}
        {plans.length > 0 && !generating && !isCreatingNew && (
          <div className="space-y-6">
            
            {/* HERO HEADER BANNER FOR CURRENTLY ACTIVE PLAN */}
            {activePlan && (
              <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase">
                      Active Study Focus
                    </span>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold">
                      {activePlan.planTitle || activePlan.subject}
                    </h2>
                    <p className="text-xs text-indigo-100">
                      Subject: <span className="font-semibold text-white">{activePlan.subject}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3">
                      <div>
                        <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">
                          Current Level
                        </p>
                        <p className="text-xs font-bold text-white">{activePlan.currentLevel}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/learning/study-plan/${activePlan._id}`)}
                      className="px-5 py-3.5 rounded-2xl bg-white text-indigo-600 text-xs font-bold hover:bg-slate-50 transition shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>Open Detail View</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TWO-COLUMN LAYOUT: PLAN SELECTOR (LEFT) + ACTIVE PLAN SUMMARY (RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT SIDEBAR: STUDY PLANS LIST */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                  Your Plans ({plans.length})
                </h3>

                <div className="space-y-2">
                  {plans.map((plan, idx) => {
                    const isSelected = selectedPlanIndex === idx;

                    return (
                      <div
                        key={plan._id || idx}
                        onClick={() => setSelectedPlanIndex(idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
                            : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected
                                ? "bg-orange-500 text-white shadow-xs"
                                : "bg-orange-100/70 text-orange-800"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {plan.planTitle || plan.subject}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {plan.currentLevel} • {plan.dailyPlan?.length || 0} Days Plan
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleDelete(plan._id, e)}
                            disabled={deletingId === plan._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete Plan"
                          >
                            {deletingId === plan._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-red-600 rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>

                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isSelected ? "rotate-90 text-orange-600" : "text-slate-400"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT DISPLAY: ACTIVE PLAN PREVIEW */}
              <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                {activePlan && (
                  <>
                    {/* PLAN SUMMARY */}
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                          Overview
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 mt-0.5">
                          {activePlan.planTitle || activePlan.subject}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-orange-50/80 border border-orange-200/80 text-orange-700 rounded-full text-[11px] font-semibold">
                        {activePlan.currentLevel}
                      </span>
                    </div>

                    {activePlan.summary && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {activePlan.summary}
                      </p>
                    )}

                    {/* WEEKLY TARGETS HIGHLIGHT */}
                    {activePlan.weeklyTargets && activePlan.weeklyTargets.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Key Targets
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activePlan.weeklyTargets.slice(0, 4).map((target, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-3.5 rounded-2xl bg-orange-50/30 border border-slate-200/70 flex items-start gap-2.5"
                            >
                              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {tIdx + 1}
                              </div>
                              <p className="text-xs text-slate-700 font-medium leading-snug">
                                {typeof target === "string" ? target : target.title || target.target}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DAILY PLAN PREVIEW NODES */}
                    {activePlan.dailyPlan && activePlan.dailyPlan.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Daily Schedule ({activePlan.dailyPlan.length} Days)
                          </h4>
                          <button
                            onClick={() => navigate(`/learning/study-plan/${activePlan._id}`)}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            View All Days →
                          </button>
                        </div>

                        <div className="space-y-3">
                          {activePlan.dailyPlan.slice(0, 3).map((day, dIdx) => (
                            <div
                              key={dIdx}
                              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">
                                  {day.day || `Day ${dIdx + 1}`}
                                </span>
                              </div>
                              {day.topic && (
                                <p className="text-xs font-bold text-slate-800">
                                  {day.topic}
                                </p>
                              )}
                              {day.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2">
                                  {day.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}