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

const response = (status, data) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => data,
});

function createApiHarness({ refreshStatus = 200, impersonated = false, validSupportSession = null } = {}) {
  const state = {
    accessToken: impersonated ? 'impersonated-access' : 'old-access',
    refreshToken: impersonated ? null : 'normal-refresh',
    user: impersonated
      ? { id: 'owner', role: 'RESTAURANT_OWNER', supportSessionId: 'flow-1', restaurants: [{ id: 'restaurant-a' }] }
      : { id: 'owner', role: 'RESTAURANT_OWNER', restaurants: [{ id: 'restaurant-a' }] },
    clearAuthCalls: 0,
    setAuthCalls: [],
    updateAccessToken(token) {
      state.accessToken = token;
    },
    clearAuth() {
      state.clearAuthCalls += 1;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
    },
    setAuth(user, accessToken, refreshToken) {
      state.setAuthCalls.push({ user, accessToken, refreshToken });
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
    },
  };
  const attempts = new Map();
  let refreshCalls = 0;
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    if (String(url).endsWith('/auth/refresh')) {
      refreshCalls += 1;
      return response(refreshStatus, refreshStatus === 200 ? { accessToken: 'new-access' } : { error: 'invalid' });
    }
    const count = (attempts.get(url) || 0) + 1;
    attempts.set(url, count);
    return count === 1 ? response(401, { error: 'expired' }) : response(200, {
      ok: true,
      authorization: new Headers(options.headers).get('Authorization'),
    });
  };

  const apiModule = loadTypeScriptModule('src/lib/api.ts', {
    './request-timeout': { withRequestTimeout: (run) => run(new AbortController().signal) },
    '../store/authStore': { useAuthStore: { getState: () => state } },
    '../config/backend': { API_BASE_URL: 'https://api.ordio.test/api' },
    './session-lifecycle': { getValidSupportSession: () => validSupportSession },
    './passcode-session': { getSecurityProof: () => null, clearSecurityProof() {} },
  });

  return {
    api: apiModule.api,
    state,
    attempts,
    getRefreshCalls: () => refreshCalls,
    restore: () => { global.fetch = originalFetch; },
  };
}

test('AUTH-003: three concurrent 401s share one refresh and each retry once with the latest token', async () => {
  const harness = createApiHarness();
  try {
    const results = await Promise.all(['/one', '/two', '/three'].map((path) => harness.api.get(path)));
    assert.equal(harness.getRefreshCalls(), 1);
    assert.deepEqual([...harness.attempts.values()], [2, 2, 2]);
    assert.ok(results.every((result) => result.authorization === 'Bearer new-access'));
    assert.equal(harness.state.clearAuthCalls, 0);
  } finally {
    harness.restore();
  }
});

test('AUTH-003: refresh failure performs one terminal logout for concurrent requests', async () => {
  const harness = createApiHarness({ refreshStatus: 401 });
  try {
    const results = await Promise.allSettled(['/one', '/two', '/three'].map((path) => harness.api.get(path)));
    assert.ok(results.every((result) => result.status === 'rejected'));
    assert.equal(harness.getRefreshCalls(), 1);
    assert.equal(harness.state.clearAuthCalls, 1);
  } finally {
    harness.restore();
  }
});

test('AUTH-003: a retried 401 is not refreshed or retried again', async () => {
  const harness = createApiHarness();
  const originalFetch = global.fetch;
  let resourceCalls = 0;
  let refreshCalls = 0;
  global.fetch = async (url) => {
    if (String(url).endsWith('/auth/refresh')) {
      refreshCalls += 1;
      return response(200, { accessToken: 'new-access' });
    }
    resourceCalls += 1;
    return response(401, { error: 'still unauthorized' });
  };
  try {
    await assert.rejects(harness.api.get('/one'), /still unauthorized/);
    assert.equal(refreshCalls, 1);
    assert.equal(resourceCalls, 2);
  } finally {
    global.fetch = originalFetch;
    harness.restore();
  }
});

test('AUTH-004: expired impersonation never refreshes and restores only a validated admin backup', async () => {
  const adminBackup = {
    user: { id: 'admin', role: 'SUPER_ADMIN', restaurants: [] },
    accessToken: 'admin-access',
  };
  const harness = createApiHarness({ impersonated: true, validSupportSession: adminBackup });
  const previousStorage = global.localStorage;
  global.localStorage = {};
  try {
    await assert.rejects(harness.api.get('/orders'), /SuperAdmin session has been restored/);
    assert.equal(harness.getRefreshCalls(), 0);
    assert.deepEqual(harness.state.setAuthCalls[0].user, adminBackup.user);
    assert.equal(harness.state.setAuthCalls[0].accessToken, adminBackup.accessToken);
    assert.equal(harness.state.setAuthCalls[0].refreshToken, undefined);
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
    harness.restore();
  }
});

test('AUTH-004: invalid impersonation backup ends the session without attempting refresh', async () => {
  const harness = createApiHarness({ impersonated: true, validSupportSession: null });
  const previousStorage = global.localStorage;
  global.localStorage = {};
  try {
    await assert.rejects(harness.api.get('/orders'), /sign in again/);
    assert.equal(harness.getRefreshCalls(), 0);
    assert.equal(harness.state.clearAuthCalls, 1);
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
    harness.restore();
  }
});

test('AUTH-004: neither normal nor impersonated frontend sessions persist refresh tokens', () => {
  const values = new Map();
  const previousStorage = global.localStorage;
  global.localStorage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  try {
    const { useAuthStore } = loadTypeScriptModule('src/store/authStore.ts', {
      '../lib/session-lifecycle': {
        clearInvalidSupportSession() {},
        teardownFrontendSession() {},
      },
      '../lib/passcode-session': { clearSecurityProof() {} },
    });
    const normalUser = { id: 'normal', role: 'RESTAURANT_OWNER', restaurants: [{ id: 'restaurant-a' }] };
    useAuthStore.getState().setAuth(normalUser, 'normal-access');
    assert.equal(values.has('qr_refresh_token'), false);

    const impersonated = { ...normalUser, id: 'impersonated', supportSessionId: 'flow-1' };
    useAuthStore.getState().setAuth(impersonated, 'impersonated-access');
    assert.equal(values.get('qr_access_token'), 'impersonated-access');
    assert.equal(values.has('qr_refresh_token'), false);
    assert.equal('refreshToken' in useAuthStore.getState(), false);

    const source = fs.readFileSync(path.join(root, 'src/pages/dashboard/SuperAdminDashboard.tsx'), 'utf8');
    assert.match(source, /setAuth\(mockOwnerUser, res\.token\)/);
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});

test('CFG-001: production rejects loopback and non-HTTPS APIs while development permits localhost HTTP', () => {
  const { resolveBackendUrls } = loadTypeScriptModule('src/config/backend-url.ts');
  assert.throws(() => resolveBackendUrls('http://api.ordio.test/api', false), /HTTPS/);
  assert.throws(() => resolveBackendUrls('https://127.0.0.1/api', false), /loopback/);
  assert.throws(() => resolveBackendUrls('https://[::1]/api', false), /loopback/);
  assert.throws(() => resolveBackendUrls('https://[::ffff:7f00:1]/api', false), /loopback/);
  assert.deepEqual(resolveBackendUrls('http://localhost:5000/api/', true), {
    apiBaseUrl: 'http://localhost:5000/api',
    socketUrl: 'http://localhost:5000',
  });
});

test('SEC-001: proofs are scoped, expire, and live only in memory', () => {
  const { saveSecurityProof, getSecurityProof, clearSecurityProof } = loadTypeScriptModule('src/lib/passcode-session.ts');
  const expiresAt = new Date(Date.now() + 10_000).toISOString();
  saveSecurityProof('analytics', 'server-issued-proof', expiresAt);
  assert.equal(getSecurityProof('analytics'), 'server-issued-proof');
  assert.equal(getSecurityProof('settings'), null);
  clearSecurityProof('analytics');
  assert.equal(getSecurityProof('analytics'), null);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/lib/passcode-session.ts'), 'utf8'), /localStorage|sessionStorage/);
});

test('SEC-001: centralized session teardown removes every passcode verification key', () => {
  const localValues = new Map([['admin_access_token', 'admin-token']]);
  const sessionValues = new Map([
    ['ordio_passcode_verified', 'true'],
    ['ordio_passcode_verified:analytics', '{}'],
    ['ordio_passcode_verified:subscription', '{}'],
    ['ordio_passcode_verified:settings', '{}'],
  ]);
  const storage = (values) => ({
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  });
  const previousSessionStorage = global.sessionStorage;
  global.sessionStorage = storage(sessionValues);
  try {
    const { teardownFrontendSession } = loadTypeScriptModule('src/lib/session-lifecycle.ts', {
      './passcode-session': { clearSecurityProof() {} },
    });
    teardownFrontendSession(storage(localValues));
    assert.equal(sessionValues.size, 0);
    assert.equal(localValues.has('admin_access_token'), false);
  } finally {
    if (previousSessionStorage === undefined) delete global.sessionStorage;
    else global.sessionStorage = previousSessionStorage;
  }
});

test('OPS-001: locks block duplicates, validate finite decimals, and unlock after failure', async () => {
  const { parseFiniteNumber, withActionLock } = loadTypeScriptModule('src/lib/inventory-safety.ts');
  assert.throws(() => parseFiniteNumber('', { field: 'Quantity', min: 0 }), /required/);
  assert.throws(() => parseFiniteNumber(Infinity, { field: 'Quantity', min: 0 }), /finite/);
  assert.equal(parseFiniteNumber('1.25', { field: 'Quantity', min: 0, allowZero: false }), 1.25);

  const locks = new Set();
  let release;
  const first = withActionLock(locks, 'transfer', () => new Promise((resolve) => { release = resolve; }));
  const duplicate = await withActionLock(locks, 'transfer', async () => 'duplicate');
  assert.equal(duplicate.started, false);
  release('done');
  assert.equal((await first).started, true);

  await assert.rejects(withActionLock(locks, 'transfer', async () => { throw new Error('failed'); }), /failed/);
  const afterFailure = await withActionLock(locks, 'transfer', async () => 'retry');
  assert.equal(afterFailure.started, true);
});

test('RBAC-001: STAFF has no unsupported owner dashboard capability', () => {
  const { hasCapability, defaultRouteForRole } = loadTypeScriptModule('src/lib/capabilities.ts');
  assert.equal(hasCapability('STAFF', 'owner.dashboard'), false);
  assert.equal(hasCapability('SUPER_ADMIN', 'inventory.manage'), true);
  assert.equal(hasCapability('RESTAURANT_OWNER', 'inventory.manage'), true);
  assert.equal(hasCapability('WAITER', 'waiter.dashboard'), true);
  assert.equal(defaultRouteForRole('STAFF'), '/unauthorized');
});
