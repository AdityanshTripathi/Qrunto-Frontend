import React from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Tags,
  QrCode,
  Package,
  Users,
  Smile,
  BarChart3,
  CreditCard,
  Settings as SettingsIcon,
} from 'lucide-react'
import type { Capability } from './lib/capabilities'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  capability: Capability
}

export interface NavigationGroup {
  label: string
  collapsible?: boolean
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, capability: 'owner.dashboard' },
      { name: 'Active Orders', href: '/dashboard/orders', icon: ShoppingBag, capability: 'orders.manage' },
    ],
  },
  {
    label: 'Management',
    collapsible: true,
    items: [
      { name: 'Menu Items', href: '/dashboard/menu', icon: Utensils, capability: 'menu.manage' },
      { name: 'Categories', href: '/dashboard/categories', icon: Tags, capability: 'categories.manage' },
      { name: 'Tables & QRs', href: '/dashboard/tables', icon: QrCode, capability: 'tables.manage' },
      { name: 'Inventory', href: '/dashboard/inventory', icon: Package, capability: 'inventory.manage' },
      { name: 'Waiters', href: '/dashboard/waiters', icon: Users, capability: 'waiters.manage' },
    ],
  },
  {
    label: 'Business',
    collapsible: true,
    items: [
      { name: 'CRM', href: '/dashboard/crm', icon: Smile, capability: 'crm.manage' },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, capability: 'analytics.view' },
      { name: 'Billing Plan', href: '/dashboard/subscription', icon: CreditCard, capability: 'subscription.manage' },
      { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, capability: 'settings.manage' },
    ],
  },
]

export const currentUser = {
  name: 'Ordio Admin',
  email: 'admin@ordio.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
}
