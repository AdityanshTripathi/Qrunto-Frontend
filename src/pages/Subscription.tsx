import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxTables: number;
  maxMenuItems: number;
  featuresJson: string[];
}

export const Subscription: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingPlanId, setSelectingPlanId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const navigate = useNavigate();

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

  const handleSelectPlan = async (planId: string) => {
    setSelectingPlanId(planId);
    try {
      // Create pending subscription session on the backend
      await api.post('/subscriptions', { planId });
      
      toast.success('Subscription plan selected successfully!');
      
      // Simulate Payment redirection (mock payments for Phase 4)
      toast.info('Simulating payment gateway redirect...');
      
      setTimeout(() => {
        toast.success('Mock payment successful! Workspace created.');
        navigate('/dashboard'); // Will lead to dashboard in next phase
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to select subscription plan');
      setSelectingPlanId(null);
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    
    // Simulate promo codes for Phase 4
    if (promoCode.toUpperCase() === 'FREE30' || promoCode.toUpperCase() === 'FIRST100') {
      setPromoApplied(true);
      toast.success('Promo code applied! 100% discount on first month.');
    } else {
      toast.error('Invalid or expired promo code');
    }
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
              placeholder="Have a promo code? (e.g., FREE30)"
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
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {promoApplied ? '₹0' : `₹${plan.price}`}
                    </span>
                    <span className="text-[#9ca3af] text-sm">/ {plan.durationDays} days</span>
                  </div>
                  {promoApplied && (
                    <span className="text-xs text-[#22C55E] font-medium block mt-1 line-through text-gray-500">
                      Was ₹{plan.price}
                    </span>
                  )}
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
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={selectingPlanId !== null}
                    className={`w-full font-bold rounded-[16px] py-4 px-4 flex items-center justify-center gap-2 transition-all ${
                      isProfessional
                        ? 'bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-lg hover:shadow-orange-600/20'
                        : 'bg-[#374151] hover:bg-[#4b5563] text-white'
                    }`}
                  >
                    {selectingPlanId === plan.id ? 'Processing...' : 'Get Started'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
