import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteStudyPlan, generateStudyPlan, getStudyPlans } from './StudyPlanService';
import Input from '../../src/components/ui/Input';
import Select from '../../src/components/ui/Select';
import Button from '../../src/components/ui/Button';


const LEVEL_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

function LevelBadge({ level }) {
  const styles = {
    Beginner: 'bg-success-bg text-success-text border-success-border',
    Intermediate: 'bg-surface-blue text-brand-link border-surface-blue-border',
    Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
        styles[level] || 'bg-ink-100 text-ink-500 border-ink-200'
      }`}
    >
      {level}
    </span>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white/70 p-5 animate-pulse space-y-3">
      <div className="h-4 w-2/3 bg-ink-100 rounded" />
      <div className="h-3 w-1/3 bg-ink-100 rounded" />
      <div className="h-3 w-full bg-ink-100 rounded" />
      <div className="h-3 w-5/6 bg-ink-100 rounded" />
    </div>
  );
}

export default function StudyPlanList() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [formError, setFormError] = useState('');
  const [generating, setGenerating] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [listError, setListError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadPlans = async () => {
    setLoadingPlans(true);
    setListError('');
    try {
      const data = await getStudyPlans();
      setPlans(data.studyPlans || []);
    } catch (err) {
      setListError(err.message || 'Could not load your study plans.');
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!subject.trim() || !currentLevel) {
      setFormError('Add a subject and pick your current level to continue.');
      return;
    }

    setGenerating(true);
    try {
      const data = await generateStudyPlan({ subject: subject.trim(), currentLevel });
      setPlans((prev) => [data.studyPlan, ...prev]);
      setSubject('');
      setCurrentLevel('');
      navigate(`/learning/study-plan/${data.studyPlan._id}`);
    } catch (err) {
      setFormError(err.message || 'Something went wrong generating the plan. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteStudyPlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setListError(err.message || 'Could not delete that plan.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-ink-900 text-2xl tracking-tight">
          Study Planner
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Tell it what you're learning and where you're starting from — it lays out a
          day-by-day plan.
        </p>
      </div>

      {/* Generate form */}
      <form
        onSubmit={handleGenerate}
        className="rounded-2xl border border-ink-200 bg-surface-blue/40 p-6 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">
              Subject or topic
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Organic Chemistry, IELTS Writing"
              disabled={generating}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">
              Current level
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
          <p className="text-danger-text text-xs font-medium">{formError}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={generating}
          loadingText="Generating your plan…"
          className="sm:w-auto sm:px-8"
        >
          Generate plan
        </Button>
      </form>

      {/* Existing plans */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wide">
          Your plans
        </h2>

        {listError && (
          <div className="rounded-lg border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger-text">
            {listError}
          </div>
        )}

        {loadingPlans ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <PlanCardSkeleton />
            <PlanCardSkeleton />
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-ink-700">No study plans yet</p>
            <p className="text-xs text-ink-500 mt-1">
              Generate your first one above to see it here.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="rounded-2xl border border-ink-200 bg-white p-5 flex flex-col gap-3 hover:border-brand-indigo/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-bold text-ink-900 text-base leading-snug">
                    {plan.planTitle || plan.subject}
                  </h3>
                  <LevelBadge level={plan.currentLevel} />
                </div>

                <p className="text-xs text-ink-500 line-clamp-2">
                  {plan.summary || `A study plan for ${plan.subject}.`}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    className="text-xs py-2"
                    onClick={() => navigate(`/learning/study-plan/${plan._id}`)}
                  >
                    View plan
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs py-2 !w-auto px-3 border-danger-border text-danger-text hover:bg-danger-text hover:text-white hover:border-transparent"
                    loading={deletingId === plan._id}
                    loadingText=""
                    onClick={() => handleDelete(plan._id)}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}