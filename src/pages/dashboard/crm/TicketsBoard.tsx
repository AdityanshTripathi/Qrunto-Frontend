import React, { useEffect, useState } from 'react';
import { useCRMStore, type Ticket } from '../../../store/crmStore';
import { AlertCircle, CheckCircle, Clock, Loader2, ArrowRight, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export const TicketsBoard: React.FC = () => {
  const {
    tickets,
    ticketsLoading,
    fetchTickets,
    updateTicketStatus,
    loading
  } = useCRMStore();

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      await updateTicketStatus(id, nextStatus);
      toast.success(`Ticket marked as ${nextStatus.replace('_', ' ').toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ticket status');
    }
  };

  // Group tickets by status
  const openTickets = tickets.filter((t) => t.status === 'OPEN');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED');

  if (ticketsLoading && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
        <p className="text-slate-500 text-sm">Loading complaints board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Complaints Ticket Board</h3>
        <p className="text-xs text-slate-400">Review low-rating order feedback and track resolution tickets across columns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: OPEN */}
        <div className="bg-[#f8fafc] dark:bg-[#111827]/15 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-205 dark:border-[#374151]/20 pb-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Unresolved / Open</h4>
            </div>
            <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{openTickets.length}</span>
          </div>

          <div className="space-y-3 min-h-[300px] overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin">
            {openTickets.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center italic py-10">No new complaints filed.</p>
            ) : (
              openTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200/60 dark:border-[#374151]/40 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-800 dark:text-white text-xs leading-snug">{ticket.subject}</h5>
                    {ticket.feedback?.rating && (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                        ⭐ {ticket.feedback.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed">{ticket.description}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-[#374151]/20">
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-gray-200">{ticket.customer?.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{ticket.customer?.phone}</p>
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1.5 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/20 rounded-xl text-[9px] font-bold transition-colors flex items-center gap-1 focus:outline-none"
                    >
                      Investigate
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="bg-[#f8fafc] dark:bg-[#111827]/15 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-205 dark:border-[#374151]/20 pb-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">In Investigation</h4>
            </div>
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{inProgressTickets.length}</span>
          </div>

          <div className="space-y-3 min-h-[300px] overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin">
            {inProgressTickets.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center italic py-10">No active investigations.</p>
            ) : (
              inProgressTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200/60 dark:border-[#374151]/40 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-800 dark:text-white text-xs leading-snug">{ticket.subject}</h5>
                    {ticket.feedback?.rating && (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                        ⭐ {ticket.feedback.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-505 dark:text-gray-400 leading-relaxed">{ticket.description}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-[#374151]/20">
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-gray-200">{ticket.customer?.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{ticket.customer?.phone}</p>
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-bold transition-colors flex items-center gap-1 focus:outline-none"
                    >
                      Resolve
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: RESOLVED */}
        <div className="bg-[#f8fafc] dark:bg-[#111827]/15 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-205 dark:border-[#374151]/20 pb-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Resolved</h4>
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{resolvedTickets.length}</span>
          </div>

          <div className="space-y-3 min-h-[300px] overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin">
            {resolvedTickets.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center italic py-10">No resolved complaints yet.</p>
            ) : (
              resolvedTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-[#1f2937]/35 border border-slate-200/60 dark:border-[#374151]/40 rounded-2xl p-4 space-y-3 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-800 dark:text-white text-xs leading-snug line-through">{ticket.subject}</h5>
                    {ticket.feedback?.rating && (
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                        ⭐ {ticket.feedback.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed italic">"{ticket.description}"</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-[#374151]/20">
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-gray-250">{ticket.customer?.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{ticket.customer?.phone}</p>
                    </div>

                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider">Closed</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default TicketsBoard;
