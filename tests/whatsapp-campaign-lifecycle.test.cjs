const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const helperPath = path.join(root, 'src/pages/dashboard/crm/whatsapp-campaign-api.ts');

function loadHelper(api) {
  const output = ts.transpileModule(fs.readFileSync(helperPath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: helperPath,
  }).outputText;
  const loadedModule = { exports: {} };
  new Function('module', 'exports', 'require', output)(
    loadedModule,
    loadedModule.exports,
    name => name === '../../../lib/api' ? { api } : require(name),
  );
  return loadedModule.exports;
}

const draft = {
  name: 'Friday regulars',
  channel: 'WHATSAPP',
  segmentId: null,
  templateSubject: null,
  scheduledAt: '2026-09-25T18:00',
  selectedTemplateId: 'template-1',
  templateLanguage: 'en_US',
  templateCategory: 'MARKETING',
  templateParameters: { 'body.1': '20% off' },
};

test('disconnected status blocks queue eligibility but never blocks a valid draft create call', async () => {
  const calls = [];
  const helper = loadHelper({ post: async (...args) => { calls.push(args); } });
  assert.equal(helper.isQueueEligibleConnection('DISCONNECTED'), false);
  assert.equal(helper.canQueueCampaign('DRAFT', 'DISCONNECTED'), false);
  await helper.whatsappCampaignApi.createDraft(draft);
  assert.deepEqual(calls, [['/crm/campaigns', draft]]);
});

test('campaign API centralizes edit, queue, cancel, list, and log endpoint conventions', async () => {
  const calls = [];
  const api = {
    get: async (...args) => { calls.push(['get', ...args]); return {}; },
    post: async (...args) => { calls.push(['post', ...args]); return {}; },
    patch: async (...args) => { calls.push(['patch', ...args]); return {}; },
  };
  const { whatsappCampaignApi } = loadHelper(api);
  await whatsappCampaignApi.list();
  await whatsappCampaignApi.updateDraft('draft/1', draft);
  await whatsappCampaignApi.logs('draft/1');
  await whatsappCampaignApi.cancel('draft/1');
  await whatsappCampaignApi.queue('draft/1', 'queue-key-123');
  assert.deepEqual(calls, [
    ['get', '/crm/campaigns'],
    ['patch', '/crm/campaigns/draft%2F1', draft],
    ['get', '/crm/campaigns/draft%2F1/logs'],
    ['post', '/crm/campaigns/draft%2F1/cancel'],
    ['post', '/crm/v2/campaigns/draft%2F1/queue', { idempotencyKey: 'queue-key-123' }, { headers: { 'Idempotency-Key': 'queue-key-123' } }],
  ]);
});

test('campaign creation preserves a retryable idempotency key and maps secure backend template fields for editing', async () => {
  const calls = [];
  const helper = loadHelper({
    get: async () => ({ campaigns: [{ id: 'draft-1', whatsappTemplateId: 'template-1', whatsappTemplateLanguage: 'en_US', whatsappTemplateCategory: 'MARKETING', whatsappTemplateParameters: { 'body.1': 'Offer' } }] }),
    post: async (...args) => { calls.push(args); return {}; },
  });
  await helper.whatsappCampaignApi.createDraft(draft, 'create-key-123');
  const response = await helper.whatsappCampaignApi.list();
  assert.deepEqual(calls, [['/crm/campaigns', { ...draft, idempotencyKey: 'create-key-123' }, { headers: { 'Idempotency-Key': 'create-key-123' } }]]);
  assert.deepEqual(response.campaigns[0].selectedTemplateId, 'template-1');
  assert.deepEqual(response.campaigns[0].templateParameters, { 'body.1': 'Offer' });
});

test('only CONNECTED can queue and every connection state has explicit operator messaging', () => {
  const helper = loadHelper({});
  const statuses = ['CONNECTED', 'NEEDS_REAUTH', 'LEGACY_CONNECTED', 'ERROR', 'DISCONNECTED'];
  for (const status of statuses) {
    assert.equal(typeof helper.connectionStatusMessage(status, 'Sender'), 'string');
    assert.ok(helper.connectionStatusMessage(status, 'Sender').length > 30);
    assert.equal(helper.isQueueEligibleConnection(status), status === 'CONNECTED');
  }
  assert.equal(helper.canQueueCampaign('DRAFT', 'CONNECTED'), true);
  assert.equal(helper.canQueueCampaign('QUEUED', 'CONNECTED'), false);
  assert.equal(helper.canQueueCampaign('DRAFT', 'LEGACY_CONNECTED'), false);
  assert.equal(helper.canCancelCampaign('DRAFT'), true);
  assert.equal(helper.canCancelCampaign('QUEUED'), true);
  assert.equal(helper.canCancelCampaign('SENDING'), true);
  assert.equal(helper.canCancelCampaign('COMPLETED'), false);
  assert.match(helper.connectionStatusMessage('ERROR'), /could not be verified/i);
});

test('active UI guards each campaign action and explains uncertain recipient outcomes', () => {
  const hub = fs.readFileSync(path.join(root, 'src/pages/dashboard/crm/CRMHub.tsx'), 'utf8');
  assert.match(hub, /campaignActionIds\.has\(campaign\.id\)/);
  assert.match(hub, /queueIdempotencyKeys\.current\.get\(campaign\.id\)/);
  assert.match(hub, /queueIdempotencyKeys\.current\.set\(campaign\.id, queueKey\)/);
  assert.match(hub, /PENDING_RECONCILIATION/);
  assert.match(hub, /Pending reconciliation means the provider accepted the request/);
  assert.match(hub, /Save draft/);
  assert.match(hub, /Update draft/);
  assert.doesNotMatch(hub, /campaignCanSave\s*=\s*whatsappConfigured/);
});

test('legacy directory and store cannot enter destructive campaign workflows', () => {
  const directory = fs.readFileSync(path.join(root, 'src/pages/dashboard/crm/CustomersDirectory.tsx'), 'utf8');
  const store = fs.readFileSync(path.join(root, 'src/store/crmStore.ts'), 'utf8');
  assert.doesNotMatch(directory, /setActiveTab\('campaigns'\)/);
  assert.doesNotMatch(directory, /<CampaignsConfig\s*\/>/);
  assert.match(store, /Legacy campaign creation is retired/);
  assert.match(store, /Campaign deletion is not supported/);
  assert.doesNotMatch(store, /api\.delete\(`\/crm\/campaigns/);
});
