import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Check,
  AlertTriangle,
  Droplets,
  Calendar,
  Flame,
  Zap,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Award
} from "lucide-react";
import toast from "react-hot-toast";

export default function GlobalCopilot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your AI Chief of Staff. You can talk to me, type commands, or use quick shortcuts to organize your day.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState(true);

  // Active Micro-Quiz State in Chat
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const BACKEND_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
    // Pre-load speech synthesis voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, [messages, isOpen]);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendCommand(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition failed. Please type your message.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast("Listening for your command...", { icon: "🎙️" });
      } catch {
        setIsListening(false);
      }
    }
  };

  // Speak AI response using natural female Web Speech Synthesis
  const speakText = (text) => {
    if (!isVoiceResponseEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.02;
    utterance.pitch = 1.05;

    // Prioritize natural executive female voices across Chrome, Edge, Safari, and Windows
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Zira") ||
          v.name.includes("Jenny") ||
          v.name.includes("Aria") ||
          v.name.includes("Sonia") ||
          v.name.includes("Samantha") ||
          v.name.includes("Google US English") ||
          v.name.includes("Victoria") ||
          v.name.includes("Karen") ||
          v.name.toLowerCase().includes("female") ||
          v.name.includes("Natural"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSendCommand = async (commandToSend) => {
    const text = (commandToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];

    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/copilot/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          command: text,
          timezone: userTimezone
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const aiMessageId = `ai-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: aiMessageId,
            sender: "ai",
            text: data.reply || "Done! Action processed.",
            type: data.type || "REGULAR",
            proposal: data.proposal || null,
            studyQuiz:
              data.type === "STUDY_QUIZ"
                ? {
                    studyPlanId: data.studyPlanId,
                    taskNumber: data.taskNumber,
                    taskTitle: data.taskTitle,
                    questions: data.questions
                  }
                : null,
            deepLink:
              data.type === "DEEP_LINK"
                ? {
                    target: data.target,
                    prefillData: data.prefillData
                  }
                : null,
            quickShortcuts: data.quickShortcuts || null,
            provider: data.provider || "gemini",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);

        if (data.reply) {
          speakText(data.reply);
        }

        // Show Instant Toast Notifications for user actions
        if (data.todo) {
          toast.success(`📅 Task added: "${data.todo.title}"`);
        } else if (data.totalWaterMl !== undefined) {
          toast.success(`💧 Water logged! Total: ${data.totalWaterMl}ml`);
        } else if (data.type === "STUDY_QUIZ") {
          toast("🧠 Active recall quiz ready!", { icon: "📚" });
        } else if (data.type === "PROPOSAL") {
          toast("⚠️ Confirmation required to delete task", { icon: "🗑️" });
        }

        // Handle Automatic Deep-Link Navigation if requested
        if (data.type === "DEEP_LINK" && data.target) {
          setTimeout(() => {
            navigate(data.target, { state: data.prefillData });
            setIsOpen(false);
          }, 1200);
        }

        // Trigger global data refresh so Dashboard live meters update
        window.dispatchEvent(new Event("lifeos-data-refresh"));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "ai",
            text: data.message || "I encountered an issue processing that command. Please try again.",
            isError: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "Network error connecting to AI Copilot. Please check your connection.",
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Two-Phase Commit Confirmation Handler
  const handleConfirmAction = async (messageId, token, confirmed) => {
    try {
      const res = await fetch(`${BACKEND_URL}/copilot/confirm-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, confirmed })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  type: "RESOLVED",
                  proposalResolved: true,
                  text: data.message || (confirmed ? "Action confirmed and executed." : "Action cancelled.")
                }
              : msg
          )
        );

        toast.success(confirmed ? "Action executed successfully!" : "Action cancelled safely.");
        window.dispatchEvent(new Event("lifeos-data-refresh"));
      } else {
        toast.error(data.message || "Failed to process confirmation.");
      }
    } catch {
      toast.error("Network error handling confirmation.");
    }
  };

  // Submit Study Task Micro-Quiz
  const handleSubmitMicroQuiz = async (messageId, studyPlanId, taskNumber) => {
    const answers = quizAnswers[messageId] || {};
    setSubmittingQuiz(true);

    try {
      const res = await fetch(`${BACKEND_URL}/copilot/submit-study-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studyPlanId,
          taskNumber,
          userAnswers: answers
        })
      });

      const data = await res.json();

      if (data.success && data.isPassed) {
        toast.success(data.message, { icon: "🧠" });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  type: "QUIZ_RESOLVED",
                  text: data.message
                }
              : msg
          )
        );
        window.dispatchEvent(new Event("lifeos-data-refresh"));
      } else {
        toast.error(data.message || "Quiz not passed. Please review and try again!");
      }
    } catch {
      toast.error("Error submitting micro-quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING PULSING COPILOT TRIGGER BUTTON */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative group p-3.5 sm:p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-600 text-white shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 cursor-pointer flex items-center justify-center active:scale-95 border border-white/20"
          title="Open AI Chief of Staff (Ctrl + K)"
          aria-label="Open AI Chief of Staff"
        >
          {/* Ambient Glow Pulse */}
          <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-indigo-400 opacity-20 group-hover:opacity-40" />

          <div className="relative flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-200 animate-spin-slow" />
            <span className="hidden sm:inline text-xs font-bold tracking-tight">
              AI Copilot
            </span>
          </div>

          <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[9px] font-extrabold bg-white/20 rounded-md text-white/90 border border-white/20">
            ⌘K
          </span>
        </button>
      </div>

      {/* 2. PORTAL COPILOT STUDIO DRAWER / MODAL */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/40 backdrop-blur-xs flex items-end sm:items-center justify-end p-0 sm:p-5 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="copilot-drawer-title"
          >
            {/* Copilot Window Container */}
            <div
              className="relative w-full sm:w-[440px] bg-white/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col h-[85vh] sm:h-[620px] max-h-[90vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-right-6 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-sky-300 shadow-2xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 id="copilot-drawer-title" className="font-serif font-bold text-sm text-white">
                        AI Chief of Staff
                      </h3>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        Context Memory
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-200">
                      Autonomous LifeOS Executive Assistant
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Voice Synthesis Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsVoiceResponseEnabled(!isVoiceResponseEnabled)}
                    className={`p-1.5 rounded-xl transition cursor-pointer ${
                      isVoiceResponseEnabled
                        ? "text-sky-300 bg-white/15"
                        : "text-slate-400 hover:bg-white/10"
                    }`}
                    title={isVoiceResponseEnabled ? "Voice responses enabled" : "Voice muted"}
                  >
                    {isVoiceResponseEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition cursor-pointer"
                    title="Close Copilot (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Zero-Token Quick Action Chips */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => handleSendCommand("log 250ml water")}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 text-sky-800 border border-slate-200 font-bold transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <Droplets className="w-3 h-3 text-sky-600" />
                  <span>+250ml</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendCommand("log 500ml water")}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 text-sky-800 border border-slate-200 font-bold transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <Droplets className="w-3 h-3 text-sky-600" />
                  <span>+500ml</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendCommand("today's agenda")}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-indigo-800 border border-slate-200 font-bold transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  <span>Agenda</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendCommand("my life score")}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 font-bold transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Score</span>
                </button>
              </div>

              {/* Chat Stream History */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl max-w-[88%] space-y-2 shadow-2xs ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : msg.isError
                          ? "bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-xs"
                          : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* STUDY PLAN MICRO-QUIZ VERIFICATION CARD */}
                      {msg.type === "STUDY_QUIZ" && msg.studyQuiz && (
                        <div className="mt-3 p-3 bg-white rounded-2xl border border-indigo-100 space-y-3 shadow-2xs text-left">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-indigo-900 font-bold">
                            <BookOpen className="w-4 h-4 text-brand-indigo" />
                            <span>Active Recall: {msg.studyQuiz.taskTitle}</span>
                          </div>

                          {(msg.studyQuiz.questions || []).map((q, qIdx) => (
                            <div key={qIdx} className="space-y-1.5">
                              <p className="font-semibold text-slate-800 text-[11px]">
                                {qIdx + 1}. {q.question}
                              </p>
                              <div className="grid grid-cols-1 gap-1">
                                {(q.options || []).map((opt, optIdx) => {
                                  const optLetter = String.fromCharCode(65 + optIdx);
                                  const isSelected = (quizAnswers[msg.id] || {})[qIdx] === optLetter;
                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      onClick={() =>
                                        setQuizAnswers((prev) => ({
                                          ...prev,
                                          [msg.id]: {
                                            ...(prev[msg.id] || {}),
                                            [qIdx]: optLetter
                                          }
                                        }))
                                      }
                                      className={`px-2.5 py-1.5 rounded-xl border text-left text-[11px] transition cursor-pointer flex items-center gap-2 ${
                                        isSelected
                                          ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold"
                                          : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                                      }`}
                                    >
                                      <span className="w-4 h-4 rounded-full bg-white border flex items-center justify-center text-[9px] font-bold">
                                        {optLetter}
                                      </span>
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            disabled={submittingQuiz}
                            onClick={() =>
                              handleSubmitMicroQuiz(
                                msg.id,
                                msg.studyQuiz.studyPlanId,
                                msg.studyQuiz.taskNumber
                              )
                            }
                            className="w-full py-2 bg-gradient-to-r from-brand-indigo to-indigo-600 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{submittingQuiz ? "Verifying..." : "Submit & Complete Task"}</span>
                          </button>
                        </div>
                      )}

                      {/* TWO-PHASE COMMIT CONFIRMATION PROPOSAL */}
                      {msg.type === "PROPOSAL" && msg.proposal && (
                        <div className="mt-2 pt-2 border-t border-slate-300/60 space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Confirmation Required</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleConfirmAction(msg.id, msg.proposal.token, true)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs active:scale-95"
                            >
                              ✓ Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmAction(msg.id, msg.proposal.token, false)}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* DEEP-LINK NOTIFICATION */}
                      {msg.type === "DEEP_LINK" && msg.deepLink && (
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                          <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                            <span>Redirecting</span>
                            <ArrowRight className="w-3 h-3 animate-pulse" />
                          </span>
                        </div>
                      )}

                      {/* Quick Fallback Shortcuts if Double Failure */}
                      {msg.quickShortcuts && (
                        <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                          {msg.quickShortcuts.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendCommand(chip.command)}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <span
                        className={`text-[9px] block text-right font-medium ${
                          msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-slate-400 p-2 text-xs">
                    <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span>AI Copilot is processing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Mic Dock */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCommand();
                }}
                className="p-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2"
              >
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-2xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  title={isListening ? "Listening... Click to stop" : "Speak to AI Copilot"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-slate-700" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask or command AI Copilot..."}
                  disabled={loading || isListening}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white transition"
                />

                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer disabled:opacity-40 shrink-0 shadow-xs active:scale-95 flex items-center justify-center"
                  title="Send command"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
