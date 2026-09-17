import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Gift, Megaphone, Search, Users, UserRoundCheck, UserRoundX, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';
import { useRestaurantTimezone, localDate } from '../../../lib/timezone';

type Tab = 'guests' | 'segments' | 'campaigns' | 'loyalty';
type Segment = 'all' | 'first' | 'regular' | 'vip' | 'lapsed';
type Guest = { id: string; name: string; phone: string; brandTotalSpend: string | number; brandVisitCount: number;
  brandLastVisitAt: string | null; acquisitionSource: string; loyaltyAccount?: { pointsBalance: number } | null };
type Overview = { total: number; repeat: number; lapsed: number; recent: number; optedIn: number; repeatRate: number };
type SavedSegment = { id: string; name: string; description: string | null; _count?: { customers: number } };
type Campaign = { id: string; name: string; templateBody: string; status: string; scheduledAt: string;
  sentCount: number; failedCount: number; segment?: { name: string } | null };
type CampaignLog = { id: string; status: string; customer?: { name: string; phone: string } | null; errorDetails?: string | null };
type Policy = { pointsPerHundredRupees: number; maxRedemptionPercent: number };
const money = (value: string | number) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60';
const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white';
const primary = 'rounded-xl bg-[#E96B3C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d85d30] disabled:opacity-50';
const muted = 'text-sm text-slate-500 dark:text-slate-400';

export default function CRMHub() {
  const navigate = useNavigate();
  const timeZone = useRestaurantTimezone();
  const [tab, setTab] = useState<Tab>('guests');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [segment, setSegment] = useState<Segment>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [segments, setSegments] = useState<SavedSegment[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [policy, setPolicy] = useState<Policy>({ pointsPerHundredRupees: 1, maxRedemptionPercent: 20 });
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('');
  const [whatsappLanguage, setWhatsappLanguage] = useState('en_US');
  const [authTemplateConfigured, setAuthTemplateConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [segmentName, setSegmentName] = useState('');
  const [minimumVisits, setMinimumVisits] = useState(2);
  const [minimumSpend, setMinimumSpend] = useState(0);
  const [lapsedDays, setLapsedDays] = useState(0);
  const [campaignName, setCampaignName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [campaignSegmentId, setCampaignSegmentId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const refreshOverview = useCallback(async () => {
    const data = await api.get('/crm/v2/overview') as Overview;
    setOverview(data);
  }, []);
  const refreshGuests = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), segment });
      if (search) params.set('search', search);
      const data = await api.get(`/crm/v2/customers?${params}`) as { customers: Guest[]; total: number };
      setGuests(data.customers); setTotal(data.total);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load guests'); }
    finally { setLoading(false); }
  }, [page, segment, search]);
  const refreshSegments = useCallback(async () => {
    const data = await api.get('/crm/segments') as { segments: SavedSegment[] };
    setSegments(data.segments);
  }, []);
  const refreshCampaigns = useCallback(async () => {
    const data = await api.get('/crm/campaigns') as { campaigns: Campaign[] };
    setCampaigns(data.campaigns);
  }, []);

  useEffect(() => { void refreshOverview().catch(() => setError('Could not load CRM overview')); }, [refreshOverview]);
  useEffect(() => { void refreshGuests(); }, [refreshGuests]);
  useEffect(() => {
    if (tab === 'segments' || tab === 'campaigns') void refreshSegments().catch(() => setError('Could not load segments'));
    if (tab === 'campaigns') {
      void refreshCampaigns().catch(() => setError('Could not load campaigns'));
      void api.get('/crm/v2/whatsapp-status').then((data: { configured: boolean; phoneNumberId: string | null; languageCode: string | null; authTemplateConfigured: boolean }) => {
        setWhatsappConfigured(data.configured);
        setWhatsappPhoneNumberId(data.phoneNumberId || '');
        setWhatsappLanguage(data.languageCode || 'en_US');
        setAuthTemplateConfigured(data.authTemplateConfigured);
      });
    }
    if (tab === 'loyalty') void api.get('/crm/v2/loyalty-policy').then((data: Policy) => setPolicy(data));
  }, [tab, refreshSegments, refreshCampaigns]);

  const createSegment = async () => {
    if (!segmentName.trim()) return;
    setSaving(true);
    try {
      await api.post('/crm/segments', { name: segmentName.trim(), description: null,
        criteria: { ...(minimumVisits > 0 ? { minOrders: minimumVisits } : {}),
          ...(minimumSpend > 0 ? { minSpend: minimumSpend } : {}),
          ...(lapsedDays > 0 ? { lastVisitDaysAgo: lapsedDays } : {}) } });
      setSegmentName(''); await refreshSegments(); toast.success('Segment created');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not create segment'); }
    finally { setSaving(false); }
  };
  const createCampaign = async () => {
    if (!campaignName.trim() || !templateName.trim() || !scheduledAt) return;
    setSaving(true);
    try {
      await api.post('/crm/campaigns', { name: campaignName.trim(), channel: 'WHATSAPP',
        segmentId: campaignSegmentId || null, templateSubject: null, templateBody: templateName.trim(), scheduledAt });
      setCampaignName(''); setTemplateName(''); setScheduledAt(''); await refreshCampaigns();
      toast.success(whatsappConfigured ? 'Campaign queued' : 'Campaign saved as draft');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not create campaign'); }
    finally { setSaving(false); }
  };
  const queueCampaign = async (id: string) => {
    try { await api.post(`/crm/v2/campaigns/${id}/queue`); await refreshCampaigns(); toast.success('Campaign queued'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not queue campaign'); }
  };
  const loadCampaignLogs = async (id: string) => {
    setSelectedCampaign(id);
    try { const data = await api.get(`/crm/campaigns/${id}/logs`) as { logs: CampaignLog[] }; setCampaignLogs(data.logs); }
    catch { toast.error('Could not load delivery activity'); }
  };
  const savePolicy = async () => {
    setSaving(true);
    try { await api.put('/crm/v2/loyalty-policy', policy); toast.success('Loyalty rules saved'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not save loyalty rules'); }
    finally { setSaving(false); }
  };
  const saveWhatsAppConnection = async () => {
    setSaving(true);
    try {
      await api.put('/crm/v2/whatsapp-connection', { phoneNumberId: whatsappPhoneNumberId.trim(),
        accessToken: whatsappAccessToken.trim(), languageCode: whatsappLanguage.trim() });
      setWhatsappAccessToken(''); setWhatsappConfigured(true); toast.success('WhatsApp connection saved');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not save WhatsApp connection'); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-7xl space-y-6 pb-12">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E96B3C]">Relationships</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Guest CRM</h1>
        <p className={`mt-1 ${muted}`}>Know your dine-in guests and bring them back.</p></div>
      <button onClick={() => { void refreshOverview(); void refreshGuests(); }} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"><RefreshCw size={16}/> Refresh</button>
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {[
        { label: 'Guests', value: overview?.total ?? '—', icon: Users },
        { label: 'Repeat guests', value: overview?.repeat ?? '—', icon: UserRoundCheck },
        { label: 'Repeat rate', value: overview ? `${overview.repeatRate}%` : '—', icon: ArrowRight },
        { label: 'Lapsed 30d', value: overview?.lapsed ?? '—', icon: UserRoundX },
        { label: 'WhatsApp opt-ins', value: overview?.optedIn ?? '—', icon: Megaphone },
      ].map(item => <div key={item.label} className={card}><item.icon className="mb-3 text-[#E96B3C]" size={20}/>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p><p className={muted}>{item.label}</p></div>)}
    </div>

    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
      {([['guests', 'Guests'], ['segments', 'Segments'], ['campaigns', 'WhatsApp campaigns'], ['loyalty', 'Loyalty rules']] as const).map(([key, label]) =>
        <button key={key} onClick={() => setTab(key)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === key ? 'border-[#E96B3C] text-[#E96B3C]' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{label}</button>)}
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40">{error}</p>}

    {tab === 'guests' && <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Guest directory</h2><p className={muted}>{total} matching guests</p></div>
        <form onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="flex gap-2">
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Name or mobile" aria-label="Search guests" className={input}/>
          <button type="submit" className={primary} aria-label="Search"><Search size={17}/></button>
        </form>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">{([['all', 'All'], ['first', 'First visit'], ['regular', 'Regular'], ['vip', 'VIP ₹10k+'], ['lapsed', 'Lapsed 30d']] as const).map(([key, label]) =>
        <button key={key} onClick={() => { setSegment(key); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${segment === key ? 'bg-[#E96B3C] text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'}`}>{label}</button>)}</div>
      <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700"><tr><th className="py-3 pr-3">Guest</th><th className="py-3 pr-3">Visits</th><th className="py-3 pr-3">Spend</th><th className="py-3 pr-3">Last visit</th><th className="py-3">Points</th></tr></thead>
        <tbody>{guests.map(guest => <tr key={guest.id} onClick={() => navigate(`/dashboard/crm/customers/${guest.id}`)} className="cursor-pointer border-b border-slate-100 hover:bg-orange-50/50 dark:border-slate-700 dark:hover:bg-slate-700/30">
          <td className="py-3 pr-3"><span className="font-semibold text-slate-900 dark:text-white">{guest.name}</span><span className="block text-xs text-slate-500">{guest.phone}</span></td>
          <td className="py-3 pr-3">{guest.brandVisitCount}</td><td className="py-3 pr-3">{money(guest.brandTotalSpend)}</td>
          <td className="py-3 pr-3">{guest.brandLastVisitAt ? localDate(guest.brandLastVisitAt, timeZone) : 'No paid visit yet'}</td>
          <td className="py-3">{guest.loyaltyAccount?.pointsBalance ?? 0}</td></tr>)}</tbody></table>
        {!loading && guests.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No guests match this view yet.</p>}
        {loading && <p className="py-12 text-center text-sm text-slate-500">Loading guests…</p>}</div>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-500"><span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
    </div>}

    {tab === 'segments' && <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
      <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Create a segment</h2><p className={`mb-5 ${muted}`}>Rules use paid visits and net spend across all outlets.</p>
        <div className="space-y-3"><label className="block text-xs font-semibold text-slate-500">Name<input className={`mt-1 ${input}`} value={segmentName} onChange={e => setSegmentName(e.target.value)} placeholder="Regular coffee guests"/></label>
          <label className="block text-xs font-semibold text-slate-500">Minimum visits<input type="number" min="0" className={`mt-1 ${input}`} value={minimumVisits} onChange={e => setMinimumVisits(Number(e.target.value))}/></label>
          <label className="block text-xs font-semibold text-slate-500">Minimum spend (₹)<input type="number" min="0" className={`mt-1 ${input}`} value={minimumSpend} onChange={e => setMinimumSpend(Number(e.target.value))}/></label>
          <label className="block text-xs font-semibold text-slate-500">No visit in past N days (0 disables)<input type="number" min="0" className={`mt-1 ${input}`} value={lapsedDays} onChange={e => setLapsedDays(Number(e.target.value))}/></label>
          <button disabled={saving || !segmentName.trim()} onClick={createSegment} className={primary}>Create segment</button></div></div>
      <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Saved segments</h2><div className="mt-4 space-y-2">{segments.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-700"><div><p className="font-semibold text-slate-900 dark:text-white">{item.name}</p><p className={muted}>{item.description || 'Rule-based guest group'}</p></div><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#E96B3C]">{item._count?.customers ?? 0} guests</span></div>)}{segments.length === 0 && <p className={muted}>No saved segments yet.</p>}</div></div>
    </div>}

    {tab === 'campaigns' && <div className="space-y-5">
      <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Meta WhatsApp connection</h2><p className={muted}>{whatsappConfigured ? `Connected to phone number ID ${whatsappPhoneNumberId}. Enter a new token only to replace the connection.` : 'Connect this brand’s own Meta Cloud API sender. Campaigns remain drafts until connected.'}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.6fr_0.7fr_auto]"><input className={input} aria-label="Meta phone number ID" placeholder="Phone number ID" value={whatsappPhoneNumberId} onChange={e => setWhatsappPhoneNumberId(e.target.value)}/><input className={input} aria-label="Meta access token" type="password" autoComplete="new-password" placeholder="Access token" value={whatsappAccessToken} onChange={e => setWhatsappAccessToken(e.target.value)}/><input className={input} aria-label="Template language" placeholder="en_US" value={whatsappLanguage} onChange={e => setWhatsappLanguage(e.target.value)}/><button className={primary} disabled={saving || !whatsappPhoneNumberId || !whatsappAccessToken} onClick={saveWhatsAppConnection}>Save connection</button></div>
        {!authTemplateConfigured && <p className="mt-3 text-xs text-amber-700">Phone verification also needs the server-side approved authentication template name configured.</p>}
      </div>
      <div className={`grid gap-4 ${card} lg:grid-cols-[1.2fr_1fr_1fr]`}><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule a campaign</h2><p className={muted}>Only verified guests with active WhatsApp marketing consent are eligible. Use an approved Meta template name.</p></div>
        <div className="space-y-3"><input className={input} placeholder="Campaign name" value={campaignName} onChange={e => setCampaignName(e.target.value)}/><input className={input} placeholder="Approved template name" value={templateName} onChange={e => setTemplateName(e.target.value)}/></div>
        <div className="space-y-3"><select className={input} value={campaignSegmentId} onChange={e => setCampaignSegmentId(e.target.value)}><option value="">All eligible guests</option>{segments.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><input type="datetime-local" aria-label="Schedule date and time" className={input} value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}/><button className={primary} disabled={saving || !campaignName || !templateName || !scheduledAt} onClick={createCampaign}>Save campaign</button></div></div>
      <div className={card}><h2 className="text-lg font-bold text-slate-900 dark:text-white">Campaign activity</h2><div className="mt-4 space-y-2">{campaigns.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-700"><div><p className="font-semibold text-slate-900 dark:text-white">{item.name}</p><p className={muted}>{item.templateBody} · {item.segment?.name || 'All eligible'} · {localDate(item.scheduledAt, timeZone)}</p></div><div className="flex items-center gap-3 text-xs"><span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600 dark:bg-slate-700 dark:text-white">{item.status}</span><span>{item.sentCount} accepted · {item.failedCount} failed</span>{item.status === 'DRAFT' && <button onClick={() => void queueCampaign(item.id)} className="font-semibold text-[#E96B3C]">Queue</button>}<button onClick={() => void loadCampaignLogs(item.id)} className="font-semibold text-[#E96B3C]">Details</button></div></div>)}{campaigns.length === 0 && <p className={muted}>No campaigns yet.</p>}</div></div>
      {selectedCampaign && <div className={card}><h3 className="font-bold text-slate-900 dark:text-white">Delivery activity</h3><div className="mt-3 space-y-2">{campaignLogs.map(log => <div key={log.id} className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm dark:border-slate-700"><span>{log.customer?.name || 'Guest'} · {log.customer?.phone || ''}</span><span>{log.status}{log.errorDetails ? ` · ${log.errorDetails}` : ''}</span></div>)}{campaignLogs.length === 0 && <p className={muted}>No recipients recorded yet.</p>}</div></div>}
    </div>}

    {tab === 'loyalty' && <div className={`max-w-2xl ${card}`}><Gift className="text-[#E96B3C]"/><h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">Brand-wide loyalty</h2><p className={`mb-5 ${muted}`}>Guests earn points on settled dine-in spend. One point is worth ₹1 when redeemed; refunds adjust the ledger.</p>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-500">Points per ₹100 paid<input type="number" min="0" max="20" value={policy.pointsPerHundredRupees} onChange={e => setPolicy({ ...policy, pointsPerHundredRupees: Number(e.target.value) })} className={`mt-1 ${input}`}/></label>
        <label className="text-xs font-semibold text-slate-500">Maximum bill discount (%)<input type="number" min="0" max="100" value={policy.maxRedemptionPercent} onChange={e => setPolicy({ ...policy, maxRedemptionPercent: Number(e.target.value) })} className={`mt-1 ${input}`}/></label></div>
      <button onClick={savePolicy} disabled={saving} className={`mt-5 ${primary}`}>Save loyalty rules</button></div>}
  </div>;
}
