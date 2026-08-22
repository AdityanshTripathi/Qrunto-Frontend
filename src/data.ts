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

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles?: string[]
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
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Active Orders', href: '/dashboard/orders', icon: ShoppingBag },
    ],
  },
  {
    label: 'Management',
    collapsible: true,
    items: [
      { name: 'Menu Items', href: '/dashboard/menu', icon: Utensils },
      { name: 'Categories', href: '/dashboard/categories', icon: Tags },
      { name: 'Tables & QRs', href: '/dashboard/tables', icon: QrCode },
      { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
      { name: 'Waiters', href: '/dashboard/waiters', icon: Users },
    ],
  },
  {
    label: 'Business',
    collapsible: true,
    items: [
      { name: 'CRM Hub', href: '/dashboard/crm', icon: Smile },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Billing Plan', href: '/dashboard/subscription', icon: CreditCard },
      { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
    ],
  },
]

export const currentUser = {
  name: 'Ordio Admin',
  email: 'admin@ordio.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
}
