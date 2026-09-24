import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SkillCelebrationModal({
  isOpen,
  onClose,
  badge = {
    skill: "React.js",
    subCompetency: "Component Architecture & State",
    score: 90,
    date: new Date(),
    badgeId: `verified_${Date.now()}`
  },
  onBuildActionPlan
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
    } else {
      setAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen || !badge) return null;

  const scorePct = badge.score || 85;
  const skillTitle = badge.skill || "Technical Competency";
  const verifiedDate = badge.date
    ? new Date(badge.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  const handleCopyProof = () => {
    const proofText = `🛡️ Verified Skill Credential: ${skillTitle} (${scorePct}% Mastery)\nIssued by LifeOS AI Verification Engine on ${verifiedDate}\nCredential ID: ${badge.badgeId || "LOS-VERIFIED-" + Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    navigator.clipboard.writeText(proofText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateActionPlan = () => {
    if (onBuildActionPlan) {
      onBuildActionPlan(skillTitle);
    } else {
      onClose();
      navigate("/learning/action-plan", {
        state: {
          goal: `Build a production-grade portfolio project using ${skillTitle}`,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Dynamic Confetti & Sparkles Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Animated Background Confetti Particles */}
        <div className="absolute w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse -top-10 -left-10" />
        <div className="absolute w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse -bottom-10 -right-10" />
        <div className="absolute w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-indigo-200/80 shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6 animate-scaleUp z-10">
        {/* Top Header */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider animate-bounce">
            <span>🎉</span> Official Skill Verification
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Congratulations!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You successfully passed the assessment and unlocked an official LifeOS Competency Badge.
          </p>
        </div>

        {/* 3D Holographic Metallic Badge Card */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 text-white shadow-xl border-2 border-indigo-400/40 overflow-hidden transform transition hover:scale-[1.02] duration-300">
          {/* Holographic Sheen Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer pointer-events-none" />

          {/* Decorative Corner Accents */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-indigo-300/60 uppercase tracking-widest">
            LIFEOS • VERIFIED
          </div>
          <div className="absolute top-3 right-3 text-amber-400 text-sm">
            ✨
          </div>

          <div className="space-y-3 py-2">
            {/* Badge Icon Emblem */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-slate-900 flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/10">
              🛡️
            </div>

            <div className="space-y-0.5">
              <h4 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {skillTitle}
              </h4>
              <p className="text-xs font-medium text-sky-200">
                {badge.subCompetency || "Verified Domain Specialist"}
              </p>
            </div>

            {/* Score Pill & Verified Seal */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold font-mono">
                ⭐ {scorePct}% Mastery
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-semibold">
                Issued {verifiedDate}
              </span>
            </div>
          </div>

          {/* Bottom Certified Ribbon */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Official LifeOS Proof</span>
            <span className="font-mono text-indigo-300">ID: {badge.badgeId ? badge.badgeId.slice(0, 12) : "LOS-" + Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
          </div>
        </div>

        {/* Life Score Points Reward Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                +40 Learning Points Awarded
              </p>
              <p className="text-[11px] text-emerald-700">
                Daily Life Score updated & Skill added to your Profile.
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-600 font-mono">
            +40 pts
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleCopyProof}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <span className="text-emerald-600">✓</span>
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy Verification</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCreateActionPlan}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]"
            >
              <span>🚀 Build Action Plan ➔</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
