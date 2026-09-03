import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import FeatureLayout from "../../src/components/FeatureLayout";

const SUGGESTED_ROLES = [
  "Frontend React Developer",
  "Full Stack Node/React Engineer",
  "Backend Python/Django Engineer",
  "Product Manager (Tech)",
  "Data Analyst & SQL Specialist",
  "DevOps & Cloud Engineer",
];

export default function InterviewStudio() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const BACKEND_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

  // Sessions and Selection
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [initialFetching, setInitialFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submittingTurn, setSubmittingTurn] = useState(false);
  const [creatingStudyPlan, setCreatingStudyPlan] = useState(false);
  const [creatingTopicPlan, setCreatingTopicPlan] = useState(null);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Setup Form State
  const [roleTitle, setRoleTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [interviewType, setInterviewType] = useState("mixed");
  const [targetCompanyOrStyle, setTargetCompanyOrStyle] = useState("Standard Tech / Enterprise");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Live Turn Studio State
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [activeTab, setActiveTab] = useState("studio"); // "studio" | "scorecard"

  // Voice Input (Beta) State
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize Speech Recognition check
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentAnswer((prev) => `${prev} ${finalTranscript}`.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Pre-fill state if navigated from Job Match, Study Plan, or Roadmap
  useEffect(() => {
    const incomingRole = location.state?.roleTitle || location.state?.targetRole;
    if (incomingRole) {
      setRoleTitle(incomingRole);
      const incomingTopic = location.state.jobDescription || location.state.customTopic;
      if (incomingTopic) {
        setJobDescription(location.state.jobDescription || `Target Milestone Focus: ${location.state.customTopic}`);
        setShowJdInput(true);
      }
      setSelectedSession(null);
      setIsCreatingNew(true);
    }
  }, [location.state]);

  // Fetch Interview Sessions on Mount
  useEffect(() => {
    fetchSessions(pagination.currentPage);
  }, []);

  const fetchSessions = async (page = 1, autoSelectFirst = true) => {
    try {
      setInitialFetching(true);
      const res = await fetch(
        `${BACKEND_URL}/interview?page=${page}&limit=${pagination.pageSize}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok && data.sessions) {
        setSessions(data.sessions);
        if (data.pagination) {
          setPagination(data.pagination);
        }

        if (autoSelectFirst) {
          // If navigated with location.state to create new interview, keep form open
          if (location.state?.roleTitle) {
            setSelectedSession(null);
            setIsCreatingNew(true);
          } else if (data.sessions.length > 0) {
            fetchSessionDetail(data.sessions[0]._id);
          } else {
            setSelectedSession(null);
            setIsCreatingNew(true);
          }
        }
      } else {
        setError(data.message || "Failed to load interview history.");
      }
    } catch {
      setError("Network error fetching interview sessions.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchSessionDetail = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/interview/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.session) {
        setSelectedSession(data.session);
        setIsCreatingNew(false);
        if (data.session.status === "completed") {
          setActiveTab("scorecard");
        } else {
          setActiveTab("studio");
        }
        setCurrentAnswer("");
      }
    } catch {
      toast.error("Failed to load interview details.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Start New Interview Session
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!roleTitle.trim()) {
      toast.error("Please specify a target role title.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BACKEND_URL}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roleTitle: roleTitle.trim(),
          experienceLevel,
          interviewType,
          targetCompanyOrStyle,
          jobDescription: jobDescription.trim(),
          totalQuestions: parseInt(totalQuestions, 10) || 5,
        }),
      });

      const data = await res.json();

      if (res.ok && data.session) {
        toast.success("Interview session initialized! Question #1 ready.");
        
        // Clear navigation history state so it doesn't reopen form on subsequent clicks
        if (location.state) {
          navigate(location.pathname, { replace: true, state: {} });
        }

        setSelectedSession(data.session);
        setIsCreatingNew(false);
        setActiveTab("studio");
        setCurrentAnswer("");
        setSessions((prev) => [
          data.session,
          ...prev.filter((s) => s._id !== data.session._id),
        ]);
      } else {
        setError(data.message || "Failed to start interview.");
      }
    } catch {
      setError("Network error connecting to AI Interviewer.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Turn Answer
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide your answer before submitting.");
      return;
    }

    if (!selectedSession) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      setSubmittingTurn(true);
      setError("");

      const currentQNum = selectedSession.currentTurn;

      const res = await fetch(
        `${BACKEND_URL}/interview/${selectedSession._id}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            questionNumber: currentQNum,
            userAnswer: currentAnswer.trim(),
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.session) {
        setSelectedSession(data.session);
        setCurrentAnswer("");

        if (data.isCompleted) {
          toast.success("🎉 Interview completed! Diagnostic scorecard ready. (+Career Score boost & Life Score updated)", { duration: 4500 });
          setActiveTab("scorecard");
        } else {
          toast.success(`Question #${data.session.currentTurn} ready!`);
        }
        fetchSessions(pagination.currentPage);
      } else {
        toast.error(data.message || "Failed to submit answer.");
      }
    } catch {
      toast.error("Error submitting answer to server.");
    } finally {
      setSubmittingTurn(false);
    }
  };

  // 3. Toggle Voice Input
  const toggleVoiceInput = () => {
    if (!isSpeechSupported) {
      toast.error("Voice input is not supported in this browser. Please type your response.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast("🎙️ Listening... Speak clearly into your microphone.", { icon: "🎙️" });
      } catch (err) {
        console.warn("Speech start error:", err);
      }
    }
  };

  // 4. Create Study Plan from Interview Weaknesses (Priority #1 Retention Bridge)
  const handleCreateStudyPlan = async (specificTopic = null) => {
    if (!selectedSession) return;

    try {
      if (specificTopic) {
        setCreatingTopicPlan(specificTopic);
      } else {
        setCreatingStudyPlan(true);
      }

      const res = await fetch(
        `${BACKEND_URL}/interview/${selectedSession._id}/create-study-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ specificTopic })
        }
      );

      const data = await res.json();

      if (res.ok && data.studyPlan) {
        toast.success(`Study Plan for "${specificTopic || selectedSession.roleTitle}" generated!`);
        navigate("/learning/study-plan", {
          state: { topic: specificTopic || selectedSession.roleTitle },
        });
      } else {
        toast.error(data.message || "Failed to create study plan.");
      }
    } catch {
      toast.error("Error generating remediation study plan.");
    } finally {
      setCreatingStudyPlan(false);
      setCreatingTopicPlan(null);
    }
  };

  // 5. Delete Session
  const handleDeleteSession = async () => {
    if (!deleteModal.id) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${BACKEND_URL}/interview/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Interview session deleted.");
        setDeleteModal({ isOpen: false, id: null, title: "" });
        fetchSessions(pagination.currentPage);
      } else {
        toast.error("Failed to delete interview.");
      }
    } catch {
      toast.error("Error deleting interview session.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get current active turn
  const currentTurnData =
    selectedSession?.turns &&
    selectedSession.turns.find(
      (t) => t.questionNumber === selectedSession.currentTurn
    );

  // Verdict Badge Color Helper
  const getVerdictStyle = (verdict = "") => {
    switch (verdict) {
      case "Strong Hire":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-300";
      case "Hire with Reservations":
        return "bg-sky-500/10 text-sky-700 border-sky-300";
      case "Needs Preparation":
        return "bg-amber-500/10 text-amber-800 border-amber-300";
      default:
        return "bg-rose-500/10 text-rose-700 border-rose-300";
    }
  };

  // SECTION 1: SETUP FORM
  const renderForm = () => (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all text-left space-y-6">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          🎙️
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
          Configure Mock Interview Session
        </h2>
        <p className="text-xs text-slate-500">
          Tailor target role, experience level, and round format. LifeOS AI acts as a senior interviewer with turn-by-turn evaluation.
        </p>
      </div>

      {/* Suggested Role Chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Popular Interview Roles
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_ROLES.map((role, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setRoleTitle(role)}
              className="text-xs text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-xl transition cursor-pointer border border-transparent hover:border-indigo-200"
            >
              ✦ {role}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleStartInterview} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
            Target Job Title or Role
          </label>
          <input
            type="text"
            required
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g., Senior React Engineer, AI Product Manager, Financial Analyst..."
            disabled={loading}
            className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              disabled={loading}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 cursor-pointer"
            >
              <option value="entry">Entry / Graduate (0-1 yrs)</option>
              <option value="junior">Junior (1-3 yrs)</option>
              <option value="mid">Mid-Level (3-5 yrs)</option>
              <option value="senior">Senior (5-8 yrs)</option>
              <option value="lead">Lead / Staff (8+ yrs)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
              Round Focus Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              disabled={loading}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 cursor-pointer"
            >
              <option value="mixed">Mixed Comprehensive Round</option>
              <option value="technical">Technical Problem-Solving</option>
              <option value="behavioral">Behavioral (STAR Method)</option>
              <option value="system_design">System & Architecture Design</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
              Question Count
            </label>
            <select
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              disabled={loading}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 cursor-pointer"
            >
              <option value={3}>3 Questions (Quick Sprint)</option>
              <option value={5}>5 Questions (Standard Round)</option>
              <option value={7}>7 Questions (Comprehensive Round)</option>
              <option value={10}>10 Questions (Full Mock Assessment)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
            Target Company / Interview Style
          </label>
          <input
            type="text"
            value={targetCompanyOrStyle}
            onChange={(e) => setTargetCompanyOrStyle(e.target.value)}
            placeholder="e.g., Tier-1 Tech, Fast-Paced Startup, Enterprise Consulting..."
            disabled={loading}
            className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800"
          />
        </div>

        {/* Optional Job Description Input Accordion */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => setShowJdInput(!showJdInput)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5 cursor-pointer py-1 px-1"
          >
            <span>{showJdInput ? "▼ Hide Job Description" : "▶ + Paste Job Description (Optional — for Hyper-Targeted Questions)"}</span>
          </button>

          {showJdInput && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
                <span>Job Description & Requirements</span>
                <span className="text-[10px] text-slate-400 font-normal">AI will tailor interview questions to this specific circular</span>
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job requirements, responsibilities, or tech stack here..."
                disabled={loading}
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 leading-relaxed font-sans"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-3">
          {sessions.length > 0 && isCreatingNew && (
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !roleTitle.trim()}
            className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 hover:opacity-95 text-white font-bold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Preparing Interview Room...
              </>
            ) : (
              <>
                <span>🎙️ Start Mock Interview Session ➔</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // SECTION 2: HERO BANNER
  const renderHero = () => {
    if (!selectedSession) return null;

    const isCompleted = selectedSession.status === "completed";

    return (
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 text-white shadow-xl relative overflow-hidden text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
              {selectedSession.experienceLevel} • {selectedSession.interviewType}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                isCompleted
                  ? "bg-emerald-400 text-slate-950 font-extrabold"
                  : "bg-amber-400 text-slate-950"
              }`}
            >
              {isCompleted ? "✓ Completed & Evaluated" : `In Progress • Q${selectedSession.currentTurn}/${selectedSession.totalQuestions}`}
            </span>
            {selectedSession.jobDescription && (
              <span className="px-3 py-1 rounded-full bg-sky-300/30 text-white text-[10px] font-bold">
                🎯 Tailored to Custom JD
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-white">
            {selectedSession.roleTitle}
          </h1>

          <p className="text-xs text-sky-100 leading-relaxed">
            Target Style: {selectedSession.targetCompanyOrStyle} • Total {selectedSession.totalQuestions} Questions
          </p>
        </div>

        {/* Action Buttons in Hero */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCreatingNew(true)}
            className="px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>+ New Interview</span>
          </button>
        </div>
      </div>
    );
  };

  // SECTION 3: SIDEBAR LIST
  const renderSidebar = () => (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Interview Sessions ({sessions.length})
        </span>
        <button
          onClick={() => setIsCreatingNew(true)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
        >
          + New
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-400">No mock interviews taken yet.</p>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Start your first mock interview
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((sess) => {
            const isSelected = selectedSession?._id === sess._id && !isCreatingNew;
            const isComp = sess.status === "completed";

            return (
              <div
                key={sess._id}
                onClick={() => fetchSessionDetail(sess._id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-indigo-200 shadow-2xs"
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {sess.roleTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>{sess.experienceLevel}</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        isComp ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {isComp ? "Evaluated" : `Q${sess.currentTurn}/${sess.totalQuestions}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isComp && sess.scorecard?.overallScore !== undefined && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold font-mono">
                      {sess.scorecard.overallScore}%
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({
                        isOpen: true,
                        id: sess._id,
                        title: sess.roleTitle,
                      });
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1 text-xs transition cursor-pointer"
                    title="Delete session"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // SECTION 4: TAB CONTENT
  const tabs = [
    {
      key: "studio",
      label: selectedSession?.status === "completed" ? "Interview Q&A Room" : "Live Interview Room 🎙️",
    },
    {
      key: "scorecard",
      label: `Diagnostic Scorecard ${selectedSession?.status === "completed" ? "🏆" : ""}`,
    },
  ];

  const renderTabContent = () => {
    if (!selectedSession) return null;

    // TAB 1: LIVE INTERVIEW STUDIO
    if (activeTab === "studio") {
      const isCompleted = selectedSession.status === "completed";

      return (
        <div className="space-y-6 text-left">
          {/* Progress Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Interview Progression</span>
              <span className="font-mono text-indigo-600">
                {isCompleted
                  ? `${selectedSession.totalQuestions} / ${selectedSession.totalQuestions} Complete`
                  : `Question ${selectedSession.currentTurn} of ${selectedSession.totalQuestions}`}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-600 to-sky-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    isCompleted
                      ? 100
                      : Math.round(
                          ((selectedSession.currentTurn - 1) /
                            selectedSession.totalQuestions) *
                            100
                        )
                  }%`,
                }}
              />
            </div>
          </div>

          {/* ACTIVE TURN STUDIO (If In Progress) */}
          {!isCompleted && currentTurnData && (
            <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6 md:p-8 space-y-6 animate-fadeIn">
              {/* Question Bubble */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                    Question #{currentTurnData.questionNumber} • {currentTurnData.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    AI Interviewer
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm md:text-base font-serif font-bold text-slate-800 leading-relaxed">
                  "{currentTurnData.questionText}"
                </div>
              </div>

              {/* User Answer Studio (Typing First + Voice Toggle) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✍️</span>
                    <span>Your Answer (Typing-First)</span>
                  </label>

                  {/* Experimental Voice Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      isListening
                        ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                        : "bg-slate-100 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <span>🎙️</span>
                    <span>{isListening ? "Listening... (Stop)" : "Voice (Beta)"}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your structured answer here. Use the STAR format (Situation, Task, Action, Result) for behavioral questions or clearly outline technical architecture..."
                  disabled={submittingTurn}
                  className="w-full p-4 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 leading-relaxed font-sans"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-slate-400">
                    💡 Tip: Be concise, lead with metrics, and clearly explain your rationale.
                  </p>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={submittingTurn || !currentAnswer.trim()}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 hover:opacity-95 text-white text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    {submittingTurn ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Evaluating Turn...
                      </>
                    ) : (
                      <>
                        <span>Submit Answer ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ALL PREVIOUS TURNS REVIEW */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Interview Questions & Responses
            </h3>

            {selectedSession.turns.map((turn, idx) => {
              const isCurrent = turn.questionNumber === selectedSession.currentTurn && !isCompleted;
              if (isCurrent) return null; // Already rendered in active studio above

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      Question #{turn.questionNumber} • {turn.category}
                    </span>
                    {turn.score !== undefined && turn.score > 0 && (
                      <span className="text-[11px] font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                        Turn Score: {turn.score}/100
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-relaxed">
                    "{turn.questionText}"
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Candidate Response:
                    </span>
                    <p className="whitespace-pre-line leading-relaxed">
                      {turn.userAnswer || "No answer provided."}
                    </p>
                  </div>

                  {turn.feedbackBrief && (
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                        <span>💬</span> Real-time Feedback
                      </span>
                      <p className="leading-relaxed">{turn.feedbackBrief}</p>
                    </div>
                  )}

                  {turn.idealAnswerBullet && (
                    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-950 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        <span>💡</span> Ideal Benchmark Answer
                      </span>
                      <p className="whitespace-pre-line leading-relaxed text-slate-700">
                        {turn.idealAnswerBullet}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // TAB 2: DIAGNOSTIC SCORECARD
    if (activeTab === "scorecard") {
      const isCompleted = selectedSession.status === "completed";
      const sc = selectedSession.scorecard || {};

      if (!isCompleted) {
        return (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="text-3xl">⏳</div>
            <h3 className="text-base font-bold text-slate-800">
              Interview In Progress
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please answer all {selectedSession.totalQuestions} questions in the Live Interview Room to unlock your full diagnostic scorecard.
            </p>
            <button
              onClick={() => setActiveTab("studio")}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
            >
              Continue Interview ➔
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-6 text-left animate-fadeIn">
          {/* Main Scorecard Summary Header */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Hiring Assessment Verdict
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <span
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border uppercase tracking-wider ${getVerdictStyle(
                      sc.readinessVerdict
                    )}`}
                  >
                    {sc.readinessVerdict || "Needs Preparation"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Evaluated on {new Date(selectedSession.completedAt || selectedSession.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Overall Score Dial */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Readiness Score
                  </span>
                  <span className="text-2xl md:text-3xl font-black font-mono text-slate-900">
                    {sc.overallScore || 0}/100
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Metric Dimension Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                  <span>🎯 Technical Depth</span>
                  <span className="font-mono text-indigo-700">
                    {sc.metrics?.technicalAccuracy || 0}/100
                  </span>
                </div>
                <div className="w-full bg-indigo-200/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sc.metrics?.technicalAccuracy || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-sky-950">
                  <span>💬 Communication</span>
                  <span className="font-mono text-sky-700">
                    {sc.metrics?.communicationClarity || 0}/100
                  </span>
                </div>
                <div className="w-full bg-sky-200/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sc.metrics?.communicationClarity || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>🧠 Critical Thinking</span>
                  <span className="font-mono text-emerald-700">
                    {sc.metrics?.criticalThinking || 0}/100
                  </span>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sc.metrics?.criticalThinking || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary Review */}
            {sc.summaryReview && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Executive Summary
                </span>
                <p>{sc.summaryReview}</p>
              </div>
            )}
          </div>

          {/* RETENTION BRIDGE: 1-CLICK STUDY PLAN FROM WEAKNESSES */}
          {selectedSession.weakTopics?.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-indigo-50 to-sky-50 border border-amber-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Identified Weakness Topics ({selectedSession.weakTopics.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Generate a study plan for an individual topic or a combined master plan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCreateStudyPlan(null)}
                  disabled={creatingStudyPlan || !!creatingTopicPlan}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:opacity-95 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {creatingStudyPlan ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Generating Master Plan...
                    </>
                  ) : (
                    <>
                      <span>🚀 Generate Master Plan (All Topics) ➔</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {selectedSession.weakTopics.map((wt, idx) => {
                  const isThisLoading = creatingTopicPlan === wt.topic;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between gap-3 text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-amber-500 text-xs">✦</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                            {wt.severity || 'Moderate'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2">
                          {wt.topic}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {wt.suggestedSkill || selectedSession.roleTitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCreateStudyPlan(wt.topic)}
                        disabled={creatingStudyPlan || !!creatingTopicPlan}
                        className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                      >
                        {isThisLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-amber-600/40 border-t-amber-600 rounded-full animate-spin" />
                            <span>Creating Plan...</span>
                          </>
                        ) : (
                          <>
                            <span>+ Create Study Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question-by-Question Benchmark Diagnostic List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Question-by-Question Diagnostic & Benchmark Answers
              </h3>
              <span className="text-[10px] text-slate-400">
                ℹ️ AI Reference Benchmark
              </span>
            </div>

            {selectedSession.turns.map((turn, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    Question #{turn.questionNumber} • {turn.category}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                    Score: {turn.score || 70}/100
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 leading-relaxed">
                  "{turn.questionText}"
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Your Response:
                  </span>
                  <p className="whitespace-pre-line leading-relaxed">
                    {turn.userAnswer || "No answer provided."}
                  </p>
                </div>

                {turn.feedbackBrief && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <span>💬</span> Evaluation Feedback
                    </span>
                    <p className="leading-relaxed">{turn.feedbackBrief}</p>
                  </div>
                )}

                {turn.idealAnswerBullet && (
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-950 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <span>💡</span> Ideal Benchmark Answer
                    </span>
                    <p className="whitespace-pre-line leading-relaxed text-slate-700">
                      {turn.idealAnswerBullet}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <FeatureLayout
        badgeText="CareerOS Simulator"
        title="AI Mock Interview Simulator"
        subtitle="Adaptive multi-round interview practice with turn-by-turn AI evaluation and weak topic study plans."
        onBack={() => navigate(-1)}
        backTooltip="Go Back"
        initialFetching={initialFetching}
        loading={loading}
        error={error}
        setError={setError}
        isCreatingNew={isCreatingNew}
        setIsCreatingNew={setIsCreatingNew}
        hasItems={sessions.length > 0}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderTabContent={renderTabContent}
        pagination={pagination}
        onPageChange={(page) => fetchSessions(page)}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-left">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-lg font-bold">
              🗑️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                Delete Interview Session?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete "{deleteModal.title}"? This diagnostic record cannot be recovered.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: null, title: "" })}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSession}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
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
