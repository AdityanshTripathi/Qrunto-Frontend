import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, ShieldCheck, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface Plan {
  name: string;
  price: number;
  maxTables: number;
  maxMenuItems: number;
  featuresJson: string[];
}

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startDate: string;
  endDate: string;
  plan: Plan;
}

export const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const res = await api.get('/subscriptions/current');
        setSubscription(res.subscription || null);
      } catch (err: any) {
        toast.error('Failed to load subscription details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
        <p className="text-gray-400 font-medium">Loading subscription details...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
            Pending Activation
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-[#9ca3af] mt-1">
          Manage your platform plan, view billing details, limits, and upgrade your tier.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Current Subscription Card */}
        {subscription ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Card */}
            <div className="bg-[#1f2937]/25 border border-[#374151]/35 rounded-[24px] p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#374151]/20 pb-6 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20 uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    Current Plan
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">{subscription.plan.name} Plan</h2>
                </div>
                <div className="self-start sm:self-auto flex items-center gap-2">
                  {getStatusBadge(subscription.status)}
                </div>
              </div>

              {/* Subscription details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#374151]/30 rounded-xl text-[#9ca3af]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9ca3af] font-medium">Pricing</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      ₹{subscription.plan.price.toLocaleString('en-IN')} / 30 Days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#374151]/30 rounded-xl text-[#9ca3af]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9ca3af] font-medium">Renews / Expires On</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      {new Date(subscription.endDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#374151]/30 rounded-xl text-[#9ca3af]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9ca3af] font-medium">Table Limit</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      {subscription.plan.maxTables === 9999 ? 'Unlimited' : `Up to ${subscription.plan.maxTables} Tables`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#374151]/30 rounded-xl text-[#9ca3af]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9ca3af] font-medium">Menu Items Limit</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      {subscription.plan.maxMenuItems === 9999 ? 'Unlimited' : `Up to ${subscription.plan.maxMenuItems} Items`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/subscription')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-xl transition-all shadow-md shadow-[#FF6B35]/10"
                >
                  Change / Upgrade Plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoices Box */}
            <div className="bg-[#1f2937]/25 border border-[#374151]/35 rounded-[24px] p-6 backdrop-blur-md">
              <h3 className="text-base font-bold text-white mb-4">Billing History & Invoices</h3>
              <div className="border border-[#374151]/25 rounded-xl overflow-hidden bg-white/5 py-10 text-center text-[#9ca3af]">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-gray-300">No invoices yet</p>
                <p className="text-xs mt-0.5">Invoices for your subscription renewals will be listed here.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-[#1f2937]/20 border border-[#374151]/40 rounded-[24px] p-12 text-center backdrop-blur-md flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-4 text-[#9ca3af]">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-200">No Active Subscription</h3>
            <p className="text-sm text-[#9ca3af] max-w-sm mt-1 mb-6">
              You do not have an active plan yet. Choose a plan to activate table management and menu editing features.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-xl transition-all shadow-md shadow-[#FF6B35]/15"
            >
              Select pricing plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Column - Plan features display */}
        {subscription && (
          <div className="bg-[#1f2937]/25 border border-[#374151]/35 rounded-[24px] p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-4">Included Features</h3>
            <ul className="space-y-3">
              {Array.isArray(subscription.plan.featuresJson) &&
                subscription.plan.featuresJson.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#d1d5db]">
                    <span className="bg-[#22C55E]/10 text-[#22C55E] p-0.5 rounded-full shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
