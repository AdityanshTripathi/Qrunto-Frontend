const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function loadTypeScriptModule(relativePath, mocks = {}) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name));
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const admin = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@ordio.test',
  role: 'SUPER_ADMIN',
  restaurants: [],
};

const tenantUser = (id, restaurantId, supportSessionId) => ({
  id,
  name: id,
  email: `${id}@ordio.test`,
  role: 'RESTAURANT_OWNER',
  restaurants: [{ id: restaurantId, name: restaurantId, slug: restaurantId }],
  ...(supportSessionId ? { supportSessionId } : {}),
});

test('P0 AUTH-001: normal logout and account change destroy the SuperAdmin restore path', () => {
  const storage = new MemoryStorage();
  const previousStorage = global.localStorage;
  global.localStorage = storage;

  try {
    const lifecycle = loadTypeScriptModule('src/lib/session-lifecycle.ts');
    const { useAuthStore } = loadTypeScriptModule('src/store/authStore.ts', {
      '../lib/session-lifecycle': lifecycle,
    });

    useAuthStore.getState().setAuth(admin, 'admin-access', 'admin-refresh');
    const flowId = 'support-flow-1';
    const impersonated = tenantUser('impersonated-owner', 'restaurant-a', flowId);
    useAuthStore.getState().setAuth(impersonated, 'impersonated-access', 'impersonated-access');
    lifecycle.saveSupportSession(storage, {
      flowId,
      impersonatedRestaurantId: 'restaurant-a',
      expiresAt: Date.now() + 60_000,
      user: admin,
      accessToken: 'admin-access',
      refreshToken: 'admin-refresh',
    });

    assert.equal(lifecycle.getValidSupportSession(storage, impersonated).user.id, admin.id);
    useAuthStore.getState().clearAuth();

    for (const key of [
      'admin_user',
      'admin_access_token',
      'admin_refresh_token',
      'admin_support_session',
    ]) {
      assert.equal(storage.getItem(key), null);
    }

    const normalUser = tenantUser('owner-b', 'restaurant-b');
    useAuthStore.getState().setAuth(normalUser, 'owner-b-access', 'owner-b-refresh');
    assert.equal(lifecycle.getValidSupportSession(storage, normalUser), null);
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});

test('P0 STATE-001: logout clears all CRM data and stale tenant responses cannot restore it', async () => {
  const storage = new MemoryStorage();
  const previousStorage = global.localStorage;
  global.localStorage = storage;

  const requests = [];
  const api = {
    get() {
      return new Promise((resolve, reject) => requests.push({ resolve, reject }));
    },
  };

  try {
    const lifecycle = loadTypeScriptModule('src/lib/session-lifecycle.ts');
    const { useCRMStore } = loadTypeScriptModule('src/store/crmStore.ts', {
      '../lib/api': { api },
      '../lib/session-lifecycle': lifecycle,
    });
    const { useAuthStore } = loadTypeScriptModule('src/store/authStore.ts', {
      '../lib/session-lifecycle': lifecycle,
    });

    useAuthStore.getState().setAuth(tenantUser('owner-a', 'restaurant-a'), 'a-access', 'a-refresh');
    useCRMStore.setState({
      customers: [{ id: 'customer-a' }],
      total: 1,
      campaigns: [{ id: 'campaign-a' }],
      timeline: [{ id: 'timeline-a' }],
      coupons: [{ id: 'coupon-a' }],
      segments: [{ id: 'segment-a' }],
      tickets: [{ id: 'ticket-a' }],
      campaignLogsPagination: { nextCursor: 'old-log-cursor', hasMore: true },
      campaignsPagination: { nextCursor: 'old-campaign-cursor', hasMore: true },
    });

    const staleTenantARequest = useCRMStore.getState().fetchCustomers();
    useCRMStore.getState().setRestaurantId('restaurant-a-secondary');

    let state = useCRMStore.getState();
    assert.deepEqual(state.customers, []);
    assert.equal(state.restaurantId, 'restaurant-a-secondary');

    useAuthStore.getState().clearAuth();

    state = useCRMStore.getState();
    assert.deepEqual(state.customers, []);
    assert.deepEqual(state.campaigns, []);
    assert.deepEqual(state.timeline, []);
    assert.deepEqual(state.coupons, []);
    assert.deepEqual(state.segments, []);
    assert.deepEqual(state.tickets, []);
    assert.deepEqual(state.campaignsPagination, { nextCursor: null, hasMore: false });
    assert.deepEqual(state.campaignLogsPagination, { nextCursor: null, hasMore: false });

    useAuthStore.getState().setAuth(tenantUser('owner-b', 'restaurant-b'), 'b-access', 'b-refresh');
    const failedTenantBRequest = useCRMStore.getState().fetchCustomers();
    requests[2].reject(new Error('Tenant B unavailable'));
    await failedTenantBRequest;

    requests[0].resolve({ customers: [{ id: 'customer-a' }], total: 1 });
    await staleTenantARequest;

    state = useCRMStore.getState();
    assert.deepEqual(state.customers, []);
    assert.equal(state.total, 0);
    assert.equal(state.error, 'Tenant B unavailable');
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});
