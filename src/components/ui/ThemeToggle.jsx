import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ variant = "default", className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer select-none active:scale-95 ${
          isDark
            ? "bg-slate-800/90 text-amber-300 border border-amber-400/30 hover:bg-slate-800 hover:border-amber-400/60 shadow-xs"
            : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 shadow-xs"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        aria-label="Toggle visual theme mode"
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow transition-transform" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-600 transition-transform rotate-0" />
          )}
        </div>
        <span className="capitalize text-[11px] font-bold tracking-wide">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  // Default compact icon toggle (Perfect for Header, Sidebar footer, Toolbars)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer group active:scale-90 ${
        isDark
          ? "bg-slate-800/80 border-slate-700/80 text-amber-300 hover:text-amber-200 hover:bg-slate-700/80 hover:border-amber-400/40 shadow-xs"
          : "bg-white border-slate-200/90 text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 hover:border-amber-200 shadow-xs"
      } ${className}`}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label="Toggle visual theme mode"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
    </button>
  );
}
