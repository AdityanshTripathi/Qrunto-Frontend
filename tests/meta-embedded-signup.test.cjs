const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'src/lib/meta-embedded-signup.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: sourcePath,
}).outputText;
const loadedModule = { exports: {} };
new Function('module', 'exports', 'require', output)(loadedModule, loadedModule.exports, require);
const {
  createPreparedEmbeddedSignupAttempt,
  loadFacebookSdk,
  MetaEmbeddedSignupClientError,
  parseEmbeddedSignupStart,
} = loadedModule.exports;

function config(overrides = {}) {
  return {
    appId: 'public-app-id',
    configId: 'public-config-id',
    graphApiVersion: 'v26.0',
    state: 'opaque-memory-only-state',
    expiresAt: '2030-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('Meta signup success sends only code and state, then permits status refresh', async () => {
  let loginOptions;
  const sdk = {
    init() {},
    login(callback, options) {
      loginOptions = options;
      callback({ authResponse: { code: 'one-time-code' } });
    },
  };
  const operations = [];
  const attempt = createPreparedEmbeddedSignupAttempt(sdk, config(), () => Date.parse('2029-01-01T00:00:00.000Z'));
  const result = await attempt.complete(async body => {
    operations.push({ operation: 'complete', body });
    operations.push({ operation: 'refresh-status' });
  });

  assert.deepEqual(result, { status: 'connected' });
  assert.deepEqual(operations, [
    { operation: 'complete', body: { code: 'one-time-code', state: 'opaque-memory-only-state' } },
    { operation: 'refresh-status' },
  ]);
  assert.deepEqual(loginOptions, {
    config_id: 'public-config-id',
    response_type: 'code',
    override_default_response_type: true,
    extras: { setup: {} },
  });
});

test('Meta popup cancellation never calls backend completion', async () => {
  const sdk = { init() {}, login(callback) { callback({ status: 'unknown' }); } };
  let completions = 0;
  const attempt = createPreparedEmbeddedSignupAttempt(sdk, config(), () => Date.parse('2029-01-01T00:00:00.000Z'));
  const result = await attempt.complete(async () => { completions++; });
  assert.deepEqual(result, { status: 'cancelled' });
  assert.equal(completions, 0);
});

test('SDK login failure is safe and never calls backend completion', async () => {
  const sdk = { init() {}, login() { throw new Error('raw SDK detail'); } };
  let completions = 0;
  const attempt = createPreparedEmbeddedSignupAttempt(sdk, config(), () => Date.parse('2029-01-01T00:00:00.000Z'));
  await assert.rejects(
    attempt.complete(async () => { completions++; }),
    error => error instanceof MetaEmbeddedSignupClientError
      && error.code === 'SDK_LOGIN_FAILED'
      && !error.message.includes('raw SDK detail'),
  );
  assert.equal(completions, 0);
});

test('SDK initialization failure is normalized without exposing raw details', t => {
  const previousWindow = global.window;
  global.window = { FB: { init() { throw new Error('raw init detail'); }, login() {} } };
  t.after(() => { global.window = previousWindow; });
  assert.throws(
    () => loadFacebookSdk(config()),
    error => error instanceof MetaEmbeddedSignupClientError
      && error.code === 'SDK_INIT_FAILED'
      && !error.message.includes('raw init detail'),
  );
});

test('expired signup state is rejected before opening Meta', async () => {
  let logins = 0;
  let completions = 0;
  const sdk = { init() {}, login() { logins++; } };
  const attempt = createPreparedEmbeddedSignupAttempt(sdk, config(), () => Date.parse('2031-01-01T00:00:00.000Z'));
  const result = await attempt.complete(async () => { completions++; });
  assert.deepEqual(result, { status: 'expired' });
  assert.equal(logins, 0);
  assert.equal(completions, 0);
});

test('backend rejection remains a failed attempt and is not reported as connected', async () => {
  const backendError = Object.assign(new Error('Signup state is invalid'), { code: 'WHATSAPP_SIGNUP_STATE_INVALID' });
  const sdk = { init() {}, login(callback) { callback({ authResponse: { code: 'one-time-code' } }); } };
  const attempt = createPreparedEmbeddedSignupAttempt(sdk, config(), () => Date.parse('2029-01-01T00:00:00.000Z'));
  await assert.rejects(attempt.complete(async () => { throw backendError; }), backendError);
});

test('duplicate completion calls open one popup and submit once', async () => {
  let callback;
  let logins = 0;
  let completions = 0;
  const sdk = {
    init() {},
    login(next) { logins++; callback = next; },
  };
  const attempt = createPreparedEmbeddedSignupAttempt(sdk, config(), () => Date.parse('2029-01-01T00:00:00.000Z'));
  const first = attempt.complete(async () => { completions++; });
  const duplicate = await attempt.complete(async () => { completions++; });
  assert.deepEqual(duplicate, { status: 'ignored' });
  callback({ authResponse: { code: 'one-time-code' } });
  assert.deepEqual(await first, { status: 'connected' });
  assert.equal(logins, 1);
  assert.equal(completions, 1);
});

test('frontend integration keeps credentials ephemeral and preserves the manual connection path', () => {
  const helper = fs.readFileSync(sourcePath, 'utf8');
  const component = fs.readFileSync(path.join(root, 'src/pages/dashboard/crm/WhatsAppEmbeddedSignup.tsx'), 'utf8');
  const hub = fs.readFileSync(path.join(root, 'src/pages/dashboard/crm/CRMHub.tsx'), 'utf8');
  assert.doesNotMatch(`${helper}\n${component}`, /localStorage|sessionStorage|console\.(log|info|error)|accessToken|wabaId|phoneNumberId/);
  assert.match(component, /\/crm\/v2\/whatsapp\/connect\/start/);
  assert.match(component, /\/crm\/v2\/whatsapp\/connect\/complete/);
  assert.match(component, /await onConnected\(\)/);
  assert.match(hub, /\/crm\/v2\/whatsapp-connection/);
  assert.match(hub, /Manual connection/);
  assert.match(hub, /Meta access token/);
});

test('start response validation rejects malformed backend data', () => {
  assert.throws(() => parseEmbeddedSignupStart({ appId: 'only-one-field' }), /invalid response/);
  assert.deepEqual(parseEmbeddedSignupStart(config()), config());
});
