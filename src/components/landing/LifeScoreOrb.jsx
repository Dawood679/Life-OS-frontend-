import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sparkles, Activity, ShieldCheck, Zap, TrendingUp } from "lucide-react";

export default function LifeScoreOrb() {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(88.4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = 440);
    let height = (canvas.height = 440);

    // Generate 3D sphere particles
    const particleCount = 110;
    const particles = [];
    const radius = 135;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        baseRadius: Math.random() * 2.2 + 1.2,
        colorType: i % 3 === 0 ? "indigo" : i % 3 === 1 ? "sky" : "emerald",
      });
    }

    let angleX = 0.003;
    let angleY = 0.005;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Soft mouse influence
      const targetAngleY = mousePos.x * 0.0005 + 0.006;
      const targetAngleX = mousePos.y * 0.0005 + 0.004;
      angleY += (targetAngleY - angleY) * 0.05;
      angleX += (targetAngleX - angleX) * 0.05;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Rotate and draw particles
      particles.forEach((p) => {
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        const fov = 350;
        const scale = fov / (fov + z2);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;
        const alpha = Math.max(0.15, Math.min(1, (z2 + radius) / (2 * radius)));

        ctx.beginPath();
        ctx.arc(px, py, p.baseRadius * scale, 0, Math.PI * 2);

        if (p.colorType === "indigo") {
          ctx.fillStyle = isDark
            ? `rgba(99, 102, 241, ${alpha * 0.9})`
            : `rgba(79, 70, 229, ${alpha * 0.85})`;
        } else if (p.colorType === "sky") {
          ctx.fillStyle = isDark
            ? `rgba(14, 165, 233, ${alpha * 0.9})`
            : `rgba(2, 132, 199, ${alpha * 0.85})`;
        } else {
          ctx.fillStyle = isDark
            ? `rgba(16, 185, 129, ${alpha * 0.9})`
            : `rgba(5, 150, 105, ${alpha * 0.85})`;
        }
        ctx.fill();
      });

      // Glowing orbital ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Date.now() * 0.0004);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius + 20, (radius + 20) * 0.35, Math.PI / 6, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? "rgba(99, 102, 241, 0.28)" : "rgba(99, 102, 241, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark, mousePos]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x, y });
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 3D Orb Main Container */}
      <div
        onMouseMove={handleMouseMove}
        className="relative flex items-center justify-center group my-2 sm:my-4"
      >
        {/* Background Radial Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl opacity-60 transition-opacity duration-700 pointer-events-none ${
            isDark
              ? "bg-gradient-to-tr from-brand-indigo/30 via-brand-sky/20 to-brand-emerald/15"
              : "bg-gradient-to-tr from-brand-indigo/20 via-brand-sky/15 to-pink-200/40"
          }`}
        />

        {/* 3D Particle Canvas with dynamic viewport sizing */}
        <canvas
          ref={canvasRef}
          className="w-[270px] h-[270px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] relative z-10 cursor-grab active:cursor-grabbing"
        />

        {/* Central Glass HUD Sphere */}
        <div className="absolute inset-0 m-auto w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full z-20 flex flex-col items-center justify-center text-center backdrop-blur-md transition-all duration-300 pointer-events-none">
          <div
            className={`w-full h-full rounded-full flex flex-col items-center justify-center p-4 sm:p-6 border shadow-2xl transition-all ${
              isDark
                ? "bg-[#07090e]/85 border-brand-indigo/30 shadow-[0_0_45px_rgba(99,102,241,0.35)]"
                : "bg-white/90 border-brand-indigo/20 shadow-[0_20px_45px_rgba(99,102,241,0.18)]"
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-sky mb-0.5 sm:mb-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
              <span>Universal Score</span>
            </div>

            <div className="flex items-baseline justify-center gap-0.5 my-0.5">
              <span
                className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {score}
              </span>
              <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-400">/100</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[9px] sm:text-[10px] font-bold mt-0.5">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>+3.8% this week</span>
            </div>

            <span className={`text-[9px] sm:text-[10px] font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Balanced Focus Mode
            </span>
          </div>
        </div>

        {/* DESKTOP / TABLET Floating Micro-Pills (Visible on sm: and up) */}
        {/* Floating Pill 1: Learning */}
        <div
          className={`hidden sm:flex absolute -top-4 -left-2 md:-top-6 md:-left-4 z-30 items-center gap-2 px-3.5 py-2 rounded-2xl border backdrop-blur-xl shadow-lg transition-transform duration-300 animate-float ${
            isDark
              ? "bg-[#0e131f]/90 border-brand-indigo/40 text-white"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-indigo-100"
          }`}
        >
          <div className="w-7 h-7 rounded-xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center font-bold text-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400">LearningOS (40%)</span>
            <span className="text-xs font-bold text-brand-indigo">90-Day Roadmap Active</span>
          </div>
        </div>

        {/* Floating Pill 2: Health */}
        <div
          className={`hidden sm:flex absolute -bottom-4 -left-2 md:-bottom-6 md:-left-4 z-30 items-center gap-2 px-3.5 py-2 rounded-2xl border backdrop-blur-xl shadow-lg transition-transform duration-300 animate-float ${
            isDark
              ? "bg-[#0e131f]/90 border-emerald-500/40 text-white"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-emerald-100"
          }`}
          style={{ animationDelay: "2s" }}
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400">HealthOS (35%)</span>
            <span className="text-xs font-bold text-emerald-500">7.8h Sleep · Rested</span>
          </div>
        </div>

        {/* Floating Pill 3: Verified Badge */}
        <div
          className={`hidden sm:flex absolute top-1/2 -right-6 md:-right-10 -translate-y-1/2 z-30 items-center gap-2 px-3.5 py-2 rounded-2xl border backdrop-blur-xl shadow-lg transition-transform duration-300 animate-float ${
            isDark
              ? "bg-[#0e131f]/90 border-purple-500/40 text-white"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-purple-100"
          }`}
          style={{ animationDelay: "3.5s" }}
        >
          <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400">Verified Ledger</span>
            <span className="text-xs font-bold text-purple-400">React Architect (88%)</span>
          </div>
        </div>
      </div>

      {/* MOBILE ONLY (screen < sm) Responsive Badge Deck - Cleanly stacked without any overlapping! */}
      <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 w-full px-2 mt-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-semibold ${
            isDark ? "bg-[#0e131f]/80 border-brand-indigo/30 text-slate-200" : "bg-white/90 border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-brand-indigo" />
          <span>LearningOS (40%) · Roadmap</span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-semibold ${
            isDark ? "bg-[#0e131f]/80 border-emerald-500/30 text-slate-200" : "bg-white/90 border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>HealthOS (35%) · 7.8h Sleep</span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-semibold ${
            isDark ? "bg-[#0e131f]/80 border-purple-500/30 text-slate-200" : "bg-white/90 border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Verified Badge · React Architect</span>
        </div>
      </div>
    </div>
  );
}
