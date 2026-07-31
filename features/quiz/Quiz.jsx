import { useEffect, useState } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    quizId: null,
    quizTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);

  // Interactive Quiz Taking State
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("takeQuiz");

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // 1. Fetch All Quizzes on Mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/quiz`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.quizzes) {
        setQuizzes(data.quizzes);
        if (data.quizzes.length > 0) {
          fetchQuizDetail(data.quizzes[0]._id);
        }
      } else {
        setError(data.message || "Failed to fetch quizzes.");
      }
    } catch {
      setError("Unable to connect to server to load quizzes.");
    } finally {
      setInitialFetching(false);
    }
  };

  // 2. Fetch Single Quiz Detail
  const fetchQuizDetail = async (id) => {
    try {
      setFetchingDetail(true);
      setError("");
      const res = await fetch(`${BACKEND_URL}/quiz/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.quiz) {
        setSelectedQuiz(data.quiz);
        setUserAnswers({});
        setIsSubmitted(false);
        setActiveTab("takeQuiz");
      } else {
        setError(data.message || "Failed to load quiz details.");
      }
    } catch {
      setError("Error loading selected quiz details.");
    } finally {
      setFetchingDetail(false);
    }
  };

  // 3. Generate New Quiz
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          numberOfQuestions: Number(numberOfQuestions),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate quiz.");
        return;
      }

      const newQuiz = data.quiz;
      setQuizzes((prev) => [newQuiz, ...prev]);
      setSelectedQuiz(newQuiz);
      setUserAnswers({});
      setIsSubmitted(false);
      setIsCreatingNew(false);
      setTopic("");
      setActiveTab("takeQuiz");
    } catch {
      setError("Unable to connect to AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (id, title, e) => {
    e?.stopPropagation();
    setDeleteModal({
      isOpen: true,
      quizId: id,
      quizTitle: title || "this quiz",
    });
  };

  // Close Delete Modal
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModal({ isOpen: false, quizId: null, quizTitle: "" });
  };

  // 4. Confirm Delete Quiz Function
  const confirmDelete = async () => {
    const { quizId } = deleteModal;
    if (!quizId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/quiz/${quizId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = quizzes.filter((item) => item._id !== quizId);
        setQuizzes(updated);
        if (selectedQuiz?._id === quizId) {
          if (updated.length > 0) {
            fetchQuizDetail(updated[0]._id);
          } else {
            setSelectedQuiz(null);
          }
        }
        closeDeleteModal();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete quiz.");
      }
    } catch {
      setError("Error attempting to delete quiz.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Quiz Interaction Logic
  const handleSelectOption = (questionIdx, optionKey) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionKey,
    }));
  };

  const calculateScore = () => {
    if (!selectedQuiz?.questions) return 0;
    let correctCount = 0;
    selectedQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
  };

  // Navigation Dynamic Tabs
  const tabs = [
    { key: "takeQuiz", label: isSubmitted ? "Questions & Explanations" : "Take Quiz" },
    {
      key: "summary",
      label: `Results & Analytics ${isSubmitted ? "🏆" : ""}`,
    },
  ];

  // Helper Badge Color for Difficulty
  const getDifficultyBadge = (diff = "") => {
    switch (diff.toLowerCase()) {
      case "advanced":
      case "hard":
        return "bg-rose-500 text-white";
      case "intermediate":
      case "medium":
        return "bg-amber-500 text-white";
      default:
        return "bg-emerald-500 text-white";
    }
  };

  // SECTION 1: GENERATE FORM

  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          🧠
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Generate AI Knowledge Assessment
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Specify a topic, choose your target difficulty level, and set question limits.
          LifeOS AI will dynamically craft progressive MCQs with detailed explanations.
        </p>

        <form onSubmit={handleGenerate} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Quiz Topic or Subject
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Hooks, PostgreSQL Indexing, Data Analysis Basics..."
              disabled={loading}
              className="w-full p-4 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={loading}
                className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 cursor-pointer"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Number of Questions
              </label>
              <select
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
                disabled={loading}
                className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 cursor-pointer"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3">
            {quizzes.length > 0 && isCreatingNew && (
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
              disabled={loading || !topic.trim()}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating AI Quiz...
                </>
              ) : (
                <>
                  <span>Create Quiz</span>
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

  // SECTION 2: HERO BANNER
  const renderHero = () => {
    if (!selectedQuiz) return null;

    const totalQuestions = selectedQuiz.questions?.length || 0;
    const answeredCount = Object.keys(userAnswers).length;
    const score = calculateScore();
    const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${getDifficultyBadge(selectedQuiz.difficulty)}`}>
                {selectedQuiz.difficulty || "Beginner"}
              </span>
              <span className="text-xs text-sky-100/80">• {totalQuestions} MCQs</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold line-clamp-2">
              {selectedQuiz.quizTitle || selectedQuiz.topic}
            </h2>
            <p className="text-xs text-indigo-100">
              Created on: {new Date(selectedQuiz.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-5 self-start md:self-auto shrink-0">
            {isSubmitted ? (
              <div className="text-center">
                <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Final Score</p>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {scorePercentage}% <span className="text-xs font-normal text-sky-200">({score}/{totalQuestions})</span>
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Progress</p>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {answeredCount} <span className="text-xs font-normal text-sky-200">/ {totalQuestions} answered</span>
                </p>
              </div>
            )}
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Status</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${isSubmitted ? "bg-emerald-400 text-slate-900" : "bg-amber-400 text-slate-900"}`}>
                {isSubmitted ? "Completed" : "In Progress"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // SECTION 3: SIDEBAR
  const renderSidebar = () => (
    <>
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
        Saved Quizzes ({quizzes.length})
      </h3>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {quizzes.map((item) => {
          const isSelected = selectedQuiz?._id === item._id;

          return (
            <div
              key={item._id}
              onClick={() => {
                fetchQuizDetail(item._id);
                setIsCreatingNew(false);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
                  : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0">
                <span
                  className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-extrabold transition-colors ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-orange-100/70 text-orange-800"
                  }`}
                >
                  📝
                </span>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.quizTitle || item.topic}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 capitalize">
                    {item.difficulty} • {item.numberOfQuestions} Questions
                  </p>
                </div>
              </div>

              {/* Triggers New Custom Delete Modal */}
              <button
                onClick={(e) => openDeleteModal(item._id, item.quizTitle || item.topic, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 transition cursor-pointer shrink-0 rounded-lg hover:bg-rose-50"
                title="Delete Quiz"
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


  // SECTION 4: TAB CONTENT
  const renderTabContent = () => {
    if (fetchingDetail) {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 animate-pulse">
            Loading quiz questions & options...
          </p>
        </div>
      );
    }

    if (!selectedQuiz || !selectedQuiz.questions) return null;

    if (activeTab === "takeQuiz") {
      const answeredCount = Object.keys(userAnswers).length;
      const totalQuestions = selectedQuiz.questions.length;

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Questions ({totalQuestions})
            </h4>
            {!isSubmitted ? (
              <span className="text-xs font-semibold text-indigo-600">
                {answeredCount} of {totalQuestions} Answered
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span>✓</span> Review Answers & Explanations Below
              </span>
            )}
          </div>

          <div className="space-y-6">
            {selectedQuiz.questions.map((q, qIdx) => {
              const selectedOption = userAnswers[qIdx];
              const options = q.options || [];

              return (
                <div
                  key={qIdx}
                  className="p-5 md:p-6 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h5 className="text-sm md:text-base font-bold text-slate-800 leading-snug">
                      {q.question}
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {options.map((opt, optIdx) => {
                      const key = typeof opt === "object" ? opt.key || String.fromCharCode(65 + optIdx) : String.fromCharCode(65 + optIdx);
                      const label = typeof opt === "object" ? opt.text || opt.label : opt;

                      const isSelected = selectedOption === key;
                      const isCorrect = q.correctAnswer === key;

                      let btnStyle = "bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-orange-50/40";
                      if (isSelected) {
                        btnStyle = "bg-orange-500 text-white border-orange-500 shadow-xs";
                      }

                      if (isSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-500 font-bold";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-rose-500 text-white border-rose-500";
                        } else {
                          btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(qIdx, key)}
                          className={`w-full p-3.5 rounded-xl border text-xs text-left transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                              isSelected || (isSubmitted && isCorrect)
                                ? "bg-white/20 text-white"
                                : "bg-slate-200/70 text-slate-600"
                            }`}
                          >
                            {key}
                          </span>
                          <span className="leading-snug">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && q.explanation && (
                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                      <span className="text-sm">💡</span>
                      <div>
                        <span className="font-bold">Explanation: </span>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isSubmitted && (
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={answeredCount === 0}
                className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:opacity-95 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Submit Quiz Answers</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "summary") {
      const totalQuestions = selectedQuiz.questions.length;
      const score = calculateScore();
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

      return (
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Performance Breakdown
          </h4>

          {!isSubmitted ? (
            <div className="p-8 text-center bg-orange-50/40 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-sm text-slate-600 font-semibold">
                You haven't submitted your answers for this quiz yet!
              </p>
              <button
                onClick={() => setActiveTab("takeQuiz")}
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs hover:bg-orange-600 transition"
              >
                Go to Quiz Questions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Correct Answers</p>
                <p className="text-3xl font-black text-emerald-700">{score}</p>
              </div>

              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Incorrect Answers</p>
                <p className="text-3xl font-black text-rose-700">{totalQuestions - score}</p>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Overall Accuracy</p>
                <p className="text-3xl font-black text-indigo-700">{percentage}%</p>
              </div>
            </div>
          )}

          {isSubmitted && (
            <div className="p-6 rounded-2xl bg-white/80 border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Recommendations</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {percentage >= 80
                  ? "🎉 Outstanding! You have demonstrated strong mastery over this topic. Try increasing the difficulty or testing another module."
                  : percentage >= 60
                  ? "👍 Good attempt! Review the explanations for the questions you missed to reinforce your understanding."
                  : "📚 Consider reviewing fundamental concepts for this topic before retaking the quiz."}
              </p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };


  // MAIN RENDER WITH FEATURE LAYOUT & MODAL
  return (
    <>
      <FeatureLayout
        badgeText="LearningOS Hub"
        title="AI Quiz & Knowledge Assessment"
        subtitle="Powered by Gemini 2.5 Flash • Custom MCQ Generation & Detailed Explanations"
        loading={loading}
        initialFetching={initialFetching}
        error={error}
        setError={setError}
        isCreatingNew={isCreatingNew}
        setIsCreatingNew={setIsCreatingNew}
        hasItems={quizzes.length > 0}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderTabContent={renderTabContent}
      />


      {/* DELETE MODAL */}
     
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          {/* Modal Overlay backdrop click */}
          <div
            className="fixed inset-0"
            onClick={closeDeleteModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl z-10 space-y-5 text-center transform transition-all scale-100">
            {/* Warning Icon Badge */}
            <div className="w-14 h-14 bg-rose-100/80 text-rose-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            {/* Modal Title & Message */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">
                Delete Quiz?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Are you sure you want to delete <span className="font-semibold text-slate-700">"{deleteModal.quizTitle}"</span>? This action cannot be undone.
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold shadow-md shadow-rose-200 active:scale-98 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}