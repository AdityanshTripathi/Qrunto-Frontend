import {
  useRestaurantTimezone,
  localDate,
  addDays,
  localHour,
} from '../../lib/timezone';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../config/backend';
import { OverviewContent } from './OverviewContent';
export interface KPIStats {
  totalRevenue: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  activeTablesCount: number;
}

export interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface Payment {
  id: string;
  paymentMethod: string;
  status: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  table: { tableNumber: string } | null;
  status:
    | 'NEW'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY'
    | 'SERVED'
    | 'PAID'
    | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
  payments?: Payment[];
}

export interface Subscription {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  endDate: string;
  plan: { name: string; price: number };
}

export const DashboardOverview: React.FC = () => {
  const restaurantTimeZone = useRestaurantTimezone();
  const { user, accessToken } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [inventoryMetrics, setInventoryMetrics] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orderStats, setOrderStats] = useState({
    active: 0,
    new: 0,
    accepting: 0,
    preparing: 0,
    ready: 0,
    served: 0,
    cancelled: 0,
    paid: 0,
  });
  const [salesPeriod, setSalesPeriod] = useState<'today' | 'week' | 'month'>(
    'today',
  );

  const dashboardRequestRef = useRef<Promise<void> | null>(null);
  const dashboardRefreshQueuedRef = useRef(false);

  const fetchDashboardData = useCallback(
    (queueIfBusy = false): Promise<void> => {
      if (dashboardRequestRef.current) {
        if (queueIfBusy) dashboardRefreshQueuedRef.current = true;
        return dashboardRequestRef.current;
      }

      const request = (async () => {
        do {
          dashboardRefreshQueuedRef.current = false;
          try {
            const inventoryRequest = api
              .get('/inventory/reports/dashboard-metrics')
              .then((data) => ({ data, error: null }))
              .catch((error) => ({ data: null, error }));

            const [
              analyticsRes,
              subRes,
              ordersRes,
              orderStatsRes,
              inventoryResult,
            ] = await Promise.all([
              api.get('/analytics/overview'),
              api.get('/subscriptions/current'),
              api.get('/orders?limit=30'),
              api.get('/orders/stats'),
              inventoryRequest,
            ]);

            setKpis(analyticsRes.kpis || null);
            setHasData(true);
            setError(null);
            setTopItems(analyticsRes.topSellingItems || []);
            setSubscription(subRes.subscription || null);

            const orders: Order[] = ordersRes.orders || [];
            setAllOrders(orders);
            const active = orders.filter((o) =>
              ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status),
            );
            setActiveOrders(active.slice(0, 6));
            const stats = orderStatsRes.stats || {};
            setOrderStats({
              active:
                (stats.NEW || 0) +
                (stats.ACCEPTED || 0) +
                (stats.PREPARING || 0) +
                (stats.READY || 0),
              new: stats.NEW || 0,
              accepting: stats.ACCEPTED || 0,
              preparing: stats.PREPARING || 0,
              ready: stats.READY || 0,
              served: stats.SERVED || 0,
              cancelled: stats.CANCELLED || 0,
              paid: stats.PAID || 0,
            });

            if (inventoryResult.error) {
              setInventoryMetrics(null);
              console.error(
                'Failed to load inventory metrics:',
                inventoryResult.error,
              );
            } else {
              setInventoryMetrics(inventoryResult.data?.metrics ?? null);
            }
          } catch (err: any) {
            setError('Unable to refresh dashboard data. Please try again.');
            toast.error('Failed to load dashboard data: ' + err.message);
          } finally {
            setLoading(false);
          }
        } while (dashboardRefreshQueuedRef.current);
      })();

      dashboardRequestRef.current = request;
      void request.finally(() => {
        if (dashboardRequestRef.current === request)
          dashboardRequestRef.current = null;
      });
      return request;
    },
    [],
  );

  useEffect(() => {
    setLoading(true);
    void fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId || !accessToken) return;

    const socket: Socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      tryAllTransports: true,
      auth: { token: accessToken },
    });

    const handleUpdate = () => {
      void fetchDashboardData(true);
    };

    socket.on('NEW_ORDER', handleUpdate);
    socket.on('ITEM_ADDED', handleUpdate);
    socket.on('ORDER_UPDATED', handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, [user, accessToken, fetchDashboardData]);

  const getSalesChartData = () => {
    const paidServedOrders = allOrders.filter(
      (o) => o && o.status && ['SERVED', 'PAID'].includes(o.status),
    );
    if (paidServedOrders.length === 0) return [];

    if (salesPeriod === 'today') {
      const todayHours = Array.from(
        { length: 24 },
        (_, hour) => `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`,
      );
      const today = new Date();

      return todayHours.map((hourStr) => {
        let targetHour = parseInt(hourStr);
        if (hourStr.endsWith('pm') && targetHour !== 12) targetHour += 12;
        if (hourStr.endsWith('am') && targetHour === 12) targetHour = 0;

        const hourOrders = paidServedOrders.filter((o) => {
          const oDate = new Date(o.createdAt);
          return (
            localDate(oDate, restaurantTimeZone) ===
              localDate(today, restaurantTimeZone) &&
            localHour(oDate, restaurantTimeZone) === targetHour
          );
        });

        const revenue = hourOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const count = hourOrders.length;
        const aov = count > 0 ? parseFloat((revenue / count).toFixed(2)) : 0;

        return { time: hourStr, revenue, orders: count, aov };
      });
    }

    if (salesPeriod === 'week') {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(
          addDays(localDate(new Date(), restaurantTimeZone), -i) + 'T00:00:00Z',
        );
        weekDays.push(d);
      }

      return weekDays.map((date) => {
        const dayName = daysOfWeek[date.getUTCDay()]!;
        const dayOrders = paidServedOrders.filter((o) => {
          const oDate = new Date(o.createdAt);
          return (
            localDate(oDate, restaurantTimeZone) ===
            date.toISOString().slice(0, 10)
          );
        });

        const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const count = dayOrders.length;
        const aov = count > 0 ? parseFloat((revenue / count).toFixed(2)) : 0;

        return { time: dayName, revenue, orders: count, aov };
      });
    }

    const monthData = [];
    for (let i = 3; i >= 0; i--) {
      const today = localDate(new Date(), restaurantTimeZone);
      const start = addDays(today, -(i + 1) * 7 + 1);
      const end = addDays(today, -i * 7);

      const weekOrders = paidServedOrders.filter((o) => {
        const oDate = new Date(o.createdAt);
        const day = localDate(oDate, restaurantTimeZone);
        return day >= start && day <= end;
      });

      const revenue = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const count = weekOrders.length;
      const aov = count > 0 ? parseFloat((revenue / count).toFixed(2)) : 0;

      monthData.push({ time: `W${4 - i}`, revenue, orders: count, aov });
    }
    return monthData;
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData(true);
    } finally {
      setRefreshing(false);
    }
  };
  const refreshControl = (
    <button
      className="dash-icon-button dash-refresh"
      onClick={() => void refresh()}
      disabled={refreshing || loading}
      aria-label={refreshing ? 'Refreshing dashboard' : 'Refresh dashboard'}
      title="Refresh dashboard"
    >
      <RefreshCw size={16} />
      <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
    </button>
  );
  const toolbar = document.getElementById('dashboard-overview-toolbar');
  return (
    <>
      {toolbar ? (
        createPortal(refreshControl, toolbar)
      ) : (
        <div className="overview-fallback-toolbar">{refreshControl}</div>
      )}
      {error && (
        <div className="overview-error" role="alert">
          <span>
            {error}
            {hasData ? ' Showing the last loaded data.' : ''}
          </span>
          <button
            className="overview-button"
            onClick={() => void refresh()}
            disabled={refreshing}
          >
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <div className="overview-loading" role="status">
          <p>Loading your restaurant overview…</p>
          <div className="overview-metrics">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="overview-skeleton" />
            ))}
          </div>
          <div className="overview-skeleton overview-skeleton-large" />
        </div>
      ) : hasData ? (
        <OverviewContent
          name={user?.name || ''}
          isStaff={user?.role === 'STAFF'}
          timezone={restaurantTimeZone}
          kpis={kpis}
          topItems={topItems}
          activeOrders={activeOrders}
          stats={orderStats}
          inventory={inventoryMetrics}
          subscription={subscription}
          period={salesPeriod}
          setPeriod={setSalesPeriod}
          chart={getSalesChartData()}
        />
      ) : null}
    </>
  );
};

export default DashboardOverview;
