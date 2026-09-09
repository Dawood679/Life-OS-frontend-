import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Compass,
  Layers,
  Zap,
  Activity,
  Award,
} from "lucide-react";

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Ecosystem", href: "#ecosystem", icon: Compass },
    { label: "Bento Features", href: "#features", icon: Layers },
    { label: "Magic Pipeline", href: "#pipeline", icon: Zap },
    { label: "Live Sandbox", href: "#sandbox", icon: Activity },
    { label: "Life Score", href: "#lifescore", icon: Award },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-[#07090e]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            : "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_10px_30px_rgba(99,102,241,0.06)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-indigo via-brand-sky to-brand-sky-light p-0.5 shadow-lg shadow-brand-indigo/25 group-hover:scale-105 transition-transform duration-300">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  isDark ? "bg-[#07090e]" : "bg-white"
                }`}
              >
                <Sparkles className="w-5 h-5 text-brand-sky animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xl font-extrabold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light">OS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
                  v2.5
                </span>
              </div>
              <span className={`text-[11px] font-medium tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Universal AI Life System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md bg-white/[0.03] dark:bg-white/[0.02]">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isDark
                    ? "text-slate-300 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-3.5 h-3.5 text-brand-sky" />
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Section: Theme Switcher & Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark and light mode"
              className={`relative p-2.5 rounded-xl border transition-all duration-300 group cursor-pointer ${
                isDark
                  ? "bg-slate-900/80 border-slate-700/60 text-amber-300 hover:bg-slate-800 hover:border-amber-400/40 hover:shadow-[0_0_15px_rgba(252,211,77,0.25)]"
                  : "bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-brand-indigo hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 transition-transform duration-500 rotate-0 group-hover:rotate-90 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-500 -rotate-12 group-hover:rotate-0 text-brand-indigo" />
              )}
            </button>

            {/* Login Link */}
            <Link
              to="/login"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                isDark
                  ? "text-slate-200 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                  : "text-slate-700 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm"
              }`}
            >
              Sign In
            </Link>

            {/* Get Started CTA */}
            <Link
              to="/register"
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light hover:opacity-95 shadow-md shadow-brand-indigo/30 hover:shadow-brand-indigo/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-800 text-amber-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className={`sm:hidden px-4 pt-2 pb-6 border-b transition-all ${
            isDark ? "bg-[#07090e]/95 border-slate-800 backdrop-blur-xl" : "bg-white/95 border-slate-200 backdrop-blur-xl"
          }`}
        >
          <div className="flex flex-col gap-2 py-3">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isDark ? "text-slate-200 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-4 h-4 text-brand-sky" />
                {item.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-700/30 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full py-2.5 text-center rounded-xl text-sm font-semibold border ${
                  isDark ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-800 bg-slate-50"
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light shadow-md shadow-brand-indigo/30"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
