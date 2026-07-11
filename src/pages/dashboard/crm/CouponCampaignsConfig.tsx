import React, { useEffect, useState } from 'react';
import { useCRMStore, type Coupon } from '../../../store/crmStore';
import { Plus, Trash2, Loader2, X, AlertTriangle, Calendar, Percent, Tag } from 'lucide-react';
import { toast } from 'sonner';

export const CouponCampaignsConfig: React.FC = () => {
  const {
    coupons,
    couponsLoading,
    fetchCoupons,
    createCoupon,
    deleteCoupon
  } = useCRMStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(0);
    setMinOrderAmount(0);
    setMaxDiscountAmount('');
    setStartDate('');
    setEndDate('');
    setSelectedCoupon(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openDeleteModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !startDate || !endDate) return;

    setSubmitting(true);
    try {
      await createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount: maxDiscountAmount === '' ? null : maxDiscountAmount,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      toast.success('Coupon campaign created successfully!');
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setSubmitting(true);
    try {
      await deleteCoupon(selectedCoupon.id);
      toast.success('Coupon campaign deleted successfully');
      setIsDeleteOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete coupon campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Coupon Campaigns</h3>
          <p className="text-xs text-slate-400">Define customer discount codes, eligibility criteria, and validity periods.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs shadow-lg shadow-[#FF6B35]/15 shrink-0 select-none focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {couponsLoading && coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
          <p className="text-slate-500 text-sm">Loading campaigns...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-12 text-center">
          <p className="text-md font-bold text-slate-800 dark:text-white">No Coupon Campaigns Defined</p>
          <p className="text-xs text-slate-400 mt-1">Create your first code (e.g. WELCOME50 with ₹50 flat discount) to reward guests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[210px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#FF6B35]" />
                    <span className="font-extrabold text-slate-800 dark:text-white text-base">{coupon.code}</span>
                  </div>
                  <span className="text-[11px] font-black px-2.5 py-0.5 bg-orange-500/10 text-[#FF6B35] border border-orange-500/20 rounded-full flex items-center gap-1 select-none">
                    {coupon.discountType === 'PERCENTAGE' ? (
                      <><Percent className="w-3 h-3" /> {coupon.discountValue}% Off</>
                    ) : (
                      <>₹{coupon.discountValue} Off</>
                    )}
                  </span>
                </div>
                
                <div className="py-4 space-y-1.5 text-xs text-slate-500 dark:text-gray-400">
                  <div>
                    Min Spend Limit: <strong className="text-slate-850 dark:text-white">₹{coupon.minOrderAmount}</strong>
                  </div>
                  {coupon.maxDiscountAmount && (
                    <div>
                      Max Discount cap: <strong className="text-slate-850 dark:text-white">₹{coupon.maxDiscountAmount}</strong>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 pt-1.5 border-t border-slate-100 dark:border-[#374151]/20">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => openDeleteModal(coupon)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-500 rounded-xl transition-colors focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-6">
              <h3 className="text-md font-black text-slate-800 dark:text-white">Create Coupon Campaign</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Campaign Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAVE20"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-705 dark:text-gray-200"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Min Spend Requirement (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Max Discount Amount (Optional Cap)</label>
                <input
                  type="number"
                  placeholder="No discount limit cap"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 text-center z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-2">Delete Coupon Campaign?</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 px-2">
              Are you sure you want to delete campaign <strong className="text-slate-800 dark:text-white">{selectedCoupon.code}</strong>? Issued coupons will be deactivated.
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
                className="flex-1 py-2.5 bg-red-505 hover:bg-red-650 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-red-500/15 disabled:opacity-60 focus:outline-none"
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
