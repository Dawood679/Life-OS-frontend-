import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Lock,
  RefreshCw,
  Crown,
} from "lucide-react";

export default function PricingSection() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (planKey) => {
    setLoadingPlan(planKey);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ plan: planKey }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.requireAuth) {
          toast(data.message || "Please sign in or register to subscribe.", { icon: "🔒" });
          navigate("/login", {
            state: { message: "Please sign in or register to complete your subscription." }
          });
          return;
        }
        toast.error(data.message || "Failed to initiate Stripe checkout");
        return;
      }

      if (data.url) {
        if (data.mode === "stripe") {
          toast.success("Redirecting to secure Stripe Checkout...");
        } else {
          toast.success(data.message || "Redirecting...");
        }
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      toast.error("Unable to connect to Stripe. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const cards = [
    {
      id: "starter",
      title: "Starter",
      badge: "Free Forever",
      price: "$0",
      period: "forever",
      subtext: "Free forever, no credit card required",
      description: "Essential life telemetry, morning briefings, and personal AI guidance.",
      features: [
        "Core Life Score & Energy Tracking",
        "1 AI Study Plan & Roadmap / week",
        "Daily Morning Briefing & Todo Matrix",
        "Standard Groq Fallback Engine",
        "Universal Focus Mode (Balanced)",
        "Single-device Web Sync",
      ],
      isPopular: false,
      isBestValue: false,
      isFree: true,
      ctaText: "Get Started Free",
      href: "/register",
    },
    {
      id: "monthly",
      title: "Monthly Payment",
      badge: "Flexible Subscription",
      price: "$19",
      period: "/ month",
      subtext: "Billed $19 monthly • Cancel anytime",
      description: "Full-spectrum autonomous AI power with month-to-month flexibility.",
      features: [
        "Unlimited AI Copilot & Deep Reasoning",
        "Sub-second Gemini 2.5 Flash + Groq 3.3 Engine",
        "Prescription Scanner & Health OCR",
        "Resume Analyzer & Automated Job Tracker",
        "Proactive 'Human EA' Burnout Guardian",
        "Code Reviewer & Project Generator",
        "Standard Priority Support",
      ],
      isPopular: false,
      isBestValue: false,
      isFree: false,
      ctaText: "Subscribe Monthly ($19/mo)",
      planKey: "pro_monthly",
    },
    {
      id: "yearly",
      title: "Yearly Payment",
      badge: "1-Year Full Pass • Best Value",
      price: "$180",
      period: "one-time / 1 year access",
      subtext: "Pay $180 once • Full 365 days access • No auto-renewal surprises",
      description: "1 full year of unrestricted AI power. After 1 year, choose to renew monthly or yearly.",
      features: [
        "Full 365 Days Unrestricted Pro Access",
        "Equal to $15/month (Save $48 compared to monthly)",
        "Zero auto-renewal surprise charges",
        "Priority Zero-Queue AI Engine Access",
        "Prescription Scanner & Health OCR",
        "Resume Analyzer & Automated Job Tracker",
        "VIP Early Access to new Gemini models",
      ],
      isPopular: true,
      isBestValue: true,
      isFree: false,
      ctaText: "Get 1-Year Full Pass ($180)",
      planKey: "yearly_pass",
    },
  ];

  return (
    <section
      id="pricing"
      className={`py-24 relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-[#07090e]" : "bg-gradient-to-b from-white via-slate-50 to-white"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-indigo/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-indigo/30 bg-brand-indigo/5 text-brand-indigo text-xs font-bold tracking-wide uppercase mb-4">
            <CreditCard className="w-3.5 h-3.5 text-brand-sky" />
            <span>Simple, Transparent Plans</span>
          </div>

          <h2
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light">
              Payment Plan
            </span>
          </h2>

          <p
            className={`text-base sm:text-lg leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Select between free Starter, flexible Monthly, or high-savings Yearly membership.
            All paid plans are powered by secure Stripe checkout.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                card.isBestValue
                  ? isDark
                    ? "bg-gradient-to-b from-[#131726] to-[#0d101c] border-2 border-brand-indigo shadow-[0_0_50px_rgba(99,102,241,0.25)] lg:-translate-y-2"
                    : "bg-white border-2 border-brand-indigo shadow-2xl shadow-brand-indigo/15 lg:-translate-y-2"
                  : isDark
                  ? "bg-[#0b0e17] border border-white/10 hover:border-white/20"
                  : "bg-white/90 border border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-200/50"
              }`}
            >
              {/* Badge Ribbon */}
              {card.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md ${
                      card.isBestValue
                        ? "bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light text-white"
                        : isDark
                        ? "bg-slate-800 text-slate-300 border border-white/10"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {card.title}
                  </h3>
                  {card.isBestValue ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-brand-sky opacity-80" />
                  )}
                </div>

                <p
                  className={`text-xs leading-relaxed min-h-[36px] mb-6 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {card.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl sm:text-5xl font-black tracking-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {card.price}
                    </span>
                    {card.period && (
                      <span
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {card.period}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] block mt-1 font-medium ${
                      card.isBestValue
                        ? "text-emerald-400 font-semibold"
                        : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {card.subtext}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span
                    className={`text-[11px] uppercase tracking-wider font-bold block ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    What's included:
                  </span>
                  {card.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-0.5 ${
                          card.isBestValue
                            ? "bg-brand-indigo/20 text-brand-sky"
                            : isDark
                            ? "bg-slate-800 text-slate-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-xs leading-snug ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {card.isFree ? (
                  <Link
                    to={card.href}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 border transition-all duration-200 ${
                      isDark
                        ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        : "border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-sm"
                    }`}
                  >
                    <span>{card.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(card.planKey)}
                    disabled={loadingPlan === card.planKey}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                      card.isBestValue
                        ? "bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light text-white shadow-brand-indigo/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
                        : isDark
                        ? "border border-brand-indigo/40 bg-brand-indigo/20 text-white hover:bg-brand-indigo/30 hover:scale-[1.02] active:scale-[0.98]"
                        : "border-2 border-brand-indigo bg-brand-indigo text-white hover:bg-brand-indigo/90 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {loadingPlan === card.planKey ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting to Stripe...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 opacity-80" />
                        <span>{card.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Security & Guarantee Trust Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted Stripe Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-sky" />
            <span>Instant AI Engine Provisioning</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-brand-indigo" />
            <span>14-Day Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
