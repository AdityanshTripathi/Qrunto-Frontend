export type InventoryTab = 'overview' | 'stock' | 'recipes' | 'purchases' | 'operations' | 'reports';
export type OperationView = 'wastage' | 'adjustments' | 'count' | 'expiry';

export interface InventoryMetrics {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  todayConsumption: number;
  todayPurchases: number;
  todayWastage: number;
  stockHealthScore: number | null;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactName?: string | null;
  phone: string;
  email?: string | null;
  gstNumber?: string | null;
  address?: string | null;
  creditDays: number;
  outstandingBalance: number;
  isActive?: boolean;
}

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  openingStock: number;
  currentStock: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderQuantity: number;
  purchasePrice: number;
  averageCost: number;
  lastPurchaseDate?: string | null;
  expiryDate?: string | null;
  storageLocation?: string | null;
  supplierId?: string | null;
  notes?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
  supplier?: Pick<InventorySupplier, 'id' | 'name'> | null;
}

export interface RecipeIngredient {
  id: string;
  rawMaterialId?: string;
  quantity: number;
  rawMaterial?: Pick<RawMaterial, 'id' | 'name' | 'unit' | 'averageCost'>;
}

export interface InventoryRecipe {
  id: string;
  menuItemId?: string;
  notes?: string | null;
  menuItem?: { id: string; name: string; price: number };
  ingredients?: RecipeIngredient[];
  metrics: {
    foodCost: number;
    grossProfit: number;
    marginPercentage: number;
    foodCostPercentage: number;
  };
}

export interface MenuItemOption {
  id: string;
  name: string;
  price?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  receivedDate?: string | null;
  grandTotal: number;
  subtotal?: number;
  gstAmount?: number;
  invoiceNumber?: string | null;
  invoiceAttachmentUrl?: string | null;
  notes?: string | null;
  supplier?: Pick<InventorySupplier, 'name'>;
}

export type WastageReason = 'SPOILAGE' | 'EXPIRED' | 'SPILLAGE' | 'PREP_WASTE' | 'THEFT' | 'OTHER';

export interface WastageRecord {
  id: string;
  wasteDate: string;
  quantity: number;
  cost: number;
  reason: WastageReason;
  notes?: string | null;
  rawMaterial?: Pick<RawMaterial, 'name' | 'unit' | 'sku'>;
  user?: { name: string };
}

export interface AuditItem {
  id: string;
  expectedStock?: number;
  actualStock?: number;
  variance: number;
  rawMaterial?: Pick<RawMaterial, 'name' | 'unit' | 'sku'>;
}

export interface AuditRecord {
  id: string;
  auditDate: string;
  items?: AuditItem[];
  notes?: string | null;
  user?: { name: string };
}

export interface ConsumptionAnalytics {
  dailyConsumption: Array<{ date: string; cost: number }>;
  topConsumedItems: Array<{ name: string; cost: number }>;
}

export interface InventoryData {
  metrics: InventoryMetrics;
  rawMaterials: RawMaterial[];
  suppliers: InventorySupplier[];
  recipes: InventoryRecipe[];
  menuItems: MenuItemOption[];
  purchaseOrders: PurchaseOrder[];
  wastageRecords: WastageRecord[];
  auditRecords: AuditRecord[];
}

export type InventoryDialog =
  | { type: 'item'; item?: RawMaterial }
  | { type: 'detail'; item: RawMaterial }
  | { type: 'adjust'; item?: RawMaterial }
  | { type: 'recipe'; recipe?: InventoryRecipe; menuItemId?: string }
  | { type: 'purchase' }
  | { type: 'receive'; purchaseOrder: PurchaseOrder }
  | { type: 'supplier'; supplier?: InventorySupplier }
  | { type: 'wastage'; item?: RawMaterial }
  | { type: 'count' }
  | null;
