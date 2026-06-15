import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Utensils,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Tags,
  IndianRupee,
  Camera,
  Upload,
  AlignLeft,
} from 'lucide-react';
import { api } from '../../lib/api';

// ─── Image Compression Helper ─────────────────────────────────────────────────
const compressImage = (file: File, maxSize = 600, quality = 0.82): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
const MenuItemSchema = z.object({
  categoryId: z.string().uuid('Please select a valid category'),
  name: z.string().min(1, 'Item name is required').max(100),
  description: z.string().max(500, 'Description is too long').optional(),
  price: z.number().nonnegative('Price cannot be negative'),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

type MenuItemInputs = z.infer<typeof MenuItemSchema>;

// ─── Price formatter ───────────────────────────────────────────────────────────
const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

// ─── Component ────────────────────────────────────────────────────────────────
export const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemInputs>({
    resolver: zodResolver(MenuItemSchema),
    defaultValues: { isAvailable: true, isFeatured: false },
  });

  const watchedIsAvailable = watch('isAvailable');
  const watchedIsFeatured = watch('isFeatured');

  // ─── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/menu-items'),
        api.get('/categories'),
      ]);
      setMenuItems(itemsRes.menuItems || []);
      setCategories(catsRes.categories || []);
    } catch (err: any) {
      toast.error('Failed to load menu data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Modal open helpers ────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setEditingItem(null);
    reset({ isAvailable: true, isFeatured: false, categoryId: '', name: '', description: '', price: 0, imageUrl: '' });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    reset({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? '',
      price: item.price,
      imageUrl: item.imageUrl ?? '',
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
    });
    setImagePreview(item.imageUrl ?? null);
    setIsModalOpen(true);
  };

  // ─── File upload handler ────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    setIsCompressing(true);
    try {
      const base64 = await compressImage(file);
      setImagePreview(base64);
      setValue('imageUrl', base64);
    } catch {
      toast.error('Failed to process image. Please try another.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Form submit ───────────────────────────────────────────────────────────
  const onSubmit = async (data: MenuItemInputs) => {
    setActionLoading(true);
    try {
      // Build payload carefully
      const payload: Record<string, unknown> = {
        categoryId: data.categoryId,
        name: data.name,
        price: data.price,
      };
      if (data.description) payload.description = data.description;
      payload.imageUrl = imagePreview || null;
      if (data.isAvailable !== undefined) payload.isAvailable = data.isAvailable;
      if (data.isFeatured !== undefined) payload.isFeatured = data.isFeatured;

      if (editingItem) {
        await api.patch(`/menu-items/${editingItem.id}`, payload);
        toast.success('Menu item updated successfully');
        setFailedImages((prev) => {
          const updated = { ...prev };
          delete updated[editingItem.id];
          return updated;
        });
      } else {
        await api.post('/menu-items', payload);
        toast.success('Menu item added to your menu!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save menu item');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Quick toggle helpers ──────────────────────────────────────────────────
  const handleToggleAvailability = async (item: MenuItem) => {
    setActionLoading(true);
    try {
      await api.patch(`/menu-items/${item.id}`, { isAvailable: !item.isAvailable });
      toast.success(`${item.name} marked as ${!item.isAvailable ? 'available' : 'unavailable'}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update availability');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (item: MenuItem) => {
    setActionLoading(true);
    try {
      await api.patch(`/menu-items/${item.id}`, { isFeatured: !item.isFeatured });
      toast.success(`${item.name} ${!item.isFeatured ? 'marked as featured' : 'removed from featured'}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update featured status');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await api.delete(`/menu-items/${id}`);
      toast.success('Menu item removed');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete menu item');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Derived: filter items ─────────────────────────────────────────────────
  const filteredItems =
    activeCategoryFilter === 'all'
      ? menuItems
      : menuItems.filter((item) => item.categoryId === activeCategoryFilter);

  const activeCategories = categories.filter((c) => c.isActive);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Menu Management</h1>
          <p className="text-sm text-[#9ca3af]">Create, manage, and organise your restaurant's dishes and drinks.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-xl transition-all shadow-md shadow-[#FF6B35]/15 hover:shadow-[#FF6B35]/25 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Menu Item
        </button>
      </div>

      {/* Category Tab Filters */}
      {!loading && menuItems.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              activeCategoryFilter === 'all'
                ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-sm'
                : 'bg-[#1f2937]/20 text-[#9ca3af] border-[#374151]/40 hover:text-white hover:border-[#FF6B35]/40'
            }`}
          >
            All ({menuItems.length})
          </button>
          {activeCategories.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  activeCategoryFilter === cat.id
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-sm'
                    : 'bg-[#1f2937]/20 text-[#9ca3af] border-[#374151]/40 hover:text-white hover:border-[#FF6B35]/40'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="bg-[#1f2937]/10 border border-[#374151]/30 rounded-[24px] p-24 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin mb-4" />
          <p className="text-gray-300 font-medium">Loading menu items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-[#1f2937]/20 border border-[#374151]/40 rounded-[24px] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-4 text-[#9ca3af]">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-200">
            {activeCategoryFilter === 'all' ? 'No menu items yet' : 'No items in this category'}
          </h3>
          <p className="text-sm text-[#9ca3af] max-w-sm mt-1 mb-6">
            {activeCategoryFilter === 'all'
              ? "Your menu is empty. Add your first dish to get started!"
              : "No items in this category yet. Add some using the button above."}
          </p>
          {activeCategoryFilter === 'all' && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#374151] hover:bg-[#4b5563] border border-[#4b5563]/40 font-semibold text-sm text-white rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-[#1f2937]/25 border border-[#374151]/35 hover:border-[#FF6B35]/30 rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 group ${
                !item.isAvailable ? 'opacity-60' : ''
              }`}
            >
              {/* Image or Placeholder */}
              <div className="relative h-44 bg-gradient-to-br from-[#1f2937] to-[#111827] overflow-hidden">
                {item.imageUrl && !failedImages[item.id] ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => {
                      setFailedImages((prev) => ({ ...prev, [item.id]: true }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Utensils className="w-12 h-12 text-[#374151]" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  {item.isFeatured && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-full shadow-sm">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  {!item.isAvailable && (
                    <span className="px-2.5 py-1 bg-red-600/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-full shadow-sm">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Category Tag */}
                <div className="absolute bottom-3 right-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#111827]/80 backdrop-blur-sm text-[#9ca3af] text-[11px] font-semibold rounded-full border border-[#374151]/40">
                    <Tags className="w-3 h-3" />
                    {item.category.name}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-white leading-tight group-hover:text-orange-100 transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-[#FF6B35] font-extrabold text-lg whitespace-nowrap">
                    {formatPrice(item.price)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-[#9ca3af] leading-relaxed flex-1 line-clamp-2">{item.description}</p>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-[#374151]/25">
                  {/* Availability & Featured toggles */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      disabled={actionLoading}
                      title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        item.isAvailable
                          ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20'
                          : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/20'
                      }`}
                    >
                      {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      disabled={actionLoading}
                      title={item.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        item.isFeatured
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-[#374151]/20 text-[#9ca3af] border-[#374151]/40 hover:text-white'
                      }`}
                    >
                      {item.isFeatured ? <Star className="w-3.5 h-3.5" /> : <StarOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-2">
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 bg-red-950/20 border border-red-500/30 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                        <span className="text-[11px] text-red-400 font-semibold px-1.5">Delete?</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={actionLoading}
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 bg-[#374151] hover:bg-[#4b5563] text-gray-300 rounded-lg transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2.5 bg-[#374151]/30 hover:bg-[#374151] border border-[#374151]/40 hover:border-[#4b5563]/60 rounded-xl text-gray-300 hover:text-white transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add / Edit Modal ────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-[#1f2937] border border-[#374151]/75 rounded-[24px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6B35]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#374151]/40 relative shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#FF6B35]" />
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-[#111827] border border-[#374151] rounded-xl text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form — Scrollable */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                {/* Category Select */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#d1d5db] mb-2">
                    <Tags className="w-4 h-4 text-[#FF6B35]" />
                    Category
                  </label>
                  <select
                    {...register('categoryId')}
                    className={`w-full bg-[#111827]/70 border ${
                      errors.categoryId ? 'border-red-500 focus:ring-red-500' : 'border-[#374151] focus:ring-[#FF6B35]'
                    } rounded-[12px] py-3 px-4 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all appearance-none`}
                  >
                    <option value="" disabled>Select a category...</option>
                    {activeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                  {activeCategories.length === 0 && (
                    <p className="text-amber-400 text-xs mt-1">⚠ No active categories found. Create categories first.</p>
                  )}
                </div>

                {/* Item Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#d1d5db] mb-2">
                    <Utensils className="w-4 h-4 text-[#FF6B35]" />
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paneer Tikka, Mango Lassi"
                    className={`w-full bg-[#111827]/70 border ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#374151] focus:ring-[#FF6B35]'
                    } rounded-[12px] py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    {...register('name')}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#d1d5db] mb-2">
                    <IndianRupee className="w-4 h-4 text-[#FF6B35]" />
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 250"
                    className={`w-full bg-[#111827]/70 border ${
                      errors.price ? 'border-red-500 focus:ring-red-500' : 'border-[#374151] focus:ring-[#FF6B35]'
                    } rounded-[12px] py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#d1d5db] mb-2">
                    <AlignLeft className="w-4 h-4 text-[#FF6B35]" />
                    Description
                    <span className="text-[#6b7280] text-xs font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A short, appetising description for customers..."
                    className={`w-full bg-[#111827]/70 border ${
                      errors.description ? 'border-red-500 focus:ring-red-500' : 'border-[#374151] focus:ring-[#FF6B35]'
                    } rounded-[12px] py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
                    {...register('description')}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#d1d5db] mb-2">
                    <Camera className="w-4 h-4 text-[#FF6B35]" />
                    Item Photo
                    <span className="text-[#6b7280] text-xs font-normal">(optional)</span>
                  </label>

                  {/* Hidden real file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture={undefined}
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {imagePreview ? (
                    /* ── Preview State ── */
                    <div className="relative rounded-[14px] overflow-hidden border border-[#374151]/50 bg-[#111827]/40">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-xs text-white font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                          Photo selected
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-white font-semibold bg-[#FF6B35]/80 hover:bg-[#FF6B35] backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => { setImagePreview(null); setValue('imageUrl', ''); }}
                            className="text-xs text-white font-semibold bg-red-600/80 hover:bg-red-600 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Upload Zone ── */
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing}
                      className="w-full border-2 border-dashed border-[#374151]/60 hover:border-[#FF6B35]/50 bg-[#111827]/30 hover:bg-[#FF6B35]/5 rounded-[14px] py-8 flex flex-col items-center justify-center gap-3 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCompressing ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
                          <p className="text-sm font-semibold text-[#9ca3af]">Compressing image...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-[#374151]/40 group-hover:bg-[#FF6B35]/10 flex items-center justify-center transition-colors">
                            <Upload className="w-6 h-6 text-[#9ca3af] group-hover:text-[#FF6B35] transition-colors" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-[#d1d5db] group-hover:text-white transition-colors">
                              Upload Photo
                            </p>
                            <p className="text-xs text-[#6b7280] mt-1 flex items-center justify-center gap-1.5">
                              <Camera className="w-3.5 h-3.5" /> Camera &nbsp;·&nbsp;
                              <Upload className="w-3.5 h-3.5" /> Gallery
                            </p>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Toggles: Available & Featured */}
                <div className="flex gap-3">
                  {/* Available Toggle */}
                  <button
                    type="button"
                    onClick={() => setValue('isAvailable', !watchedIsAvailable)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] border font-semibold text-sm transition-all ${
                      watchedIsAvailable
                        ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                        : 'bg-[#374151]/20 text-[#9ca3af] border-[#374151]/40'
                    }`}
                  >
                    {watchedIsAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {watchedIsAvailable ? 'Available' : 'Unavailable'}
                  </button>

                  {/* Featured Toggle */}
                  <button
                    type="button"
                    onClick={() => setValue('isFeatured', !watchedIsFeatured)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] border font-semibold text-sm transition-all ${
                      watchedIsFeatured
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-[#374151]/20 text-[#9ca3af] border-[#374151]/40'
                    }`}
                  >
                    {watchedIsFeatured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    {watchedIsFeatured ? 'Featured' : 'Not Featured'}
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[#374151]/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-[#374151] hover:bg-[#4b5563] font-semibold text-sm text-white rounded-[12px] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-[12px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-orange-600/20 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingItem ? 'Update Item' : 'Add to Menu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
