import React, { useEffect, useState } from 'react';
import { useCRMStore, type Campaign } from '../../../store/crmStore';
import { Plus, Trash2, Loader2, X, AlertTriangle, Calendar, Mail, MessageSquare, Megaphone, Eye, BarChart, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export const CampaignsConfig: React.FC = () => {
  const {
    campaigns,
    campaignsLoading,
    fetchCampaigns,
    createCampaign,
    deleteCampaign,
    fetchCampaignLogs,
    segments,
    fetchSegments
  } = useCRMStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Campaign logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    totalFailed: 0,
    emailCount: 0,
    smsCount: 0,
    completedCount: 0,
    pendingCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'EMAIL'>('EMAIL');
  const [segmentId, setSegmentId] = useState<string>('All');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStatsData = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/crm/campaigns/stats');
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error('Failed to load campaign analytics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchSegments();
    fetchStatsData();
  }, []);

  const resetForm = () => {
    setName('');
    setChannel('EMAIL');
    setSegmentId('All');
    setTemplateSubject('');
    setTemplateBody('');
    setScheduledAt('');
    setSelectedCampaign(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openDeleteModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteOpen(true);
  };

  const openLogsModal = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsLogsOpen(true);
    setLoadingLogs(true);
    try {
      const data = await fetchCampaignLogs(campaign.id);
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load campaign logs');
      setIsLogsOpen(false);
    } finally {
      setLoadingLogs(false);
    }
  };

  const insertTag = (tag: string) => {
    setTemplateBody((prev) => prev + tag);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !templateBody.trim() || !scheduledAt) return;

    setSubmitting(true);
    try {
      await createCampaign({
        name: name.trim(),
        channel,
        segmentId: segmentId === 'All' ? null : segmentId,
        templateSubject: channel === 'EMAIL' ? templateSubject.trim() || 'Special Offer' : null,
        templateBody: templateBody.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      toast.success('Campaign scheduled successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchStatsData(); // refresh stats
    } catch (err: any) {
      toast.error(err.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCampaign) return;
    setSubmitting(true);
    try {
      await deleteCampaign(selectedCampaign.id);
      toast.success('Campaign deleted successfully');
      setIsDeleteOpen(false);
      resetForm();
      fetchStatsData(); // refresh stats
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'SENDING':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'FAILED':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'DRAFT':
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  const totalDispatched = stats.totalSent + stats.totalFailed;
  const successRate = totalDispatched > 0 ? (stats.totalSent / totalDispatched) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Campaign Analytics Visual Panel */}
      <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/55 rounded-[28px] p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#374151]/30 pb-3 mb-5">
          <BarChart className="w-5 h-5 text-[#FF6B35]" />
          <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Campaign Analytics</h4>
        </div>

        {loadingStats ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6B35]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 dark:text-gray-300">
            <div className="bg-slate-50/50 dark:bg-[#111827]/10 border border-slate-200/50 dark:border-[#374151]/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Campaigns</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">{stats.totalCampaigns}</h3>
            </div>
            
            <div className="bg-slate-50/50 dark:bg-[#111827]/10 border border-slate-200/50 dark:border-[#374151]/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispatched Messages</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">{totalDispatched}</h3>
            </div>

            <div className="bg-slate-50/50 dark:bg-[#111827]/10 border border-slate-200/50 dark:border-[#374151]/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Success Rate</p>
              <h3 className="text-xl font-black text-emerald-500 mt-1">{successRate.toFixed(1)}%</h3>
            </div>

            <div className="bg-slate-50/50 dark:bg-[#111827]/10 border border-slate-200/50 dark:border-[#374151]/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Channel Mix (Email/SMS)</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">{stats.emailCount} / {stats.smsCount}</h3>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Campaign Workspace</h3>
          <p className="text-xs text-slate-400">Queue SMS and email blasts to dynamic client segment groups.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs shadow-lg shadow-[#FF6B35]/15 shrink-0 select-none focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {campaignsLoading && campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
          <p className="text-slate-500 text-sm">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-12 text-center">
          <p className="text-md font-bold text-slate-800 dark:text-white">No Campaigns Scheduled</p>
          <p className="text-xs text-slate-400 mt-1">Configure your first campaign to alert customers of new menu items or loyalty rewards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[270px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/30 pb-3">
                  <div className="flex items-center gap-2">
                    {campaign.channel === 'EMAIL' ? (
                      <Mail className="w-4 h-4 text-[#FF6B35]" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className="font-extrabold text-slate-800 dark:text-white text-base truncate max-w-[150px]">{campaign.name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${getStatusBadge(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="py-4 space-y-1.5 text-xs text-slate-500 dark:text-gray-400">
                  <div>
                    Target Segment: <strong className="text-slate-800 dark:text-white">{campaign.segment?.name || 'All Customers'}</strong>
                  </div>
                  {campaign.channel === 'EMAIL' && campaign.templateSubject && (
                    <div className="truncate">
                      Subject: <span className="italic">"{campaign.templateSubject}"</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 pt-1.5 border-t border-slate-100 dark:border-[#374151]/20">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Delivery progress progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                      <span>Delivery progress:</span>
                      <span>{campaign.sentCount} sent / {campaign.failedCount} failed</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${(campaign.sentCount / Math.max(1, campaign.sentCount + campaign.failedCount)) * 100}%`
                        }}
                      />
                      <div
                        className="bg-red-500 h-full"
                        style={{
                          width: `${(campaign.failedCount / Math.max(1, campaign.sentCount + campaign.failedCount)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center border-t border-slate-100 dark:border-[#374151]/20 pt-3 gap-2">
                <button
                  onClick={() => openLogsModal(campaign)}
                  className="px-3 py-1.5 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/20 font-bold rounded-xl text-[10px] transition-colors flex items-center gap-1 focus:outline-none"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Logs
                </button>
                
                <button
                  onClick={() => openDeleteModal(campaign)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-500 rounded-xl transition-colors focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-6">
              <h3 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#FF6B35]" />
                Schedule Campaign
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-505 dark:text-gray-400 transition-all focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Campaign Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekend Discount Blast"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Channel Type</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-705 dark:text-gray-250"
                  >
                    <option value="EMAIL">Email Address</option>
                    <option value="SMS">SMS / Text Message</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Segment Group</label>
                  <select
                    value={segmentId}
                    onChange={(e) => setSegmentId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-705 dark:text-gray-250"
                  >
                    <option value="All">All Customers</option>
                    {segments.map((seg) => (
                      <option key={seg.id} value={seg.id}>{seg.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {channel === 'EMAIL' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Subject Line</label>
                  <input
                    type="text"
                    required={channel === 'EMAIL'}
                    placeholder="e.g. Free Dessert this Weekend!"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Content Template</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => insertTag(' {{name}} ')}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded border border-slate-200 dark:border-transparent text-[9px] font-bold focus:outline-none"
                    >
                      + Name
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag(' {{phone}} ')}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded border border-slate-200 dark:border-transparent text-[9px] font-bold focus:outline-none"
                    >
                      + Phone
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Hey {{name}}, visit us this weekend for a 20% discount!"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-slate-800 dark:text-white leading-relaxed"
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Queue Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DELIVERIES LOG DRAWER MODAL */}
      {isLogsOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsLogsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl p-6 text-left z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#374151]/35 pb-4 mb-4">
              <div>
                <h3 className="text-md font-black text-slate-850 dark:text-white">Delivery Log Metrics</h3>
                <p className="text-[10px] text-slate-400">Execution audits for campaign: <strong>{selectedCampaign.name}</strong></p>
              </div>
              <button onClick={() => setIsLogsOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 py-2">
              {loadingLogs ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center text-slate-450 dark:text-gray-400 py-10">No messages dispatched yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="bg-slate-50 dark:bg-[#111827]/25 border border-slate-200/50 dark:border-[#374151]/20 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-white">{log.customer?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{log.customer?.email || log.customer?.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        log.status === 'SENT' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : log.status === 'FAILED'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {log.status}
                      </span>
                      {log.errorDetails && <p className="text-[9px] text-red-400 mt-1 truncate max-w-[120px]">{log.errorDetails}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
