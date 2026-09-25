import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import LifeScoreOrb from "./LifeScoreOrb";
import SpotlightInput from "./SpotlightInput";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Play,
  Pause,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Volume2,
  Brain,
  Flame,
  Droplets,
} from "lucide-react";

export default function HeroSection() {
  const { isDark } = useTheme();

  // Dynamic rotating headline keywords
  const rotatingWords = ["Career Velocity", "Deep Learning", "Peak Wellness", "Life Mastery"];
  const [wordIndex, setWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState("opacity-100 translate-y-0");

  // Mouse spotlight aura coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive Mini Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState("opacity-0 -translate-y-2");
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setFadeState("opacity-100 translate-y-0");
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative pt-24 pb-20 md:pt-28 md:pb-24 overflow-hidden select-none"
    >
      {/* Interactive Mouse Follow Glow Aura */}
      <div
        className="pointer-events-none absolute -inset-px opacity-35 transition-opacity duration-300 blur-3xl hidden md:block"
        style={{
          background: isDark
            ? `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.22), rgba(14, 165, 233, 0.12), transparent 70%)`
            : `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.14), rgba(236, 72, 153, 0.08), transparent 70%)`,
        }}
      />

      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[520px] rounded-full blur-[140px] opacity-40 animate-pulse-glow ${
            isDark
              ? "bg-gradient-to-tr from-brand-indigo via-brand-sky to-brand-purple"
              : "bg-gradient-to-tr from-brand-indigo/30 via-brand-sky/20 to-pink-200/50"
          }`}
        />
        <div
          className={`absolute top-1/3 -left-40 w-[500px] h-[400px] rounded-full blur-[130px] opacity-30 ${
            isDark ? "bg-emerald-500/20" : "bg-sky-200/40"
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Animated Dynamic Headline, Subtitle, CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1
              className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Stop Juggling Apps.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light">
                One OS For Your
              </span>
              <br />
              <span
                className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-sky via-brand-indigo to-purple-400 transition-all duration-300 font-extrabold ${fadeState}`}
              >
                {rotatingWords[wordIndex]}.
              </span>
            </h1>

            <p
              className={`mt-6 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              LifeOS seamlessly unifies your <strong>Career Roadmaps</strong>, <strong>Voice Mock Interviews</strong>, <strong>Active Study Plans</strong>, and <strong>Health & Sleep tracking</strong> into an interconnected 0–100 Life Score engine with proactive AI assistance.
            </p>

            {/* Action Buttons with Micro-Glow */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light hover:opacity-95 shadow-xl shadow-brand-indigo/35 hover:shadow-brand-indigo/55 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
              >
                <span>Start Your LifeOS Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#sandbox"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  isDark
                    ? "text-slate-200 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                    : "text-slate-800 border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                }`}
              >
                <Play className="w-4 h-4 text-brand-sky fill-brand-sky/20" />
                <span>Explore Live Demo</span>
              </a>
            </div>

            {/* Key Value Micro Chips */}
            <div className="mt-8 pt-6 border-t border-slate-700/20 dark:border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Easier your life</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-sky/10 border border-brand-sky/20 text-brand-sky">
                <Brain className="w-3.5 h-3.5" />
                <span>Zero AI Hallucination</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo">
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Cross-Module Bridges</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive LifeScore Orb + Surrounding Orbit Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Live Interactive Orbit Mini Card: Streak & Water */}
            <div
              className={`hidden sm:flex absolute -top-8 right-2 z-30 items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl shadow-xl transition-transform hover:scale-105 duration-300 animate-float ${
                isDark ? "bg-[#0e131f]/90 border-slate-700/80 text-white" : "bg-white/90 border-slate-200 text-slate-900"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-black">
                <Flame className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400">Consistency Streak</span>
                <span className="text-xs font-black text-purple-400">🔥 14 Days Active (+4.5 Score)</span>
              </div>
            </div>

            {/* 3D Canvas Orb */}
            <LifeScoreOrb />

            {/* Live Interactive Orbit Mini Card: Hydration */}
            <div
              className={`hidden sm:flex absolute -bottom-6 right-6 z-30 items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl shadow-xl transition-transform hover:scale-105 duration-300 animate-float ${
                isDark ? "bg-[#0e131f]/90 border-slate-700/80 text-white" : "bg-white/90 border-slate-200 text-slate-900"
              }`}
              style={{ animationDelay: "2.5s" }}
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-black">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400">Hydration Logger</span>
                <span className="text-xs font-black text-sky-500">1,750ml / 2,000ml</span>
              </div>
            </div>
          </div>
        </div>

        {/* macOS Spotlight Command Bar */}
        <SpotlightInput />

        {/* Live Metrics HUD Strip with Dynamic Hover Elevation */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            {
              label: "Goals & Blueprints Shipped",
              value: "14,800+",
              sub: "Over 850 active weekly roadmaps",
              icon: Zap,
              color: "text-brand-sky",
              borderGlow: "hover:border-brand-sky/50",
            },
            {
              label: "Verified Skill Badges Earned",
              value: "9,240+",
              sub: "80%+ Quiz Mastery required",
              icon: Award,
              color: "text-purple-400",
              borderGlow: "hover:border-purple-400/50",
            },
            {
              label: "Mock Interview Sessions",
              value: "32,500+",
              sub: "Voice audio & diagnostic radar",
              icon: Users,
              color: "text-brand-indigo",
              borderGlow: "hover:border-brand-indigo/50",
            },
            {
              label: "Avg Life Score Increase",
              value: "+28.4%",
              sub: "Health, study & career combined",
              icon: TrendingUp,
              color: "text-emerald-400",
              borderGlow: "hover:border-emerald-400/50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-4 sm:p-5 rounded-2xl border text-center transition-all duration-300 hover:scale-105 group cursor-default ${
                isDark
                  ? `bg-[#0e131f]/70 border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${stat.borderGlow}`
                  : `bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(99,102,241,0.05)] ${stat.borderGlow}`
              }`}
            >
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color} transition-transform group-hover:scale-110`} />
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
