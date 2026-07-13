import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const revenueData = [
  { day: 'Mon', value: 42000 },
  { day: 'Tue', value: 58000 },
  { day: 'Wed', value: 51000 },
  { day: 'Thu', value: 73000 },
  { day: 'Fri', value: 89000 },
  { day: 'Sat', value: 112000 },
  { day: 'Sun', value: 94000 },
];

const ordersData = [
  { h: '9am', v: 12 },
  { h: '11am', v: 34 },
  { h: '1pm', v: 67 },
  { h: '3pm', v: 28 },
  { h: '6pm', v: 82 },
  { h: '8pm', v: 91 },
  { h: '10pm', v: 44 },
];

const topItems = [
  { name: 'Truffle Pasta', orders: 84, revenue: '₹63,000' },
  { name: 'Wagyu Steak', orders: 61, revenue: '₹1,22,000' },
  { name: 'Tiramisu', orders: 109, revenue: '₹32,700' },
  { name: 'Burrata Salad', orders: 77, revenue: '₹38,500' },
];

const inventoryItems = [
  { name: 'Wagyu Ribeye', level: 12, total: 100, status: 'low' },
  { name: 'Sauvignon Blanc', level: 68, total: 100, status: 'healthy' },
  { name: 'Truffle Oil', level: 30, total: 100, status: 'medium' },
  { name: 'Burrata', level: 90, total: 100, status: 'healthy' },
];

const crmCustomers = [
  { name: 'Eleanor Sterling', visits: 12, ltv: '₹24,440', tier: 'VIP' },
  { name: 'Arjun Mehta', visits: 8, ltv: '₹16,200', tier: 'Gold' },
  { name: 'Priya Kapoor', visits: 5, ltv: '₹9,800', tier: 'Silver' },
  { name: 'Rahul Sharma', visits: 19, ltv: '₹41,000', tier: 'VIP' },
];

const tabs = ['Analytics', 'Inventory', 'CRM', 'Kitchen'];

const AnalyticsView = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#061b0e]/6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-[#434843]/50 font-medium mb-1">Weekly Revenue</div>
          <div className="text-2xl font-bold text-[#061b0e]">₹5,19,000</div>
          <div className="text-xs text-emerald-600 font-medium mt-0.5">+18.4% vs last week</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#061b0e" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#061b0e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#434843' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}k`, 'Revenue']}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Area type="monotone" dataKey="value" stroke="#061b0e" strokeWidth={2} fill="url(#revGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white rounded-xl p-5 border border-[#061b0e]/6 shadow-sm">
      <div className="text-xs text-[#434843]/50 font-medium mb-1">Orders by Hour</div>
      <div className="text-2xl font-bold text-[#061b0e] mb-4">358 today</div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={ordersData} barSize={10}>
          <Bar dataKey="v" fill="#d0e9d4" radius={[3, 3, 0, 0]} />
          <XAxis dataKey="h" tick={{ fontSize: 9, fill: '#434843' }} axisLine={false} tickLine={false} />
          <YAxis hide />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-[#061b0e]/6 shadow-sm">
      <div className="text-xs text-[#434843]/50 font-medium mb-4">Top Selling Items</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {topItems.map((item) => (
          <div key={item.name} className="bg-[#FFF8F0] rounded-lg p-3">
            <div className="text-xs font-semibold text-[#061b0e] mb-1">{item.name}</div>
            <div className="text-base font-bold text-[#061b0e]">{item.orders} orders</div>
            <div className="text-xs text-[#434843]/50">{item.revenue}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const InventoryView = () => (
  <div className="bg-white rounded-xl p-5 border border-[#061b0e]/6 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <div className="text-sm font-bold text-[#061b0e]">Stock Overview</div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="text-[10px] font-semibold text-amber-700">2 Low Stock Alerts</span>
      </div>
    </div>
    <div className="space-y-5">
      {inventoryItems.map((item) => (
        <div key={item.name}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-[#061b0e]">{item.name}</span>
            <span className={`text-xs font-semibold ${
              item.status === 'low' ? 'text-red-500' : item.status === 'medium' ? 'text-amber-500' : 'text-emerald-600'
            }`}>
              {item.status === 'low' ? 'Low Stock' : item.status === 'medium' ? 'Moderate' : 'Healthy'} ({item.level})
            </span>
          </div>
          <div className="h-2 bg-[#061b0e]/6 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.status === 'low' ? 'bg-red-400' : item.status === 'medium' ? 'bg-amber-400' : 'bg-[#d0e9d4]'
              }`}
              style={{ width: `${item.level}%` }}
            />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 flex items-center gap-3 p-3.5 bg-[#061b0e] rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-[#d0e9d4]/15 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7l10 0" stroke="#d0e9d4" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <span className="text-xs font-bold text-white">AI Auto-Reorder Active — Wagyu Ribeye restocked</span>
    </div>
  </div>
);

const CRMView = () => (
  <div className="bg-white rounded-xl p-5 border border-[#061b0e]/6 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <div className="text-sm font-bold text-[#061b0e]">Customer Directory</div>
      <div className="grid grid-cols-3 gap-3 text-center">
        {[{ v: '2,418', l: 'Total Guests' }, { v: '68%', l: 'Repeat Rate' }, { v: '₹1,840', l: 'Avg LTV' }].map(m => (
          <div key={m.l} className="bg-[#FFF8F0] rounded-lg px-3 py-2">
            <div className="text-sm font-bold text-[#061b0e]">{m.v}</div>
            <div className="text-[10px] text-[#434843]/50">{m.l}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-3">
      {crmCustomers.map((c) => (
        <div key={c.name} className="flex items-center justify-between py-3 border-b border-[#061b0e]/5 last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#d0e9d4] flex items-center justify-center text-[#061b0e] font-bold text-xs">
              {c.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#061b0e]">{c.name}</div>
              <div className="text-xs text-[#434843]/50">{c.visits} visits · {c.ltv}</div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            c.tier === 'VIP' ? 'bg-[#061b0e] text-[#d0e9d4]' : c.tier === 'Gold' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {c.tier}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const KitchenView = () => {
  const orders = [
    { table: 'Table 5', items: ['Wagyu Steak x1', 'Caesar Salad x2'], status: 'Preparing', time: '8 min' },
    { table: 'Table 12', items: ['Truffle Pasta x2'], status: 'Ready', time: '0 min' },
    { table: 'Table 3', items: ['Tiramisu x3', 'Espresso x2'], status: 'Pending', time: '14 min' },
    { table: 'Table 9', items: ['Burrata x1', 'Carbonara x1'], status: 'Served', time: 'Done' },
  ];
  const statusStyles: Record<string, string> = {
    Preparing: 'bg-amber-50 text-amber-700 border-amber-200',
    Ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-slate-50 text-slate-600 border-slate-200',
    Served: 'bg-[#d0e9d4] text-[#0b2013] border-[#b4cdb8]',
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {orders.map((o) => (
        <div key={o.table} className="bg-white rounded-xl p-4 border border-[#061b0e]/6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-bold text-[#061b0e]">{o.table}</span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusStyles[o.status]}`}>{o.status}</span>
          </div>
          <ul className="space-y-1 mb-3">
            {o.items.map(i => <li key={i} className="text-xs text-[#434843]/70">{i}</li>)}
          </ul>
          <div className="text-[10px] font-semibold text-[#434843]/40">{o.time}</div>
        </div>
      ))}
    </div>
  );
};

const views: Record<string, React.ReactNode> = {
  Analytics: <AnalyticsView />,
  Inventory: <InventoryView />,
  CRM: <CRMView />,
  Kitchen: <KitchenView />,
};

export const DashboardShowcase: React.FC = () => {
  const [active, setActive] = useState('Analytics');

  return (
    <section className="py-24 bg-[#f4f0eb]" id="dashboard">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#434843]/50 mb-3">Dashboard Preview</p>
          <h2 className="text-[36px] sm:text-[44px] font-bold text-[#061b0e] tracking-[-0.03em] leading-[1.1]">
            Your entire restaurant.
            <br />
            <span className="text-[#434843]/40">One screen.</span>
          </h2>
        </div>

        {/* Dashboard container */}
        <div className="bg-white rounded-2xl border border-[#061b0e]/8 shadow-xl overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#061b0e]/6 bg-[#FFF8F0]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-amber-300" />
              <div className="w-3 h-3 rounded-full bg-emerald-300" />
            </div>
            {/* Tab bar */}
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    active === tab
                      ? 'bg-[#061b0e] text-white shadow-sm'
                      : 'text-[#434843]/60 hover:text-[#061b0e] hover:bg-[#061b0e]/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="w-16" />
          </div>

          {/* Dashboard content */}
          <div className="p-5 sm:p-6 bg-[#f9f7f4] min-h-[360px] transition-all duration-300">
            {views[active]}
          </div>
        </div>
      </div>
    </section>
  );
};
