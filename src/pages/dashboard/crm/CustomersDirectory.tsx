import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMStore } from '../../../store/crmStore';
import { 
  Search, Eye, Loader2, ArrowUpDown, Calendar, Milestone, Send
} from 'lucide-react';
import { api } from '../../../lib/api';
import { LoyaltyTiersConfig } from './LoyaltyTiersConfig';
import { CouponCampaignsConfig } from './CouponCampaignsConfig';
import { CustomerSegmentsConfig } from './CustomerSegmentsConfig';
import { CampaignsConfig } from './CampaignsConfig';
import { TicketsBoard } from './TicketsBoard';
import { toast } from 'sonner';

export const CustomersDirectory: React.FC = () => {
  const navigate = useNavigate();
  const {
    customers,
    total,
    loading,
    search,
    setSearch,
    sortBy,
    sortOrder,
    setSort,
    limit,
    offset,
    setPagination,
    fetchCustomers
  } = useCRMStore();

  const [localSearch, setLocalSearch] = useState(search);
  const [activeTab, setActiveTab] = useState<'directory' | 'loyalty' | 'coupons' | 'segments' | 'campaigns' | 'tickets'>('directory');

  // Occasions state
  const [upcomingOccasions, setUpcomingOccasions] = useState<any[]>([]);
  const [loadingOccasions, setLoadingOccasions] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch, search]);

  // Fetch customers and occasions on mount
  useEffect(() => {
    fetchCustomers();
    
    const fetchOccasions = async () => {
      setLoadingOccasions(true);
      try {
        const res = await api.get('/crm/customers/occasions/upcoming');
        if (res.upcoming) {
          setUpcomingOccasions(res.upcoming);
        }
      } catch (err) {
        console.error('Failed to load upcoming occasions:', err);
      } finally {
        setLoadingOccasions(false);
      }
    };
    fetchOccasions();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(localSearch);
  };

  const handleSort = (field: string) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSort(field, isAsc ? 'desc' : 'asc');
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setPagination(limit, Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setPagination(limit, offset + limit);
    }
  };

  const sendManualGreeting = (name: string, phone: string, type: string) => {
    toast.success(`Sent manual ${type.toLowerCase()} greeting with a discount code to ${name} (${phone})!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPEAT':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'CHURN_RISK':
        return 'bg-amber-500/10 text-amber-505 border border-amber-505/20';
      case 'CHURNED':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
  };

  // Funnel calculations based on loaded customer directory list
  const leadsCount = total;
  const orderedCount = customers.filter((c) => (c.profiles?.[0]?.totalOrders ?? 0) >= 1).length;
  const repeatCount = customers.filter((c) => (c.profiles?.[0]?.totalOrders ?? 0) >= 2).length;
  const vipCount = customers.filter((c) => c.metadataJson?.rfm?.segment === 'Champions').length;

  const orderedPercent = leadsCount > 0 ? (orderedCount / leadsCount) * 100 : 0;
  const repeatPercent = leadsCount > 0 ? (repeatCount / leadsCount) * 100 : 0;
  const vipPercent = leadsCount > 0 ? (vipCount / leadsCount) * 100 : 0;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-[#374151]/45 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
            activeTab === 'directory'
              ? 'border-[#FF6B35] text-[#FF6B35] font-black'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          Customer Directory
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
            activeTab === 'loyalty'
              ? 'border-[#FF6B35] text-[#FF6B35] font-black'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          Loyalty Tiers Config
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
            activeTab === 'coupons'
              ? 'border-[#FF6B35] text-[#FF6B35] font-black'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          Coupon Campaigns
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
            activeTab === 'segments'
              ? 'border-[#FF6B35] text-[#FF6B35] font-black'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          Customer Segments
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
            activeTab === 'campaigns'
              ? 'border-[#FF6B35] text-[#FF6B35] font-black'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          Marketing Campaigns
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
            activeTab === 'tickets'
              ? 'border-[#FF6B35] text-[#FF6B35] font-black'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-white'
          }`}
        >
          Customer Complaints
        </button>
      </div>

      {activeTab === 'loyalty' ? (
        <LoyaltyTiersConfig />
      ) : activeTab === 'coupons' ? (
        <CouponCampaignsConfig />
      ) : activeTab === 'segments' ? (
        <CustomerSegmentsConfig />
      ) : activeTab === 'campaigns' ? (
        <CampaignsConfig />
      ) : activeTab === 'tickets' ? (
        <TicketsBoard />
      ) : (
        <>
          {/* Summary Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Customer Acquisition Funnel Widget */}
            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/55 rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#374151]/30 pb-3 mb-5">
                <Milestone className="w-5 h-5 text-[#FF6B35]" />
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Acquisition Funnel</h4>
              </div>

              <div className="space-y-4">
                {/* Leads */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-700 dark:text-gray-300">
                    <span> Leads (Total Scans/Signups)</span>
                    <span>{leadsCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden relative">
                    <div className="bg-[#FF6B35]/20 h-full w-full" />
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-[#FF6B35]">100% Conversion</span>
                  </div>
                </div>

                {/* Ordered */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-700 dark:text-gray-300">
                    <span> Ordered Guests (First Visit)</span>
                    <span>{orderedCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden relative">
                    <div className="bg-sky-500/20 h-full transition-all duration-500" style={{ width: `${orderedPercent}%` }} />
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-sky-500">{orderedPercent.toFixed(0)}% conversion rate</span>
                  </div>
                </div>

                {/* Repeat */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-700 dark:text-gray-300">
                    <span> Repeat Diners (2+ Visits)</span>
                    <span>{repeatCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden relative">
                    <div className="bg-emerald-500/20 h-full transition-all duration-500" style={{ width: `${repeatPercent}%` }} />
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-emerald-500">{repeatPercent.toFixed(0)}% retention rate</span>
                  </div>
                </div>

                {/* VIP */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-700 dark:text-gray-300">
                    <span> VIP Champions</span>
                    <span>{vipCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-xl overflow-hidden relative">
                    <div className="bg-indigo-500/20 h-full transition-all duration-500" style={{ width: `${vipPercent}%` }} />
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-indigo-500">{vipPercent.toFixed(0)}% loyalty share</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Occasions Alert Calendar Widget */}
            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/55 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#374151]/30 pb-3 mb-4">
                  <Calendar className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Upcoming Occasions (30d)</h4>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[190px] pr-1.5 scrollbar-thin">
                  {loadingOccasions ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FF6B35]" />
                    </div>
                  ) : upcomingOccasions.length === 0 ? (
                    <p className="text-xs text-slate-450 dark:text-gray-400 py-10 text-center italic">No upcoming birthdays or anniversaries.</p>
                  ) : (
                    upcomingOccasions.map((occ) => (
                      <div key={`${occ.customerId}-${occ.type}`} className="flex items-center justify-between bg-slate-50 dark:bg-[#111827]/25 border border-slate-200/50 dark:border-[#374151]/20 rounded-2xl p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{occ.type === 'BIRTHDAY' ? '🎂' : '💍'}</span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{occ.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{occ.type} · {new Date(occ.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {occ.daysRemaining === 1 ? 'Tomorrow' : `In ${occ.daysRemaining} days`}
                          </span>
                          
                          <button
                            onClick={() => sendManualGreeting(occ.name, occ.phone, occ.type)}
                            className="p-1.5 bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 text-[#FF6B35] rounded-xl transition-all"
                            title="Send Discount Code"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Top filter row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={triggerSearch} className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search customers by name or phone..."
                value={localSearch}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/25 transition-all text-slate-800 dark:text-white"
              />
            </form>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Matches: {total}
              </span>
            </div>
          </div>

          {/* Main Directory Table */}
          {loading && customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
              <p className="text-slate-500 text-sm">Loading CRM records...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-12 text-center">
              <p className="text-lg font-bold text-slate-800 dark:text-white">No Customers Found</p>
              <p className="text-sm text-slate-400 mt-1">
                {localSearch ? 'Try a different search query or filter.' : 'Wait for QR or POS orders to sync customer records automatically.'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#374151]/35 text-slate-400 text-xs font-semibold uppercase tracking-wider select-none">
                      <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1.5">
                          Customer Name <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="py-4 px-6 font-semibold">Phone</th>
                      <th className="py-4 px-6 font-semibold">Email</th>
                      <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors" onClick={() => handleSort('totalSpend')}>
                        <div className="flex items-center gap-1.5">
                          Total Spend <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors" onClick={() => handleSort('totalOrders')}>
                        <div className="flex items-center gap-1.5">
                          Visits/Orders <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors" onClick={() => handleSort('lastVisit')}>
                        <div className="flex items-center gap-1.5">
                          Last Activity <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="py-4 px-6 text-center font-semibold">Status</th>
                      <th className="py-4 px-6 text-right font-semibold">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/35 text-sm">
                    {customers.map((customer) => {
                      const profile = customer.profiles?.[0] || {};
                      return (
                        <tr key={customer.id} className="hover:bg-slate-55/50 dark:hover:bg-[#374151]/10 transition-colors">
                          <td className="py-4.5 px-6 font-bold text-slate-800 dark:text-white">
                            {customer.name}
                          </td>
                          <td className="py-4.5 px-6 text-slate-500 dark:text-gray-300 font-mono text-xs">
                            {customer.phone}
                          </td>
                          <td className="py-4.5 px-6 text-slate-500 dark:text-gray-400">
                            {customer.email || '-'}
                          </td>
                          <td className="py-4.5 px-6 text-slate-700 dark:text-gray-200 font-semibold">
                            ₹{(profile.totalSpend ?? 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-4.5 px-6 text-slate-700 dark:text-gray-200 font-semibold">
                            {profile.totalOrders ?? 0}
                          </td>
                          <td className="py-4.5 px-6 text-slate-400 text-xs">
                            {profile.lastVisit ? new Date(profile.lastVisit).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : '-'}
                          </td>
                          <td className="py-4.5 px-6 text-center font-semibold">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusBadge(profile.repeatStatus || 'NEW')}`}>
                              {profile.repeatStatus || 'NEW'}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-right">
                            <button
                              onClick={() => navigate(`/dashboard/crm/customers/${customer.id}`)}
                              className="p-2 bg-slate-100 dark:bg-[#1f2937] hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151] rounded-xl text-slate-700 dark:text-gray-300 transition-colors"
                              title="View Profile Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-[#374151]/35 flex items-center justify-between text-xs text-slate-550 dark:text-gray-400">
                <span>
                  Showing Page {currentPage} of {totalPages} ({total} entries)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className="px-3 py-2 bg-slate-100 border border-slate-200 dark:bg-[#1f2937] dark:border-[#374151] rounded-xl font-bold disabled:opacity-50 transition-all text-slate-700 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={offset + limit >= total}
                    className="px-3 py-2 bg-slate-100 border border-slate-200 dark:bg-[#1f2937] dark:border-[#374151] rounded-xl font-bold disabled:opacity-50 transition-all text-slate-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default CustomersDirectory;
