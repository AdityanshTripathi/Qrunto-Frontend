const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(relativePath, mocks = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(root, relativePath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), module, module.exports,
  );
  return module.exports;
}

function apiHarness(fetchImpl) {
  const previousFetch = global.fetch;
  global.fetch = fetchImpl;
  const state = {
    user: { id: 'owner' }, accessToken: 'token', clearAuthCalls: 0,
    updateAccessToken() {},
    clearAuth() { this.clearAuthCalls += 1; this.user = null; this.accessToken = null; },
  };
  const apiModule = load('src/lib/api.ts', {
    './request-timeout': { withRequestTimeout: (run) => run(new AbortController().signal) },
    '../store/authStore': { useAuthStore: { getState: () => state } },
    '../config/backend': { API_BASE_URL: 'https://api.ordio.test/api' },
    './session-lifecycle': { getValidSupportSession: () => null },
  });
  return { api: apiModule.api, state, restore: () => { global.fetch = previousFetch; } };
}

test('API-002: typed errors retain HTTP status, safe validation details, and retry guidance', async () => {
  const statuses = [403, 409, 422, 429, 500];
  const harness = apiHarness(async (url) => {
    const status = Number(String(url).match(/\/(\d+)$/)?.[1]);
    return {
      ok: false, status,
      headers: new Headers({ 'x-request-id': 'req-123', 'retry-after': '30' }),
      json: async () => ({ message: 'Request rejected', code: 'REJECTED', errors: { email: ['Invalid email'] } }),
    };
  });
  try {
    for (const status of statuses) {
      await assert.rejects(harness.api.get(`/${status}`), (error) => {
        assert.equal(error.name, 'ApiError');
        assert.equal(error.status, status);
        assert.equal(error.kind, 'http');
        assert.equal(error.requestId, 'req-123');
        assert.equal(error.retryAfter, '30');
        assert.deepEqual(error.fieldErrors, { email: ['Invalid email'] });
        return true;
      });
    }
  } finally { harness.restore(); }
});

test('API-002: timeout and network failures are distinguishable and no production copy mentions port 5000', async () => {
  let timeout = true;
  const harness = apiHarness(async () => {
    if (timeout) { const error = new Error('deadline'); error.name = 'TimeoutError'; throw error; }
    throw new TypeError('Failed to fetch');
  });
  try {
    await assert.rejects(harness.api.get('/timeout'), (error) => error.kind === 'timeout');
    timeout = false;
    await assert.rejects(harness.api.get('/offline'), (error) => error.kind === 'network');
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/lib/api.ts'), 'utf8'), /port 5000/i);
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/components/DashboardLayout.tsx'), 'utf8'), /port 5000/i);
  } finally { harness.restore(); }
});

test('API-002: a missing refresh cookie expires the local session as an auth error', async () => {
  let requestCount = 0;
  const harness = apiHarness(async () => {
    requestCount += 1;
    return {
      ok: false,
      status: 401,
      headers: new Headers(),
      json: async () => ({ error: 'Invalid or expired refresh token' }),
    };
  });
  try {
    await assert.rejects(harness.api.get('/subscriptions/current'), (error) => {
      assert.equal(error.name, 'ApiError');
      assert.equal(error.kind, 'auth');
      assert.equal(error.status, 401);
      assert.match(error.message, /session has expired/i);
      return true;
    });
    assert.equal(requestCount, 2);
    assert.equal(harness.state.clearAuthCalls, 1);
    assert.equal(harness.state.accessToken, null);
  } finally { harness.restore(); }
});

test('API-002: refresh transport failures keep local state for a later retry', async () => {
  let requestCount = 0;
  const harness = apiHarness(async () => {
    requestCount += 1;
    if (requestCount === 1) {
      return { ok: false, status: 401, headers: new Headers(), json: async () => ({ error: 'Unauthorized' }) };
    }
    throw new TypeError('Failed to fetch');
  });
  try {
    await assert.rejects(harness.api.get('/subscriptions/current'), (error) => error.kind === 'network');
    assert.equal(harness.state.clearAuthCalls, 0);
    assert.equal(harness.state.accessToken, 'token');
  } finally { harness.restore(); }
});

test('STATE-002: latest customer request wins and old failures cannot replace newer state', async () => {
  const pending = [];
  const api = { get: () => new Promise((resolve, reject) => pending.push({ resolve, reject })) };
  const { useCRMStore } = load('src/store/crmStore.ts', {
    '../lib/api': { api }, '../lib/session-lifecycle': { registerSessionTeardown() {} },
  });
  useCRMStore.getState().reset();
  const first = useCRMStore.getState().fetchCustomers();
  useCRMStore.getState().setSearch('new');
  const second = pending.length === 2 ? Promise.resolve() : null;
  assert.ok(second);
  pending[1].resolve({ customers: [{ id: 'new' }], total: 1 });
  await Promise.resolve();
  pending[0].reject(new Error('old request failed'));
  await Promise.all([first, Promise.resolve()]);
  assert.deepEqual(useCRMStore.getState().customers, [{ id: 'new' }]);
  assert.equal(useCRMStore.getState().error, null);
});

test('STATE-002: campaign log pagination remains keyed to the selected campaign', async () => {
  const pending = [];
  const api = { get: () => new Promise((resolve) => pending.push({ resolve })) };
  const { useCRMStore } = load('src/store/crmStore.ts', {
    '../lib/api': { api }, '../lib/session-lifecycle': { registerSessionTeardown() {} },
  });
  const first = useCRMStore.getState().fetchCampaignLogs('campaign-a');
  const second = useCRMStore.getState().fetchCampaignLogs('campaign-b');
  pending[1].resolve({ logs: [{ id: 'b' }], pagination: { nextCursor: 'b-next', hasMore: true } });
  await second;
  pending[0].resolve({ logs: [{ id: 'a' }], pagination: { nextCursor: 'a-next', hasMore: true } });
  await first;
  const state = useCRMStore.getState();
  assert.equal(state.campaignLogsCampaignId, 'campaign-b');
  assert.deepEqual(state.campaignLogsPagination, { nextCursor: 'b-next', hasMore: true });
});

test('RT-001: dashboard and realtime pages use serialized refreshes with reconnect reconciliation and cleanup', () => {
  const hook = fs.readFileSync(path.join(root, 'src/hooks/useCoalescedRefresh.ts'), 'utf8');
  assert.match(hook, /activeRef\.current/);
  assert.match(hook, /queuedRef\.current/);
  assert.match(hook, /mountedRef\.current = false/);
  for (const relativePath of [
    'src/pages/dashboard/DashboardOverview.tsx', 'src/pages/dashboard/OrderManagement.tsx',
    'src/pages/dashboard/BillsPage.tsx', 'src/pages/waiter/WaiterDashboard.tsx',
  ]) {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.match(source, /socket\.on\('connect'/);
    assert.match(source, /socket\.disconnect\(\)/);
  }
  const dashboard = fs.readFileSync(path.join(root, 'src/pages/dashboard/DashboardOverview.tsx'), 'utf8');
  assert.match(dashboard, /socket\.off\('NEW_ORDER'/);
  assert.match(dashboard, /hasConnectedRef\.current\) handleUpdate\(\)/);
});

test('Orders: initial load resolves the skeleton while background refreshes stay coalesced', () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/dashboard/OrderManagement.tsx'), 'utf8');
  assert.match(source, /const \[loading, setLoading\] = useState\(true\)/);
  assert.match(source, /const initialOrdersLoadRef = useRef\(true\)/);
  assert.match(source, /const silent = !initialOrdersLoadRef\.current;\s*initialOrdersLoadRef\.current = false;\s*return fetchOrdersAndStats\(silent\)/);
  assert.match(source, /useEffect\(\(\) => \{\s*void refreshOrders\(\);\s*\}, \[refreshOrders\]\)/);
  assert.match(source, /else if \(!silent\) setLoading\(false\)/);
  assert.match(source, /loading \? \(\s*<SkeletonLoader[\s\S]*?\) : filteredOrders\.length === 0/);
});
