import type { RawMaterial, WastageReason } from './inventory-types';

export type StockStatus = 'Healthy' | 'Low Stock' | 'Out of Stock';

export function getStockStatus(item: Pick<RawMaterial, 'currentStock' | 'minimumStockLevel'>): StockStatus {
  if (item.currentStock <= 0) return 'Out of Stock';
  if (item.currentStock <= item.minimumStockLevel) return 'Low Stock';
  return 'Healthy';
}

export function stockValue(item: Pick<RawMaterial, 'currentStock' | 'averageCost'>): number {
  return item.currentStock * item.averageCost;
}

export function consumptionUnit(unit: string): string {
  const normalized = unit.trim().toUpperCase();
  if (normalized === 'KG') return 'GM';
  if (normalized === 'LTR' || normalized === 'L') return 'ML';
  return normalized;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatInventoryDate(value: string | Date | null | undefined, timeZone: string, includeTime = false): string {
  if (!value) return 'Not available';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

export function isInCurrentMonth(value: string, timeZone: string, now = new Date()): boolean {
  const key = (date: Date) => new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  }).format(date);
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && key(parsed) === key(now);
}

export const WASTAGE_REASON_LABELS: Record<WastageReason, string> = {
  SPOILAGE: 'Spoiled',
  EXPIRED: 'Expired',
  SPILLAGE: 'Spillage',
  PREP_WASTE: 'Kitchen / prep waste',
  THEFT: 'Theft',
  OTHER: 'Other',
};

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
