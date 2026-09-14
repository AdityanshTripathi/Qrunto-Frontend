const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/dashboard-data.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loadedModule = { exports: {} };
new Function('module', 'exports', output)(loadedModule, loadedModule.exports);
const { buildSalesChartData } = loadedModule.exports;

const dateTools = {
  localDate: (value) => new Date(value).toISOString().slice(0, 10),
  localHour: (value) => new Date(value).getUTCHours(),
  addDays: (date, days) => {
    const result = new Date(`${date}T00:00:00Z`);
    result.setUTCDate(result.getUTCDate() + days);
    return result.toISOString().slice(0, 10);
  },
};
const now = new Date('2026-08-31T12:00:00Z');

test('Dashboard sales chart uses production aggregation without fabricated data', () => {
  assert.deepEqual(buildSalesChartData([], 'today', 'UTC', dateTools, now), []);
  assert.deepEqual(buildSalesChartData([{ status: 'NEW', totalAmount: 99, createdAt: now.toISOString() }], 'today', 'UTC', dateTools, now), []);
  const chart = buildSalesChartData([
    { status: 'PAID', totalAmount: 10, createdAt: '2026-08-31T12:15:00Z' },
    { status: 'SERVED', totalAmount: 20, createdAt: '2026-08-31T12:45:00Z' },
    { status: 'PAID', totalAmount: 99, createdAt: '2026-08-30T12:00:00Z' },
  ], 'today', 'UTC', dateTools, now);
  assert.equal(chart.length, 24);
  assert.deepEqual(chart[12], { time: '12pm', revenue: 30, orders: 2, aov: 15 });
  assert.equal(chart.reduce((total, point) => total + point.revenue, 0), 30);
});

test('Dashboard period aggregation has stable shapes and finite outputs', () => {
  const orders = [{ status: 'PAID', totalAmount: 25, createdAt: '2026-08-30T09:00:00Z' }];
  const week = buildSalesChartData(orders, 'week', 'UTC', dateTools, now);
  const month = buildSalesChartData(orders, 'month', 'UTC', dateTools, now);
  assert.equal(week.length, 7);
  assert.equal(month.length, 4);
  assert.equal(week.reduce((total, point) => total + point.revenue, 0), 25);
  assert.ok(month.every((point) => Number.isFinite(point.aov)));
});
