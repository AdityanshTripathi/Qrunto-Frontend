import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Layers,
  IndianRupee,
  Clock,
  CheckCheck,
  ChefHat,
  Package,
  QrCode,
  Utensils,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type {
  KPIStats,
  TopItem,
  Order,
  Subscription,
} from './DashboardOverview';

type Period = 'today' | 'week' | 'month';
interface Props {
  name: string;
  isStaff: boolean;
  timezone: string;
  kpis: KPIStats | null;
  topItems: TopItem[];
  activeOrders: Order[];
  stats: {
    active: number;
    new: number;
    accepting: number;
    preparing: number;
    ready: number;
  };
  inventory: { lowStockItems?: number; outOfStockItems?: number } | null;
  subscription: Subscription | null;
  period: Period;
  setPeriod: (period: Period) => void;
  chart: { time: string; revenue: number; orders: number; aov: number }[];
}
const money = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const actions = [
  {
    title: 'Menu',
    subtitle: 'Manage your dishes',
    icon: Utensils,
    to: '/dashboard/menu',
  },
  {
    title: 'Tables & QR',
    subtitle: 'Make ordering easy',
    icon: QrCode,
    to: '/dashboard/tables',
  },
  {
    title: 'Inventory',
    subtitle: 'Keep stock in check',
    icon: Package,
    to: '/dashboard/inventory',
  },
  {
    title: 'Reports',
    subtitle: 'Explore your numbers',
    icon: BarChart3,
    to: '/dashboard/analytics',
  },
];

export function OverviewContent({
  name,
  isStaff,
  timezone,
  kpis,
  topItems,
  activeOrders,
  stats,
  inventory,
  subscription,
  period,
  setPeriod,
  chart,
}: Props) {
  const summary = isStaff
    ? [
        {
          label: 'Active orders',
          value: stats.active,
          note: 'Currently in progress',
          icon: ShoppingBag,
        },
        {
          label: 'New orders',
          value: stats.new,
          note: 'Awaiting acceptance',
          icon: Clock,
        },
        {
          label: 'Preparing',
          value: stats.preparing,
          note: 'With your kitchen',
          icon: ChefHat,
        },
        {
          label: 'Ready to serve',
          value: stats.ready,
          note: 'Ready for the table',
          icon: CheckCheck,
        },
      ]
    : [
        {
          label: "Today's revenue",
          value: kpis ? money(kpis.totalRevenue) : '—',
          note: 'From served orders',
          icon: IndianRupee,
        },
        {
          label: "Today's orders",
          value: kpis?.totalOrdersCount ?? '—',
          note: 'Served orders today',
          icon: ShoppingBag,
        },
        {
          label: 'Average order value',
          value: kpis ? money(kpis.averageOrderValue) : '—',
          note: "Across today's served orders",
          icon: TrendingUp,
        },
        {
          label: 'Enabled tables',
          value: kpis?.activeTablesCount ?? '—',
          note: 'Available for ordering',
          icon: Layers,
        },
      ];
  const stages = [
    { label: 'New', value: stats.new, status: 'new' },
    { label: 'Accepted', value: stats.accepting, status: 'accepted' },
    { label: 'Preparing', value: stats.preparing, status: 'preparing' },
    { label: 'Ready', value: stats.ready, status: 'ready' },
  ];
  const expiry = subscription?.endDate ? new Date(subscription.endDate) : null;
  const validExpiry = expiry && !Number.isNaN(expiry.getTime()) ? expiry : null;
  const daysLeft = validExpiry
    ? Math.ceil((validExpiry.getTime() - Date.now()) / 86400000)
    : null;
  const subscriptionNeedsAttention =
    subscription &&
    (subscription.status !== 'ACTIVE' || (daysLeft !== null && daysLeft <= 7));
  const chartHasOrders = chart.some((point) => point.orders > 0);
  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">RESTAURANT OVERVIEW</p>
          <h1>A good day starts here.</h1>
          <p>
            Welcome back{name ? `, ${name.split(' ')[0]}` : ''}. Here’s your
            restaurant at a glance.
          </p>
        </div>
        <Link
          className="overview-button overview-primary"
          to="/dashboard/orders"
        >
          Manage orders <ArrowRight size={16} />
        </Link>
      </div>

      <section className="overview-metrics" aria-label="Restaurant summary">
        {summary.map(({ label, value, note, icon: Icon }) => (
          <article className="overview-metric" key={label}>
            <div className="overview-metric-label">
              <span>{label}</span>
              <Icon size={18} aria-hidden="true" />
            </div>
            <strong>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>

      <div className="overview-columns">
        <section className="overview-card overview-orders">
          <div className="overview-section-heading">
            <div>
              <h2>
                Active orders{' '}
                <span className="overview-count">{stats.active}</span>
              </h2>
              <p>Your kitchen, in the moment.</p>
            </div>
            <Link className="overview-link" to="/dashboard/orders">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overview-stages">
            {stages.map((stage) => (
              <Link
                to="/dashboard/orders"
                className="overview-stage"
                key={stage.label}
                aria-label={`${stage.value} ${stage.label.toLowerCase()} orders. View orders.`}
              >
                <span>
                  <i className={`overview-dot status-${stage.status}`} />
                  {stage.label}
                </span>
                <strong>{stage.value}</strong>
              </Link>
            ))}
          </div>
          {activeOrders.length ? (
            <div
              className="overview-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Active orders table"
            >
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Order / items</th>
                    <th>Table</th>
                    <th>Status</th>
                    <th>Placed at</th>
                    <th className="overview-amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          to="/dashboard/orders"
                          className="overview-order-number"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p
                          title={order.orderItems
                            ?.map(
                              (item) => `${item.itemName} ×${item.quantity}`,
                            )
                            .join(', ')}
                        >
                          {order.orderItems
                            ?.map(
                              (item) => `${item.itemName} ×${item.quantity}`,
                            )
                            .join(', ') || 'No item details'}
                        </p>
                      </td>
                      <td>{order.table?.tableNumber ?? 'No table'}</td>
                      <td>
                        <span
                          className={`overview-badge status-${order.status.toLowerCase()}`}
                        >
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <time dateTime={order.createdAt}>
                          {new Date(order.createdAt).toLocaleTimeString(
                            'en-IN',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: timezone,
                            },
                          )}
                        </time>
                      </td>
                      <td className="overview-amount">
                        {money(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overview-empty">
              <ShoppingBag size={28} />
              <h3>No active orders in recent activity</h3>
              <p>New orders will appear here as they arrive.</p>
              <Link className="overview-link" to="/dashboard/orders">
                Open all orders <ArrowRight size={14} />
              </Link>
            </div>
          )}
          <p className="overview-card-footnote">
            Showing up to 6 active orders from the latest 30 orders.
          </p>
        </section>

        <aside className="overview-card overview-attention">
          <div className="overview-section-heading">
            <div>
              <h2>Needs attention</h2>
              <p>A little focus goes a long way.</p>
            </div>
            <AlertCircle size={18} />
          </div>
          <Link className="overview-alert" to="/dashboard/orders">
            <span className="overview-alert-icon">
              <Clock size={18} />
            </span>
            <span>
              <strong>Awaiting acceptance</strong>
              <small>
                {stats.new === 0 ? 'All caught up' : 'Review incoming orders'}
              </small>
            </span>
            <b>{stats.new}</b>
          </Link>
          <Link className="overview-alert" to="/dashboard/orders">
            <span className="overview-alert-icon overview-green">
              <CheckCheck size={18} />
            </span>
            <span>
              <strong>Ready to serve</strong>
              <small>
                {stats.ready === 0
                  ? 'Nothing waiting to be served'
                  : 'Bring these to the table'}
              </small>
            </span>
            <b>{stats.ready}</b>
          </Link>
          {!isStaff && (
            <>
              <div className="overview-divider" />
              <p className="overview-eyebrow">INVENTORY CHECK</p>
              <Link className="overview-alert" to="/dashboard/inventory">
                <span className="overview-alert-icon">
                  <Package size={18} />
                </span>
                <span>
                  <strong>Low stock</strong>
                  <small>
                    {typeof inventory?.lowStockItems === 'number'
                      ? 'Items below stock threshold'
                      : 'Inventory data unavailable'}
                  </small>
                </span>
                <b>{inventory?.lowStockItems ?? '—'}</b>
              </Link>
              <Link className="overview-alert" to="/dashboard/inventory">
                <span>
                  <strong>Out of stock</strong>
                  <small>Review your inventory</small>
                </span>
                <b>{inventory?.outOfStockItems ?? '—'}</b>
              </Link>
            </>
          )}
        </aside>
      </div>

      {!isStaff && (
        <div className="overview-columns">
          <section className="overview-card">
            <div className="overview-section-heading overview-chart-heading">
              <div>
                <h2>Sales activity</h2>
                <p>Served and paid orders in recent activity.</p>
              </div>
              <div className="overview-periods" aria-label="Sales chart period">
                {(
                  [
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: '7 days' },
                    { key: 'month', label: '28 days' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    aria-pressed={period === item.key}
                    onClick={() => setPeriod(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {chartHasOrders ? (
              <div
                className="overview-chart"
                role="img"
                aria-label={`Sales activity for ${period === 'today' ? 'today' : period === 'week' ? '7 days' : '28 days'} from the latest 30 orders; ${money(chart.reduce((sum, point) => sum + point.revenue, 0))} in this sample.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chart}
                    margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--dash-border)"
                      strokeDasharray="3 5"
                    />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--dash-muted)', fontSize: 11 }}
                      minTickGap={25}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--dash-muted)', fontSize: 11 }}
                      tickFormatter={(value) =>
                        `₹${value >= 1000 ? `${value / 1000}k` : value}`
                      }
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--dash-card)',
                        border: '1px solid var(--dash-border)',
                        borderRadius: 10,
                        color: 'var(--dash-text)',
                        fontSize: 12,
                      }}
                      formatter={(value) => [money(Number(value)), 'Sales']}
                    />
                    <Area
                      dataKey="revenue"
                      type="monotone"
                      stroke="var(--dash-accent)"
                      fill="var(--dash-accent)"
                      fillOpacity={0.08}
                      strokeWidth={2.5}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overview-empty overview-chart">
                <BarChart3 size={28} />
                <h3>No sales in this sample</h3>
                <p>No served or paid orders for the selected period.</p>
              </div>
            )}
            <p className="overview-card-footnote">
              Based on the latest 30 orders, not full-period totals.{' '}
              <Link to="/dashboard/analytics">View full reports</Link>
            </p>
          </section>
          <section className="overview-card">
            <div className="overview-section-heading">
              <div>
                <h2>Guest favourites</h2>
                <p>Top 5 items by recorded sales volume.</p>
              </div>
              <Utensils size={18} />
            </div>
            {topItems.length ? (
              <ol className="overview-top-items">
                {topItems.slice(0, 5).map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <span className="overview-rank">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.quantity.toLocaleString('en-IN')} sold
                      </small>
                    </div>
                    <b>{money(item.revenue)}</b>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="overview-empty">
                <Utensils size={28} />
                <h3>Your favourites will show here</h3>
                <p>Item rankings appear as sales are recorded.</p>
              </div>
            )}
            <Link className="overview-link" to="/dashboard/menu">
              Manage menu <ArrowRight size={14} />
            </Link>
          </section>
        </div>
      )}

      <section
        className="overview-quick-section"
        aria-labelledby="quick-actions-title"
      >
        <div className="overview-section-heading">
          <h2 id="quick-actions-title">Your everyday essentials</h2>
          <span className="overview-muted">A shortcut to the next task</span>
        </div>
        <div className="overview-quick-actions">
          {actions.map(({ title, subtitle, icon: Icon, to }) => (
            <Link to={to} key={title}>
              <Icon size={20} />
              <span>
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </section>
      {!isStaff && (
        <section
          className={`overview-plan ${subscriptionNeedsAttention ? 'overview-plan-attention' : ''}`}
          aria-label="Subscription"
        >
          <div>
            <span className="overview-eyebrow">YOUR PLAN</span>
            <strong>{subscription?.plan?.name || 'No active plan'}</strong>
            <span className="overview-muted">
              {subscription
                ? `${subscription.status.toLowerCase()}${validExpiry ? ` · ${daysLeft !== null && daysLeft <= 0 ? 'Ended' : 'Ends'} ${validExpiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: timezone })}` : ''}`
                : 'Subscription information unavailable'}
            </span>
          </div>
          <Link className="overview-link" to="/dashboard/subscription">
            Manage plan <ArrowRight size={14} />
          </Link>
        </section>
      )}
    </div>
  );
}
