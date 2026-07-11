import React, { useEffect, useState } from 'react';
import { useCRMStore, type LoyaltyTier } from '../../../store/crmStore';
import { Plus, Edit2, Trash2, Loader2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const LoyaltyTiersConfig: React.FC = () => {
  const {
    loyaltyTiers,
    loyaltyTiersLoading,
    fetchLoyaltyTiers,
    upsertLoyaltyTier,
    deleteLoyaltyTier
  } = useCRMStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [minSpend, setMinSpend] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLoyaltyTiers();
  }, []);

  const resetForm = () => {
    setName('');
    setMinSpend(0);
    setMultiplier(1.0);
    setSelectedTier(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (tier: LoyaltyTier) => {
    setSelectedTier(tier);
    setName(tier.name);
    setMinSpend(tier.minSpend);
    setMultiplier(tier.multiplier);
    setIsModalOpen(true);
  };

  const openDeleteModal = (tier: LoyaltyTier) => {
    setSelectedTier(tier);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await upsertLoyaltyTier({
        id: selectedTier?.id,
        name: name.trim(),
        minSpend,
        multiplier,
      });
      toast.success(selectedTier ? 'Loyalty tier updated successfully' : 'Loyalty tier created successfully');
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save loyalty tier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTier) return;
    setSubmitting(true);
    try {
      await deleteLoyaltyTier(selectedTier.id);
      toast.success('Loyalty tier deleted successfully');
      setIsDeleteOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete loyalty tier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Loyalty Tiers Config</h3>
          <p className="text-xs text-slate-400">Configure spend thresholds and points multipliers for customer tiers.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs shadow-lg shadow-[#FF6B35]/15 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Tier
        </button>
      </div>

      {loyaltyTiersLoading && loyaltyTiers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
          <p className="text-slate-500 text-sm">Loading loyalty configuration...</p>
        </div>
      ) : loyaltyTiers.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-12 text-center">
          <p className="text-md font-bold text-slate-800 dark:text-white">No Loyalty Tiers Defined</p>
          <p className="text-xs text-slate-400 mt-1">Get started by defining your first tier (e.g. Silver Tier with ₹1,000 spend requirement).</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loyaltyTiers.map((tier) => (
            <div key={tier.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[180px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/30 pb-3">
                  <span className="font-extrabold text-slate-800 dark:text-white text-base">{tier.name}</span>
                  <span className="text-[11px] font-black px-2.5 py-0.5 bg-orange-500/10 text-[#FF6B35] border border-orange-500/20 rounded-full">
                    {tier.multiplier}x Points
                  </span>
                </div>
                <div className="py-4 text-xs text-slate-500 dark:text-gray-400">
                  Minimum spend limit: <strong className="text-slate-850 dark:text-white text-sm">₹{tier.minSpend.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(tier)}
                  className="p-2 bg-slate-100 dark:bg-[#1f2937] hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151] rounded-xl text-slate-700 dark:text-gray-300 transition-colors focus:outline-none"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openDeleteModal(tier)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-500 rounded-xl transition-colors focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-6">
              <h3 className="text-md font-black text-slate-800 dark:text-white">
                {selectedTier ? 'Edit Loyalty Tier' : 'Create Loyalty Tier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Tier, VIP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Minimum Spend (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={minSpend}
                  onChange={(e) => setMinSpend(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Points Multiplier</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={multiplier}
                  onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1.0)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-[#374151]/35">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-xl transition-all border border-slate-200 dark:border-[#374151] focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-[#FF6B35]/15 disabled:opacity-60 focus:outline-none"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteOpen && selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 text-center z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-2">Delete Loyalty Tier?</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 px-2">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-white">{selectedTier.name}</strong>? Customers in this tier will revert to default multipliers.
            </p>

            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-xl border border-slate-200 dark:border-[#374151] focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-red-500/15 disabled:opacity-60 focus:outline-none"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
