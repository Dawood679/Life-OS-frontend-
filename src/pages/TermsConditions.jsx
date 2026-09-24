import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import {
  FileText,
  Shield,
  Scale,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Zap,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function TermsConditions() {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    { id: "acceptance", title: "1. Acceptance & Eligibility", icon: UserCheck },
    { id: "account", title: "2. Account Responsibilities", icon: Lock },
    { id: "acceptable-use", title: "3. Acceptable Use Policy", icon: Shield },
    { id: "health-disclaimer", title: "4. Health & Medical Disclaimer", icon: Activity },
    { id: "ai-guidance", title: "5. AI Feedback & Employment Disclaimer", icon: Sparkles },
    { id: "user-content", title: "6. User Content Ownership", icon: Scale },
    { id: "verified-badges", title: "7. Verified Skill Badges Integrity", icon: Award },
    { id: "uptime-availability", title: "8. AI Availability & Rate Limits", icon: Zap },
    { id: "liability", title: "9. Limitation of Liability", icon: AlertTriangle },
    { id: "modifications", title: "10. Changes & Legal Contact", icon: FileText },
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
      {/* Dynamic Navbar */}
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
            <span className="text-xs font-semibold text-slate-400">Legal Agreement</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-700/20 dark:border-white/10">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border mb-3 backdrop-blur-md ${
                  isDark
                    ? "bg-brand-sky/10 border-brand-sky/30 text-brand-sky"
                    : "bg-sky-50 border-sky-200 text-brand-sky"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>USER SERVICE AGREEMENT</span>
              </div>

              <h1
                className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Terms of Service &
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky via-brand-indigo to-emerald-400">
                  Platform Usage Guidelines
                </span>
              </h1>

              <p
                className={`mt-3 text-sm sm:text-base leading-relaxed max-w-2xl ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Effective Date: <strong>September 2026</strong> · Universal System v2.5. By accessing or using LifeOS, you agree to be bound by these Terms of Service.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Fair & Transparent</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>Non-Medical Assistive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid Layout */}
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
                              ? "bg-brand-sky/20 text-brand-sky border border-brand-sky/30"
                              : "bg-sky-50 text-brand-sky border border-sky-200"
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
                    Questions about these terms?
                  </div>
                  <a
                    href="mailto:legal@lifeos.ai"
                    className="text-xs font-bold text-brand-sky hover:underline"
                  >
                    legal@lifeos.ai
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Terms Content Clauses */}
            <div className="lg:col-span-8 space-y-8">
              {/* Section 1 */}
              <section
                id="acceptance"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl transition-all ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-sky/15 text-brand-sky flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    1. Acceptance of Terms & Eligibility
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  By creating an account, browsing, or utilizing any feature of the LifeOS platform (including LearningOS, CareerOS, HealthOS, or the Life Score engine), you agree to these Terms of Service.
                </p>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  You must be at least 13 years of age (or the minimum legal age required in your country) to use LifeOS. If you are under 18, you represent that you have parental or legal guardian consent.
                </p>
              </section>

              {/* Section 2 */}
              <section
                id="account"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    2. Account Responsibilities & Security
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account:
                </p>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Accurate Information:</strong> You agree to provide accurate and updated registration details.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Credential Confidentiality:</strong> You must not share your login tokens or session cookies with third parties.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Notification of Breach:</strong> You agree to notify us immediately if you suspect unauthorized access to your account.</span>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section
                id="acceptable-use"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    3. Acceptable Use Policy & Prohibited Conduct
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  LifeOS is designed to elevate personal productivity, technical mastery, and wellness. You agree NOT to:
                </p>

                <ul className="space-y-2 text-xs sm:text-sm list-disc pl-5">
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    Use automated bots or scrapers to abuse AI token allocations or generate fraudulent verified badges.
                  </li>
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    Reverse engineer, decompile, or attempt to extract source algorithms of the Life Score Engine or AI fallback handlers.
                  </li>
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    Upload malicious files, viruses, or offensive content to the OCR document scanner or mock interview simulator.
                  </li>
                </ul>
              </section>

              {/* Section 4: Crucial Health Disclaimer */}
              <section
                id="health-disclaimer"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark
                    ? "bg-amber-500/5 border-amber-500/30"
                    : "bg-amber-50/70 border-amber-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold text-amber-500`}>
                    4. Crucial Health & Medical Disclaimer
                  </h2>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-300 dark:text-slate-300">
                  <p className={isDark ? "text-slate-200 font-semibold" : "text-slate-900 font-semibold"}>
                    ⚠️ PLEASE READ CAREFULLY:
                  </p>
                  <p className={isDark ? "text-slate-300" : "text-slate-700"}>
                    <strong>LifeOS (including HealthOS, Prescription OCR Scanner, Water & Sleep Tracking, and the Burnout Guard) is an assistive personal logging and organization tool ONLY.</strong>
                  </p>
                  <p className={isDark ? "text-slate-300" : "text-slate-700"}>
                    LifeOS is <strong>NOT</strong> a certified medical device, healthcare provider, emergency response system, or licensed pharmacist. The OCR scanner and Gemini AI models may occasionally misread handwritten text or dosages.
                  </p>
                  <p className={isDark ? "text-slate-300" : "text-slate-700"}>
                    <strong>Always verify extracted prescriptions against physical labels and consult a certified physician before taking any medication. Never delay seeking professional medical advice because of information generated by LifeOS.</strong>
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section
                id="ai-guidance"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    5. AI Guidance & Employment Disclaimer
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  AI Mock Interview studio scorecards, readiness verdicts (*Strong Hire*, *Needs Prep*), and Job Matcher recommendations are predictive educational simulations. LifeOS does not guarantee actual job offers, employment contracts, or interview outcomes with prospective employers.
                </p>
              </section>

              {/* Section 6 */}
              <section
                id="user-content"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    6. User Content & Intellectual Property
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <strong>You retain 100% ownership</strong> of all notes, roadmaps, code assets, and personal information you create or upload on LifeOS.
                </p>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  LifeOS grants you a personal, non-exclusive, non-transferable license to access and use the platform's UI, algorithms, and 3D visualizers in accordance with your account plan.
                </p>
              </section>

              {/* Section 7 */}
              <section
                id="verified-badges"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    7. Verified Skill Badges Integrity
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Verified Skill Badges in the user ledger are awarded strictly upon achieving <strong>80% or higher</strong> on timed diagnostic quizzes. LifeOS reserves the right to revoke badges if fraudulent submission methods or unauthorized exploits are detected.
                </p>
              </section>

              {/* Section 8 */}
              <section
                id="uptime-availability"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-sky/15 text-brand-sky flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    8. AI Service Availability & Rate Limits
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  While LifeOS implements automatic dual-engine AI fallback (Gemini ➔ Groq) to maintain 99.9% reliability, third-party network outages or upstream maintenance may occasionally cause momentary latency. Fair use rate limits apply to free tier accounts.
                </p>
              </section>

              {/* Section 9 */}
              <section
                id="liability"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    9. Limitation of Liability
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  To the maximum extent permitted by law, LifeOS and its team shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service, reliance on AI outputs, or misinterpretation of health telemetry.
                </p>
              </section>

              {/* Section 10 */}
              <section
                id="modifications"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark
                    ? "bg-gradient-to-r from-[#0e131f] to-brand-sky/10 border-brand-sky/30"
                    : "bg-gradient-to-r from-white to-sky-50/50 border-sky-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <FileText className="w-5 h-5 text-brand-sky" />
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    10. Modifications & Legal Inquiries
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  We may update these terms periodically to reflect new features or regulatory requirements. Continued use of LifeOS after changes implies acceptance.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:legal@lifeos.ai"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light shadow-md shadow-brand-indigo/25 hover:opacity-95 transition-all"
                  >
                    <span>Contact Legal Team</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/privacy"
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Read Privacy Policy
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
