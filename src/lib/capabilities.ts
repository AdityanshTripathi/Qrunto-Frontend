import type { User } from '../store/authStore';

export type UserRole = User['role'];

export type Capability =
  | 'superadmin.dashboard'
  | 'owner.dashboard'
  | 'orders.manage'
  | 'menu.manage'
  | 'categories.manage'
  | 'tables.manage'
  | 'inventory.manage'
  | 'waiters.manage'
  | 'crm.manage'
  | 'analytics.view'
  | 'billing.manage'
  | 'settings.manage'
  | 'subscription.manage'
  | 'waiter.dashboard';

const OWNER_CAPABILITIES: readonly Capability[] = [
  'owner.dashboard',
  'orders.manage',
  'menu.manage',
  'categories.manage',
  'tables.manage',
  'inventory.manage',
  'waiters.manage',
  'crm.manage',
  'analytics.view',
  'billing.manage',
  'settings.manage',
  'subscription.manage',
];

export const ROLE_CAPABILITIES: Readonly<Record<UserRole, readonly Capability[]>> = {
  SUPER_ADMIN: ['superadmin.dashboard', ...OWNER_CAPABILITIES],
  RESTAURANT_OWNER: OWNER_CAPABILITIES,
  STAFF: [],
  WAITER: ['waiter.dashboard'],
};

export function hasCapability(role: UserRole | undefined, capability: Capability): boolean {
  return Boolean(role && ROLE_CAPABILITIES[role].includes(capability));
}

export function defaultRouteForRole(role: UserRole | undefined): string {
  if (role === 'WAITER') return '/waiter-dashboard';
  if (role === 'STAFF') return '/unauthorized';
  return '/dashboard';
}
