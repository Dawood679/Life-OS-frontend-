import React from "react";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import BentoGrid from "../components/landing/BentoGrid";
import MagicPipeline from "../components/landing/MagicPipeline";
import InteractiveSandbox from "../components/landing/InteractiveSandbox";
import HumanEAShowcase from "../components/landing/HumanEAShowcase";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 relative overflow-x-hidden ${
        isDark
          ? "bg-[#07090e] text-slate-100 bg-grid-pattern-dark"
          : "bg-[#fdf2f8]/30 text-slate-800 bg-grid-pattern-light"
      }`}
    >
      {/* Dynamic Glassmorphic Navbar */}
      <Navbar />

      {/* Main Sections Assembly */}
      <main>
        {/* 1. Hero Section (with 3D Canvas Orb & Spotlight Command Bar) */}
        <HeroSection />

        {/* 2. Bento Grid 2.0 (LearningOS, CareerOS, HealthOS, Verified Ledger) */}
        <div id="ecosystem">
          <BentoGrid />
        </div>

        {/* 3. The 1-Click Magic Pipeline (Cross-Module Workflow Showcase) */}
        <MagicPipeline />

        {/* 4. Live Focus Mode Sandbox (Interactive Algorithm Recalculation) */}
        <InteractiveSandbox />

        {/* 5. Proactive "Human EA" Burnout Guard Showcase */}
        <div id="lifescore">
          <HumanEAShowcase />
        </div>

        {/* 6. High-Converting Call to Action Card */}
        <CTASection />
      </main>

      {/* Modern Bento Footer */}
      <Footer />
    </div>
  );
}
