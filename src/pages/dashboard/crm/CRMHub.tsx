import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Gift, Megaphone, Search, Users, UserRoundCheck, UserRoundX, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';
import { useRestaurantTimezone, localDate } from '../../../lib/timezone';
import { WhatsAppEmbeddedSignup } from './WhatsAppEmbeddedSignup';
import {
  areTemplateParametersComplete,
  parameterFields,
  reconcileTemplateDraft,
  shapeCachedTemplates,
  shapeEligibleTemplates,
} from './whatsapp-campaign-templates';
import type { TemplateDraft, WhatsAppTemplate } from './whatsapp-campaign-templates';

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
type WhatsAppStatus = {
  configured: boolean;
  phoneNumberId: string | null;
  languageCode: string | null;
  source: 'MANUAL' | 'EMBEDDED_SIGNUP' | null;
  displayPhoneNumber: string | null;
  displayName: string | null;
  authTemplateConfigured: boolean;
};
const money = (value: string | number) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.025] dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none';
const input = 'min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none hover:border-slate-300 focus-visible:border-[#FF6B35] focus-visible:ring-2 focus-visible:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:hover:border-slate-600 dark:focus-visible:border-orange-500';
const primary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const muted = 'text-[13px] leading-5 text-slate-500 dark:text-slate-400';
const heading = 'text-lg font-black tracking-tight text-slate-900 dark:text-white';
const secondaryButton = 'inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white';

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
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('');
  const [whatsappLanguage, setWhatsappLanguage] = useState('en_US');
  const [authTemplateConfigured, setAuthTemplateConfigured] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [cachedTemplates, setCachedTemplates] = useState<WhatsAppTemplate[]>([]);
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft>({ selectedTemplateId: '', templateParameters: {} });
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesSyncing, setTemplatesSyncing] = useState(false);
  const [templatesError, setTemplatesError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [segmentName, setSegmentName] = useState('');
  const [minimumVisits, setMinimumVisits] = useState(2);
  const [minimumSpend, setMinimumSpend] = useState(0);
  const [lapsedDays, setLapsedDays] = useState(0);
  const [campaignName, setCampaignName] = useState('');
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
  const refreshTemplates = useCallback(async () => {
    setTemplatesLoading(true); setTemplatesError('');
    try {
      const [cacheResponse, eligibleResponse] = await Promise.all([
        api.get('/crm/v2/whatsapp/templates'),
        api.get('/crm/v2/whatsapp/templates/eligible'),
      ]);
      const nextTemplates = shapeEligibleTemplates(eligibleResponse);
      setCachedTemplates(shapeCachedTemplates(cacheResponse));
      setTemplates(nextTemplates);
      setTemplateDraft(current => reconcileTemplateDraft(current, nextTemplates));
      return true;
    } catch (err) {
      setTemplatesError(err instanceof Error ? err.message : 'Could not load WhatsApp templates');
      return false;
    } finally { setTemplatesLoading(false); }
  }, []);
  const refreshWhatsAppStatus = useCallback(async () => {
    const data = await api.get('/crm/v2/whatsapp-status') as WhatsAppStatus;
    setWhatsappStatus(data);
    setWhatsappConfigured(data.configured);
    setWhatsappPhoneNumberId(data.phoneNumberId || '');
    setWhatsappLanguage(data.languageCode || 'en_US');
    setAuthTemplateConfigured(data.authTemplateConfigured);
    await refreshTemplates();
  }, [refreshTemplates]);

  useEffect(() => { void Promise.resolve().then(refreshOverview).catch(() => setError('Could not load CRM overview')); }, [refreshOverview]);
  useEffect(() => { void Promise.resolve().then(refreshGuests); }, [refreshGuests]);
  useEffect(() => {
    if (tab === 'segments' || tab === 'campaigns') void Promise.resolve().then(refreshSegments).catch(() => setError('Could not load segments'));
    if (tab === 'campaigns') {
      void Promise.resolve().then(refreshCampaigns).catch(() => setError('Could not load campaigns'));
      void Promise.resolve().then(refreshWhatsAppStatus).catch(() => setError('Could not load WhatsApp connection status'));
    }
    if (tab === 'loyalty') void api.get('/crm/v2/loyalty-policy').then((data: Policy) => setPolicy(data));
  }, [tab, refreshSegments, refreshCampaigns, refreshWhatsAppStatus]);

  const selectedTemplate = templates.find(template => template.id === templateDraft.selectedTemplateId);
  const templateParameterFields = parameterFields(selectedTemplate);
  const campaignCanSave = whatsappConfigured && Boolean(campaignName.trim()) && Boolean(scheduledAt) &&
    Boolean(selectedTemplate) && areTemplateParametersComplete(selectedTemplate, templateDraft.templateParameters);

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
  const syncTemplates = async () => {
    if (!whatsappConfigured) return;
    setTemplatesSyncing(true); setTemplatesError('');
    try {
      await api.post('/crm/v2/whatsapp/templates/sync');
      if (await refreshTemplates()) toast.success('WhatsApp templates synced');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not sync WhatsApp templates';
      setTemplatesError(message); toast.error(message);
    } finally { setTemplatesSyncing(false); }
  };
  const createCampaign = async () => {
    if (!campaignCanSave || !selectedTemplate) return;
    setSaving(true);
    try {
      await api.post('/crm/campaigns', { name: campaignName.trim(), channel: 'WHATSAPP',
        segmentId: campaignSegmentId || null, templateSubject: null, scheduledAt,
        selectedTemplateId: selectedTemplate.id, templateLanguage: selectedTemplate.languageCode,
        templateCategory: selectedTemplate.category, templateParameters: templateDraft.templateParameters });
      setCampaignName(''); setTemplateDraft({ selectedTemplateId: '', templateParameters: {} });
      setScheduledAt(''); await refreshCampaigns();
      toast.success('Campaign queued');
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
      setWhatsappAccessToken(''); await refreshWhatsAppStatus(); toast.success('WhatsApp connection saved');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not save WhatsApp connection'); }
    finally { setSaving(false); }
  };

  const whatsappConnectionLabel = whatsappStatus?.displayName
    ? `${whatsappStatus.displayName}${whatsappStatus.displayPhoneNumber ? ` · ${whatsappStatus.displayPhoneNumber}` : ''}`
    : whatsappStatus?.displayPhoneNumber || (whatsappConfigured ? 'WhatsApp is connected' : null);

  return <div className="mx-auto max-w-7xl space-y-5 pb-10">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF6B35]">Relationships</p>
        <h1 className="mt-0.5 text-[22px] font-black tracking-tight text-slate-900 dark:text-white">Guest CRM</h1>
        <p className={`mt-0.5 ${muted}`}>Know your dine-in guests and bring them back.</p></div>
      <button onClick={() => { void refreshOverview(); void refreshGuests(); }} className={`${secondaryButton} gap-2`}><RefreshCw size={15}/> Refresh</button>
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {[
        { label: 'Guests', value: overview?.total ?? '—', icon: Users },
        { label: 'Repeat guests', value: overview?.repeat ?? '—', icon: UserRoundCheck },
        { label: 'Repeat rate', value: overview ? `${overview.repeatRate}%` : '—', icon: ArrowRight },
        { label: 'Lapsed 30d', value: overview?.lapsed ?? '—', icon: UserRoundX },
        { label: 'WhatsApp opt-ins', value: overview?.optedIn ?? '—', icon: Megaphone },
      ].map(item => <div key={item.label} className={card}><item.icon className="mb-3 text-[#FF6B35]" size={19} strokeWidth={1.8}/>
        <p className="text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">{item.value}</p><p className={`mt-0.5 ${muted}`}>{item.label}</p></div>)}
    </div>

    <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900/60">
      {([['guests', 'Guests'], ['segments', 'Segments'], ['campaigns', 'WhatsApp campaigns'], ['loyalty', 'Loyalty rules']] as const).map(([key, label]) =>
        <button key={key} onClick={() => setTab(key)} aria-current={tab === key ? 'page' : undefined} className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 ${tab === key ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}>{label}</button>)}
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-300">{error}</p>}

    {tab === 'guests' && <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className={heading}>Guest directory</h2><p className={`mt-0.5 ${muted}`}>{total} matching guests</p></div>
        <form onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="flex gap-2">
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Name or mobile" aria-label="Search guests" className={input}/>
          <button type="submit" className={primary} aria-label="Search"><Search size={17}/></button>
        </form>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">{([['all', 'All'], ['first', 'First visit'], ['regular', 'Regular'], ['vip', 'VIP ₹10k+'], ['lapsed', 'Lapsed 30d']] as const).map(([key, label]) =>
        <button key={key} onClick={() => { setSegment(key); setPage(1); }} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 ${segment === key ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{label}</button>)}</div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400"><tr><th className="px-4 py-3">Guest</th><th className="px-3 py-3">Visits</th><th className="px-3 py-3">Spend</th><th className="px-3 py-3">Last visit</th><th className="px-4 py-3">Points</th></tr></thead>
        <tbody>{guests.map(guest => <tr key={guest.id} onClick={() => navigate(`/dashboard/crm/customers/${guest.id}`)} className="cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
          <td className="px-4 py-3"><span className="font-bold text-slate-900 dark:text-white">{guest.name}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{guest.phone}</span></td>
          <td className="px-3 py-3 tabular-nums text-slate-700 dark:text-slate-300">{guest.brandVisitCount}</td><td className="px-3 py-3 font-semibold tabular-nums text-slate-800 dark:text-slate-200">{money(guest.brandTotalSpend)}</td>
          <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{guest.brandLastVisitAt ? localDate(guest.brandLastVisitAt, timeZone) : 'No paid visit yet'}</td>
          <td className="px-4 py-3 font-semibold tabular-nums text-slate-800 dark:text-slate-200">{guest.loyaltyAccount?.pointsBalance ?? 0}</td></tr>)}</tbody></table>
        {!loading && guests.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No guests match this view yet.</p>}
        {loading && <p className="py-12 text-center text-sm text-slate-500">Loading guests…</p>}</div>
      <div className="mt-5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400"><span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className={secondaryButton}>Previous</button><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className={secondaryButton}>Next</button></div></div>
    </div>}

    {tab === 'segments' && <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
      <div className={card}><h2 className={heading}>Create a segment</h2><p className={`mb-5 mt-1 ${muted}`}>Rules use paid visits and net spend across all outlets.</p>
        <div className="space-y-3"><label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Name<input className={`mt-1.5 ${input}`} value={segmentName} onChange={e => setSegmentName(e.target.value)} placeholder="Regular coffee guests"/></label>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Minimum visits<input type="number" min="0" className={`mt-1.5 ${input}`} value={minimumVisits} onChange={e => setMinimumVisits(Number(e.target.value))}/></label>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Minimum spend (₹)<input type="number" min="0" className={`mt-1.5 ${input}`} value={minimumSpend} onChange={e => setMinimumSpend(Number(e.target.value))}/></label>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">No visit in past N days (0 disables)<input type="number" min="0" className={`mt-1.5 ${input}`} value={lapsedDays} onChange={e => setLapsedDays(Number(e.target.value))}/></label>
          <button disabled={saving || !segmentName.trim()} onClick={createSegment} className={primary}>Create segment</button></div></div>
      <div className={card}><h2 className={heading}>Saved segments</h2><div className="mt-4 space-y-2">{segments.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30"><div><p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p><p className={muted}>{item.description || 'Rule-based guest group'}</p></div><span className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-extrabold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">{item._count?.customers ?? 0} guests</span></div>)}{segments.length === 0 && <p className={muted}>No saved segments yet.</p>}</div></div>
    </div>}

    {tab === 'campaigns' && <div className="space-y-5">
      <div className={card}><h2 className={heading}>Meta WhatsApp connection</h2><p className={`mt-1 ${muted}`}>{whatsappConfigured ? `${whatsappConnectionLabel}. Campaigns can use this connection.` : 'Connect this brand’s own Meta Cloud API sender. Campaigns remain drafts until connected.'}</p>
        <WhatsAppEmbeddedSignup connected={whatsappConfigured} connectionLabel={whatsappConnectionLabel} onConnected={refreshWhatsAppStatus}/>
        <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"/><span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Manual connection</span><span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"/></div>
        <p className={`mb-3 ${muted}`}>Existing manual setup remains available for legacy connections. Saving it can replace a manual connection.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.6fr_0.7fr_auto]"><input className={input} aria-label="Meta phone number ID" placeholder="Phone number ID" value={whatsappPhoneNumberId} onChange={e => setWhatsappPhoneNumberId(e.target.value)}/><input className={input} aria-label="Meta access token" type="password" autoComplete="new-password" placeholder="Access token" value={whatsappAccessToken} onChange={e => setWhatsappAccessToken(e.target.value)}/><input className={input} aria-label="Template language" placeholder="en_US" value={whatsappLanguage} onChange={e => setWhatsappLanguage(e.target.value)}/><button className={primary} disabled={saving || !whatsappPhoneNumberId || !whatsappAccessToken} onClick={saveWhatsAppConnection}>Save connection</button></div>
        {!authTemplateConfigured && <p className="mt-3 text-xs leading-5 text-amber-700 dark:text-amber-300">Phone verification also needs the server-side approved authentication template name configured.</p>}
      </div>
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className={heading}>Schedule a campaign</h2><p className={`mt-1 ${muted}`}>Only verified guests with active WhatsApp marketing consent are eligible. Choose an approved template from this brand's current connection.</p></div>
          <button className={`${secondaryButton} gap-2`} disabled={!whatsappConfigured || templatesLoading || templatesSyncing} onClick={syncTemplates}><RefreshCw className={templatesSyncing ? 'animate-spin' : ''} size={14}/>{templatesSyncing ? 'Syncing templates…' : 'Manual Sync Templates'}</button></div>
        <div className="mt-4">
          {!whatsappConfigured && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">Connect WhatsApp before syncing or selecting templates.</p>}
          {whatsappConfigured && templatesLoading && templates.length === 0 && <p className={muted}>Loading approved templates…</p>}
          {whatsappConfigured && templatesError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-300">{templatesError}</p>}
          {whatsappConfigured && !templatesLoading && !templatesError && templates.length === 0 && cachedTemplates.some(template => template.approvalStatus === 'APPROVED') && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">Approved cached templates are stale for the current WhatsApp connection. Sync templates to refresh them.</p>}
          {whatsappConfigured && !templatesLoading && !templatesError && templates.length === 0 && !cachedTemplates.some(template => template.approvalStatus === 'APPROVED') && <p className={muted}>No approved templates are available. Sync after Meta approves a template.</p>}
          {templates.length > 0 && <p className={muted}>{templates.length} approved template{templates.length === 1 ? '' : 's'} available{cachedTemplates[0]?.lastSyncedAt ? ` · Cache updated ${localDate(cachedTemplates[0].lastSyncedAt, timeZone)}` : ''}.</p>}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3"><input aria-label="Campaign name" className={input} placeholder="Campaign name" value={campaignName} onChange={e => setCampaignName(e.target.value)}/>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Approved template<select aria-label="Approved WhatsApp template" className={`mt-1.5 ${input}`} disabled={!whatsappConfigured || templatesLoading || templatesSyncing || templates.length === 0} value={templateDraft.selectedTemplateId} onChange={e => setTemplateDraft(current => reconcileTemplateDraft({ ...current, selectedTemplateId: e.target.value }, templates))}><option value="">Select a template</option>{templates.map(template => <option value={template.id} key={template.id}>{template.templateName} · {template.languageCode} · {template.category}</option>)}</select></label>
            {selectedTemplate && <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30"><p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Template parameters</p>{templateParameterFields.length === 0 ? <p className={muted}>This template has no required parameters.</p> : templateParameterFields.map(field => <label key={field.name} className="block text-xs font-bold text-slate-600 dark:text-slate-300">{field.label}<input type={field.inputType} maxLength={1024} required aria-label={`Template parameter ${field.name}`} className={`mt-1.5 ${input}`} value={templateDraft.templateParameters[field.name] ?? ''} onChange={e => setTemplateDraft(current => ({ ...current, templateParameters: { ...current.templateParameters, [field.name]: e.target.value } }))}/></label>)}</div>}
          </div>
          <div className="space-y-3"><select aria-label="Campaign segment" className={input} value={campaignSegmentId} onChange={e => setCampaignSegmentId(e.target.value)}><option value="">All eligible guests</option>{segments.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><input type="datetime-local" aria-label="Schedule date and time" className={input} value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}/><button className={primary} disabled={saving || templatesLoading || templatesSyncing || !campaignCanSave} onClick={createCampaign}>Save campaign</button></div>
        </div>
      </div>
      <div className={card}><h2 className={heading}>Campaign activity</h2><div className="mt-4 space-y-2">{campaigns.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30"><div><p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p><p className={muted}>{item.templateBody} · {item.segment?.name || 'All eligible'} · {localDate(item.scheduledAt, timeZone)}</p></div><div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300"><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{item.status}</span><span className="tabular-nums">{item.sentCount} accepted · {item.failedCount} failed</span>{item.status === 'DRAFT' && <button onClick={() => void queueCampaign(item.id)} className="font-bold text-orange-700 hover:text-orange-600 focus-visible:outline-none focus-visible:underline dark:text-orange-400">Queue</button>}<button onClick={() => void loadCampaignLogs(item.id)} className="font-bold text-orange-700 hover:text-orange-600 focus-visible:outline-none focus-visible:underline dark:text-orange-400">Details</button></div></div>)}{campaigns.length === 0 && <p className={muted}>No campaigns yet.</p>}</div></div>
      {selectedCampaign && <div className={card}><h3 className={heading}>Delivery activity</h3><div className="mt-3 space-y-2">{campaignLogs.map(log => <div key={log.id} className="flex justify-between gap-3 border-b border-slate-100 py-2.5 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"><span>{log.customer?.name || 'Guest'} · {log.customer?.phone || ''}</span><span className="font-medium">{log.status}{log.errorDetails ? ` · ${log.errorDetails}` : ''}</span></div>)}{campaignLogs.length === 0 && <p className={muted}>No recipients recorded yet.</p>}</div></div>}
    </div>}

    {tab === 'loyalty' && <div className={`max-w-2xl ${card}`}><Gift className="text-[#FF6B35]" size={20} strokeWidth={1.8}/><h2 className={`mt-3 ${heading}`}>Brand-wide loyalty</h2><p className={`mb-5 mt-1 ${muted}`}>Guests earn points on settled dine-in spend. One point is worth ₹1 when redeemed; refunds adjust the ledger.</p>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Points per ₹100 paid<input type="number" min="0" max="20" value={policy.pointsPerHundredRupees} onChange={e => setPolicy({ ...policy, pointsPerHundredRupees: Number(e.target.value) })} className={`mt-1.5 ${input}`}/></label>
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Maximum bill discount (%)<input type="number" min="0" max="100" value={policy.maxRedemptionPercent} onChange={e => setPolicy({ ...policy, maxRedemptionPercent: Number(e.target.value) })} className={`mt-1.5 ${input}`}/></label></div>
      <button onClick={savePolicy} disabled={saving} className={`mt-5 ${primary}`}>Save loyalty rules</button></div>}
  </div>;
}
