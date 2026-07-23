import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteStudyPlan, getStudyPlan } from './StudyPlanService';
import Button from '../../src/components/ui/Button';



export default function StudyPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getStudyPlan(id);
        if (!cancelled) setPlan(data.studyPlan);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load this study plan.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudyPlan(id);
      navigate('/learning/study-plan');
    } catch (err) {
      setError(err.message || 'Could not delete this plan.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-6 w-2/3 bg-ink-100 rounded" />
        <div className="h-4 w-1/3 bg-ink-100 rounded" />
        <div className="h-24 w-full bg-ink-100 rounded-2xl" />
        <div className="h-40 w-full bg-ink-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-lg border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger-text">
          {error || 'Study plan not found.'}
        </div>
        <Button
          variant="outline"
          className="mt-4 sm:w-auto px-6"
          onClick={() => navigate('/learning/study-plan')}
        >
          Back to Study Planner
        </Button>
      </div>
    );
  }

  const dailyPlan = Array.isArray(plan.dailyPlan) ? plan.dailyPlan : [];
  const weeklyTargets = Array.isArray(plan.weeklyTargets) ? plan.weeklyTargets : [];
  const tips = Array.isArray(plan.tips) ? plan.tips : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Back link */}
      <button
        onClick={() => navigate('/learning/study-plan')}
        className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Study Planner
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border bg-surface-blue text-brand-link border-surface-blue-border">
            {plan.currentLevel}
          </span>
          <h1 className="font-serif font-bold text-ink-900 text-2xl tracking-tight mt-2">
            {plan.planTitle || plan.subject}
          </h1>
          <p className="text-sm text-ink-500 mt-1">{plan.subject}</p>
        </div>

        <Button
          variant="outline"
          className="!w-auto px-4 text-xs border-danger-border text-danger-text hover:bg-danger-text hover:text-white hover:border-transparent"
          loading={deleting}
          loadingText="Deleting…"
          onClick={handleDelete}
        >
          Delete plan
        </Button>
      </div>

      {/* Summary */}
      {plan.summary && (
        <div className="rounded-2xl border border-surface-blue-border bg-surface-blue/50 p-5">
          <p className="text-sm text-ink-700 leading-relaxed">{plan.summary}</p>
        </div>
      )}

      {/* Weekly targets */}
      {weeklyTargets.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wide mb-3">
            Weekly targets
          </h2>
          <ul className="space-y-2">
            {weeklyTargets.map((target, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700"
              >
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-brand-gradient text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {typeof target === 'string' ? target : target.title || target.target}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Daily plan */}
      {dailyPlan.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wide mb-3">
            Daily plan
          </h2>
          <div className="space-y-3">
            {dailyPlan.map((day, i) => (
              <div
                key={i}
                className="rounded-xl border border-ink-200 bg-white p-4"
              >
                <p className="text-xs font-bold text-brand-indigo uppercase tracking-wide mb-1.5">
                  {day.day || `Day ${i + 1}`}
                </p>
                {day.topic && (
                  <p className="text-sm font-semibold text-ink-900 mb-1">{day.topic}</p>
                )}
                {day.tasks && (
                  <ul className="space-y-1 mt-1.5">
                    {(Array.isArray(day.tasks) ? day.tasks : [day.tasks]).map((task, j) => (
                      <li key={j} className="text-xs text-ink-600 flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-ink-400 shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                )}
                {!day.tasks && day.description && (
                  <p className="text-xs text-ink-600 mt-1">{day.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wide mb-3">
            Tips
          </h2>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-success-border bg-success-bg px-4 py-3 text-sm text-success-text"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}