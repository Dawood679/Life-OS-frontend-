import React, { useState } from 'react';
import { useUpgradeModalStore } from '../store/upgradeModalStore';
import useAuthStore from '../lib/authStore';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Zap, 
  Crown, 
  ShieldCheck, 
  ArrowRight, 
  Lock,
  Mic,
  Calendar,
  Brain,
  Layers
} from 'lucide-react';

export default function UpgradeModal() {
  const { isOpen, feature, title, description, closeUpgradeModal } = useUpgradeModalStore();
  const { user } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState(null);

  if (!isOpen) return null;

  const handleSubscribe = async (planId) => {
    try {
      setLoadingPlan(planId);

      const res = await axiosInstance.post('/payments/create-checkout-session', {
        plan: planId,
        planId: planId // 'pro_monthly' or 'pro_yearly'
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else if (res.data?.simulated || res.data?.mode === 'simulation') {
        toast.success(res.data.message || 'VIP Subscription Activated!');
        closeUpgradeModal();
        window.location.reload();
      } else {
        toast.error('Unable to initiate checkout. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Payment initiation failed.';
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const featureHighlights = [
    { icon: Mic, label: 'Unlimited AI Mock Interviews with Live Voice' },
    { icon: Calendar, label: 'Full 90-Day Career Blueprint (All 3 Phases)' },
    { icon: Brain, label: 'AI Human EA & Burnout Rescheduler' },
    { icon: Layers, label: 'Unlimited Verified Skill Ledger Certifications' },
    { icon: ShieldCheck, label: 'Dense 16-Column Job Pipeline & Resume Matcher' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-2xl bg-slate-900/95 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden text-slate-100 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeUpgradeModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>VIP SUPERPOWERS UNLOCKED</span>
          </div>
        </div>

        {/* Dynamic Title & Subtitle */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-sm md:text-base text-slate-300 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Value Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          {featureHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2 text-xs md:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* 2 Plan Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Option 1: Monthly Subscription */}
          <div className="relative p-5 rounded-2xl bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Monthly Pro
                </span>
                <span className="text-xs text-slate-400">Cancel anytime</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold text-white">$19</span>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Full-spectrum AI automation billed month-to-month.
              </p>
            </div>

            <button
              onClick={() => handleSubscribe('pro_monthly')}
              disabled={loadingPlan !== null}
              className="w-full py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loadingPlan === 'pro_monthly' ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Start Monthly Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Option 2: 1-Year Pass (Featured) */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-800/90 to-slate-800/90 border-2 border-amber-500/50 hover:border-amber-400 transition-all flex flex-col justify-between shadow-lg shadow-amber-500/5">
            {/* Best Value Ribbon */}
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
              BEST VALUE • SAVE $48
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> 1-Year Access Pass
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  1-Time Pay
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold text-amber-300">$180</span>
                <span className="text-xs text-slate-400 font-medium">/ 365 days</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                365 days of unrestricted VIP access. Zero unexpected renewals.
              </p>
            </div>

            <button
              onClick={() => handleSubscribe('pro_yearly')}
              disabled={loadingPlan !== null}
              className="w-full py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loadingPlan === 'pro_yearly' ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Claim 1-Year Pass ($180)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Trust Guarantee */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Stripe Checkout</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant VIP Activation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
