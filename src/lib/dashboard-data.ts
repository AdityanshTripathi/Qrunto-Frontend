export interface DashboardChartOrder {
  status: string;
  totalAmount: number;
  createdAt: string;
}

export type SalesPeriod = 'today' | 'week' | 'month';

export interface DashboardDateTools {
  localDate: (value: Date | string, timeZone: string) => string;
  localHour: (value: Date | string, timeZone: string) => number;
  addDays: (date: string, days: number) => string;
}

export interface SalesChartPoint { time: string; revenue: number; orders: number; aov: number; }

const point = (time: string, orders: DashboardChartOrder[]): SalesChartPoint => {
  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  return { time, revenue, orders: orders.length, aov: orders.length ? Number((revenue / orders.length).toFixed(2)) : 0 };
};

export const buildSalesChartData = (
  orders: DashboardChartOrder[],
  period: SalesPeriod,
  timeZone: string,
  dateTools: DashboardDateTools,
  now = new Date(),
): SalesChartPoint[] => {
  const paidServedOrders = orders.filter((order) => ['SERVED', 'PAID'].includes(order.status));
  if (!paidServedOrders.length) return [];

  if (period === 'today') {
    const today = dateTools.localDate(now, timeZone);
    return Array.from({ length: 24 }, (_, hour) => {
      const time = `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`;
      return point(time, paidServedOrders.filter((order) => dateTools.localDate(new Date(order.createdAt), timeZone) === today && dateTools.localHour(new Date(order.createdAt), timeZone) === hour));
    });
  }

  if (period === 'week') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, index) => {
      const date = dateTools.addDays(dateTools.localDate(now, timeZone), index - 6);
      const day = new Date(`${date}T00:00:00Z`);
      return point(dayNames[day.getUTCDay()]!, paidServedOrders.filter((order) => dateTools.localDate(new Date(order.createdAt), timeZone) === date));
    });
  }

  return Array.from({ length: 4 }, (_, index) => {
    const start = dateTools.addDays(dateTools.localDate(now, timeZone), -(4 - index) * 7 + 1);
    const end = dateTools.addDays(dateTools.localDate(now, timeZone), -(3 - index) * 7);
    return point(`W${index + 1}`, paidServedOrders.filter((order) => {
      const day = dateTools.localDate(new Date(order.createdAt), timeZone);
      return day >= start && day <= end;
    }));
  });
};
