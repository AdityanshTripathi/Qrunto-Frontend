import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Percent, CreditCard, Smartphone, Copy, CheckCircle, Loader2, X } from 'lucide-react';
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
  const [promoApplied, setPromoApplied] = useState(false);
  
  // Payment Simulator states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedLicenseCode, setGeneratedLicenseCode] = useState<string | null>(null);

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

  const handleSelectPlan = (plan: Plan) => {
    setSelectingPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectingPlan) return;
    setProcessingPayment(true);
    try {
      // Create transaction and generate license code on backend
      let basePrice = selectingPlan.price;
      if (billingCycle === '6month') {
        basePrice = selectingPlan.price6Month || (selectingPlan.price * 6);
      } else if (billingCycle === 'yearly') {
        basePrice = selectingPlan.price1Year || (selectingPlan.price * 12);
      }
      const finalPrice = promoApplied ? 0 : basePrice;
      const durationMonths = billingCycle === '6month' ? 6 : billingCycle === 'yearly' ? 12 : 1;

      const res = await api.post('/subscriptions/purchase', {
        planId: selectingPlan.id,
        paymentMethod: paymentMethod.toUpperCase(),
        amount: finalPrice,
        durationMonths
      });

      setGeneratedLicenseCode(res.code);

      // Auto-redeem the generated license code to activate the subscription immediately
      await api.post('/subscriptions/redeem', { code: res.code });

      setPaymentSuccess(true);
      toast.success('Payment successful & subscription activated!');
    } catch (err: any) {
      toast.error(err.message || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    
    if (promoCode.toUpperCase() === 'FREE30' || promoCode.toUpperCase() === 'FIRST100') {
      setPromoApplied(true);
      toast.success('Promo code applied! 100% discount on first month.');
    } else {
      toast.error('Invalid or expired promo code');
    }
  };

  const copyToClipboard = () => {
    if (generatedLicenseCode) {
      navigator.clipboard.writeText(generatedLicenseCode);
      toast.success('License code copied to clipboard!');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => {
              if (!processingPayment) {
                setIsCheckoutOpen(false);
                setPaymentSuccess(false);
                setGeneratedLicenseCode(null);
              }
            }} 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
          />
          
          <div className="relative w-full max-w-md bg-[#1f2937] border border-[#374151] rounded-[28px] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#111827] px-6 py-5 border-b border-[#374151] flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-white text-base">Qrunto Subscriptions</h3>
                <p className="text-[11px] text-gray-400">Order Ref: SaaS-Plan-Checkout</p>
              </div>
              <button 
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setPaymentSuccess(false);
                  setGeneratedLicenseCode(null);
                }}
                disabled={processingPayment}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Switch */}
            {!paymentSuccess ? (
              <div className="p-6 space-y-6">
                {/* Plan summary */}
                {(() => {
                  let displayPrice = selectingPlan.price;
                  let displayDuration = `${selectingPlan.durationDays} Days`;
                  
                  if (billingCycle === '6month') {
                    displayPrice = selectingPlan.price6Month || (selectingPlan.price * 6);
                    displayDuration = '6 Months (180 Days)';
                  } else if (billingCycle === 'yearly') {
                    displayPrice = selectingPlan.price1Year || (selectingPlan.price * 12);
                    displayDuration = '1 Year (365 Days)';
                  }

                  return (
                    <div className="bg-[#111827]/40 border border-[#374151]/55 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{selectingPlan.name} Plan</h4>
                        <p className="text-xs text-gray-400">{displayDuration} Duration</p>
                      </div>
                      <span className="text-[#FF6B35] font-black text-lg">
                        ₹{(promoApplied ? 0 : displayPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })()}

                {/* Gateway simulation */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Payment Method</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-white font-bold'
                          : 'border-[#374151]/60 bg-[#111827]/20 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mb-2" />
                      <span className="text-xs">Credit/Debit Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-white font-bold'
                          : 'border-[#374151]/60 bg-[#111827]/20 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 mb-2" />
                      <span className="text-xs">UPI Netbanking</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9ca3af] uppercase">Card Number</label>
                        <input
                          type="text"
                          disabled
                          value="4111 2222 3333 4444"
                          className="w-full bg-[#111827]/40 border border-[#374151]/60 rounded-xl py-2.5 px-3 text-xs text-white opacity-70 cursor-not-allowed"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#9ca3af] uppercase">Expiry</label>
                          <input
                            type="text"
                            disabled
                            value="12 / 29"
                            className="w-full bg-[#111827]/40 border border-[#374151]/60 rounded-xl py-2.5 px-3 text-xs text-white opacity-70 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#9ca3af] uppercase">CVV</label>
                          <input
                            type="password"
                            disabled
                            value="***"
                            className="w-full bg-[#111827]/40 border border-[#374151]/60 rounded-xl py-2.5 px-3 text-xs text-white opacity-70 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 text-center py-4 bg-[#111827]/30 border border-[#374151]/40 rounded-2xl">
                      <p className="text-xs text-gray-300 font-semibold">UPI Integration Simulator</p>
                      <p className="text-[10px] text-gray-500 mt-1">Simulated via secure payment link. ID: qrunto.pay@upi</p>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  className="w-full py-4 bg-[#FF6B35] hover:bg-orange-600 disabled:bg-[#FF6B35]/40 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/15"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Sandbox Payment...
                    </>
                  ) : (
                    <>
                      Pay ₹{(() => {
                        let displayPrice = selectingPlan.price;
                        if (billingCycle === '6month') displayPrice = selectingPlan.price6Month || (selectingPlan.price * 6);
                        else if (billingCycle === 'yearly') displayPrice = selectingPlan.price1Year || (selectingPlan.price * 12);
                        return (promoApplied ? 0 : displayPrice).toLocaleString('en-IN');
                      })()} Now
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-6 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white">Subscription Activated!</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Your payment was successful and your subscription is active. Proceed to your dashboard.
                  </p>
                </div>

                {/* License Code Display Box */}
                <div className="bg-[#111827] border border-[#374151]/80 rounded-2xl p-5 space-y-2 relative group">
                  <span className="text-[9px] font-bold text-[#FF6B35] uppercase tracking-wider">License Code (Auto-Activated)</span>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xl font-black text-white font-mono tracking-widest selection:bg-orange-500/20">
                      {generatedLicenseCode}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 bg-[#374151]/60 hover:bg-[#374151] rounded-lg text-gray-300 transition-colors"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setPaymentSuccess(false);
                      setGeneratedLicenseCode(null);
                      navigate('/dashboard'); // Direct to dashboard
                    }}
                    className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
