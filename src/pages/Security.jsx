import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import {
  ShieldCheck,
  Lock,
  Server,
  Key,
  Database,
  Brain,
  Bug,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Cpu,
  AlertCircle,
  FileCheck,
  Layers,
} from "lucide-react";

export default function Security() {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "1. Security Architecture Overview", icon: ShieldCheck },
    { id: "authentication", title: "2. Authentication & Session Hardening", icon: Key },
    { id: "encryption", title: "3. Encryption (Transit & Rest)", icon: Lock },
    { id: "ai-safety", title: "4. AI Privacy & Zero-Data-Retention", icon: Brain },
    { id: "health-security", title: "5. HealthOS & OCR Document Safety", icon: FileCheck },
    { id: "infrastructure", title: "6. Threat Shield & API Hardening", icon: Server },
    { id: "backup-recovery", title: "7. Disaster Recovery & Backups", icon: RefreshCw },
    { id: "vulnerability-disclosure", title: "8. Bug Bounty & Disclosure", icon: Bug },
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

      {/* Main Content */}
      <main className="pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Top Hero Section */}
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
            <span className="text-xs font-semibold text-slate-400">Trust & Security</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-700/20 dark:border-white/10">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border mb-3 backdrop-blur-md ${
                  isDark
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ENTERPRISE-GRADE DEFENSE-IN-DEPTH</span>
              </div>

              <h1
                className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Security Architecture &
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-brand-sky">
                  Data Protection Standards
                </span>
              </h1>

              <p
                className={`mt-3 text-sm sm:text-base leading-relaxed max-w-2xl ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                LifeOS is built with security engineered into every layer—from immutable cryptographic cookies to ephemeral AI inferences and localized health telemetry.
              </p>
            </div>

            {/* Live Security HUD Badges */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>TLS 1.3 Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-sky/10 border border-brand-sky/20 text-brand-sky text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>HTTP-Only JWT Isolation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky TOC */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-2">
              <div
                className={`p-5 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/80 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Security Navigation
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
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
                    Security Hotline
                  </div>
                  <a
                    href="mailto:security@lifeos.ai"
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    security@lifeos.ai
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Security Specifications */}
            <div className="lg:col-span-8 space-y-8">
              {/* Section 1: Overview */}
              <section
                id="overview"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl transition-all ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    1. Defense-in-Depth Architecture Overview
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  LifeOS utilizes a comprehensive defense-in-depth model that assumes zero implicit trust across network boundaries. Every API request is authenticated via cryptographic session tokens, validated with strict Zod schema sanitizers, and protected by distributed rate limiters.
                </p>

                {/* 3 Pillar Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  {[
                    { title: "Zero Trust Ingestion", desc: "Strict schema validation and parameter sanitization on all endpoints before reaching database or AI layers." },
                    { title: "Ephemeral Processing", desc: "AI inferences, prescription OCR buffers, and voice audio streams are processed in-memory with zero disk leakage." },
                    { title: "Isolated Data Stores", desc: "User logs, verified badges, and credentials reside in encrypted, access-controlled MongoDB clusters." },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? "bg-[#07090e]/60 border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="text-xs font-bold text-emerald-400 mb-1">{item.title}</div>
                      <div className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 2: Authentication */}
              <section
                id="authentication"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-sky/15 text-brand-sky flex items-center justify-center font-bold">
                    <Key className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    2. Authentication & Session Hardening
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <h4 className={`font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      A. Cryptographic Password Hashing
                    </h4>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      User passwords are never stored in plaintext. We utilize <code>bcryptjs</code> with an adaptive work factor (12 salt rounds), ensuring computational resistance against rainbow table and brute-force cracking attacks.
                    </p>
                  </div>

                  <div>
                    <h4 className={`font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      B. HTTP-Only, SameSite-Strict Cookie Sessions
                    </h4>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      JWT authentication tokens are delivered inside <code>HTTP-Only</code>, <code>Secure</code>, and <code>SameSite=Strict</code> cookies. This eliminates client-side JavaScript access and neutralizes Cross-Site Scripting (XSS) token theft vulnerabilities.
                    </p>
                  </div>

                  <div>
                    <h4 className={`font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      C. Brute Force Throttling
                    </h4>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      Authentication endpoints (<code>/api/auth/login</code>, <code>/api/auth/verify-otp</code>) are governed by strict IP-level rate limiters that temporarily lock out repeated failed attempts.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: Encryption */}
              <section
                id="encryption"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    3. Encryption Standards (In-Transit & At-Rest)
                  </h2>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Encryption in Transit (TLS 1.3):</strong> 100% of data transmitted between your browser and our backend is encrypted using Modern TLS 1.3 with Perfect Forward Secrecy (PFS) and HTTP Strict Transport Security (HSTS).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Encryption at Rest (AES-256):</strong> All persistent storage volumes, MongoDB database snapshots, and user telemetry are encrypted using industry-standard AES-256 algorithms.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: AI Safety */}
              <section
                id="ai-safety"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    4. AI Privacy & Zero-Data-Retention Safeguards
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  LifeOS utilizes enterprise API endpoints from <strong>Google Gemini</strong> and <strong>Groq Cloud</strong> under zero-data-retention compliance policies:
                </p>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-purple-500/5 border-purple-500/20 text-slate-300" : "bg-purple-50 border-purple-200 text-slate-700"
                  }`}
                >
                  <ul className="space-y-2 text-xs leading-relaxed list-disc pl-4">
                    <li>Prompts sent for Mock Interviews, Study Plans, or Roadmap synthesis are <strong>never used to train public foundation models</strong>.</li>
                    <li>Payloads are processed ephemerally in volatile RAM and dismissed immediately once responses are streamed to the client.</li>
                    <li>Sub-second fallback mechanisms ensure high-availability failover without data leakage.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5: HealthOS Safety */}
              <section
                id="health-security"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    5. HealthOS & Prescription Document Isolation
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Health data requires heightened scrutiny. When you use the Prescription OCR Scanner:
                </p>

                <ul className="space-y-2 text-xs sm:text-sm list-disc pl-5">
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    Uploaded prescription images are parsed in an isolated memory buffer using Tesseract OCR + Gemini Vision and stored only if explicitly requested.
                  </li>
                  <li className={isDark ? "text-slate-300" : "text-slate-600"}>
                    Access to medication schedules and dosage logs is restricted strictly to your authenticated session ID.
                  </li>
                </ul>
              </section>

              {/* Section 6: Infrastructure Hardening */}
              <section
                id="infrastructure"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-sky/15 text-brand-sky flex items-center justify-center font-bold">
                    <Server className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    6. Threat Shield & API Hardening
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      isDark ? "bg-[#07090e]/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-brand-sky mb-1">Helmet Header Protection</div>
                    <p className="text-slate-400">Enforces CSP, X-Frame-Options (anti-clickjacking), and disables MIME-type sniffing.</p>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      isDark ? "bg-[#07090e]/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-brand-sky mb-1">NoSQL Injection Defense</div>
                    <p className="text-slate-400">All MongoDB queries utilize strictly-typed Mongoose ORM models with input sanitization.</p>
                  </div>
                </div>
              </section>

              {/* Section 7: Disaster Recovery */}
              <section
                id="backup-recovery"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark ? "bg-[#0e131f]/70 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    7. Disaster Recovery & Snapshot Protocols
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  We maintain automated, encrypted daily and hourly snapshots with automated point-in-time recovery to guarantee zero data loss in the event of hardware or cluster failovers.
                </p>
              </section>

              {/* Section 8: Vulnerability Disclosure */}
              <section
                id="vulnerability-disclosure"
                className={`scroll-mt-28 sm:scroll-mt-32 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
                  isDark
                    ? "bg-gradient-to-r from-[#0e131f] to-emerald-500/10 border-emerald-500/30"
                    : "bg-gradient-to-r from-white to-emerald-50/50 border-emerald-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <Bug className="w-5 h-5 text-emerald-400" />
                  <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    8. Vulnerability Disclosure & Bug Bounty
                  </h2>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  We welcome responsible disclosure from security researchers. If you discover a potential vulnerability, please report it directly to our security response team:
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:security@lifeos.ai"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25 hover:opacity-95 transition-all"
                  >
                    <span>Submit Security Report</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/privacy"
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Review Privacy Policy
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
