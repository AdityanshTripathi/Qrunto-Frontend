import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { withRequestTimeout } from '../src/lib/request-timeout.ts';

let signal;
await assert.rejects(withRequestTimeout(s => { signal = s; return new Promise(() => {}); }, null, 20), { name: 'TimeoutError' });
assert.equal(signal.aborted, true);
assert.equal(await withRequestTimeout(async () => 42, null, 100), 42);
const caller = new AbortController();
caller.abort(new Error('caller cancelled'));
await assert.rejects(withRequestTimeout(async () => assert.fail('must not run'), caller.signal), /caller cancelled/);

// Exercise the real API client with only auth/config/network mocked.
let cleared = 0;
const store = { accessToken: 'test', refreshToken: 'test-refresh', updateAccessToken() {}, clearAuth() { cleared++; } };
const source = readFileSync(new URL('../src/lib/api.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function('require', 'module', 'exports', code)(id => {
  if (id === './request-timeout') return { withRequestTimeout: (run, signal) => withRequestTimeout(run, signal, 30) };
  if (id === '../store/authStore') return { useAuthStore: { getState: () => store } };
  if (id === '../config/backend') return { API_BASE_URL: 'https://test.invalid/api' };
  throw new Error('Unexpected import');
}, mod, mod.exports);
const api = mod.exports.api;
const originalFetch = globalThis.fetch;
try {
  for (const stage of ['headers', 'body', 'refresh', 'retry']) {
    let calls = 0;
    const signals = [];
    globalThis.fetch = async (_url, options) => {
      calls++;
      signals.push(options.signal);
      if (stage === 'headers') return new Promise(() => {});
      if (stage === 'body') return { ok: true, status: 200, json: () => new Promise(() => {}) };
      if (calls === 1) return { status: 401 };
      if (stage === 'refresh') return new Promise(() => {});
      if (calls === 2) return { ok: true, json: async () => ({ accessToken: 'test-new' }) };
      return new Promise(() => {});
    };
    await assert.rejects(api.get('/subscriptions/current'), { name: 'TimeoutError' });
    assert.ok(signals.every(s => s === signals[0] && s.aborted), stage + ' shares deadline');
    assert.equal(cleared, 0, 'Timeout must not clear auth');
  }
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ subscription: true }) });
  assert.deepEqual(await api.get('/subscriptions/current'), { subscription: true });
  console.log('PASS timeout: headers, body, refresh, retry, cancellation, success, auth preserved');
} finally { globalThis.fetch = originalFetch; }
