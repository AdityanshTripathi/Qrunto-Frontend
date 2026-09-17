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
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60';
const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white';
const label = 'block text-xs font-semibold uppercase tracking-wide text-slate-500';
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
  if (error) return <div className={card}><p role="alert" className="text-red-600">{error}</p><button onClick={() => navigate('/dashboard/crm')} className="mt-4 text-[#E96B3C]">Back to CRM</button></div>;
  if (!guest) return <p className="py-12 text-center text-sm text-slate-500">Loading guest profile…</p>;
  const optedIn = guest.consents[0]?.granted === true;
  const averageBill = guest.brandVisitCount ? Number(guest.brandTotalSpend) / guest.brandVisitCount : 0;
  return <div className="mx-auto max-w-7xl space-y-6 pb-12">
    <div className="flex items-center gap-4"><button aria-label="Back to CRM" onClick={() => navigate('/dashboard/crm')} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 dark:border-slate-700 dark:text-white"><ArrowLeft size={20}/></button>
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E96B3C]">Guest profile</p><h1 className="text-3xl font-bold text-slate-900 dark:text-white">{guest.name}</h1><p className="text-sm text-slate-500">{guest.phone} · {guest.phoneVerifiedAt ? 'Verified mobile' : 'Mobile not verified'}</p></div></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[[ShoppingBag, 'Paid visits', guest.brandVisitCount], [Heart, 'Net spend', money(guest.brandTotalSpend)], [Gift, 'Loyalty points', guest.loyaltyAccount?.pointsBalance ?? 0], [CalendarDays, 'Average bill', money(averageBill)]].map(([Icon, title, value], index) => {
        const Glyph = Icon as typeof ShoppingBag;
        return <div key={index} className={card}><Glyph size={20} className="mb-3 text-[#E96B3C]"/><p className="text-2xl font-bold text-slate-900 dark:text-white">{value as string | number}</p><p className="text-sm text-slate-500">{title as string}</p></div>;
      })}
    </div>
    <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
      <div className="space-y-5">
        <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Service preferences</h2><p className="mb-5 text-sm text-slate-500">Only record details the guest has shared.</p>
          <div className="space-y-3"><label className={label}>Name<input className={`mt-1 ${input}`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label>
            <label className={label}>Email (optional)<input type="email" className={`mt-1 ${input}`} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label>
            <label className={label}>Dietary preference<input className={`mt-1 ${input}`} value={form.dietaryPreference} onChange={e => setForm({ ...form, dietaryPreference: e.target.value })} placeholder="e.g. vegetarian"/></label>
            <label className={label}>Seating preference<input className={`mt-1 ${input}`} value={form.seatingPreference} onChange={e => setForm({ ...form, seatingPreference: e.target.value })} placeholder="e.g. quiet corner"/></label>
            <label className={label}>Allergy alert<textarea className={`mt-1 ${input}`} value={form.allergyNote} onChange={e => setForm({ ...form, allergyNote: e.target.value })} placeholder="Only if the guest disclosed one" rows={2}/></label>
            <div className="grid grid-cols-2 gap-3"><label className={label}>Birthday<input type="date" className={`mt-1 ${input}`} value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })}/></label><label className={label}>Anniversary<input type="date" className={`mt-1 ${input}`} value={form.anniversary} onChange={e => setForm({ ...form, anniversary: e.target.value })}/></label></div>
            <button disabled={saving} onClick={savePreferences} className="rounded-xl bg-[#E96B3C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save preferences</button></div></div>
        <div className={card}><div className="flex items-center gap-2"><ShieldCheck size={20} className="text-[#E96B3C]"/><h2 className="text-lg font-bold text-slate-900 dark:text-white">WhatsApp permission</h2></div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{optedIn ? 'Guest opted in to offers.' : 'No active marketing permission.'}</p>
          {guest.consents[0] && <p className="mt-1 text-xs text-slate-500">Last decision: {localDate(guest.consents[0].recordedAt, zone)} · {guest.consents[0].source}</p>}
          {optedIn && <button disabled={saving} onClick={optOut} className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Stop WhatsApp offers</button>}</div>
        <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Outlet activity</h2><div className="mt-3 space-y-2">{guest.profiles.map(profile => <div key={profile.id} className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-700"><span>{profile.restaurant.name}</span><span>{profile.totalOrders} visits · {money(profile.totalSpend)}</span></div>)}</div></div>
      </div>
      <div className="space-y-5">
        <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Dining history</h2><p className="mb-4 text-sm text-slate-500">First visit {guest.brandFirstVisitAt ? localDate(guest.brandFirstVisitAt, zone) : '—'} · Last visit {guest.brandLastVisitAt ? localDate(guest.brandLastVisitAt, zone) : '—'}</p>
          <div className="space-y-3">{guest.orders.map(order => <div key={order.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700"><div className="flex justify-between gap-3"><div><p className="font-semibold text-slate-900 dark:text-white">{order.restaurant.name} · {order.orderNumber}</p><p className="text-xs text-slate-500">{localDate(order.createdAt, zone)}</p></div><strong className="text-sm">{money(order.totalAmount)}</strong></div><p className="mt-2 text-sm text-slate-500">{order.orderItems.map(item => `${item.quantity}× ${item.itemName}`).join(', ')}</p></div>)}{guest.orders.length === 0 && <p className="text-sm text-slate-500">No paid visits yet.</p>}</div></div>
        <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Staff notes</h2><div className="mt-3 flex gap-2"><input className={input} value={note} onChange={e => setNote(e.target.value)} placeholder="Useful service context" maxLength={1000}/><button disabled={saving || !note.trim()} onClick={addNote} className="rounded-xl bg-[#E96B3C] px-4 text-sm font-semibold text-white disabled:opacity-50">Add</button></div>
          <div className="mt-4 space-y-2">{guest.notes.map(item => <div key={item.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-700/40"><p>{item.noteText}</p><p className="mt-1 text-xs text-slate-500">{item.user.name} · {localDate(item.createdAt, zone)}</p></div>)}{guest.notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}</div></div>
        <div className={card}><div className="flex items-center gap-2"><MessageCircle size={19} className="text-[#E96B3C]"/><h2 className="text-lg font-bold text-slate-900 dark:text-white">Feedback</h2></div><div className="mt-3 space-y-2">{guest.feedbacks.map(item => <div key={item.id} className="border-b border-slate-100 py-2 text-sm dark:border-slate-700"><strong>{item.rating}/5</strong> · {item.comments || 'No comment'}<p className="text-xs text-slate-500">{localDate(item.createdAt, zone)}</p></div>)}{guest.feedbacks.length === 0 && <p className="text-sm text-slate-500">No feedback yet.</p>}</div></div>
        <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Points ledger</h2><div className="mt-3 space-y-2">{guest.loyaltyAccount?.ledger.map(item => <div key={item.id} className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-700"><span>{item.description}<small className="block text-slate-500">{localDate(item.createdAt, zone)}</small></span><strong className={item.points >= 0 ? 'text-emerald-600' : 'text-red-600'}>{item.points > 0 ? '+' : ''}{item.points}</strong></div>)}{!guest.loyaltyAccount?.ledger.length && <p className="text-sm text-slate-500">No point activity yet.</p>}</div></div>
      </div>
    </div>
  </div>;
}
