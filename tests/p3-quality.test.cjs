const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('ROUTE-001: unknown routes render NotFound while unauthorized remains distinct', () => {
  const app = read('src/App.tsx');
  const protectedRoute = read('src/components/ProtectedRoute.tsx');
  const notFound = read('src/pages/NotFound.tsx');
  assert.match(app, /const NotFound = React\.lazy/);
  assert.match(app, /<Route path="\*" element=\{<NotFound \/>\} \/>/);
  assert.match(app, /<Route path="\*" element=\{<NotFound \/>\} \/>/);
  assert.match(protectedRoute, /to="\/unauthorized"/);
  assert.match(notFound, /Page not found/);
  assert.match(notFound, /<Link/);
});

test('A11Y-001: campaign dialogs expose dialog semantics and shared keyboard focus handling', () => {
  const hook = read('src/hooks/useAccessibleDialog.ts');
  const dialog = read('src/components/AccessibleDialog.tsx');
  const campaigns = read('src/pages/dashboard/crm/CampaignsConfig.tsx');
  assert.match(hook, /event\.key === 'Escape'/);
  assert.match(hook, /event\.key !== 'Tab'/);
  assert.match(hook, /openerRef\.current\?\.focus\(\)/);
  assert.match(hook, /focusInitial\(\)/);
  assert.match(dialog, /role="dialog"/);
  assert.match(dialog, /aria-modal="true"/);
  assert.match(dialog, /useAccessibleDialog\(isOpen/);
  assert.match(campaigns, /role="dialog" aria-modal="true" aria-labelledby="campaign-dialog-title"/);
  assert.match(campaigns, /role="dialog" aria-modal="true" aria-labelledby="campaign-logs-dialog-title"/);
  assert.match(campaigns, /data-dialog-initial-focus/);
  assert.match(campaigns, /useAccessibleDialog\(isModalOpen/);
  assert.match(campaigns, /useAccessibleDialog\(isLogsOpen/);
});

test('A11Y-001: dialog focus setup remains stable while controlled fields rerender', () => {
  const hook = read('src/hooks/useAccessibleDialog.ts');
  assert.match(hook, /const onCloseRef = useRef\(onClose\)/);
  assert.match(hook, /onCloseRef\.current = onClose/);
  assert.match(hook, /onCloseRef\.current\(\)/);
  assert.match(hook, /\[dialogRef, isOpen\]/);
  assert.doesNotMatch(hook, /\[dialogRef, isOpen, onClose\]/);
});

test('A11Y-001: CRM form, member, and destructive dialogs use the shared dialog wrapper', () => {
  for (const relativePath of [
    'src/pages/dashboard/crm/CouponCampaignsConfig.tsx',
    'src/pages/dashboard/crm/LoyaltyTiersConfig.tsx',
    'src/pages/dashboard/crm/CustomerSegmentsConfig.tsx',
  ]) {
    const source = read(relativePath);
    assert.match(source, /import \{ AccessibleDialog \}/);
    assert.match(source, /<AccessibleDialog isOpen=/);
    assert.match(source, /ariaLabel=/);
  }
});

test('A11Y-001: dashboard order and subscription dialogs use the shared wrapper', () => {
  for (const relativePath of [
    'src/pages/dashboard/OrderManagement.tsx',
    'src/pages/dashboard/SubscriptionManagement.tsx',
  ]) {
    const source = read(relativePath);
    assert.match(source, /import \{ AccessibleDialog \}/);
    assert.match(source, /<AccessibleDialog isOpen=/);
    assert.match(source, /ariaLabel=/);
  }
});

test('A11Y-001: remaining active modal flows use the shared dialog wrapper', () => {
  for (const relativePath of [
    'src/pages/dashboard/inventory/InventoryDialogs.tsx',
    'src/pages/dashboard/MenuManagement.tsx',
    'src/pages/dashboard/TableManagement.tsx',
    'src/pages/dashboard/SuperAdminDashboard.tsx',
    'src/pages/dashboard/WaitersPage.tsx',
    'src/pages/waiter/WaiterDashboard.tsx',
    'src/pages/CustomerMenu.tsx',
    'src/pages/dashboard/BillsPage.tsx',
    'src/pages/dashboard/CategoryManagement.tsx',
    'src/pages/Subscription.tsx',
  ]) {
    const source = read(relativePath);
    assert.match(source, /import \{ AccessibleDialog \}/);
    assert.match(source, /<AccessibleDialog isOpen=/);
    assert.match(source, /ariaLabel=/);
  }
  const hook = read('src/hooks/useAccessibleDialog.ts');
  assert.match(hook, /activeDialogs\.at\(-1\) !== dialog/);
});

test('Staff workspace uses the dashboard sidebar framework without exposing owner navigation', () => {
  const layout = read('src/components/WaiterDashboardLayout.tsx');
  const sidebar = read('src/components/dashboard-sidebar/StaffSidebar.tsx');
  assert.match(layout, /<SidebarProvider>/);
  assert.match(layout, /<StaffSidebar/);
  assert.match(layout, /<DashboardMenuButton \/>/);
  assert.match(sidebar, /collapsible="icon"/);
  assert.match(sidebar, /Staff workspace/);
  assert.match(sidebar, /<DropdownMenuContent side="top"/);
  assert.match(sidebar, /Light Mode/);
  assert.match(sidebar, /Log out/);
  assert.match(sidebar, /event\.key === 'Escape'/);
  assert.match(sidebar, /event\.key !== 'Tab'/);
  assert.doesNotMatch(sidebar, /owner\.dashboard|menu\.manage|analytics\.view/);
});

test('GST toggle persists settings and suppresses GST registration details on bills', () => {
  const settings = read('src/pages/dashboard/Settings.tsx');
  const bills = read('src/pages/dashboard/BillsPage.tsx');
  assert.match(settings, /gstEnabled: boolean/);
  assert.match(settings, /setValue\('gstEnabled', data\.settings\.gstEnabled \?\? true\)/);
  assert.match(settings, /gstEnabled: payload\.gstEnabled/);
  assert.match(settings, /role="switch"/);
  assert.match(settings, /Charge GST/);
  assert.match(settings, /disabled=\{!watchedGstEnabled\}/);
  assert.match(bills, /restaurantSettings\.gstEnabled && restaurantDetails\?\.gstNumber/);
});
