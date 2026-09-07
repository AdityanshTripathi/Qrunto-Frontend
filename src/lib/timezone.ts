import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from './api';

export function timezone(value: unknown): string {
  if (typeof value === 'string' && !/^[+-]/.test(value)) {
    try { new Intl.DateTimeFormat('en', { timeZone: value }); return value; } catch { /* legacy setting */ }
  }
  return 'Asia/Kolkata';
}
const pending = new Map<string, Promise<any>>();
// Refresh persisted tenant metadata without adding public menu analytics events.
export function useRestaurantTimezone(): string {
  const userId = useAuthStore(state => state.user?.id);
  const tenantZone = useAuthStore(state => state.user?.restaurantTimezone ?? state.user?.restaurants[0]?.timezone);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const key = userId;
    if (!pending.has(key)) pending.set(key, api.get('/auth/me').finally(() => pending.delete(key)));
    pending.get(key)!
      .then(data => {
        const user = useAuthStore.getState().user;
        if (!active || !data?.user?.restaurantTimezone || user?.id !== userId) return;
        const zone = timezone(data.user.restaurantTimezone);
        if (user.restaurantTimezone !== zone) {
          useAuthStore.setState({ user: { ...user, restaurantTimezone: zone } });
        }
      }).catch(() => { /* use persisted tenant setting while offline */ });
    return () => { active = false; };
  }, [userId]);
  return timezone(tenantZone);
}
export function localDate(value: Date | string, zone: string): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone(zone), year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value)).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function addDays(day: string, days: number): string {
  const date = new Date(day + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function localHour(value: Date | string, zone: string): number {
  return Number(new Intl.DateTimeFormat('en', { timeZone: timezone(zone), hour: '2-digit', hourCycle: 'h23' }).format(new Date(value)));
}
