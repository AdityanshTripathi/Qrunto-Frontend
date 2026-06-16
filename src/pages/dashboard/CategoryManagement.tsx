import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Plus, 
  Tags, 
  Edit2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Check, 
  Loader2,
  Folder,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../../lib/api';
import { SkeletonLoader } from '../../components/SkeletonLoader';

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name is too long'),
  displayOrder: z.number().int().min(1, 'Display order must be a positive integer'),
});

type CategoryInputs = z.infer<typeof CategorySchema>;

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInputs>({
    resolver: zodResolver(CategorySchema),
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      // Categories are already ordered by displayOrder asc from backend
      setCategories(res.categories || []);
    } catch (err: any) {
      toast.error('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    const nextOrder = categories.length > 0 
      ? Math.max(...categories.map(c => c.displayOrder)) + 1 
      : 1;
    reset({
      name: '',
      displayOrder: nextOrder,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      displayOrder: cat.displayOrder,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CategoryInputs) => {
    setActionLoading(true);
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, data);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', data);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      reset();
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category soft-deleted successfully');
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    setActionLoading(true);
    try {
      const nextActive = !cat.isActive;
      await api.patch(`/categories/${cat.id}`, { isActive: nextActive });
      toast.success(`Category ${nextActive ? 'activated' : 'deactivated'} successfully`);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0 || actionLoading) return;
    
    // Optimistic state update
    const updatedCats = [...categories];
    const catA = updatedCats[index];
    const catB = updatedCats[index - 1];
    
    // Swap displayOrder values
    const tempOrder = catA.displayOrder;
    catA.displayOrder = catB.displayOrder;
    catB.displayOrder = tempOrder;
    
    // Sort array locally
    updatedCats.sort((a, b) => a.displayOrder - b.displayOrder);
    setCategories(updatedCats);
    
    setActionLoading(true);
    try {
      await Promise.all([
        api.patch(`/categories/${catA.id}`, { displayOrder: catA.displayOrder }),
        api.patch(`/categories/${catB.id}`, { displayOrder: catB.displayOrder })
      ]);
      toast.success('Category order updated');
    } catch (err: any) {
      toast.error('Failed to update category order: ' + err.message);
      // Revert in case of API failure
      fetchCategories();
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1 || actionLoading) return;
    
    // Optimistic state update
    const updatedCats = [...categories];
    const catA = updatedCats[index];
    const catB = updatedCats[index + 1];
    
    // Swap displayOrder values
    const tempOrder = catA.displayOrder;
    catA.displayOrder = catB.displayOrder;
    catB.displayOrder = tempOrder;
    
    // Sort array locally
    updatedCats.sort((a, b) => a.displayOrder - b.displayOrder);
    setCategories(updatedCats);
    
    setActionLoading(true);
    try {
      await Promise.all([
        api.patch(`/categories/${catA.id}`, { displayOrder: catA.displayOrder }),
        api.patch(`/categories/${catB.id}`, { displayOrder: catB.displayOrder })
      ]);
      toast.success('Category order updated');
    } catch (err: any) {
      toast.error('Failed to update category order: ' + err.message);
      // Revert in case of API failure
      fetchCategories();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Categories Management</h1>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af]">Group your menu items into clear categories like Starters, Mains, and Drinks.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-xl transition-all shadow-md shadow-[#FF6B35]/15 hover:shadow-[#FF6B35]/25 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {/* Main Categories Section */}
      {loading ? (
        <SkeletonLoader type="table" count={5} />
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/40 rounded-[24px] p-10 sm:p-12 text-center backdrop-blur-md flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-slate-100 dark:bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-[#9ca3af]">
            <Tags className="w-7 sm:w-8 h-7 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-200">No categories found</h3>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af] max-w-sm mt-1 mb-6">
            Create categories first so you can organize and display your menu items beautifully for the customers.
          </p>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-[#374151] hover:bg-slate-300 dark:hover:bg-[#4b5563] border border-slate-300 dark:border-[#4b5563]/40 font-semibold text-sm text-slate-800 dark:text-white rounded-xl transition-all"
          >
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, index) => {
            const isFirst = index === 0;
            const isLast = index === categories.length - 1;

            return (
              <div 
                key={cat.id} 
                className={`bg-white dark:bg-[#1f2937]/25 border border-slate-200 dark:border-[#374151]/35 hover:border-[#FF6B35]/30 rounded-[16px] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 backdrop-blur-md group ${
                  !cat.isActive ? 'opacity-65' : ''
                }`}
              >
                {/* Left side: Reorder + Name */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst || actionLoading}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-[#374151]/40 text-slate-400 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-white rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast || actionLoading}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-[#374151]/40 text-slate-400 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-white rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Display Order Number */}
                  <span className="w-8 text-center text-xs font-mono font-bold bg-slate-100 dark:bg-[#111827]/80 border border-slate-200 dark:border-[#374151]/40 py-1 px-1.5 rounded-lg text-[#FF6B35]">
                    #{cat.displayOrder}
                  </span>

                  {/* Category Folder Icon & Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center text-[#FF6B35]">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-gray-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">{cat.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">ID: {cat.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </div>

                {/* Right side: Status toggle & actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 dark:border-slate-700/50 sm:border-0 pt-3 sm:pt-0">
                  {/* Status Badge */}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    disabled={actionLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      cat.isActive 
                        ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20' 
                        : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/20'
                    }`}
                    title={cat.isActive ? 'Deactivate Category' : 'Activate Category'}
                  >
                    {cat.isActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Inactive
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-6 bg-[#374151]/40"></div>

                  {/* Action Group */}
                  <div className="flex items-center gap-2">
                    {deleteConfirmId === cat.id ? (
                      <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-500/30 rounded-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-xs text-red-600 dark:text-red-400 font-semibold px-2">Delete?</span>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={actionLoading}
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                          title="Confirm Delete"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 bg-slate-200 dark:bg-[#374151] hover:bg-slate-300 dark:hover:bg-[#4b5563] text-slate-600 dark:text-gray-300 rounded-lg transition-all"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2.5 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151]/40 hover:border-slate-300 dark:hover:border-[#4b5563]/60 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cat.id)}
                          className="p-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-xl text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over / Centered Modal for Add & Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all"
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[24px] shadow-2xl p-5 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden">
            {/* Ambient background glow inside modal */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FF6B35]/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Title / Close Header */}
            <div className="flex items-center justify-between pb-5 sm:pb-6 border-b border-slate-200 dark:border-[#374151]/40 mb-5 sm:mb-6 relative">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tags className="w-5 h-5 text-[#FF6B35]" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#d1d5db] mb-2" htmlFor="name">
                  Category Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Starters, Main Course, Mocktails"
                  className={`w-full bg-slate-50 dark:bg-[#111827]/60 border ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-[#374151] focus:ring-[#FF6B35]'
                  } rounded-[12px] py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  {...register('name')}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#d1d5db] mb-2" htmlFor="displayOrder">
                  Display Order Position
                </label>
                <input
                  id="displayOrder"
                  type="number"
                  placeholder="e.g. 1"
                  className={`w-full bg-slate-50 dark:bg-[#111827]/60 border ${
                    errors.displayOrder ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-[#374151] focus:ring-[#FF6B35]'
                  } rounded-[12px] py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  {...register('displayOrder', { valueAsNumber: true })}
                />
                {errors.displayOrder && <p className="text-red-500 text-xs mt-1">{errors.displayOrder.message}</p>}
                <p className="text-[11px] text-slate-500 dark:text-[#9ca3af] mt-1.5">
                  Determines the sorting placement. Categories with smaller order numbers appear first.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-[#374151]/40 mt-6 sm:mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-[#374151] hover:bg-slate-200 dark:hover:bg-[#4b5563] font-semibold text-sm text-slate-800 dark:text-white rounded-[12px] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-[12px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-orange-600/20"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Category'
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

export default CategoryManagement;
