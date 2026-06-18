import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Plus, Search, Edit2, Trash2, Key, UserCheck, UserX, Loader2, X, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

interface Waiter {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export const WaitersPage: React.FC = () => {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Disabled'>('Active');
  const [formShowPassword, setFormShowPassword] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  const fetchWaiters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/waiters');
      setWaiters(res.waiters || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch waiters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiters();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormStatus('Active');
    setFormShowPassword(false);
    setSelectedWaiter(null);
  };

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/dashboard/waiters', {
        name: formName,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        status: formStatus,
      });
      toast.success('Waiter account created successfully!');
      setIsCreateOpen(false);
      resetForm();
      fetchWaiters();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create waiter account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaiter) return;
    setSubmitting(true);
    try {
      await api.put(`/dashboard/waiters/${selectedWaiter.id}`, {
        name: formName,
        email: formEmail,
        phone: formPhone,
        status: formStatus,
      });
      toast.success('Waiter account updated successfully!');
      setIsEditOpen(false);
      resetForm();
      fetchWaiters();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update waiter account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (waiter: Waiter) => {
    const newStatus = !waiter.isActive;
    try {
      await api.patch(`/dashboard/waiters/${waiter.id}/status`, {
        isActive: newStatus,
      });
      toast.success(`Waiter ${newStatus ? 'enabled' : 'disabled'} successfully!`);
      fetchWaiters();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDeleteWaiter = async () => {
    if (!selectedWaiter) return;
    setSubmitting(true);
    try {
      await api.delete(`/dashboard/waiters/${selectedWaiter.id}`);
      toast.success('Waiter account deleted successfully!');
      setIsDeleteConfirmOpen(false);
      resetForm();
      fetchWaiters();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete waiter account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaiter) return;
    setSubmitting(true);
    try {
      await api.post(`/dashboard/waiters/${selectedWaiter.id}/reset-password`, {
        password: formPassword,
      });
      toast.success('Waiter password reset successfully!');
      setIsResetOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setFormName(waiter.name);
    setFormEmail(waiter.email);
    setFormPhone(waiter.phone);
    setFormStatus(waiter.isActive ? 'Active' : 'Disabled');
    setIsEditOpen(true);
  };

  const openResetModal = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setFormPassword('');
    setIsResetOpen(true);
  };

  const openDeleteModal = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setIsDeleteConfirmOpen(true);
  };

  const filteredWaiters = waiters.filter(waiter => 
    waiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    waiter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    waiter.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search waiters by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/25 transition-all text-slate-800 dark:text-white"
          />
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-[#FF6B35]/15 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Waiter
        </button>
      </div>

      {/* Main Waiters List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
          <p className="text-slate-500 text-sm">Loading staff directory...</p>
        </div>
      ) : filteredWaiters.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-12 text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">No Waiters Found</p>
          <p className="text-sm text-slate-400 mt-1">
            {searchQuery ? 'Try matching another name or search term.' : 'Get started by creating your first waiter account.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#374151]/35 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/35 text-sm">
                {filteredWaiters.map((waiter) => (
                  <tr key={waiter.id} className="hover:bg-slate-50/50 dark:hover:bg-[#374151]/10 transition-colors">
                    <td className="py-4.5 px-6 font-bold text-slate-800 dark:text-white">{waiter.name}</td>
                    <td className="py-4.5 px-6 text-slate-500 dark:text-gray-300">{waiter.email}</td>
                    <td className="py-4.5 px-6 text-slate-500 dark:text-gray-300">{waiter.phone}</td>
                    <td className="py-4.5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        waiter.isActive 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${waiter.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {waiter.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-slate-400 text-xs">
                      {new Date(waiter.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4.5 px-6 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(waiter)}
                        className="p-2 bg-slate-100 dark:bg-[#1f2937] hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151] rounded-xl text-slate-700 dark:text-gray-300 transition-colors"
                        title="Edit Waiter"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(waiter)}
                        className={`p-2 border rounded-xl transition-colors ${
                          waiter.isActive 
                            ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/25 text-red-500' 
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-500'
                        }`}
                        title={waiter.isActive ? 'Disable Waiter' : 'Enable Waiter'}
                      >
                        {waiter.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openResetModal(waiter)}
                        className="p-2 bg-slate-100 dark:bg-[#1f2937] hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151] rounded-xl text-amber-500 hover:text-amber-600 dark:text-amber-400 transition-colors"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(waiter)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-500 rounded-xl transition-colors"
                        title="Delete Waiter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE WAITER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Create Waiter Account</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWaiter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Waiter's Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="waiter@restaurant.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm pr-11 focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Active')}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      formStatus === 'Active' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-black' 
                        : 'bg-[#f8fafc] border-slate-200 dark:bg-[#111827]/30 dark:border-[#374151] text-slate-500'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Disabled')}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      formStatus === 'Disabled' 
                        ? 'bg-red-500/10 border-red-500 text-red-500 font-black' 
                        : 'bg-[#f8fafc] border-slate-200 dark:bg-[#111827]/30 dark:border-[#374151] text-slate-500'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-[#374151]/35">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); resetForm(); }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-2xl transition-all text-xs text-center border border-slate-200 dark:border-[#374151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1 shadow-lg shadow-[#FF6B35]/15 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WAITER MODAL */}
      {isEditOpen && selectedWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsEditOpen(false); resetForm(); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Edit Waiter Account</h3>
              <button onClick={() => { setIsEditOpen(false); resetForm(); }} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditWaiter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Waiter's Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="waiter@restaurant.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Active')}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      formStatus === 'Active' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-black' 
                        : 'bg-[#f8fafc] border-slate-200 dark:bg-[#111827]/30 dark:border-[#374151] text-slate-500'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Disabled')}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      formStatus === 'Disabled' 
                        ? 'bg-red-500/10 border-red-500 text-red-500 font-black' 
                        : 'bg-[#f8fafc] border-slate-200 dark:bg-[#111827]/30 dark:border-[#374151] text-slate-500'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-[#374151]/35">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); resetForm(); }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-2xl transition-all text-xs text-center border border-slate-200 dark:border-[#374151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1 shadow-lg shadow-[#FF6B35]/15 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetOpen && selectedWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsResetOpen(false); resetForm(); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-3 mb-5">
              <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Reset Password
              </h3>
              <button onClick={() => { setIsResetOpen(false); resetForm(); }} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
              Enter a new password for <strong className="text-slate-800 dark:text-white">{selectedWaiter.name}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-sm pr-11 focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-[#374151]/35">
                <button
                  type="button"
                  onClick={() => { setIsResetOpen(false); resetForm(); }}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-2xl transition-all text-xs text-center border border-slate-200 dark:border-[#374151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1 shadow-lg shadow-amber-500/15 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteConfirmOpen && selectedWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsDeleteConfirmOpen(false); resetForm(); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 text-center z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-2">Delete Waiter Account?</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 px-2">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-white">{selectedWaiter.name}</strong>? This action cannot be undone and they will immediately lose access.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setIsDeleteConfirmOpen(false); resetForm(); }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-2xl transition-all text-xs border border-slate-200 dark:border-[#374151]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWaiter}
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1 shadow-lg shadow-red-500/15 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WaitersPage;
