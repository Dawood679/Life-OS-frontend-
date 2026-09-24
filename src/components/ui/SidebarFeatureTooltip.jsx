import React from 'react';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function SidebarFeatureTooltip({ feature, position }) {
  if (!feature || !position) return null;

  // Category-specific styles
  const colorMap = {
    emerald: {
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      dot: 'bg-emerald-400',
      icon: 'text-emerald-400',
      pill: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    },
    indigo: {
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      accent: 'from-indigo-500/20 via-sky-500/10 to-transparent',
      dot: 'bg-indigo-400',
      icon: 'text-indigo-400',
      pill: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
    },
    sky: {
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      accent: 'from-sky-500/20 via-indigo-500/10 to-transparent',
      dot: 'bg-sky-400',
      icon: 'text-sky-400',
      pill: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    },
  };

  const scheme = colorMap[feature.color] || colorMap.indigo;

  // Clamp vertical position so it stays fully inside viewport
  const cardEstimatedHeight = 220;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const topClamped = Math.max(16, Math.min(position.top - 20, viewportHeight - cardEstimatedHeight - 16));

  return (
    <div
      style={{
        top: `${topClamped}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-50 pointer-events-none w-80 transition-all duration-150 ease-out animate-in fade-in zoom-in-95"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-4 text-white shadow-2xl shadow-slate-950/60 ring-1 ring-white/10">
        {/* Subtle Ambient Gradient Glow */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${scheme.accent} rounded-full blur-2xl pointer-events-none`} />

        {/* Header: OS Category Badge & Sub-tag */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${scheme.dot} animate-pulse`} />
            <span className="text-[11px] font-bold tracking-wide uppercase text-slate-300">
              {feature.category}
            </span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${scheme.badge}`}>
            {feature.tag}
          </span>
        </div>

        {/* Feature Title */}
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className={`w-4 h-4 ${scheme.icon} shrink-0`} />
          <h4 className="text-sm font-bold text-white tracking-tight">
            {feature.title}
          </h4>
        </div>

        {/* Short Punchy Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {feature.description}
        </p>

        {/* Feature Highlights */}
        {feature.highlights && feature.highlights.length > 0 && (
          <div className="space-y-1.5 mb-3 bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/40">
            {feature.highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-200">
                <CheckCircle2 className={`w-3.5 h-3.5 ${scheme.icon} shrink-0`} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Life Score Pillar Impact */}
        {feature.pillar && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Life Score Impact:
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded-md border ${scheme.pill}`}>
              {feature.pillar}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
