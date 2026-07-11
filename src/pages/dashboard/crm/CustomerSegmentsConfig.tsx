import React, { useEffect, useState } from 'react';
import { useCRMStore, type Segment, type Customer } from '../../../store/crmStore';
import { Plus, Trash2, Loader2, X, AlertTriangle, Users, RefreshCw, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export const CustomerSegmentsConfig: React.FC = () => {
  const {
    segments,
    segmentsLoading,
    fetchSegments,
    createSegment,
    deleteSegment,
    retraceSegment,
    fetchSegmentMembers
  } = useCRMStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  
  // Segment members state
  const [members, setMembers] = useState<Customer[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // RFM matrix states
  const [rfmStats, setRfmStats] = useState<Record<string, number>>({
    'Champions': 0,
    'Loyal Customers': 0,
    'Recent / New': 0,
    'Promising': 0,
    'At Risk / Churn Alert': 0,
    'Can\'t Lose Them': 0,
    'Lost / Cold': 0,
    'Need Attention': 0,
  });
  const [loadingRFM, setLoadingRFM] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minSpend, setMinSpend] = useState<number | ''>('');
  const [minOrders, setMinOrders] = useState<number | ''>('');
  const [lastVisitDaysAgo, setLastVisitDaysAgo] = useState<number | ''>('');
  const [visitedWithinDays, setVisitedWithinDays] = useState<number | ''>('');
  const [dietary, setDietary] = useState<string>('None');
  const [seating, setSeating] = useState<string>('None');
  const [submitting, setSubmitting] = useState(false);

  const fetchRFMData = async () => {
    setLoadingRFM(true);
    try {
      const res = await api.get('/crm/segments/rfm');
      if (res.matrix) {
        setRfmStats(res.matrix);
      }
    } catch (err) {
      console.error('Failed to load RFM scoring matrix:', err);
    } finally {
      setLoadingRFM(false);
    }
  };

  useEffect(() => {
    fetchSegments();
    fetchRFMData();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setMinSpend('');
    setMinOrders('');
    setLastVisitDaysAgo('');
    setVisitedWithinDays('');
    setDietary('None');
    setSeating('None');
    setSelectedSegment(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openDeleteModal = (segment: Segment) => {
    setSelectedSegment(segment);
    setIsDeleteOpen(true);
  };

  const openMembersModal = async (segment: Segment) => {
    setSelectedSegment(segment);
    setIsMembersOpen(true);
    setLoadingMembers(true);
    try {
      const data = await fetchSegmentMembers(segment.id);
      setMembers(data);
    } catch (err) {
      toast.error('Failed to load segment members');
      setIsMembersOpen(false);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createSegment({
        name: name.trim(),
        description: description.trim() || null,
        criteria: {
          minSpend: minSpend === '' ? undefined : minSpend,
          minOrders: minOrders === '' ? undefined : minOrders,
          lastVisitDaysAgo: lastVisitDaysAgo === '' ? undefined : lastVisitDaysAgo,
          visitedWithinDays: visitedWithinDays === '' ? undefined : visitedWithinDays,
          dietary: dietary === 'None' ? undefined : dietary,
          seating: seating === 'None' ? undefined : seating,
        },
      });
      toast.success('Customer segment created and evaluated successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchRFMData(); // refresh matrix counts
    } catch (err: any) {
      toast.error(err.message || 'Failed to create segment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSegment) return;
    setSubmitting(true);
    try {
      await deleteSegment(selectedSegment.id);
      toast.success('Customer segment deleted successfully');
      setIsDeleteOpen(false);
      resetForm();
      fetchRFMData(); // refresh matrix counts
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete segment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetrace = async (id: string, segmentName: string) => {
    toast.promise(retraceSegment(id), {
      loading: `Re-evaluating dynamic segment "${segmentName}"...`,
      success: (size) => {
        fetchRFMData();
        return `Success! Found ${size} matching customers.`;
      },
      error: 'Failed to evaluate segment members.',
    });
  };

  const getRFMCardStyles = (segmentName: string) => {
    switch (segmentName) {
      case 'Champions':
        return {
          bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5',
          emoji: '🏆',
        };
      case 'Loyal Customers':
        return {
          bg: 'bg-sky-500/10 text-sky-500 border-sky-500/20 dark:bg-sky-500/5',
          emoji: '🤝',
        };
      case 'Recent / New':
        return {
          bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/5',
          emoji: '🌱',
        };
      case 'Promising':
        return {
          bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/5',
          emoji: '✨',
        };
      case 'At Risk / Churn Alert':
        return {
          bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/5',
          emoji: '⚠️',
        };
      case 'Can\'t Lose Them':
        return {
          bg: 'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:bg-orange-500/5',
          emoji: '🚨',
        };
      case 'Lost / Cold':
        return {
          bg: 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/5',
          emoji: '❄️',
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/5',
          emoji: '🔍',
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* RFM Matrix Visual Grid */}
      <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[28px] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/30 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#FF6B35]" />
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">RFM Customer Grid</h4>
          </div>
          <button 
            onClick={fetchRFMData}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#374151]/60 rounded-xl text-slate-400 hover:text-slate-650 transition-colors focus:outline-none"
            title="Refresh Grid"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRFM ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingRFM ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(rfmStats).map(([key, val]) => {
              const styles = getRFMCardStyles(key);
              return (
                <div key={key} className={`border rounded-2xl p-4 flex flex-col justify-between transition-all hover:scale-[1.02] ${styles.bg}`}>
                  <div>
                    <span className="text-lg">{styles.emoji}</span>
                    <p className="text-[10px] font-extrabold uppercase mt-1 leading-snug tracking-wider">{key}</p>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mt-3">{val}</h3>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Segment Campaigns</h3>
          <p className="text-xs text-slate-400">Define query conditions and filters to automatically target groups during marketing campaigns.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs shadow-lg shadow-[#FF6B35]/15 shrink-0 select-none focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          Create Segment
        </button>
      </div>

      {segmentsLoading && segments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
          <p className="text-slate-500 text-sm">Loading segments...</p>
        </div>
      ) : segments.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-12 text-center">
          <p className="text-md font-bold text-slate-800 dark:text-white">No Segments Created</p>
          <p className="text-xs text-slate-400 mt-1">Create your first dynamic segment rule (e.g. VIP Spenders with min spend of ₹5000).</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {segments.map((segment) => {
            const criteria = segment.criteriaJson || {};
            const count = segment._count?.customers ?? 0;
            return (
              <div key={segment.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[255px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/30 pb-3">
                    <div>
                      <span className="font-extrabold text-slate-850 dark:text-white text-base">{segment.name}</span>
                      {segment.description && <p className="text-[10px] text-slate-400 mt-0.5">{segment.description}</p>}
                    </div>
                    <span className="text-[11px] font-black px-2.5 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20 rounded-full flex items-center gap-1 select-none">
                      <Users className="w-3 h-3" /> {count} matches
                    </span>
                  </div>
                  
                  <div className="py-4 space-y-1 text-[11px] text-slate-500 dark:text-gray-400">
                    {criteria.minSpend && <div>Min Spend: <strong>₹{criteria.minSpend}</strong></div>}
                    {criteria.minOrders && <div>Min Visits/Orders: <strong>{criteria.minOrders}</strong></div>}
                    {criteria.lastVisitDaysAgo && <div>Inactive for: <strong>{criteria.lastVisitDaysAgo} days+</strong></div>}
                    {criteria.visitedWithinDays && <div>Visited within: <strong>{criteria.visitedWithinDays} days</strong></div>}
                    {criteria.dietary && criteria.dietary !== 'None' && <div>Dietary preference: <strong>{criteria.dietary}</strong></div>}
                    {criteria.seating && criteria.seating !== 'None' && <div>Seating choice: <strong>{criteria.seating}</strong></div>}
                    {Object.keys(criteria).length === 0 && <div className="italic text-slate-400">All customers included.</div>}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-[#374151]/20">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openMembersModal(segment)}
                      className="px-3 py-1.5 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/20 font-bold rounded-xl text-[10px] transition-colors"
                    >
                      View Members
                    </button>
                    <button
                      onClick={() => handleRetrace(segment.id, segment.name)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-gray-300 rounded-xl transition-all border border-slate-200 dark:border-[#374151]/30 focus:outline-none"
                      title="Force Recalculate"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => openDeleteModal(segment)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-500 rounded-xl transition-colors focus:outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-6">
              <h3 className="text-md font-black text-slate-805 dark:text-white">Create Customer Segment</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Segment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Spenders"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Short Description</label>
                  <input
                    type="text"
                    placeholder="e.g. High spending frequent diners"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-[#374151]/20 pt-4 mt-2">
                <span className="text-[10px] font-extrabold text-[#FF6B35] uppercase tracking-wider block mb-3">behavior criteria rules</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Min Total Spend (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={minSpend}
                      onChange={(e) => setMinSpend(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                      className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Min Visits/Orders</label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      value={minOrders}
                      onChange={(e) => setMinOrders(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                      className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Inactive Days limit (Lost Guest)</label>
                  <input
                    type="number"
                    placeholder="No visits in X days"
                    value={lastVisitDaysAgo}
                    onChange={(e) => setLastVisitDaysAgo(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Within Days (Frequent Guest)</label>
                  <input
                    type="number"
                    placeholder="Visited within last X days"
                    value={visitedWithinDays}
                    onChange={(e) => setVisitedWithinDays(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dietary Requirement</label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-700 dark:text-gray-250"
                  >
                    <option value="None">Any Diet</option>
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Seating Preference</label>
                  <select
                    value={seating}
                    onChange={(e) => setSeating(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-700 dark:text-gray-250"
                  >
                    <option value="None">Any Table</option>
                    <option value="Window">Window Seat</option>
                    <option value="Booth">Cozy Booth</option>
                    <option value="Bar">Bar Lounge</option>
                    <option value="Outdoor">Outdoor Deck</option>
                  </select>
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Evaluate & Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER VIEW MODAL */}
      {isMembersOpen && selectedSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsMembersOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 text-left z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-4">
              <div>
                <h3 className="text-md font-black text-slate-850 dark:text-white">Segment Members</h3>
                <p className="text-[10px] text-slate-400">Current matching list for segment: <strong>{selectedSegment.name}</strong></p>
              </div>
              <button onClick={() => setIsMembersOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 py-2">
              {loadingMembers ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-center text-slate-450 dark:text-gray-400 py-10">No current members matching criteria.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="bg-slate-55 dark:bg-[#111827]/25 border border-slate-200 dark:border-[#374151]/20 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-white">{member.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{member.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#FF6B35]">₹{(member.profiles?.[0]?.totalSpend ?? 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{member.profiles?.[0]?.totalOrders ?? 0} visits</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteOpen && selectedSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 text-center z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-2">Delete Customer Segment?</h3>
            <p className="text-xs text-slate-550 dark:text-gray-400 mb-6 px-2">
              Are you sure you want to delete segment <strong className="text-slate-800 dark:text-white">{selectedSegment.name}</strong>? Matched customers will be unlinked.
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
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-red-500/15 disabled:opacity-60 focus:outline-none"
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
