import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../../../lib/api';
import type { InventoryData } from './inventory-types';

const EMPTY_DATA: InventoryData = {
  metrics: {
    totalValue: 0,
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    todayConsumption: 0,
    todayPurchases: 0,
    todayWastage: 0,
    stockHealthScore: null,
  },
  rawMaterials: [],
  suppliers: [],
  recipes: [],
  menuItems: [],
  purchaseOrders: [],
  wastageRecords: [],
  auditRecords: [],
};

const messageFromError = (error: unknown) => {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'An unexpected error occurred while loading inventory.';
};

export function useInventoryWorkspace() {
  const [data, setData] = useState<InventoryData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const refreshInventory = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const [metrics, rawMaterials, suppliers, recipes, menuItems, purchases, wastage, audits] = await Promise.all([
        api.get('/inventory/reports/dashboard-metrics'),
        api.get('/inventory/raw-materials?status=ACTIVE'),
        api.get('/inventory/suppliers'),
        api.get('/inventory/recipes'),
        api.get('/menu-items'),
        api.get('/inventory/purchases'),
        api.get('/inventory/wastage'),
        api.get('/inventory/audits'),
      ]);
      if (sequence !== requestSequence.current) return;
      setData({
        metrics: metrics.metrics,
        rawMaterials: rawMaterials.rawMaterials ?? [],
        suppliers: suppliers.suppliers ?? [],
        recipes: recipes.recipes ?? [],
        menuItems: menuItems.menuItems ?? [],
        purchaseOrders: purchases.purchaseOrders ?? [],
        wastageRecords: wastage.wastageRecords ?? [],
        auditRecords: audits.audits ?? [],
      });
    } catch (requestError: unknown) {
      if (sequence !== requestSequence.current) return;
      setError(messageFromError(requestError));
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) return refreshInventory();
    });
    return () => { cancelled = true; requestSequence.current += 1; };
  }, [refreshInventory]);

  return { data, loading, error, refreshInventory };
}
