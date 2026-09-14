'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const inventoryDir = path.join(root, 'src/pages/dashboard/inventory');
const inventorySource = () => fs.readdirSync(inventoryDir)
  .filter(file => /\.(ts|tsx)$/.test(file))
  .map(file => fs.readFileSync(path.join(inventoryDir, file), 'utf8'))
  .join('\n');

function loadTypeScriptModule(relativePath) {
  const source = read(relativePath);
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  new Function('module', 'exports', output)(loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

test('Inventory route renders the protected redesigned workspace', () => {
  const app = read('src/App.tsx');
  const dashboard = read('src/pages/dashboard/inventory/InventoryDashboard.tsx');
  assert.match(app, /path="inventory"/);
  assert.match(app, /requiredCapability="inventory\.manage"/);
  assert.match(dashboard, /InventoryOverview/);
  assert.match(dashboard, /InventoryStock/);
  assert.match(dashboard, /InventoryOperations/);
});

test('Inventory loading settles and API failures render a retryable error state', () => {
  const hook = read('src/pages/dashboard/inventory/useInventoryWorkspace.ts');
  const dashboard = read('src/pages/dashboard/inventory/InventoryDashboard.tsx');
  const primitives = read('src/pages/dashboard/inventory/InventoryPrimitives.tsx');
  assert.match(hook, /finally/);
  assert.match(hook, /setLoading\(false\)/);
  assert.match(hook, /setError\(messageFromError/);
  assert.match(dashboard, /InventoryErrorState/);
  assert.match(primitives, /role="alert"/);
  assert.match(primitives, /Try again/);
});

test('Stock status calculation distinguishes healthy, low and out-of-stock', () => {
  const { getStockStatus } = loadTypeScriptModule('src/pages/dashboard/inventory/inventory-utils.ts');
  assert.equal(getStockStatus({ currentStock: 11, minimumStockLevel: 10 }), 'Healthy');
  assert.equal(getStockStatus({ currentStock: 10, minimumStockLevel: 10 }), 'Low Stock');
  assert.equal(getStockStatus({ currentStock: 0, minimumStockLevel: 10 }), 'Out of Stock');
  assert.equal(getStockStatus({ currentStock: -1, minimumStockLevel: 10 }), 'Out of Stock');
});

test('Inventory mutation lock rejects accidental double submission', async () => {
  const { withActionLock } = loadTypeScriptModule('src/lib/inventory-safety.ts');
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const locks = new Set();
  let calls = 0;
  const first = withActionLock(locks, 'receive', async () => { calls += 1; await gate; });
  const second = await withActionLock(locks, 'receive', async () => { calls += 1; });
  assert.equal(second.started, false);
  assert.equal(calls, 1);
  release();
  await first;
});

test('Receive, wastage and adjustment use real endpoints and refresh after success', () => {
  const dialogs = read('src/pages/dashboard/inventory/InventoryDialogs.tsx');
  assert.match(dialogs, /purchases\/\$\{purchaseOrder\.id\}\/receive/);
  assert.match(dialogs, /api\.post\('\/inventory\/wastage'/);
  assert.match(dialogs, /api\.post\('\/inventory\/raw-materials\/adjust'/);
  assert.match(dialogs, /await action\(\); await onMutated\(\)/);
});

test('Branch Transfer is absent from the current Inventory UI', () => {
  const source = inventorySource();
  assert.doesNotMatch(source, /branch transfer|stock transfer|transfer modal|destBranchId|sourceBranchId/i);
});

test('Every inventory dialog uses the shared accessible dialog architecture', () => {
  const dialogs = read('src/pages/dashboard/inventory/InventoryDialogs.tsx');
  const accessibleDialog = read('src/components/AccessibleDialog.tsx');
  assert.match(dialogs, /import \{ AccessibleDialog \}/);
  assert.match(dialogs, /<AccessibleDialog isOpen/);
  assert.match(dialogs, /ariaLabel=\{title\}/);
  assert.match(accessibleDialog, /role="dialog"/);
  assert.match(accessibleDialog, /aria-modal="true"/);
});
