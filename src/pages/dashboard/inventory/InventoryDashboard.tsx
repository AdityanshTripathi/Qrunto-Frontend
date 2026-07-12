import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import { 
  Package, 
  Truck, 
  BookOpen, 
  ShoppingCart, 
  Trash2, 
  ClipboardCheck, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Check,
  X,
  ArrowRightLeft
} from 'lucide-react';

type Tab = 'overview' | 'items' | 'recipes' | 'purchases' | 'suppliers' | 'wastage' | 'audits' | 'transfers';

const getRecipeUnitLabel = (materialUnit: string): string => {
  const unit = (materialUnit || '').toUpperCase().trim();
  if (unit === 'KG') return 'GM';
  if (unit === 'LTR' || unit === 'L') return 'ML';
  return unit;
};

const getConversionFactor = (materialUnit: string): number => {
  const unit = (materialUnit || '').toUpperCase().trim();
  if (unit === 'KG' || unit === 'LTR' || unit === 'L') return 1000;
  return 1;
};

export const InventoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  // Core Data State
  const [metrics, setMetrics] = useState<any>({
    totalValue: 0,
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    todayConsumption: 0,
    todayPurchases: 0,
    todayWastage: 0,
    stockHealthScore: 100
  });
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [wastageRecords, setWastageRecords] = useState<any[]>([]);
  const [auditRecords, setAuditRecords] = useState<any[]>([]);
  const [transferRecords, setTransferRecords] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]); // For transfers

  // Filter & Search State
  const [itemSearch, setItemSearch] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState('All');
  const [itemStockFilter, setItemStockFilter] = useState('All');

  // Modals & Forms State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    sku: '',
    unit: '',
    openingStock: 0,
    currentStock: 0,
    minimumStockLevel: 0,
    maximumStockLevel: 0,
    reorderQuantity: 0,
    purchasePrice: 0,
    averageCost: 0,
    storageLocation: '',
    supplierId: '',
    notes: ''
  });

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<any | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    quantityChange: 0,
    actionType: 'MANUAL_ADJUSTMENT',
    reason: ''
  });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    gstNumber: '',
    address: '',
    creditDays: 0
  });

  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeForm, setRecipeForm] = useState({
    menuItemId: '',
    notes: '',
    ingredients: [{ rawMaterialId: '', quantity: 0 }]
  });

  const [showPOModal, setShowPOModal] = useState(false);
  const [poForm, setPOForm] = useState({
    supplierId: '',
    poNumber: '',
    notes: '',
    items: [{ rawMaterialId: '', quantity: 0, unitPrice: 0, totalCost: 0 }]
  });

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receivingPO, setReceivingPO] = useState<any | null>(null);
  const [receiveForm, setReceiveForm] = useState({
    invoiceNumber: '',
    invoiceAttachmentUrl: '',
    notes: ''
  });

  const [showWastageModal, setShowWastageModal] = useState(false);
  const [wastageForm, setWastageForm] = useState({
    rawMaterialId: '',
    quantity: 0,
    reason: 'SPOILAGE',
    notes: ''
  });

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditForm, setAuditForm] = useState({
    notes: '',
    items: [] as Array<{ rawMaterialId: string; actualStock: number; name: string; unit: string; currentStock: number; notes: string }>
  });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    destBranchId: '',
    notes: '',
    items: [{ rawMaterialId: '', quantity: 0 }]
  });

  useEffect(() => {
    fetchCoreData();
  }, [activeTab]);

  const fetchCoreData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const metRes = await api.get('/inventory/reports/dashboard-metrics');
        setMetrics(metRes.metrics);
        // Load low stock items for dashboard alert
        const rawRes = await api.get('/inventory/raw-materials?lowStock=true');
        setRawMaterials(rawRes.rawMaterials);
      } else if (activeTab === 'items') {
        const rawRes = await api.get('/inventory/raw-materials');
        setRawMaterials(rawRes.rawMaterials);
        const supRes = await api.get('/inventory/suppliers');
        setSuppliers(supRes.suppliers);
      } else if (activeTab === 'suppliers') {
        const supRes = await api.get('/inventory/suppliers');
        setSuppliers(supRes.suppliers);
      } else if (activeTab === 'recipes') {
        const recRes = await api.get('/inventory/recipes');
        setRecipes(recRes.recipes);
        // Fetch menu items for selection
        const menuRes = await api.get('/menu-items');
        setMenuItems(menuRes.menuItems || []);
        const rawRes = await api.get('/inventory/raw-materials');
        setRawMaterials(rawRes.rawMaterials);
      } else if (activeTab === 'purchases') {
        const poRes = await api.get('/inventory/purchases');
        setPurchaseOrders(poRes.purchaseOrders);
        const supRes = await api.get('/inventory/suppliers');
        setSuppliers(supRes.suppliers);
        const rawRes = await api.get('/inventory/raw-materials');
        setRawMaterials(rawRes.rawMaterials);
      } else if (activeTab === 'wastage') {
        const wasteRes = await api.get('/inventory/wastage');
        setWastageRecords(wasteRes.wastageRecords);
        const rawRes = await api.get('/inventory/raw-materials');
        setRawMaterials(rawRes.rawMaterials);
      } else if (activeTab === 'audits') {
        const auditRes = await api.get('/inventory/audits');
        setAuditRecords(auditRes.audits);
        const rawRes = await api.get('/inventory/raw-materials');
        setRawMaterials(rawRes.rawMaterials);
      } else if (activeTab === 'transfers') {
        const trfRes = await api.get('/inventory/transfers');
        setTransferRecords(trfRes.transfers);
        // Load raw materials and brand restaurants
        const rawRes = await api.get('/inventory/raw-materials');
        setRawMaterials(rawRes.rawMaterials);
        
        // Wait, to fetch other branch restaurants, we can check settings or auth user details.
        // Let's call /superadmin/restaurants or get user restaurants from store
        // Let's use user restaurants first.
        const storeUser = JSON.parse(localStorage.getItem('auth_store') || '{}')?.state?.user;
        setRestaurants(storeUser?.restaurants || []);
      }
    } catch (err: any) {
      toast.error('Failed to load inventory data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Raw Material Submit Handler
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...itemForm,
        supplierId: itemForm.supplierId || null,
        openingStock: Number(itemForm.openingStock),
        currentStock: Number(itemForm.currentStock),
        minimumStockLevel: Number(itemForm.minimumStockLevel),
        maximumStockLevel: Number(itemForm.maximumStockLevel),
        reorderQuantity: Number(itemForm.reorderQuantity),
        purchasePrice: Number(itemForm.purchasePrice),
        averageCost: Number(itemForm.averageCost || itemForm.purchasePrice)
      };

      if (editingItem) {
        await api.put(`/inventory/raw-materials/${editingItem.id}`, payload);
        toast.success('Raw material updated successfully');
      } else {
        await api.post('/inventory/raw-materials', payload);
        toast.success('Raw material created successfully');
      }
      setShowItemModal(false);
      setEditingItem(null);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      sku: item.sku,
      unit: item.unit,
      openingStock: item.openingStock,
      currentStock: item.currentStock,
      minimumStockLevel: item.minimumStockLevel,
      maximumStockLevel: item.maximumStockLevel,
      reorderQuantity: item.reorderQuantity,
      purchasePrice: item.purchasePrice,
      averageCost: item.averageCost,
      storageLocation: item.storageLocation || '',
      supplierId: item.supplierId || '',
      notes: item.notes || ''
    });
    setShowItemModal(true);
  };

  // Supplier Submit Handler
  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...supplierForm,
        creditDays: Number(supplierForm.creditDays)
      };

      if (editingSupplier) {
        await api.put(`/inventory/suppliers/${editingSupplier.id}`, payload);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/inventory/suppliers', payload);
        toast.success('Supplier created successfully');
      }
      setShowSupplierModal(false);
      setEditingSupplier(null);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      contactName: supplier.contactName || '',
      phone: supplier.phone,
      email: supplier.email || '',
      gstNumber: supplier.gstNumber || '',
      address: supplier.address || '',
      creditDays: supplier.creditDays
    });
    setShowSupplierModal(true);
  };

  // Recipe Submit Handler
  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/recipes', recipeForm);
      toast.success('Recipe configured successfully');
      setShowRecipeModal(false);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // PO Submit Handler
  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subtotal = poForm.items.reduce((acc, curr) => acc + curr.totalCost, 0);
      const gstAmount = subtotal * 0.05; // Assumed 5% standard GST
      const grandTotal = subtotal + gstAmount;

      const payload = {
        ...poForm,
        subtotal,
        gstAmount,
        grandTotal,
        status: 'PENDING'
      };

      await api.post('/inventory/purchases', payload);
      toast.success('Purchase Order created successfully');
      setShowPOModal(false);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReceivePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/inventory/purchases/${receivingPO.id}/receive`, receiveForm);
      toast.success('Purchase received, stock added, average costs updated');
      setShowReceiveModal(false);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Wastage Submit Handler
  const handleWastageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...wastageForm,
        quantity: Number(wastageForm.quantity)
      };
      await api.post('/inventory/wastage', payload);
      toast.success('Wastage event recorded successfully');
      setShowWastageModal(false);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Audit Submit Handler
  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        notes: auditForm.notes,
        items: auditForm.items.map(item => ({
          rawMaterialId: item.rawMaterialId,
          actualStock: Number(item.actualStock),
          notes: item.notes || null
        }))
      };
      await api.post('/inventory/audits', payload);
      toast.success('Physical count audit recorded successfully');
      setShowAuditModal(false);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Transfer Submit Handler
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...transferForm,
        items: transferForm.items.map(item => ({
          ...item,
          quantity: Number(item.quantity)
        }))
      };
      await api.post('/inventory/transfers', payload);
      toast.success('Stock transfer request initiated successfully');
      setShowTransferModal(false);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleApproveTransfer = async (id: string) => {
    try {
      await api.post(`/inventory/transfers/${id}/approve`);
      toast.success('Transfer approved and stocks transferred successfully');
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRejectTransfer = async (id: string) => {
    try {
      await api.post(`/inventory/transfers/${id}/reject`);
      toast.success('Transfer rejected, stocks returned successfully');
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleManualAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        rawMaterialId: adjustingItem.id,
        quantityChange: Number(adjustForm.quantityChange),
        actionType: adjustForm.actionType,
        reason: adjustForm.reason
      };
      await api.post('/inventory/raw-materials/adjust', payload);
      toast.success('Manual stock adjustment successful');
      setShowAdjustModal(false);
      setAdjustingItem(null);
      fetchCoreData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter items
  const filteredItems = rawMaterials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase()) || item.sku.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesCategory = itemCategoryFilter === 'All' || item.category === itemCategoryFilter;
    const matchesStock = itemStockFilter === 'All' || 
      (itemStockFilter === 'Low Stock' && item.currentStock <= item.minimumStockLevel) ||
      (itemStockFilter === 'Out of Stock' && item.currentStock <= 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Tab controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#374151]/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#FF6B35] to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#FF6B35]/25">
            <Package className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 tracking-tight">Inventory Workspace</h2>
            <p className="text-xs text-slate-500 dark:text-[#9ca3af]">Manage suppliers, stock, recipes, and warehouse audits</p>
          </div>
        </div>

        {/* Action button depending on tab */}
        <div>
          {activeTab === 'items' && (
            <button
              onClick={() => {
                setEditingItem(null);
                setItemForm({
                  name: '', category: '', sku: '', unit: '', openingStock: 0, currentStock: 0,
                  minimumStockLevel: 0, maximumStockLevel: 9999, reorderQuantity: 0, purchasePrice: 0,
                  averageCost: 0, storageLocation: '', supplierId: '', notes: ''
                });
                setShowItemModal(true);
              }}
              className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Raw Material
            </button>
          )}
          {activeTab === 'suppliers' && (
            <button
              onClick={() => {
                setEditingSupplier(null);
                setSupplierForm({ name: '', contactName: '', phone: '', email: '', gstNumber: '', address: '', creditDays: 0 });
                setShowSupplierModal(true);
              }}
              className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Supplier
            </button>
          )}
          {activeTab === 'recipes' && (
            <button
              onClick={() => {
                setRecipeForm({ menuItemId: '', notes: '', ingredients: [{ rawMaterialId: '', quantity: 0 }] });
                setShowRecipeModal(true);
              }}
              className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Configure Recipe
            </button>
          )}
          {activeTab === 'purchases' && (
            <button
              onClick={() => {
                const poNum = `PO-${Date.now().toString().slice(-6)}`;
                setPOForm({ supplierId: '', poNumber: poNum, notes: '', items: [{ rawMaterialId: '', quantity: 0, unitPrice: 0, totalCost: 0 }] });
                setShowPOModal(true);
              }}
              className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create Purchase Order
            </button>
          )}
          {activeTab === 'wastage' && (
            <button
              onClick={() => {
                setWastageForm({ rawMaterialId: '', quantity: 0, reason: 'SPOILAGE', notes: '' });
                setShowWastageModal(true);
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-red-500/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Log Waste Incident
            </button>
          )}
          {activeTab === 'audits' && (
            <button
              onClick={() => {
                setAuditForm({
                  notes: '',
                  items: rawMaterials.map(rm => ({
                    rawMaterialId: rm.id,
                    actualStock: rm.currentStock,
                    name: rm.name,
                    unit: rm.unit,
                    currentStock: rm.currentStock,
                    notes: ''
                  }))
                });
                setShowAuditModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
            >
              <ClipboardCheck className="w-4 h-4" /> Initiate Physical Audit
            </button>
          )}
          {activeTab === 'transfers' && (
            <button
              onClick={() => {
                setTransferForm({ destBranchId: '', notes: '', items: [{ rawMaterialId: '', quantity: 0 }] });
                setShowTransferModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" /> Request Outlet Transfer
            </button>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-1 bg-white/70 dark:bg-[#1f2937]/50 border border-slate-200 dark:border-[#374151]/40 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', name: 'Dashboard', icon: TrendingUp },
          { id: 'items', name: 'Raw Materials', icon: Package },
          { id: 'recipes', name: 'Recipe costing', icon: BookOpen },
          { id: 'purchases', name: 'Purchase Orders', icon: ShoppingCart },
          { id: 'suppliers', name: 'Suppliers List', icon: Truck },
          { id: 'wastage', name: 'Wastage logs', icon: Trash2 },
          { id: 'audits', name: 'Physical count', icon: ClipboardCheck },
          { id: 'transfers', name: 'Branch transfers', icon: ArrowRightLeft }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/15' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-[#374151]/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* 2. Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">Fetching inventory dataset...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Stock Value', val: `₹${metrics.totalValue}`, sub: 'Active materials value', color: 'border-l-[#FF6B35]', bg: 'bg-[#FF6B35]/5', text: 'text-[#FF6B35]' },
                  { name: 'Low Stock warnings', val: metrics.lowStockItems, sub: 'Items at or below min', color: 'border-l-amber-500', bg: 'bg-amber-500/5', text: 'text-amber-500' },
                  { name: 'Out of Stock', val: metrics.outOfStockItems, sub: 'Depleted SKU counts', color: 'border-l-red-500', bg: 'bg-red-500/5', text: 'text-red-500' },
                  { name: 'Stock Health Score', val: `${metrics.stockHealthScore}%`, sub: 'Target health ratio', color: 'border-l-emerald-500', bg: 'bg-emerald-500/5', text: 'text-emerald-500' }
                ].map((card, i) => (
                  <div key={i} className={`bg-white dark:bg-[#1f2937]/40 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between border-l-4 ${card.color} transition-all hover:translate-y-[-2px] hover:shadow-md`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{card.name}</span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg} ${card.text}`}>
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800 dark:text-gray-100 tracking-tight">{card.val}</p>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-1">{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Today's Transactions Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Today's Consumption Value", value: `₹${metrics.todayConsumption}`, color: 'from-orange-500/10 to-transparent border-orange-500/20 text-orange-500' },
                  { title: "Today's Purchase Value", value: `₹${metrics.todayPurchases}`, color: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-500' },
                  { title: "Today's Wastage Value", value: `₹${metrics.todayWastage}`, color: 'from-red-500/10 to-transparent border-red-500/20 text-red-500' }
                ].map((tx, idx) => (
                  <div key={idx} className={`bg-gradient-to-b ${tx.color} border rounded-2xl p-6 flex flex-col gap-2 justify-center shadow-sm`}>
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 tracking-wide uppercase">{tx.title}</span>
                    <span className="text-3xl font-black tracking-tight">{tx.value}</span>
                  </div>
                ))}
              </div>

              {/* Low Stock Alerts list */}
              {rawMaterials.length > 0 && (
                <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-5 h-5 animate-bounce" /> Low Stock Alerts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rawMaterials.map((rm) => (
                      <div key={rm.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex justify-between items-center gap-3">
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-gray-100">{rm.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">SKU: {rm.sku} | Unit: {rm.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-amber-600 dark:text-amber-400">{rm.currentStock} {rm.unit}</p>
                          <p className="text-[9px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">Min level: {rm.minimumStockLevel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RAW MATERIALS LIST */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              {/* Search and Filters Bar */}
              <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                
                <div className="flex gap-4 w-full md:w-auto shrink-0">
                  <select
                    value={itemCategoryFilter}
                    onChange={(e) => setItemCategoryFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  >
                    <option value="All">All Categories</option>
                    {Array.from(new Set(rawMaterials.map(rm => rm.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={itemStockFilter}
                    onChange={(e) => setItemStockFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="Low Stock">Low Stock Warnings</option>
                    <option value="Out of Stock">Out of Stock Only</option>
                  </select>
                </div>
              </div>

              {/* Items Datatable */}
              <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#111827]/40 border-b border-slate-200 dark:border-[#374151]/30">
                        {['SKU / Name', 'Category', 'Quantity', 'Purchase Price', 'Weighted Avg Cost', 'Storage Location', 'Supplier', 'Actions'].map((h, i) => (
                          <th key={i} className="p-4 text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/35">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-400 text-xs font-medium">No raw materials matched filters.</td>
                        </tr>
                      ) : (
                        filteredItems.map(item => {
                          const isLow = item.currentStock <= item.minimumStockLevel;
                          const isOut = item.currentStock <= 0;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-[#374151]/10 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-xs text-slate-800 dark:text-white">{item.name}</p>
                                <p className="text-[9px] text-slate-400 dark:text-gray-500 font-mono mt-0.5">{item.sku}</p>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-full text-[10px] font-bold text-slate-600 dark:text-gray-300">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-black ${
                                    isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-slate-700 dark:text-gray-200'
                                  }`}>
                                    {item.currentStock} {item.unit}
                                  </span>
                                  {isOut && <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[8px] font-bold">DEPLETED</span>}
                                  {!isOut && isLow && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[8px] font-bold">LOW</span>}
                                </div>
                              </td>
                              <td className="p-4 font-semibold text-xs">₹{item.purchasePrice}</td>
                              <td className="p-4 font-bold text-xs text-[#FF6B35]">₹{item.averageCost}</td>
                              <td className="p-4 text-xs font-medium text-slate-500 dark:text-gray-400">{item.storageLocation || '-'}</td>
                              <td className="p-4 text-xs font-medium text-slate-600 dark:text-gray-300">{item.supplier?.name || '-'}</td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditItem(item)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#374151] rounded-lg text-slate-500 dark:text-gray-300 transition-colors"
                                    title="Edit Raw Material"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAdjustingItem(item);
                                      setAdjustForm({ quantityChange: 0, actionType: 'MANUAL_ADJUSTMENT', reason: '' });
                                      setShowAdjustModal(true);
                                    }}
                                    className="p-1.5 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] rounded-lg text-slate-500 dark:text-gray-300 transition-colors"
                                    title="Quick Stock Adjust"
                                  >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECIPES */}
          {activeTab === 'recipes' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Recipe Cards List */}
              <div className="xl:col-span-2 space-y-4">
                {recipes.length === 0 ? (
                  <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-12 text-center text-slate-400 text-xs font-medium">
                    No dish recipes configured yet. Let's build one!
                  </div>
                ) : (
                  recipes.map(recipe => {
                    const price = recipe.menuItem?.price || 0;
                    const foodCost = recipe.metrics?.foodCost || 0;
                    const gp = recipe.metrics?.grossProfit || 0;
                    const margin = recipe.metrics?.marginPercentage || 0;

                    return (
                      <div key={recipe.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-6 shadow-sm space-y-4 transition-all hover:shadow-md">
                        {/* Title and stats summary */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-gray-100 tracking-tight">{recipe.menuItem?.name}</h4>
                            <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 mt-0.5">Dish Servings pricing: ₹{price}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Food Cost</span>
                              <span className="text-xs font-black text-red-500">₹{foodCost.toFixed(2)} ({recipe.metrics?.foodCostPercentage.toFixed(1)}%)</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Gross Profit</span>
                              <span className="text-xs font-black text-emerald-500">₹{gp.toFixed(2)} ({margin.toFixed(1)}%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Ingredients Breakdown */}
                        <div className="border-t border-slate-100 dark:border-[#374151]/20 pt-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Ingredients List</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recipe.ingredients?.map((ing: any) => {
                              const factor = getConversionFactor(ing.rawMaterial?.unit);
                              const cost = (ing.quantity / factor) * (ing.rawMaterial?.averageCost || 0);
                              const label = getRecipeUnitLabel(ing.rawMaterial?.unit);
                              return (
                                <div key={ing.id} className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/30 rounded-xl p-3 flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-slate-700 dark:text-gray-300">{ing.rawMaterial?.name}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">Qty: {ing.quantity} {label} | Avg cost: ₹{ing.rawMaterial?.averageCost} / {ing.rawMaterial?.unit}</p>
                                  </div>
                                  <span className="font-black text-slate-600 dark:text-gray-400">₹{cost.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Recipe Guide Panel */}
              <div className="bg-gradient-to-tr from-[#FF6B35]/10 to-transparent border border-[#FF6B35]/20 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-black text-sm text-[#FF6B35] uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Food Cost Analytics
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                  Food Cost ratio maps raw material weighted average costs directly against your menu sale price. Ensure a healthy gross profit margin above <strong>65%</strong> to optimize operations.
                </p>
                <div className="border-t border-[#FF6B35]/15 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Average Profit Margin</span>
                    <span className="font-black text-emerald-500">
                      {recipes.length > 0 
                        ? `${(recipes.reduce((acc, curr) => acc + curr.metrics.marginPercentage, 0) / recipes.length).toFixed(1)}%`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Configured Dishes</span>
                    <span className="font-black">{recipes.length} menu items</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PURCHASES */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#111827]/40 border-b border-slate-200 dark:border-[#374151]/30">
                        {['PO Number', 'Supplier', 'Order Date', 'Grand Total', 'Status', 'Invoice Ref', 'Actions'].map((h, i) => (
                          <th key={i} className="p-4 text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/35">
                      {purchaseOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-400 text-xs font-medium">No purchase logs found.</td>
                        </tr>
                      ) : (
                        purchaseOrders.map(po => {
                          const isReceived = po.status === 'RECEIVED';
                          return (
                            <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-[#374151]/10 transition-colors text-xs">
                              <td className="p-4 font-black">{po.poNumber}</td>
                              <td className="p-4 font-semibold text-slate-700 dark:text-gray-300">{po.supplier?.name}</td>
                              <td className="p-4 text-slate-500 dark:text-gray-400">{new Date(po.orderDate).toLocaleDateString()}</td>
                              <td className="p-4 font-bold text-slate-800 dark:text-white">₹{po.grandTotal.toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${
                                  isReceived 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                  {po.status}
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-slate-500 dark:text-gray-400">{po.invoiceNumber || '-'}</td>
                              <td className="p-4">
                                {!isReceived && (
                                  <button
                                    onClick={() => {
                                      setReceivingPO(po);
                                      setReceiveForm({ invoiceNumber: '', invoiceAttachmentUrl: '', notes: '' });
                                      setShowReceiveModal(true);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-lg py-1.5 px-3 transition-colors flex items-center gap-1 active:scale-95"
                                  >
                                    <Check className="w-3 h-3" /> Receive stock
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {suppliers.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-12 text-center text-slate-400 text-xs font-medium">
                  No suppliers registered yet.
                </div>
              ) : (
                suppliers.map(sup => (
                  <div key={sup.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition-all hover:translate-y-[-2px]">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight">{sup.name}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">Contact: {sup.contactName || '-'}</p>
                        </div>
                        <span className="font-black text-xs text-red-500">₹{sup.outstandingBalance.toFixed(2)}</span>
                      </div>
                      <div className="text-xs space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-[#374151]/20 text-slate-500 dark:text-gray-400">
                        <p><strong>Phone:</strong> {sup.phone}</p>
                        <p><strong>Email:</strong> {sup.email || '-'}</p>
                        <p><strong>Credit Terms:</strong> {sup.creditDays} days</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditSupplier(sup)}
                      className="border border-slate-200 hover:bg-slate-50 dark:border-[#374151]/50 dark:hover:bg-[#374151]/20 font-bold text-[10px] tracking-wider uppercase rounded-xl py-2 w-full transition-colors text-slate-600 dark:text-gray-300 mt-4"
                    >
                      Edit Supplier details
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: WASTAGE */}
          {activeTab === 'wastage' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#111827]/40 border-b border-slate-200 dark:border-[#374151]/30">
                        {['Date', 'Material Name', 'Quantity', 'Wastage Cost', 'Reason', 'Reported By', 'Notes'].map((h, i) => (
                          <th key={i} className="p-4 text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/35">
                      {wastageRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-400 text-xs font-medium">No wastage reports.</td>
                        </tr>
                      ) : (
                        wastageRecords.map(w => (
                          <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-[#374151]/10 transition-colors text-xs">
                            <td className="p-4 text-slate-500 dark:text-gray-400">{new Date(w.wasteDate).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-slate-700 dark:text-gray-200">{w.rawMaterial?.name}</td>
                            <td className="p-4 font-semibold">{w.quantity} {w.rawMaterial?.unit}</td>
                            <td className="p-4 font-black text-red-500">₹{w.cost.toFixed(2)}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[9px] font-bold">
                                {w.reason}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-gray-300">{w.user?.name}</td>
                            <td className="p-4 text-slate-500 truncate max-w-xs">{w.notes || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AUDITS */}
          {activeTab === 'audits' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#111827]/40 border-b border-slate-200 dark:border-[#374151]/30">
                        {['Audit Date', 'Conducted By', 'Item Count', 'Audited Items & Variances', 'General Notes'].map((h, i) => (
                          <th key={i} className="p-4 text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/35">
                      {auditRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-medium">No physical audits performed.</td>
                        </tr>
                      ) : (
                        auditRecords.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-[#374151]/10 transition-colors text-xs">
                            <td className="p-4 text-slate-500 dark:text-gray-400">{new Date(a.auditDate).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-slate-700 dark:text-gray-200">{a.user?.name}</td>
                            <td className="p-4 font-semibold">{a.items?.length || 0} items</td>
                            <td className="p-4 space-y-1">
                              {a.items?.slice(0, 3).map((it: any) => {
                                const isPos = it.variance > 0;
                                return (
                                  <div key={it.id} className="text-[10px] flex items-center gap-2">
                                    <span className="font-semibold">{it.rawMaterial?.name}:</span>
                                    <span className={it.variance === 0 ? 'text-slate-400' : isPos ? 'text-emerald-500' : 'text-red-500'}>
                                      {isPos ? '+' : ''}{it.variance} {it.rawMaterial?.unit}
                                    </span>
                                  </div>
                                );
                              })}
                              {a.items?.length > 3 && <span className="text-[9px] text-slate-400">+{a.items.length - 3} more items</span>}
                            </td>
                            <td className="p-4 text-slate-500 truncate max-w-xs">{a.notes || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TRANSFERS */}
          {activeTab === 'transfers' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#111827]/40 border-b border-slate-200 dark:border-[#374151]/30">
                        {['Transfer ID', 'Source Outlet', 'Dest Outlet', 'Status', 'Date Sent', 'Items', 'Action'].map((h, i) => (
                          <th key={i} className="p-4 text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/35">
                      {transferRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-400 text-xs font-medium">No stock transfers logged.</td>
                        </tr>
                      ) : (
                        transferRecords.map(tr => {
                          const currentRestId = JSON.parse(localStorage.getItem('auth_store') || '{}')?.state?.user?.restaurantId;
                          const isDest = tr.destBranchId === currentRestId;
                          const isPending = tr.status === 'PENDING';

                          return (
                            <tr key={tr.id} className="hover:bg-slate-50/50 dark:hover:bg-[#374151]/10 transition-colors text-xs">
                              <td className="p-4 font-black">{tr.transferNumber}</td>
                              <td className="p-4 font-semibold text-slate-700 dark:text-gray-300">{tr.sourceBranch?.name}</td>
                              <td className="p-4 font-semibold text-slate-700 dark:text-gray-300">{tr.destBranch?.name}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${
                                  tr.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  tr.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                  {tr.status}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500">{tr.sentDate ? new Date(tr.sentDate).toLocaleDateString() : new Date(tr.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                {tr.items?.map((it: any) => (
                                  <div key={it.id} className="text-[10px] font-medium text-slate-600 dark:text-gray-400">
                                    {it.rawMaterial?.name} ({it.quantity} {it.rawMaterial?.unit})
                                  </div>
                                ))}
                              </td>
                              <td className="p-4">
                                {isDest && isPending && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleApproveTransfer(tr.id)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-lg py-1 px-2.5 transition-all"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectTransfer(tr.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-lg py-1 px-2.5 transition-all"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MODAL DIALOGS */}
      {/* 3a. Add/Edit Raw Material Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                {editingItem ? 'Edit Raw Material' : 'Add New Raw Material'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleItemSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="Dairy, Vegetable, Meat, Grocery etc."
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="KG, LTR, PCS, GM etc."
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Current Stock</label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={itemForm.currentStock}
                    onChange={(e) => setItemForm({ ...itemForm, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Min Level (Safety)</label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={itemForm.minimumStockLevel}
                    onChange={(e) => setItemForm({ ...itemForm, minimumStockLevel: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Purchase price per unit (₹)</label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={itemForm.purchasePrice}
                    onChange={(e) => setItemForm({ ...itemForm, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Supplier</label>
                  <select
                    value={itemForm.supplierId}
                    onChange={(e) => setItemForm({ ...itemForm, supplierId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  >
                    <option value="">No Supplier</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/25 active:scale-95"
                >
                  {editingItem ? 'Save Updates' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3b. Add/Edit Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                {editingSupplier ? 'Edit Supplier' : 'Register Supplier'}
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSupplierSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/25 active:scale-95"
                >
                  {editingSupplier ? 'Save Updates' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3c. Quick Stock Adjust Modal */}
      {showAdjustModal && adjustingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                Adjust Stock: {adjustingItem.name}
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleManualAdjust} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Quantity change (use positive to add, negative to deduct)
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={adjustForm.quantityChange}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Current Stock: {adjustingItem.currentStock} {adjustingItem.unit}</span>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={adjustForm.reason}
                  placeholder="Reason for stock level discrepancy..."
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/25 active:scale-95"
                >
                  Save Stock Levels
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3d. Configure Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                Configure Dish Recipe
              </h3>
              <button onClick={() => setShowRecipeModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRecipeSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Select Menu Item</label>
                <select
                  required
                  value={recipeForm.menuItemId}
                  onChange={(e) => setRecipeForm({ ...recipeForm, menuItemId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Choose item...</option>
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (₹{item.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Ingredients Needed</label>
                  <button
                    type="button"
                    onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { rawMaterialId: '', quantity: 0 }] })}
                    className="text-[#FF6B35] hover:text-orange-600 font-extrabold text-[10px] uppercase flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add line
                  </button>
                </div>

                <div className="space-y-3">
                  {recipeForm.ingredients.map((ing, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-[#111827]/30 p-3 rounded-xl border border-slate-200 dark:border-[#374151]/30">
                      <select
                        required
                        value={ing.rawMaterialId}
                        onChange={(e) => {
                          const newIng = [...recipeForm.ingredients];
                          newIng[index].rawMaterialId = e.target.value;
                          setRecipeForm({ ...recipeForm, ingredients: newIng });
                        }}
                        className="flex-1 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="">Ingredient...</option>
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.name} (per {rm.unit})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="Quantity"
                        value={ing.quantity || ''}
                        onChange={(e) => {
                          const newIng = [...recipeForm.ingredients];
                          newIng[index].quantity = Number(e.target.value);
                          setRecipeForm({ ...recipeForm, ingredients: newIng });
                        }}
                        className="w-24 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                      />

                      {ing.rawMaterialId && (
                        <span className="text-[10px] font-black text-slate-400 w-8 text-center shrink-0">
                          {getRecipeUnitLabel(rawMaterials.find(rm => rm.id === ing.rawMaterialId)?.unit || '')}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const newIng = recipeForm.ingredients.filter((_, idx) => idx !== index);
                          setRecipeForm({ ...recipeForm, ingredients: newIng });
                        }}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/25 active:scale-95"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3e. Create PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                Create Purchase Order ({poForm.poNumber})
              </h3>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePOSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Select Supplier</label>
                <select
                  required
                  value={poForm.supplierId}
                  onChange={(e) => setPOForm({ ...poForm, supplierId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">PO Items List</label>
                  <button
                    type="button"
                    onClick={() => setPOForm({ ...poForm, items: [...poForm.items, { rawMaterialId: '', quantity: 0, unitPrice: 0, totalCost: 0 }] })}
                    className="text-[#FF6B35] hover:text-orange-600 font-extrabold text-[10px] uppercase flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>

                <div className="space-y-3">
                  {poForm.items.map((it, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center gap-3 bg-slate-50 dark:bg-[#111827]/30 p-3 rounded-xl border border-slate-200 dark:border-[#374151]/30">
                      <select
                        required
                        value={it.rawMaterialId}
                        onChange={(e) => {
                          const newItems = [...poForm.items];
                          newItems[index].rawMaterialId = e.target.value;
                          setPOForm({ ...poForm, items: newItems });
                        }}
                        className="flex-1 w-full md:w-auto bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="">Select material...</option>
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.name} (per {rm.unit})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="Quantity"
                        value={it.quantity || ''}
                        onChange={(e) => {
                          const newItems = [...poForm.items];
                          newItems[index].quantity = Number(e.target.value);
                          newItems[index].totalCost = newItems[index].quantity * newItems[index].unitPrice;
                          setPOForm({ ...poForm, items: newItems });
                        }}
                        className="w-24 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                      />

                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="Unit Price"
                        value={it.unitPrice || ''}
                        onChange={(e) => {
                          const newItems = [...poForm.items];
                          newItems[index].unitPrice = Number(e.target.value);
                          newItems[index].totalCost = newItems[index].quantity * newItems[index].unitPrice;
                          setPOForm({ ...poForm, items: newItems });
                        }}
                        className="w-24 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                      />

                      <span className="w-20 text-right font-black text-xs text-slate-700 dark:text-gray-300">₹{it.totalCost.toFixed(2)}</span>

                      <button
                        type="button"
                        onClick={() => {
                          const newItems = poForm.items.filter((_, idx) => idx !== index);
                          setPOForm({ ...poForm, items: newItems });
                        }}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0 font-extrabold text-xs">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20 rounded-xl uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-orange-600 text-white py-3 px-5 transition-all shadow-md shadow-[#FF6B35]/25 active:scale-95 rounded-xl uppercase tracking-wider"
                >
                  Submit PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3f. Receive PO Modal */}
      {showReceiveModal && receivingPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                Receive Purchase Order: {receivingPO.poNumber}
              </h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReceivePO} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={receiveForm.invoiceNumber}
                  onChange={(e) => setReceiveForm({ ...receiveForm, invoiceNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Notes / Discrepancies</label>
                <input
                  type="text"
                  value={receiveForm.notes}
                  onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                >
                  Mark Received
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3g. Wastage Incident Modal */}
      {showWastageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                Log Wastage Incident
              </h3>
              <button onClick={() => setShowWastageModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleWastageSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Select Raw Material</label>
                <select
                  required
                  value={wastageForm.rawMaterialId}
                  onChange={(e) => setWastageForm({ ...wastageForm, rawMaterialId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Choose item...</option>
                  {rawMaterials.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Quantity Lost</label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={wastageForm.quantity || ''}
                    onChange={(e) => setWastageForm({ ...wastageForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Reason</label>
                  <select
                    value={wastageForm.reason}
                    onChange={(e) => setWastageForm({ ...wastageForm, reason: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  >
                    <option value="SPOILAGE">Spoilage</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="SPILLAGE">Spillage</option>
                    <option value="PREP_WASTE">Preparation Waste</option>
                    <option value="THEFT">Theft</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Notes</label>
                <input
                  type="text"
                  value={wastageForm.notes}
                  placeholder="Details of loss event..."
                  onChange={(e) => setWastageForm({ ...wastageForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowWastageModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-red-500/25 active:scale-95"
                >
                  Log Wastage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3h. Physical Count Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                Physical Inventory Audit
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAuditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">General Notes</label>
                <input
                  type="text"
                  value={auditForm.notes}
                  placeholder="Monthly physical audit..."
                  onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Physical Counts per Material</p>
                <div className="divide-y divide-slate-100 dark:divide-[#374151]/30 max-h-96 overflow-y-auto scrollbar-thin space-y-3">
                  {auditForm.items.map((item, index) => {
                    const diff = item.actualStock - item.currentStock;
                    return (
                      <div key={item.rawMaterialId} className="flex items-center gap-4 py-3 text-xs">
                        <div className="flex-1">
                          <p className="font-bold text-slate-700 dark:text-gray-200">{item.name}</p>
                          <p className="text-[10px] text-slate-400">Current expected: {item.currentStock} {item.unit}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            required
                            step="any"
                            value={item.actualStock}
                            onChange={(e) => {
                              const newItems = [...auditForm.items];
                              newItems[index].actualStock = Number(e.target.value);
                              setAuditForm({ ...auditForm, items: newItems });
                            }}
                            className="w-24 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                          />
                          <span className="w-8">{item.unit}</span>
                        </div>

                        <span className={`w-16 text-right font-bold ${
                          diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {diff === 0 ? '0' : diff > 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-indigo-600/25 active:scale-95"
                >
                  Record Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3i. Outlet Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/50 flex justify-between items-center bg-slate-50 dark:bg-[#111827]/30">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                Transfer stock to another outlet
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleTransferSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Select Destination Branch</label>
                <select
                  required
                  value={transferForm.destBranchId}
                  onChange={(e) => setTransferForm({ ...transferForm, destBranchId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Select branch...</option>
                  {restaurants
                    .filter(r => r.id !== JSON.parse(localStorage.getItem('auth_store') || '{}')?.state?.user?.restaurantId)
                    .map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Items to Transfer</label>
                  <button
                    type="button"
                    onClick={() => setTransferForm({ ...transferForm, items: [...transferForm.items, { rawMaterialId: '', quantity: 0 }] })}
                    className="text-[#FF6B35] hover:text-orange-600 font-extrabold text-[10px] uppercase flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>

                <div className="space-y-3">
                  {transferForm.items.map((it, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-[#111827]/30 p-3 rounded-xl border border-slate-200 dark:border-[#374151]/30">
                      <select
                        required
                        value={it.rawMaterialId}
                        onChange={(e) => {
                          const newItems = [...transferForm.items];
                          newItems[index].rawMaterialId = e.target.value;
                          setTransferForm({ ...transferForm, items: newItems });
                        }}
                        className="flex-1 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="">Select material...</option>
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.name} (Available: {rm.currentStock} {rm.unit})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="Quantity"
                        value={it.quantity || ''}
                        onChange={(e) => {
                          const newItems = [...transferForm.items];
                          newItems[index].quantity = Number(e.target.value);
                          setTransferForm({ ...transferForm, items: newItems });
                        }}
                        className="w-24 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/40 rounded-lg px-3 py-2 text-xs font-semibold"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const newItems = transferForm.items.filter((_, idx) => idx !== index);
                          setTransferForm({ ...transferForm, items: newItems });
                        }}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Transfer Notes</label>
                <input
                  type="text"
                  value={transferForm.notes}
                  placeholder="Reason for transfer..."
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#111827]/30 border-t border-slate-100 dark:border-[#374151]/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="border border-slate-200 dark:border-[#374151]/50 font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-colors text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#374151]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl py-3 px-5 transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                >
                  Initiate Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryDashboard;
