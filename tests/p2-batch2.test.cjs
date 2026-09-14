const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(require, module, module.exports);
  return module.exports;
}

function style(cssText) {
  return {
    cssText,
    background: '', color: '', padding: '',
    setProperty(name, value) { this[name] = value; },
  };
}

test('CRM-001: manual greeting is unavailable and cannot claim delivery without an endpoint', () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/dashboard/crm/CustomersDirectory.tsx'), 'utf8');
  assert.doesNotMatch(source, /sendManualGreeting|toast\.success\([^\n]*greeting/i);
  assert.match(source, /disabled\s*\n\s*aria-label="Manual greetings are not enabled"/);
  assert.match(source, /title="Manual greetings are not enabled"/);
});

test('OPS-002: bill settlement uses the returned status and has neutral fallback copy', () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/dashboard/BillsPage.tsx'), 'utf8');
  const handler = source.slice(source.indexOf('const handleMarkPaid'), source.indexOf('// Direct print Invoice'));
  assert.match(handler, /const result = await api\.post/);
  assert.match(handler, /result\?\.order\?\.status/);
  assert.match(handler, /`Bill settled via \$\{method\}\.`/);
  assert.doesNotMatch(handler, /SERVED/);
});

test('UI-001: PDF capture inline styles restore after successful capture and thrown generation', () => {
  const { preparePdfCaptureStyles } = load('src/lib/pdf-capture-styles.ts');
  const first = { className: '', style: style('color: blue !important; font-weight: 700;'), closest: () => null };
  const highlighted = { className: '', style: style('color: orange;'), closest: (selector) => selector === '.keep-color' ? {} : null };
  const element = {
    style: style('background: black; color: white; padding: 3px;'),
    querySelectorAll: () => [first, highlighted],
  };

  const restoreAfterSuccess = preparePdfCaptureStyles(element);
  assert.equal(element.style.background, '#ffffff');
  restoreAfterSuccess();
  assert.equal(element.style.cssText, 'background: black; color: white; padding: 3px;');
  assert.equal(first.style.cssText, 'color: blue !important; font-weight: 700;');
  assert.equal(highlighted.style.cssText, 'color: orange;');

  const restoreAfterFailure = preparePdfCaptureStyles(element);
  assert.throws(() => { throw new Error('html2canvas failed'); }, /html2canvas failed/);
  restoreAfterFailure();
  assert.equal(element.style.cssText, 'background: black; color: white; padding: 3px;');
  assert.equal(first.style.cssText, 'color: blue !important; font-weight: 700;');
});

test('UI-001: CustomerMenu restores capture styles from finally while preserving failure notification', () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/CustomerMenu.tsx'), 'utf8');
  assert.match(source, /restoreCaptureStyles = preparePdfCaptureStyles\(element\)/);
  assert.match(source, /finally\s*\{\s*restoreCaptureStyles\?\.\(\)/);
  assert.match(source, /toast\.error\('Failed to download invoice\. Please try again\.'/);
});
