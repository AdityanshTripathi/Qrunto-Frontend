import { api } from '../../../lib/api';

export type WhatsAppConnectionStatus =
  | 'CONNECTED'
  | 'NEEDS_REAUTH'
  | 'LEGACY_CONNECTED'
  | 'ERROR'
  | 'DISCONNECTED';

export type CampaignStatus = 'DRAFT' | 'QUEUED' | 'SENDING' | 'COMPLETED' | 'FAILED' | 'EXHAUSTED' | 'CANCELLED';

export type CampaignDraftInput = {
  name: string;
  channel: 'WHATSAPP';
  segmentId: string | null;
  templateSubject: null;
  scheduledAt: string;
  selectedTemplateId: string;
  templateLanguage: string;
  templateCategory: string;
  templateParameters: Record<string, string>;
};

export const campaignEndpoints = {
  list: '/crm/campaigns',
  create: '/crm/campaigns',
  update: (id: string) => `/crm/campaigns/${encodeURIComponent(id)}`,
  logs: (id: string) => `/crm/campaigns/${encodeURIComponent(id)}/logs`,
  cancel: (id: string) => `/crm/campaigns/${encodeURIComponent(id)}/cancel`,
  queue: (id: string) => `/crm/v2/campaigns/${encodeURIComponent(id)}/queue`,
} as const;

export const isQueueEligibleConnection = (status: WhatsAppConnectionStatus | null | undefined) =>
  status === 'CONNECTED';

export const canQueueCampaign = (
  status: CampaignStatus | string,
  connectionStatus: WhatsAppConnectionStatus | null | undefined,
) => status === 'DRAFT' && isQueueEligibleConnection(connectionStatus);

export const canCancelCampaign = (status: CampaignStatus | string) =>
  status === 'DRAFT' || status === 'QUEUED' || status === 'SENDING' || status === 'FAILED';

export function connectionStatusMessage(
  status: WhatsAppConnectionStatus | null | undefined,
  label?: string | null,
) {
  switch (status) {
    case 'CONNECTED':
      return `${label || 'WhatsApp is connected'}. Campaigns can be queued for delivery.`;
    case 'NEEDS_REAUTH':
      return 'WhatsApp authorization needs reconnection. Drafts and history are preserved, but campaigns cannot be queued or sent.';
    case 'LEGACY_CONNECTED':
      return 'This is a legacy manual connection. Existing setup is preserved, but verified Embedded Signup is required before campaigns can send.';
    case 'ERROR':
      return 'WhatsApp connection status could not be verified. Drafts remain available, but campaign delivery is blocked until the connection recovers.';
    case 'DISCONNECTED':
    default:
      return 'WhatsApp is disconnected. You can create and edit drafts, but must connect a verified sender before queueing.';
  }
}

export function createClientIdempotencyKey(scope: string) {
  const nonce = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `campaign:${scope}:${nonce}`;
}

type CampaignWire = Record<string, unknown> & {
  whatsappTemplateId?: string | null;
  whatsappTemplateLanguage?: string | null;
  whatsappTemplateCategory?: string | null;
  whatsappTemplateParameters?: Record<string, string> | null;
};

export function normalizeCampaignWire(campaign: CampaignWire): CampaignWire {
  return {
    ...campaign,
    selectedTemplateId: campaign.selectedTemplateId ?? campaign.whatsappTemplateId ?? null,
    templateLanguage: campaign.templateLanguage ?? campaign.whatsappTemplateLanguage ?? null,
    templateCategory: campaign.templateCategory ?? campaign.whatsappTemplateCategory ?? null,
    templateParameters: campaign.templateParameters ?? campaign.whatsappTemplateParameters ?? null,
  };
}

export const whatsappCampaignApi = {
  list: async () => {
    const response = await api.get(campaignEndpoints.list) as { campaigns?: CampaignWire[] } & Record<string, unknown>;
    return { ...response, campaigns: (response.campaigns ?? []).map(normalizeCampaignWire) };
  },
  createDraft: (draft: CampaignDraftInput, idempotencyKey?: string) => idempotencyKey
    ? api.post(campaignEndpoints.create, { ...draft, idempotencyKey }, { headers: { 'Idempotency-Key': idempotencyKey } })
    : api.post(campaignEndpoints.create, draft),
  updateDraft: (id: string, draft: CampaignDraftInput) => api.patch(campaignEndpoints.update(id), draft),
  logs: (id: string) => api.get(campaignEndpoints.logs(id)),
  cancel: (id: string) => api.post(campaignEndpoints.cancel(id)),
  queue: (id: string, idempotencyKey = createClientIdempotencyKey(id)) => api.post(
    campaignEndpoints.queue(id),
    { idempotencyKey },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  ),
};
