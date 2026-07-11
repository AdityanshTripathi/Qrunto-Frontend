import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRMStore } from '../../../store/crmStore';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Loader2, DollarSign, ShoppingBag, TrendingUp, Sparkles,
  FileText, ChevronDown, ChevronUp, UserPlus, Award
} from 'lucide-react';
import { toast } from 'sonner';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentCustomer,
    currentCustomerLoading,
    fetchCustomerById,
    timeline,
    timelineLoading,
    fetchTimeline,
    addCustomerNote,
    updateCustomer,
    error,
    clearError
  } = useCRMStore();

  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [newNoteText, setNewNoteText] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Dining preferences states
  const [dietary, setDietary] = useState('None');
  const [seating, setSeating] = useState('None');
  const [allergies, setAllergies] = useState('');
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
      fetchTimeline(id);
    }
  }, [id, fetchCustomerById, fetchTimeline]);

  useEffect(() => {
    if (currentCustomer) {
      const meta = currentCustomer.metadataJson || {};
      setDietary(meta.dietary || 'None');
      setSeating(meta.seating || 'None');
      setAllergies(meta.allergies || '');
    }
  }, [currentCustomer]);

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !id) return;

    setNoteSubmitting(true);
    try {
      await addCustomerNote(id, newNoteText);
      setNewNoteText('');
      toast.success('Staff note added successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add staff note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !currentCustomer) return;

    setSavingPrefs(true);
    try {
      const updatedMeta = {
        ...(currentCustomer.metadataJson || {}),
        dietary,
        seating,
        allergies: allergies.trim(),
      };
      
      await updateCustomer(id, {
        metadataJson: updatedMeta
      } as any);
      
      toast.success('Dining preferences updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (currentCustomerLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
        <p className="text-slate-500 text-sm">Loading customer profile details...</p>
      </div>
    );
  }

  if (error || !currentCustomer) {
    return (
      <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-8 text-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profile Load Error</h3>
        <p className="text-sm text-slate-400 mt-1 mb-4">{error || 'Customer profile not found.'}</p>
        <button
          onClick={() => {
            clearError();
            navigate('/dashboard/crm');
          }}
          className="px-5 py-2.5 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-xl transition-all text-xs"
        >
          Back to CRM Hub
        </button>
      </div>
    );
  }

  const profile = currentCustomer.profiles?.[0] || {};

  const renderEventIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return (
          <div className="absolute left-0 w-8 h-8 -ml-4 bg-orange-500/10 border border-orange-500/20 text-[#FF6B35] rounded-full flex items-center justify-center shadow-sm z-10">
            <ShoppingBag className="w-4 h-4" />
          </div>
        );
      case 'NOTE':
        return (
          <div className="absolute left-0 w-8 h-8 -ml-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center shadow-sm z-10">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'LOYALTY':
        return (
          <div className="absolute left-0 w-8 h-8 -ml-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-full flex items-center justify-center shadow-sm z-10">
            <Award className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="absolute left-0 w-8 h-8 -ml-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-sm z-10">
            <UserPlus className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/crm')}
          className="p-2.5 bg-white dark:bg-[#1f2937]/60 border border-slate-200 dark:border-[#374151]/60 rounded-xl text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white">{currentCustomer.name}</h2>
          <p className="text-xs text-slate-400">Customer Profile Details</p>
        </div>
      </div>

      {/* Analytics Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: LTV */}
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Lifetime Value</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
              ₹{(profile.ltv ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Card 2: AOV */}
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Average Order</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
              ₹{(profile.aov ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Card 3: Visits */}
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Total Orders</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
              {profile.totalOrders ?? 0}
            </span>
          </div>
        </div>

        {/* Card 4: Health Score */}
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-[#FF6B35]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Health Score</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
              {profile.healthScore ?? 100}/100
            </span>
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card & Preferences */}
        <div className="space-y-6">
          {/* General Profile Card */}
          <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 space-y-5 h-fit shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-[#374151]/35 pb-3">
              Profile Details
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Name</span>
                  <span className="text-slate-700 dark:text-gray-200 font-semibold truncate block">{currentCustomer.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Phone</span>
                  <span className="text-slate-700 dark:text-gray-200 font-mono text-xs block">{currentCustomer.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Email</span>
                  <span className="text-slate-700 dark:text-gray-200 font-semibold truncate block">
                    {currentCustomer.email || 'Not Provided'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">First Visit</span>
                  <span className="text-slate-700 dark:text-gray-200 font-semibold block">
                    {profile.firstVisit ? new Date(profile.firstVisit).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Last Active</span>
                  <span className="text-slate-700 dark:text-gray-200 font-semibold block">
                    {profile.lastVisit ? new Date(profile.lastVisit).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-[#374151]/35 pb-3">
              Dining Preferences
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Dietary Category
                </label>
                <select
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-700 dark:text-gray-200"
                >
                  <option value="None">None</option>
                  <option value="VEG">Veg (Vegetarian)</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="NON_VEG">Non-Veg</option>
                  <option value="EGGETARIAN">Eggitarian</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Preferred Seating
                </label>
                <select
                  value={seating}
                  onChange={(e) => setSeating(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-700 dark:text-gray-200"
                >
                  <option value="None">None</option>
                  <option value="WINDOW">Window Seat</option>
                  <option value="BOOTH">Indoor Booth</option>
                  <option value="OUTDOOR">Outdoor Terrace</option>
                  <option value="QUIET">Quiet Corner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Allergies / Restrictions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Gluten, Dairy"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingPrefs}
                className="w-full py-2.5 bg-[#FF6B35]/10 hover:bg-[#FF6B35] border border-[#FF6B35]/25 text-[#FF6B35] hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
              >
                {savingPrefs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Preferences'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Timeline & Notes Widgets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Notes Widget */}
          <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-[#374151]/35 pb-3">
              Staff Notes
            </h3>

            {/* Note form */}
            <form onSubmit={handlePostNote} className="space-y-3">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type a manual staff note (e.g. food preferences, allergies)..."
                rows={3}
                className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={noteSubmitting || !newNoteText.trim()}
                  className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-md shadow-[#FF6B35]/15 disabled:opacity-50 focus:outline-none"
                >
                  {noteSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Notes list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {!currentCustomer.notes || currentCustomer.notes.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-4">No manual notes added yet.</p>
              ) : (
                currentCustomer.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#f8fafc] dark:bg-[#111827]/10 border border-slate-200/50 dark:border-[#374151]/35 rounded-xl space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        {note.isSystem ? 'System Event' : note.user?.name || 'Staff'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-gray-300 whitespace-pre-wrap">
                      {note.noteText}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline View */}
          <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-[#374151]/35 pb-3 mb-6">
              Interaction Timeline
            </h3>

            {timelineLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="w-6 h-6 text-[#FF6B35] animate-spin" />
                <span className="text-slate-400 text-xs">Loading activity timeline...</span>
              </div>
            ) : timeline.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No activity logs found for this customer.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 dark:border-[#374151]/45 ml-4 pl-0 space-y-6">
                {timeline.map((event) => {
                  const isExpanded = !!expandedEvents[event.id];
                  const hasMetaItems = event.type === 'ORDER' && event.metadata?.items?.length > 0;

                  return (
                    <div key={event.id} className="relative pl-8 pb-2">
                      {renderEventIcon(event.type)}
                      <div className="bg-[#f8fafc] dark:bg-[#111827]/10 border border-slate-200/50 dark:border-[#374151]/35 rounded-2xl p-4.5 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold text-slate-850 dark:text-white text-sm">
                            {event.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">
                            {new Date(event.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-300">
                          {event.description}
                        </p>

                        {/* Collapsible Order details */}
                        {hasMetaItems && (
                          <div className="pt-1.5">
                            <button
                              onClick={() => toggleEventExpand(event.id)}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider hover:opacity-85 focus:outline-none"
                            >
                              {isExpanded ? (
                                <>Hide items <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>View items ({event.metadata.items.length}) <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-2.5 p-3 bg-white dark:bg-[#111827]/40 border border-slate-100 dark:border-[#374151]/40 rounded-xl space-y-1.5 text-xs text-slate-650 dark:text-gray-300 shadow-inner">
                                {event.metadata.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{item.name} <strong className="text-slate-400">x{item.quantity}</strong></span>
                                    <span className="font-semibold text-slate-800 dark:text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                                {event.metadata.tableNumber && (
                                  <div className="pt-2 border-t border-slate-100 dark:border-[#374151]/30 text-[10px] text-slate-400 flex justify-between">
                                    <span>Table: {event.metadata.tableNumber}</span>
                                    {event.metadata.notes && <span>Notes: {event.metadata.notes}</span>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetail;
