import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { RefreshCw, LayoutDashboard, TrendingUp, ShoppingBag, Users, Archive, ClipboardList, DollarSign, Award } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { PasscodeLockGate } from '../../components/PasscodeLockGate';
import { DateRangeSelector } from '../../components/analytics/DateRangeSelector';
import { KpiGrid } from '../../components/analytics/KpiGrid';
import { SalesTab } from '../../components/analytics/SalesTab';
import { OrderTab } from '../../components/analytics/OrderTab';
import { CustomerTab } from '../../components/analytics/CustomerTab';
import { InventoryTab } from '../../components/analytics/InventoryTab';
import { MenuTab } from '../../components/analytics/MenuTab';
import { FinanceTab } from '../../components/analytics/FinanceTab';

const BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('ordio.in') || import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://backend-steel-seven-97.vercel.app/api');

export const Analytics: React.FC = () => {
  return (
    <PasscodeLockGate section="analytics">
      <AnalyticsContent />
    </PasscodeLockGate>
  );
};

const AnalyticsContent: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);
  const restaurantId = useAuthStore((state) => state.user?.restaurantId) || '';

  const [activeTab, setActiveTab] = useState<'executive' | 'sales' | 'orders' | 'customers' | 'inventory' | 'menu' | 'financial'>('executive');
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const [comparison, setComparison] = useState(true);

  const [dataCache, setDataCache] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchTabData = useCallback(async (tabName: string, isRefresh = false) => {
    if (!token) return;
    const cacheKey = `${tabName}:${startDate.toISOString()}:${endDate.toISOString()}:${comparison}`;

    if (dataCache[cacheKey] && !isRefresh) {
      return;
    }

    if (isRefresh) setSyncing(true);
    else setLoading(true);

    try {
      const url = `${BASE_URL}/analytics/${tabName}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&comparison=${comparison}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch analytics');

      setDataCache((prev) => ({ ...prev, [cacheKey]: resData }));
    } catch (err: any) {
      toast.error(err.message || `Error fetching ${tabName} analytics`);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [token, startDate, endDate, comparison, dataCache]);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, startDate, endDate, comparison]);

  const handleDateRangeChange = (start: Date, end: Date, compare: boolean) => {
    setStartDate(start);
    setEndDate(end);
    setComparison(compare);
    setDataCache({});
  };

  const getActiveTabKey = () => {
    return `${activeTab}:${startDate.toISOString()}:${endDate.toISOString()}:${comparison}`;
  };

  const activeData = dataCache[getActiveTabKey()];

  const tabList = [
    { id: 'executive', name: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'sales', name: 'Sales', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'orders', name: 'Orders', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'customers', name: 'CRM & Customers', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'inventory', name: 'Inventory', icon: <Archive className="w-3.5 h-3.5" /> },
    { id: 'menu', name: 'Menu Engineering', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'financial', name: 'Finances', icon: <DollarSign className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Business Intelligence</h1>
          <p className="text-xs text-slate-500 dark:text-[#9ca3af] font-semibold">
            Track metrics, aggregations, customer segments, menu engineers, and finances.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <DateRangeSelector onRangeChange={handleDateRangeChange} />
          <button
            onClick={() => {
              setDataCache({});
              fetchTabData(activeTab, true);
            }}
            disabled={syncing}
            className="px-3.5 py-2.5 bg-white dark:bg-[#1f2937]/50 border border-slate-200 dark:border-[#374151]/30 hover:border-[#FF6B35]/40 text-slate-800 dark:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-[#FF6B35] text-[#FF6B35]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonLoader type="kpis" />
          <SkeletonLoader type="charts" />
        </div>
      ) : !activeData ? (
        <div className="text-center py-16 bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 rounded-[26px] p-8 text-slate-500 dark:text-slate-400">
          No analytics data available for this range. Check back later or place some mock orders to seed statistics.
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'executive' && (
            <KpiGrid current={activeData.current} comparison={activeData.comparison} />
          )}

          {activeTab === 'sales' && <SalesTab data={activeData} />}
          {activeTab === 'orders' && <OrderTab data={activeData} />}
          {activeTab === 'customers' && <CustomerTab data={activeData} />}
          {activeTab === 'inventory' && <InventoryTab data={activeData} />}
          {activeTab === 'menu' && <MenuTab data={activeData} />}
          {activeTab === 'financial' && (
            <FinanceTab
              data={activeData}
              restaurantId={restaurantId}
              token={token}
              baseUrl={BASE_URL}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
