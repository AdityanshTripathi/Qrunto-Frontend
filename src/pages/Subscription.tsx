import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, Sparkles, Percent, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  price6Month: number;
  price1Year: number;
  durationDays: number;
  maxTables: number;
  maxMenuItems: number;
  featuresJson: string[];
}

export const Subscription: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingPlan, setSelectingPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | '6month' | 'yearly'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const promoApplied = false;
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans');
        setPlans(res.plans);
      } catch (err: any) {
        toast.error('Failed to load subscription plans: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectingPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleApplyPromo = () => {
    toast.error('Online purchases are unavailable. Redeem an existing license in dashboard billing.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] via-[#1f2937] to-[#111827] text-white py-20 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FF6B35]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/25 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Simple Pricing, Cancel Anytime
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-gray-400 bg-clip-text text-transparent">
            Choose the Perfect Plan
          </h1>
          <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto mt-4">
            Select a plan that fits your restaurant scale. Upgrade, downgrade, or cancel whenever you need.
          </p>
        </div>

        {/* Promo Code Box */}
        <div className="max-w-md mx-auto mb-16 bg-[#1f2937]/30 border border-[#374151]/40 rounded-2xl p-5 flex gap-3 items-center backdrop-blur-md">
          <div className="bg-[#FF6B35]/10 p-2.5 rounded-xl text-[#FF6B35]">
            <Percent className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Existing licenses can be redeemed in billing"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={promoApplied}
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none disabled:text-gray-400"
            />
          </div>
          <button
            onClick={handleApplyPromo}
            disabled={promoApplied}
            className="px-4 py-2 bg-[#374151] hover:bg-[#4b5563] disabled:bg-[#FF6B35]/20 disabled:text-[#FF6B35] font-semibold text-xs rounded-xl transition-all"
          >
            {promoApplied ? 'Applied' : 'Apply'}
          </button>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#1f2937]/50 border border-[#374151]/60 p-1 rounded-2xl flex items-center backdrop-blur-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#FF6B35] text-white shadow-md'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('6month')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === '6month'
                  ? 'bg-[#FF6B35] text-white shadow-md'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              6 Months
              <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">
                Save
              </span>
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#FF6B35] text-white shadow-md'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              1 Year
              <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">
                Best Value
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isProfessional = plan.name === 'Professional';
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between bg-[#1f2937]/35 border ${
                  isProfessional
                    ? 'border-[#FF6B35] shadow-2xl shadow-[#FF6B35]/10 md:-translate-y-4'
                    : 'border-[#374151]/50 shadow-lg'
                } rounded-[28px] p-8 backdrop-blur-md transition-all hover:scale-[1.02] duration-300`}
              >
                {isProfessional && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#FF6B35] to-orange-400 text-white text-xs font-bold rounded-full shadow-md uppercase tracking-wider">
                    Recommended
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-100">{plan.name} Plan</h3>
                  {(() => {
                    let displayPrice = plan.price;
                    let displayDuration = `${plan.durationDays} days`;
                    let savingText = '';
                    
                    if (billingCycle === '6month') {
                      displayPrice = plan.price6Month || (plan.price * 6);
                      displayDuration = '6 months';
                      const monthlyEquivalent = displayPrice / 6;
                      const savingsPercent = Math.round(((plan.price * 6 - displayPrice) / (plan.price * 6)) * 100);
                      if (savingsPercent > 0) {
                        savingText = `₹${Math.round(monthlyEquivalent)}/mo · Save ${savingsPercent}%`;
                      }
                    } else if (billingCycle === 'yearly') {
                      displayPrice = plan.price1Year || (plan.price * 12);
                      displayDuration = '1 year';
                      const monthlyEquivalent = displayPrice / 12;
                      const savingsPercent = Math.round(((plan.price * 12 - displayPrice) / (plan.price * 12)) * 100);
                      if (savingsPercent > 0) {
                        savingText = `₹${Math.round(monthlyEquivalent)}/mo · Save ${savingsPercent}%`;
                      }
                    }

                    return (
                      <div className="space-y-1 mt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold tracking-tight">
                            {promoApplied ? '₹0' : `₹${displayPrice}`}
                          </span>
                          <span className="text-[#9ca3af] text-sm">/ {displayDuration}</span>
                        </div>
                        {savingText && !promoApplied && (
                          <span className="text-xs text-emerald-400 font-bold block">
                            {savingText}
                          </span>
                        )}
                        {promoApplied && (
                          <span className="text-xs text-[#22C55E] font-medium block line-through text-gray-500">
                            Was ₹{displayPrice}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  <p className="text-sm text-[#9ca3af] mt-4">
                    Ideal for {plan.name === 'Starter' ? 'small kiosks & cafes' : plan.name === 'Professional' ? 'mid-sized restaurants' : 'high-volume dining chains'}.
                  </p>

                  <div className="border-t border-[#374151]/50 my-6"></div>

                  <ul className="space-y-4">
                    {Array.isArray(plan.featuresJson) &&
                      plan.featuresJson.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-[#d1d5db]">
                          <span className="bg-[#22C55E]/10 text-[#22C55E] p-0.5 rounded-full mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full font-bold rounded-[16px] py-4 px-4 flex items-center justify-center gap-2 transition-all ${
                      isProfessional
                        ? 'bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-lg hover:shadow-orange-600/20'
                        : 'bg-[#374151] hover:bg-[#4b5563] text-white'
                    }`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAYMENT MODAL OVERLAY */}
      {isCheckoutOpen && selectingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div role="dialog" aria-label="Subscription purchase unavailable" className="max-w-md rounded-2xl bg-[#1f2937] p-6 space-y-4">
            <button aria-label="Close" onClick={() => setIsCheckoutOpen(false)} className="float-right"><X /></button>
            <h3 className="font-bold">{selectingPlan.name}</h3>
            <p>Online subscription purchases are unavailable. Contact support for activation, or redeem an existing license in dashboard billing.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
