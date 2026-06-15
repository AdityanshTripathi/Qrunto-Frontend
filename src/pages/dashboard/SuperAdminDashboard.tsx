import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Store,
  CreditCard,
  QrCode,
  DollarSign,
  Settings as SettingsIcon,
  LogOut,
  Loader2,
  Plus,
  Copy,
  ArrowRight,
  Sparkles,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useAuthStore, type User } from '../../store/authStore';
import { api } from '../../lib/api';

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const SuperAdminDashboard: React.FC = () => {
  const { user, clearAuth, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'plans' | 'licenses' | 'transactions' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>({
    totalRestaurants: 0,
    activeRestaurants: 0,
    trialRestaurants: 0,
    expiredRestaurants: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    averageRevenuePerRest: 0,
  });
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [recentRestaurants, setRecentRestaurants] = useState<any[]>([]);
  const [restaurantsList, setRestaurantsList] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);
  const [licensesList, setLicensesList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  
  // Modals / Forms States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  
  // Plan form fields
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(0);
  const [planDuration, setPlanDuration] = useState(30);
  const [planMaxTables, setPlanMaxTables] = useState(10);
  const [planMaxMenuItems, setPlanMaxMenuItems] = useState(50);
  
  // License form fields
  const [licenseCodeInput, setLicenseCodeInput] = useState('');
  const [licensePlanId, setLicensePlanId] = useState('');
  const [licenseDuration, setLicenseDuration] = useState(30);
  const [licenseUsageLimit, setLicenseUsageLimit] = useState(1);
  const [licenseExpiresAt, setLicenseExpiresAt] = useState('');

  // Fetch data depending on activeTab
  const loadTabData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const res = await api.get('/superadmin/dashboard-stats');
        setKpis(res.kpis);
        setPlanDistribution(res.planDistribution);
        setRecentRestaurants(res.recentRestaurants);
      } else if (activeTab === 'restaurants') {
        const res = await api.get('/superadmin/restaurants');
        setRestaurantsList(res.restaurants);
      } else if (activeTab === 'plans') {
        const res = await api.get('/plans'); // Public plans list
        setPlansList(res.plans || []);
      } else if (activeTab === 'licenses') {
        // Fetch licenses & plans
        const [licRes, plansRes] = await Promise.all([
          api.get('/superadmin/license-codes'),
          api.get('/plans')
        ]);
        setLicensesList(licRes.codes || []);
        setPlansList(plansRes.plans || []);
        if (plansRes.plans?.length > 0) {
          setLicensePlanId(plansRes.plans[0].id);
        }
      } else if (activeTab === 'transactions') {
        const res = await api.get('/superadmin/transactions');
        setPaymentsList(res.payments || []);
      }
    } catch (err: any) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  // Toggle Restaurant Activation
  const handleToggleStatus = async (restId: string) => {
    try {
      const res = await api.patch(`/superadmin/restaurants/${restId}/toggle-status`, {});
      toast.success(res.message);
      loadTabData();
    } catch (err: any) {
      toast.error(err.message || 'Status toggle failed');
    }
  };

  // Login As Restaurant
  const handleLoginAs = async (restId: string) => {
    try {
      const res = await api.post(`/superadmin/restaurants/${restId}/login-as`, {});
      toast.success(`Logging in as Owner of ${res.restaurantName}...`);
      
      // Save Admin session
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.setItem('admin_access_token', localStorage.getItem('qr_access_token') || '');
      localStorage.setItem('admin_refresh_token', localStorage.getItem('qr_refresh_token') || '');

      // Mock user object for AuthStore
      const mockOwnerUser: User = {
        id: 'mock-owner-id',
        name: res.ownerName,
        email: 'owner@qrunto.com',
        role: 'RESTAURANT_OWNER',
        restaurants: [{ id: restId, name: res.restaurantName, slug: 'dummy-slug' }]
      };

      setAuth(mockOwnerUser, res.token, res.token);
      
      // Force reload to dashboard (which will mount Restaurant DashboardLayout)
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err: any) {
      toast.error(err.message || 'Login-as failed');
    }
  };

  // Create / Update Plan Submit
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.patch(`/superadmin/plans/${editingPlan.id}`, {
          name: planName,
          price: planPrice,
          durationDays: planDuration,
          maxTables: planMaxTables,
          maxMenuItems: planMaxMenuItems,
        });
        toast.success('Subscription plan updated successfully!');
      } else {
        await api.post('/superadmin/plans', {
          name: planName,
          price: planPrice,
          durationDays: planDuration,
          maxTables: planMaxTables,
          maxMenuItems: planMaxMenuItems,
        });
        toast.success('Subscription plan created successfully!');
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      setPlanName('');
      setPlanPrice(0);
      setPlanDuration(30);
      setPlanMaxTables(10);
      setPlanMaxMenuItems(50);
      loadTabData();
    } catch (err: any) {
      toast.error(err.message || 'Plan save failed');
    }
  };

  // Delete Restaurant
  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this restaurant and all associated menus, tables, orders, and owners? This action CANNOT be undone.')) {
      return;
    }
    try {
      const res = await api.delete(`/superadmin/restaurants/${id}`);
      toast.success(res.message || 'Restaurant deleted successfully');
      loadTabData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete restaurant');
    }
  };

  // Delete Plan
  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan? Associated subscriptions and codes will also be cleaned up.')) {
      return;
    }
    try {
      const res = await api.delete(`/superadmin/plans/${id}`);
      toast.success(res.message || 'Plan deleted successfully');
      loadTabData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete plan');
    }
  };

  // Delete License Code
  const handleDeleteLicenseCode = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this license code?')) {
      return;
    }
    try {
      const res = await api.delete(`/superadmin/license-codes/${id}`);
      toast.success(res.message || 'License code deleted successfully');
      loadTabData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete license code');
    }
  };

  // Generate License Code Submit
  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/superadmin/license-codes', {
        code: licenseCodeInput,
        planId: licensePlanId,
        durationDays: licenseDuration,
        usageLimit: licenseUsageLimit,
        expiresAt: licenseExpiresAt || null,
      });
      toast.success('License code generated successfully!');
      setIsLicenseModalOpen(false);
      setLicenseCodeInput('');
      setLicenseExpiresAt('');
      loadTabData();
    } catch (err: any) {
      toast.error(err.message || 'License code generation failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col lg:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-64 border-r border-[#374151]/50 bg-[#1f2937]/35 backdrop-blur-xl flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 px-6 py-6 border-b border-[#374151]/35">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#FF6B35] to-orange-500 rounded-xl flex items-center justify-center font-black text-lg text-white">
              👑
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              SUPER ADMIN
            </span>
          </div>

          <nav className="px-3 py-6 space-y-1">
            {[
              { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
              { id: 'restaurants', name: 'Restaurants', icon: Store },
              { id: 'plans', name: 'Subscriptions', icon: CreditCard },
              { id: 'licenses', name: 'License Codes', icon: QrCode },
              { id: 'transactions', name: 'Transactions', icon: DollarSign },
              { id: 'settings', name: 'Platform Settings', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 py-3 px-4 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-[#FF6B35] text-white font-semibold shadow-lg shadow-[#FF6B35]/15'
                      : 'text-[#9ca3af] hover:text-white hover:bg-[#374151]/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#374151]/35">
          <button
            onClick={() => clearAuth()}
            className="w-full flex items-center gap-4 py-3 px-4 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white capitalize">{activeTab} Console</h1>
            <p className="text-xs text-[#9ca3af]">Qrunto platform statistics and configurations.</p>
          </div>
          <span className="bg-[#1f2937] border border-[#374151]/60 px-4 py-2 rounded-xl text-xs font-bold text-amber-400">
            Platform System: Active
          </span>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
            <p className="text-[#9ca3af] text-sm">Fetching platform records...</p>
          </div>
        ) : (
          <>
            {/* TABS CONTENT */}

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Restaurants', value: kpis.totalRestaurants, color: 'text-white' },
                    { label: 'Active Restaurants', value: kpis.activeRestaurants, color: 'text-emerald-400' },
                    { label: 'Trial Restaurants', value: kpis.trialRestaurants, color: 'text-blue-400' },
                    { label: 'Expired Plan', value: kpis.expiredRestaurants, color: 'text-amber-400' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-[#1f2937]/25 border border-[#374151]/30 rounded-2xl p-5">
                      <p className="text-xs text-[#9ca3af] font-semibold">{stat.label}</p>
                      <p className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                  {[
                    { label: 'Monthly Revenue', value: fmt(kpis.monthlyRevenue), color: 'text-[#FF6B35]' },
                    { label: 'Total Orders', value: kpis.totalOrders, color: 'text-white' },
                    { label: "Today's Orders", value: kpis.todayOrders, color: 'text-emerald-400' },
                    { label: 'AOV Per Rest.', value: fmt(kpis.averageRevenuePerRest), color: 'text-blue-400' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-[#1f2937]/25 border border-[#374151]/30 rounded-2xl p-5">
                      <p className="text-xs text-[#9ca3af] font-semibold">{stat.label}</p>
                      <p className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plan distribution */}
                  <div className="bg-[#1f2937]/20 border border-[#374151]/30 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4">Subscription Distribution</h3>
                    <div className="space-y-4">
                      {planDistribution.map((plan, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-[#374151]/20 pb-3">
                          <div>
                            <p className="font-bold text-sm text-white">{plan.name}</p>
                            <p className="text-xs text-[#9ca3af]">{fmt(plan.price)} / plan</p>
                          </div>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                            {plan.count} active
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent registrations */}
                  <div className="bg-[#1f2937]/20 border border-[#374151]/30 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4">Recent Registrations</h3>
                    <div className="space-y-4">
                      {recentRestaurants.map((rest, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-white text-sm">{rest.name}</p>
                            <p className="text-[#9ca3af] mt-0.5">{rest.ownerName} ({rest.ownerEmail})</p>
                          </div>
                          <span className="text-[#9ca3af]">
                            {new Date(rest.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RESTAURANTS */}
            {activeTab === 'restaurants' && (
              <div className="bg-[#1f2937]/25 border border-[#374151]/30 rounded-3xl overflow-hidden animate-in fade-in duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#1f2937]/60 border-b border-[#374151]/50 text-[#9ca3af] font-bold">
                        <th className="p-4">Restaurant</th>
                        <th className="p-4">Owner / Contact</th>
                        <th className="p-4">Plan Status</th>
                        <th className="p-4">Expiry Date</th>
                        <th className="p-4">Stats</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#374151]/30">
                      {restaurantsList.map((rest) => (
                        <tr key={rest.id} className="hover:bg-[#1f2937]/10 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-sm text-white">{rest.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{rest.id}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-white">{rest.ownerName}</p>
                            <p className="text-gray-400">{rest.ownerEmail}</p>
                            <p className="text-gray-500">{rest.phone || 'No Phone'}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                              rest.isActive 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                              {rest.isActive ? 'Active' : 'Suspended'}
                            </span>
                            <p className="text-[#FF6B35] font-semibold mt-1.5">{rest.planName}</p>
                          </td>
                          <td className="p-4 text-gray-300">
                            {rest.expiryDate ? new Date(rest.expiryDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-3 text-[#9ca3af]">
                              <span>📁 {rest.stats.menuItemsCount} Items</span>
                              <span>🍽️ {rest.stats.tablesCount} Tables</span>
                            </div>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleStatus(rest.id)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${
                                rest.isActive
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              }`}
                            >
                              {rest.isActive ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleLoginAs(rest.id)}
                              className="px-3 py-1.5 bg-[#FF6B35] hover:bg-orange-600 rounded-xl text-[10px] font-bold text-white transition-all inline-flex items-center gap-1 shadow"
                            >
                              Login As
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteRestaurant(rest.id)}
                              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-[10px] font-bold text-red-400 transition-all inline-flex items-center gap-1 shadow"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: PLANS */}
            {activeTab === 'plans' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsPlanModalOpen(true)}
                    className="px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 rounded-xl font-bold text-sm text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Create Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plansList.map((plan) => (
                    <div key={plan.id} className="bg-[#1f2937]/25 border border-[#374151]/30 rounded-3xl p-6 flex flex-col justify-between hover:border-[#FF6B35]/25 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-extrabold text-lg text-white">{plan.name}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            plan.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-2xl font-black text-[#FF6B35] mt-4">{fmt(plan.price)}</p>
                        <p className="text-xs text-[#9ca3af] mt-1">{plan.durationDays} Days Duration</p>

                        <div className="border-t border-[#374151]/20 my-5 pt-4 space-y-2.5 text-xs text-gray-300">
                          <p>🍽️ Up to {plan.maxTables} Restaurant Tables</p>
                          <p>📁 Up to {plan.maxMenuItems} Menu Items</p>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2 border-t border-[#374151]/10">
                          <button
                            onClick={() => {
                              setEditingPlan(plan);
                              setPlanName(plan.name);
                              setPlanPrice(plan.price);
                              setPlanDuration(plan.durationDays);
                              setPlanMaxTables(plan.maxTables);
                              setPlanMaxMenuItems(plan.maxMenuItems);
                              setIsPlanModalOpen(true);
                            }}
                            className="p-2 bg-[#374151]/30 hover:bg-[#374151] rounded-xl text-gray-300 transition-all"
                            title="Edit Plan"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all border border-red-500/10"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LICENSES */}
            {activeTab === 'licenses' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsLicenseModalOpen(true)}
                    className="px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 rounded-xl font-bold text-sm text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Generate Code
                  </button>
                </div>

                <div className="bg-[#1f2937]/25 border border-[#374151]/30 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#1f2937]/60 border-b border-[#374151]/50 text-[#9ca3af] font-bold">
                          <th className="p-4">License Code</th>
                          <th className="p-4">Plan Details</th>
                          <th className="p-4">Duration</th>
                          <th className="p-4">Usage (Used / Limit)</th>
                          <th className="p-4">Expiry Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#374151]/30">
                        {licensesList.map((lic) => (
                          <tr key={lic.id} className="hover:bg-[#1f2937]/10 transition-colors">
                            <td className="p-4">
                              <code className="bg-[#111827] border border-[#374151]/60 px-2.5 py-1.5 rounded-lg text-[#FF6B35] font-bold font-mono text-sm tracking-wider">
                                {lic.code}
                              </code>
                            </td>
                            <td className="p-4 font-semibold text-white">
                              {lic.planName}
                            </td>
                            <td className="p-4 text-gray-300">
                              {lic.durationDays} Days
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-white">{lic.usageCount}</span> / {lic.usageLimit} redeemed
                            </td>
                            <td className="p-4 text-gray-400">
                              {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                                lic.isActive && lic.usageCount < lic.usageLimit
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {lic.usageCount >= lic.usageLimit ? 'FULLY USED' : lic.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(lic.code);
                                  toast.success('Code copied to clipboard!');
                                }}
                                className="p-2 bg-[#374151]/30 hover:bg-[#374151] rounded-xl text-gray-300 inline-flex"
                                title="Copy Code"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLicenseCode(lic.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 border border-red-500/10 inline-flex"
                                title="Delete License Code"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="bg-[#1f2937]/25 border border-[#374151]/30 rounded-3xl overflow-hidden animate-in fade-in duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#1f2937]/60 border-b border-[#374151]/50 text-[#9ca3af] font-bold">
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Restaurant</th>
                        <th className="p-4">Order Ref</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#374151]/30">
                      {paymentsList.map((pay) => (
                        <tr key={pay.id} className="hover:bg-[#1f2937]/10 transition-colors">
                          <td className="p-4 font-mono text-gray-400">
                            {pay.id.substring(0, 18)}...
                          </td>
                          <td className="p-4 font-bold text-white">
                            {pay.restaurantName}
                          </td>
                          <td className="p-4 text-gray-300">
                            {pay.orderNumber}
                          </td>
                          <td className="p-4 font-black text-[#FF6B35]">
                            {fmt(pay.amount)}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                              pay.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400 capitalize">
                            {pay.paymentMethod || 'Online'}
                          </td>
                          <td className="p-4 text-gray-400">
                            {new Date(pay.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl bg-[#1f2937]/20 border border-[#374151]/30 rounded-3xl p-6 space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" /> Platform Configurations
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#9ca3af] uppercase">Platform Branding Name</label>
                    <input
                      type="text"
                      disabled
                      value="Qrunto SaaS Systems"
                      className="w-full bg-[#111827]/40 border border-[#374151]/60 rounded-xl py-3 px-4 text-white opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#9ca3af] uppercase">Razorpay Integration Mode</label>
                    <select
                      disabled
                      className="w-full bg-[#111827]/40 border border-[#374151]/60 rounded-xl py-3 px-4 text-white opacity-60 cursor-not-allowed"
                    >
                      <option>Sandbox / Test Simulation Mode</option>
                    </select>
                  </div>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-400 text-xs">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">Sandbox Mode Active</p>
                      <p className="mt-0.5 opacity-80">All payments are currently routed to simulated gateways. No real credit card charges are processed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* PLAN CREATION MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => {
              setIsPlanModalOpen(false);
              setEditingPlan(null);
              setPlanName('');
              setPlanPrice(0);
              setPlanDuration(30);
              setPlanMaxTables(10);
              setPlanMaxMenuItems(50);
            }} 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
          />
          <div className="relative w-full max-w-sm bg-[#1f2937] border border-[#374151]/80 rounded-[24px] shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
            </h2>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pro Package"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Max Tables</label>
                  <input
                    type="number"
                    value={planMaxTables}
                    onChange={(e) => setPlanMaxTables(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Max Items</label>
                  <input
                    type="number"
                    value={planMaxMenuItems}
                    onChange={(e) => setPlanMaxMenuItems(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlanModalOpen(false);
                    setEditingPlan(null);
                    setPlanName('');
                    setPlanPrice(0);
                    setPlanDuration(30);
                    setPlanMaxTables(10);
                    setPlanMaxMenuItems(50);
                  }}
                  className="flex-1 py-3 bg-[#374151] hover:bg-[#4b5563] text-white font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-xl text-sm"
                >
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LICENSE GENERATOR MODAL */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsLicenseModalOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#1f2937] border border-[#374151]/80 rounded-[24px] shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-4">Generate License Code</h2>
            <form onSubmit={handleGenerateLicense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Custom Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FREE3MONTH (Auto if empty)"
                  value={licenseCodeInput}
                  onChange={(e) => setLicenseCodeInput(e.target.value)}
                  className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Select Subscription Plan</label>
                <select
                  required
                  value={licensePlanId}
                  onChange={(e) => setLicensePlanId(e.target.value)}
                  className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  {plansList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({fmt(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={licenseDuration}
                    onChange={(e) => setLicenseDuration(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Redeem Limit</label>
                  <input
                    type="number"
                    required
                    value={licenseUsageLimit}
                    onChange={(e) => setLicenseUsageLimit(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9ca3af] uppercase mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={licenseExpiresAt}
                  onChange={(e) => setLicenseExpiresAt(e.target.value)}
                  className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(false)}
                  className="flex-1 py-3 bg-[#374151] hover:bg-[#4b5563] text-white font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-xl text-sm"
                >
                  Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
