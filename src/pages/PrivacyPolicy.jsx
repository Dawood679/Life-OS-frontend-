import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Brain,
  Trash2,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Award,
  ArrowLeft,
  Search,
  ExternalLink,
} from "lucide-react";

export default function PrivacyPolicy() {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "1. Core Privacy Principles", icon: ShieldCheck },
    { id: "data-collected", title: "2. Information We Collect", icon: Database },
    { id: "ai-transparency", title: "3. AI Processing & Model Safety", icon: Brain },
    { id: "health-data", title: "4. HealthOS & Prescription Privacy", icon: Activity },
    { id: "career-data", title: "5. Career & Audio Interview Data", icon: Award },
    { id: "storage-security", title: "6. Data Security & Encryption", icon: Lock },
    { id: "user-rights", title: "7. Your Rights & Data Deletion", icon: Trash2 },
    { id: "cookies", title: "8. Cookies & Local Preferences", icon: Eye },
    { id: "contact", title: "9. Contact & Data Governance", icon: FileText },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 relative overflow-x-hidden ${
        isDark
          ? "bg-[#07090e] text-slate-100 bg-grid-pattern-dark"
          : "bg-[#fdf2f8]/30 text-slate-800 bg-grid-pattern-light"
      }`}
    >
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Top Header Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-indigo hover:text-brand-sky transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-400">Legal & Transparency</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-700/20 dark:border-white/10">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border mb-3 backdrop-blur-md ${
                  isDark
                    ? "bg-brand-indigo/10 border-brand-indigo/30 text-brand-sky"
                    : "bg-indigo-50 border-indigo-200 text-brand-indigo"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OFFICIAL PRIVACY COMMITMENT</span>
              </div>

              <h1
                className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Privacy Policy &
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-sky to-emerald-400">
                  Data Governance Architecture
                </span>
              </h1>

              <p
                className={`mt-3 text-sm sm:text-base leading-relaxed max-w-2xl ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Last Updated: <strong>September 2026</strong> · Version 2.5 Architecture. Learn how LifeOS safeguards your personal wellness, career trajectory, and AI interactions.
              </p>
            </div>

            {/* Quick Badges Strip */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Data Selling</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-sky/10 border border-brand-sky/20 text-brand-sky text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>AES-256 / TLS Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky Table of Contents */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-2">
              <div
                className={`p-5 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/80 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Table of Contents
                </h3>

                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                          isActive
                            ? isDark
                              ? "bg-brand-indigo/20 text-brand-sky border border-brand-indigo/30"
                              : "bg-indigo-50 text-brand-indigo border border-indigo-200"
                            : isDark
                            ? "text-slate-400 hover:text-white hover:bg-white/5"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-4 border-t border-slate-700/20 dark:border-white/10">
                  <div className="text-[11px] font-bold text-slate-400">
                    Need privacy support?
                  </div>
                  <a
                    href="mailto:privacy@lifeos.ai"
                    className="text-xs font-bold text-brand-sky hover:underline"
                  >
                    privacy@lifeos.ai
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Policy Document Body */}
            <div className="lg:col-span-8 space-y-8">
              {/* Section 1 */}
              <section
                id="overview"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl transition-all ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    1. Core Privacy Principles
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  LifeOS is built on the foundational philosophy that your personal wellness, cognitive learning journey, and professional career telemetry belong solely to you. We operate under three non-negotiable rules:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  {[
                    { title: "No Third-Party Brokers", desc: "We will never sell, rent, or trade your identifiable personal data to data brokers or advertising networks." },
                    { title: "Zero Model Pollution", desc: "Your uploaded resumes, notes, and mock interview transcripts are never used to train public commercial AI models." },
                    { title: "Absolute Deletion", desc: "When you delete a record or your entire account, data is permanently scrubbed across active databases." },
                  ].map((rule, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? "bg-[#07090e]/60 border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="text-xs font-bold text-brand-sky mb-1">{rule.title}</div>
                      <div className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {rule.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 2 */}
              <section
                id="data-collected"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-sky/15 text-brand-sky flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    2. Information We Collect
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <h4 className={`font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      A. Authentication & Account Data
                    </h4>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      When you register via Email or Google OAuth, we store your full name, email address, password hash (encrypted using bcrypt with salt rounds), and your chosen timezone for daily morning briefings.
                    </p>
                  </div>

                  <div>
                    <h4 className={`font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      B. Productivity & Learning Telemetry
                    </h4>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      Includes custom 90-Day transformation blueprints, study session completion timestamps, Micro-Quiz scores, active recall flashcards, and verified skill badges.
                    </p>
                  </div>

                  <div>
                    <h4 className={`font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      C. Calculated Life Score Telemetry
                    </h4>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      Immutable daily snapshots of your 0–100 Life Score calculated based on your active Focus Mode (Balanced, Career Sprint, or Student Exam).
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section
                id="ai-transparency"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    3. AI Processing & Model Safety (Gemini & Groq)
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  LifeOS utilizes enterprise API endpoints from <strong>Google Gemini 2.5 Flash</strong> with automated sub-second fallback resilience to <strong>Groq SDK</strong> (Qwen / Llama engines).
                </p>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-purple-500/5 border-purple-500/20 text-slate-300" : "bg-purple-50 border-purple-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enterprise Zero-Data-Retention Agreements</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    All prompts sent to our AI providers are processed under strict commercial privacy terms where telemetry is ephemeral, unlogged for training, and discarded immediately after generation.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section
                id="health-data"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    4. HealthOS & Prescription Privacy
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Health tracking involves intimate personal metrics. LifeOS treats wellness records with maximum confidentiality:
                </p>

                <ul className="space-y-2 text-xs sm:text-sm list-disc pl-5">
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    <strong>Prescription OCR Scanning:</strong> Uploaded medical documents are analyzed in-memory with Tesseract OCR & Gemini parsing to extract dosages and routines, then stored securely with restricted access tokens.
                  </li>
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    <strong>Sleep & Hydration Logs:</strong> Used exclusively to calculate your daily Health Score (35% weight) and power the Human EA Burnout Guard.
                  </li>
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    <strong>Medical Disclaimer:</strong> LifeOS is an assistive productivity organizer and does not provide medical diagnoses or alter prescribed regimens.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section
                id="career-data"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    5. Career & Audio Interview Privacy
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Career development tools process candidate resumes, salary goals, and conversational interview responses:
                </p>

                <ul className="space-y-2 text-xs sm:text-sm list-disc pl-5">
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    <strong>Voice Audio Synthesis:</strong> Speech recognition and audio feedback utilize your local browser Web Speech API. Audio streams are not recorded or uploaded to permanent external servers.
                  </li>
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    <strong>Application Tracker Data:</strong> Job stages, company names, compensation notes, and follow-up deadlines remain strictly private to your account.
                  </li>
                </ul>
              </section>

              {/* Section 6 */}
              <section
                id="storage-security"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-sky/15 text-brand-sky flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    6. Data Security & Storage Architecture
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  We implement multi-layered defense-in-depth security standards:
                </p>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>HTTP-Only Cookie Tokens:</strong> Session JWTs are stored in secure, SameSite-strict cookies inaccessible to client-side scripts.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Encryption in Transit:</strong> 100% of network traffic between your client and our API is encrypted via TLS 1.3.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Rate Limiting & Threat Shield:</strong> Express rate limiters protect against brute force and DDoS vectors.</span>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section
                id="user-rights"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center font-bold">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    7. Your Rights & Right to Be Forgotten
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  You retain complete sovereignty over your data under GDPR, CCPA, and global privacy frameworks:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? "bg-[#07090e]/70 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Export Your Data</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Download full CSV and Excel exports of your job tracker pipeline, study history, and verified badges anytime.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? "bg-[#07090e]/70 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Instant Account Purge</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Trigger account deletion from your profile to permanently delete all associated documents, logs, and score histories.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 8 & 9 */}
              <section
                id="cookies"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    8. Cookies & Local Preferences
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  We use minimal, essential local storage tokens to store your theme preference (<code>lifeos_theme</code>: dark or light) and manage your active login session. We do not place third-party cross-site advertising trackers on your machine.
                </p>
              </section>

              <section
                id="contact"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark
                    ? "bg-gradient-to-r from-[#0e131f] to-brand-indigo/10 border-brand-indigo/30"
                    : "bg-gradient-to-r from-white to-indigo-50/50 border-indigo-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <FileText className="w-5 h-5 text-brand-sky" />
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    9. Contact & Data Protection Officer
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  For questions regarding this policy, data export requests, or security audit inquiries, reach out directly to our Data Protection Office:
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:privacy@lifeos.ai"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light shadow-md shadow-brand-indigo/25 hover:opacity-95 transition-all"
                  >
                    <span>Contact Privacy Team</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/register"
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Create Protected LifeOS Account
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
