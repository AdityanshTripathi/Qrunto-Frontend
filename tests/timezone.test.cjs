const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/lib/timezone.ts'), 'utf8');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports: exportsObject,
  require: name => {
    if (name === 'react') return { useEffect() {} };
    if (name === '../store/authStore') return { useAuthStore() {} };
    if (name === './api') return { api: {} };
    throw new Error('Unexpected import');
  },
  Intl, Date, Map, Promise,
});
test('Frontend: one UTC instant displays on each tenant local date/hour, independent of browser zone', () => {
  const { localDate, localHour, addDays, timezone } = exportsObject;
  const original = process.env.TZ;
  try {
    for (const browser of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
      process.env.TZ = browser;
      const timestamp = '2026-08-31T19:00:00Z';
      assert.equal(localDate(timestamp, 'Asia/Kolkata'), '2026-09-01');
      assert.equal(localHour(timestamp, 'Asia/Kolkata'), 0);
      assert.equal(localDate(timestamp, 'UTC'), '2026-08-31');
      assert.equal(addDays('2026-03-09', -1), '2026-03-08');
      assert.equal(localHour('2026-03-08T07:30:00Z', 'America/New_York'), 3);
      assert.equal(timezone('invalid'), 'Asia/Kolkata');
    }
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});
