import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, Gift, Heart, MessageCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { api } from '../../../lib/api';
import { localDate, useRestaurantTimezone } from '../../../lib/timezone';

type Order = { id: string; orderNumber: string; createdAt: string; totalAmount: string | number;
  restaurant: { name: string }; orderItems: { id: string; itemName: string; quantity: number }[] };
type Guest = { id: string; name: string; phone: string; email: string | null; phoneVerifiedAt: string | null;
  acquisitionSource: string; createdAt: string; birthday: string | null; anniversary: string | null;
  dietaryPreference: string | null; seatingPreference: string | null; allergyNote: string | null;
  brandVisitCount: number; brandTotalSpend: string | number; brandFirstVisitAt: string | null; brandLastVisitAt: string | null;
  profiles: { id: string; totalOrders: number; totalSpend: string | number; restaurant: { name: string } }[];
  orders: Order[]; notes: { id: string; noteText: string; createdAt: string; user: { name: string } }[];
  feedbacks: { id: string; rating: number; comments: string | null; createdAt: string }[];
  loyaltyAccount: { pointsBalance: number; lifetimePoints: number; ledger: { id: string; points: number; description: string; createdAt: string }[] } | null;
  consents: { id: string; granted: boolean; recordedAt: string; source: string }[] };
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.025] dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none';
const input = 'min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 placeholder:text-slate-400 transition-colors outline-none hover:border-slate-300 focus-visible:border-[#FF6B35] focus-visible:ring-2 focus-visible:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:hover:border-slate-600 dark:focus-visible:border-orange-500';
const label = 'block text-xs font-bold text-slate-600 dark:text-slate-300';
const heading = 'text-lg font-black tracking-tight text-slate-900 dark:text-white';
const primary = 'inline-flex min-h-10 items-center justify-center rounded-lg bg-[#FF6B35] px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const muted = 'text-[13px] leading-5 text-slate-500 dark:text-slate-400';
const money = (value: string | number) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function GuestProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const zone = useRestaurantTimezone();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [form, setForm] = useState({ name: '', email: '', dietaryPreference: '', seatingPreference: '', allergyNote: '', birthday: '', anniversary: '' });
  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get(`/crm/v2/customers/${id}`) as { customer: Guest };
      setGuest(data.customer);
      setForm({ name: data.customer.name, email: data.customer.email || '',
        dietaryPreference: data.customer.dietaryPreference || '', seatingPreference: data.customer.seatingPreference || '',
        allergyNote: data.customer.allergyNote || '', birthday: data.customer.birthday?.slice(0, 10) || '',
        anniversary: data.customer.anniversary?.slice(0, 10) || '' });
      setError('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load guest'); }
  }, [id]);
  useEffect(() => { void refresh(); }, [refresh]);

  const savePreferences = async () => {
    if (!id || !form.name.trim()) return;
    setSaving(true);
    try {
      await api.put(`/crm/v2/customers/${id}/preferences`, {
        name: form.name.trim(), email: form.email.trim() || null,
        dietaryPreference: form.dietaryPreference.trim() || null,
        seatingPreference: form.seatingPreference.trim() || null,
        allergyNote: form.allergyNote.trim() || null,
        birthday: form.birthday ? `${form.birthday}T00:00:00.000Z` : null,
        anniversary: form.anniversary ? `${form.anniversary}T00:00:00.000Z` : null,
      });
      await refresh(); toast.success('Guest preferences saved');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not save preferences'); }
    finally { setSaving(false); }
  };
  const addNote = async () => {
    if (!id || !note.trim()) return;
    setSaving(true);
    try { await api.post(`/crm/v2/customers/${id}/notes`, { noteText: note.trim() }); setNote(''); await refresh(); toast.success('Note added'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not add note'); }
    finally { setSaving(false); }
  };
  const optOut = async () => {
    if (!id) return;
    setSaving(true);
    try { await api.post(`/crm/v2/customers/${id}/whatsapp-opt-out`); await refresh(); toast.success('WhatsApp marketing stopped'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not update consent'); }
    finally { setSaving(false); }
  };
  if (error) return <div className={card}><p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p><button onClick={() => navigate('/dashboard/crm')} className="mt-4 text-xs font-bold text-orange-700 hover:text-orange-600 focus-visible:outline-none focus-visible:underline dark:text-orange-400">Back to CRM</button></div>;
  if (!guest) return <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Loading guest profile…</p>;
  const optedIn = guest.consents[0]?.granted === true;
  const averageBill = guest.brandVisitCount ? Number(guest.brandTotalSpend) / guest.brandVisitCount : 0;
  return <div className="mx-auto max-w-7xl space-y-5 pb-10">
    <div className="flex items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-800"><button aria-label="Back to CRM" onClick={() => navigate('/dashboard/crm')} className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"><ArrowLeft size={18}/></button>
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF6B35]">Guest profile</p><h1 className="mt-0.5 text-[22px] font-black tracking-tight text-slate-900 dark:text-white">{guest.name}</h1><p className={muted}>{guest.phone} · {guest.phoneVerifiedAt ? 'Verified mobile' : 'Mobile not verified'}</p></div></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[[ShoppingBag, 'Paid visits', guest.brandVisitCount], [Heart, 'Net spend', money(guest.brandTotalSpend)], [Gift, 'Loyalty points', guest.loyaltyAccount?.pointsBalance ?? 0], [CalendarDays, 'Average bill', money(averageBill)]].map(([Icon, title, value], index) => {
        const Glyph = Icon as typeof ShoppingBag;
        return <div key={index} className={card}><Glyph size={19} strokeWidth={1.8} className="mb-3 text-[#FF6B35]"/><p className="text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">{value as string | number}</p><p className={`mt-0.5 ${muted}`}>{title as string}</p></div>;
      })}
    </div>
    <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
      <div className="space-y-5">
        <div className={card}><h2 className={heading}>Service preferences</h2><p className={`mb-5 mt-1 ${muted}`}>Only record details the guest has shared.</p>
          <div className="space-y-3"><label className={label}>Name<input className={`mt-1.5 ${input}`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label>
            <label className={label}>Email (optional)<input type="email" className={`mt-1.5 ${input}`} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label>
            <label className={label}>Dietary preference<input className={`mt-1.5 ${input}`} value={form.dietaryPreference} onChange={e => setForm({ ...form, dietaryPreference: e.target.value })} placeholder="e.g. vegetarian"/></label>
            <label className={label}>Seating preference<input className={`mt-1.5 ${input}`} value={form.seatingPreference} onChange={e => setForm({ ...form, seatingPreference: e.target.value })} placeholder="e.g. quiet corner"/></label>
            <label className={label}>Allergy alert<textarea className={`mt-1.5 ${input}`} value={form.allergyNote} onChange={e => setForm({ ...form, allergyNote: e.target.value })} placeholder="Only if the guest disclosed one" rows={2}/></label>
            <div className="grid grid-cols-2 gap-3"><label className={label}>Birthday<input type="date" className={`mt-1.5 ${input}`} value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })}/></label><label className={label}>Anniversary<input type="date" className={`mt-1.5 ${input}`} value={form.anniversary} onChange={e => setForm({ ...form, anniversary: e.target.value })}/></label></div>
            <button disabled={saving} onClick={savePreferences} className={primary}>Save preferences</button></div></div>
        <div className={card}><div className="flex items-center gap-2"><ShieldCheck size={19} strokeWidth={1.8} className="text-[#FF6B35]"/><h2 className={heading}>WhatsApp permission</h2></div>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{optedIn ? 'Guest opted in to offers.' : 'No active marketing permission.'}</p>
          {guest.consents[0] && <p className={`mt-1 ${muted}`}>Last decision: {localDate(guest.consents[0].recordedAt, zone)} · {guest.consents[0].source}</p>}
          {optedIn && <button disabled={saving} onClick={optOut} className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-500/10">Stop WhatsApp offers</button>}</div>
        <div className={card}><h2 className={heading}>Outlet activity</h2><div className="mt-3 space-y-2">{guest.profiles.map(profile => <div key={profile.id} className="flex justify-between gap-3 border-b border-slate-100 py-2.5 text-sm last:border-b-0 dark:border-slate-800"><span className="font-medium text-slate-800 dark:text-slate-200">{profile.restaurant.name}</span><span className="text-right tabular-nums text-slate-600 dark:text-slate-300">{profile.totalOrders} visits · {money(profile.totalSpend)}</span></div>)}</div></div>
      </div>
      <div className="space-y-5">
        <div className={card}><h2 className={heading}>Dining history</h2><p className={`mb-4 mt-1 ${muted}`}>First visit {guest.brandFirstVisitAt ? localDate(guest.brandFirstVisitAt, zone) : '—'} · Last visit {guest.brandLastVisitAt ? localDate(guest.brandLastVisitAt, zone) : '—'}</p>
          <div className="space-y-3">{guest.orders.map(order => <div key={order.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30"><div className="flex justify-between gap-3"><div><p className="text-sm font-bold text-slate-900 dark:text-white">{order.restaurant.name} · {order.orderNumber}</p><p className={`mt-0.5 ${muted}`}>{localDate(order.createdAt, zone)}</p></div><strong className="shrink-0 text-sm tabular-nums text-slate-900 dark:text-white">{money(order.totalAmount)}</strong></div><p className={`mt-2 ${muted}`}>{order.orderItems.map(item => `${item.quantity}× ${item.itemName}`).join(', ')}</p></div>)}{guest.orders.length === 0 && <p className={muted}>No paid visits yet.</p>}</div></div>
        <div className={card}><h2 className={heading}>Staff notes</h2><div className="mt-3 flex gap-2"><input className={input} value={note} onChange={e => setNote(e.target.value)} placeholder="Useful service context" maxLength={1000}/><button disabled={saving || !note.trim()} onClick={addNote} className={primary}>Add</button></div>
          <div className="mt-4 space-y-2">{guest.notes.map(item => <div key={item.id} className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-200"><p className="leading-5">{item.noteText}</p><p className={`mt-1 ${muted}`}>{item.user.name} · {localDate(item.createdAt, zone)}</p></div>)}{guest.notes.length === 0 && <p className={muted}>No notes yet.</p>}</div></div>
        <div className={card}><div className="flex items-center gap-2"><MessageCircle size={19} strokeWidth={1.8} className="text-[#FF6B35]"/><h2 className={heading}>Feedback</h2></div><div className="mt-3 space-y-2">{guest.feedbacks.map(item => <div key={item.id} className="border-b border-slate-100 py-2.5 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">{item.rating}/5</strong> · {item.comments || 'No comment'}<p className={`mt-0.5 ${muted}`}>{localDate(item.createdAt, zone)}</p></div>)}{guest.feedbacks.length === 0 && <p className={muted}>No feedback yet.</p>}</div></div>
        <div className={card}><h2 className={heading}>Points ledger</h2><div className="mt-3 space-y-2">{guest.loyaltyAccount?.ledger.map(item => <div key={item.id} className="flex justify-between gap-3 border-b border-slate-100 py-2.5 text-sm last:border-b-0 dark:border-slate-800"><span className="text-slate-700 dark:text-slate-300">{item.description}<small className={`block ${muted}`}>{localDate(item.createdAt, zone)}</small></span><strong className={`tabular-nums ${item.points >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{item.points > 0 ? '+' : ''}{item.points}</strong></div>)}{!guest.loyaltyAccount?.ledger.length && <p className={muted}>No point activity yet.</p>}</div></div>
      </div>
    </div>
  </div>;
}
