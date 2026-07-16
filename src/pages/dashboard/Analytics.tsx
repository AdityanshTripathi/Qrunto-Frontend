import React, { useState } from 'react';
import {
  RefreshCw,
  Calendar,
  Layers,
  TrendingUp,
  ShoppingBag,
  Users,
  Grid,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PasscodeLockGate } from '../../components/PasscodeLockGate';
import { ExecutiveTab } from './analytics/ExecutiveTab';
import { SalesTab } from './analytics/SalesTab';
import { OrderTab } from './analytics/OrderTab';
import { MenuTab } from './analytics/MenuTab';
import { CustomerTab } from './analytics/CustomerTab';
import { LoyaltyTab } from './analytics/LoyaltyTab';

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

const TABS = [
  { id: 'executive', name: 'Executive', icon: Layers },
  { id: 'sales', name: 'Sales', icon: TrendingUp },
  { id: 'orders', name: 'Orders', icon: ShoppingBag },
  { id: 'customer', name: 'Customer CRM', icon: Users },
  { id: 'menu', name: 'Menu', icon: Grid },
  { id: 'loyalty', name: 'Loyalty', icon: Award },
];

const AnalyticsContent: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('executive');

  // Date Range States
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [preset, setPreset] = useState<string>('30d');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handlePresetChange = (p: string) => {
    setPreset(p);
    const end = new Date();
    let start = new Date();
    switch (p) {
      case 'today':
        start = new Date();
        break;
      case 'yesterday':
        start = new Date();
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'executive':
        return (
          <ExecutiveTab
            startDate={startDate}
            endDate={endDate}
            token={token}
            baseUrl={BASE_URL}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'sales':
        return (
          <SalesTab
            startDate={startDate}
            endDate={endDate}
            token={token}
            baseUrl={BASE_URL}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'orders':
        return (
          <OrderTab
            startDate={startDate}
            endDate={endDate}
            token={token}
            baseUrl={BASE_URL}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'menu':
        return (
          <MenuTab
            startDate={startDate}
            endDate={endDate}
            token={token}
            baseUrl={BASE_URL}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'customer':
        return (
          <CustomerTab
            startDate={startDate}
            endDate={endDate}
            token={token}
            baseUrl={BASE_URL}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'loyalty':
        return (
          <LoyaltyTab
            startDate={startDate}
            endDate={endDate}
            token={token}
            baseUrl={BASE_URL}
            refreshTrigger={refreshTrigger}
          />
        );
      default:
        return (
          <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-[#FF6B35]/10 text-[#FF6B35] rounded-2xl flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                {activeTab} Analytics
              </h3>
              <p className="text-sm text-slate-400 dark:text-gray-500 mt-1 max-w-md mx-auto">
                This BI module is currently under setup. Once activated in Phase 2, detailed charts, breakdowns, and automated reports will show up here.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Dashboard Header & Title ─── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Business Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af]">
            Consolidated analytics, revenue pipelines, cohorts, and operations.
          </p>
        </div>

        {/* Date presets & Range selectors */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 dark:bg-[#1f2937]/15 p-2 rounded-2xl border border-slate-200/60 dark:border-[#374151]/20">
          <div className="flex items-center gap-1">
            {['today', 'yesterday', '7d', '30d', 'thisMonth'].map((p) => (
              <button
                key={p}
                onClick={() => handlePresetChange(p)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-all ${
                  preset === p
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-[#111827]/40'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === 'thisMonth' ? 'Month' : p}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#374151]/30 hidden sm:block" />

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151]/30 px-2 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset('custom');
                }}
                className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 dark:text-gray-200"
              />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">to</span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151]/30 px-2 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset('custom');
                }}
                className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 dark:text-gray-200"
              />
            </div>
          </div>

          <button
            onClick={triggerRefresh}
            className="p-1.5 bg-white dark:bg-[#111827] hover:border-[#FF6B35]/40 border border-slate-200 dark:border-[#374151]/30 text-slate-700 dark:text-gray-300 hover:text-[#FF6B35] rounded-xl transition-all"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Tabs Switcher Navigation ─── */}
      <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="flex gap-2 min-w-max p-1 bg-slate-100/50 dark:bg-[#111827]/10 rounded-[18px] border border-slate-200/40 dark:border-[#374151]/15">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#1f2937] text-[#FF6B35] shadow-sm border border-slate-200/50 dark:border-[#374151]/20'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B35]' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Active Tab Content ─── */}
      <div className="transition-all duration-300">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Analytics;
