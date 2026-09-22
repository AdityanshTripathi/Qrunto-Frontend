const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const helperPath = path.join(root, 'src/pages/dashboard/crm/whatsapp-campaign-templates.ts');

function loadHelper() {
  const source = fs.readFileSync(helperPath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: helperPath,
  }).outputText;
  const loadedModule = { exports: {} };
  new Function('module', 'exports', 'require', output)(loadedModule, loadedModule.exports, require);
  return loadedModule.exports;
}

const approved = {
  id: 'a30dfba1-d273-4c68-9239-05bedad52aa4',
  metaTemplateId: '998877',
  templateName: 'welcome_guest',
  languageCode: 'en_US',
  category: 'MARKETING',
  approvalStatus: 'APPROVED',
  lastSyncedAt: '2026-09-22T06:00:00.000Z',
  parameterSchema: {
    version: 1,
    parameters: [
      { name: 'header.1', component: 'HEADER', index: 1, type: 'text' },
      { name: 'body.offer', component: 'BODY', index: 1, type: 'text' },
    ],
  },
};

test('eligible response shaping accepts only approved templates with a valid sanitized schema', () => {
  const { shapeEligibleTemplates } = loadHelper();
  const result = shapeEligibleTemplates({ templates: [
    approved,
    { ...approved, id: 'rejected', approvalStatus: 'REJECTED' },
    { ...approved, id: 'removed', approvalStatus: 'SYNC_REMOVED' },
    { ...approved, id: 'bad-schema', parameterSchema: { version: 1, parameters: [{ name: 'body.1', type: 'image' }] } },
  ] });

  assert.equal(result.length, 1);
  assert.deepEqual(result[0], approved);
  assert.equal(JSON.stringify(result).includes('accessToken'), false);
  assert.equal(JSON.stringify(result).includes('wabaId'), false);
});

test('parameter fields come solely from the selected sanitized schema and remain named and typed', () => {
  const { parameterFields, areTemplateParametersComplete } = loadHelper();
  assert.deepEqual(parameterFields(approved), [
    { name: 'header.1', label: 'Header 1', inputType: 'text' },
    { name: 'body.offer', label: 'Body offer', inputType: 'text' },
  ]);
  assert.equal(areTemplateParametersComplete(approved, { 'header.1': 'Asha', 'body.offer': '20% off' }), true);
  assert.equal(areTemplateParametersComplete(approved, { 'header.1': 'Asha', 'body.offer': '  ' }), false);
  assert.equal(areTemplateParametersComplete(approved, { 'header.1': 'Asha' }), false);
});

test('refresh reconciliation preserves a compatible selected template and matching draft values', () => {
  const { reconcileTemplateDraft } = loadHelper();
  const draft = {
    selectedTemplateId: approved.id,
    templateParameters: { 'header.1': 'Asha', 'body.offer': '20% off', ignored: 'drop me' },
  };
  assert.deepEqual(reconcileTemplateDraft(draft, [{ ...approved, lastSyncedAt: '2026-09-22T07:00:00.000Z' }]), {
    selectedTemplateId: approved.id,
    templateParameters: { 'header.1': 'Asha', 'body.offer': '20% off' },
  });
});

test('refresh reconciliation removes an unavailable selection without touching unrelated campaign fields', () => {
  const { reconcileTemplateDraft } = loadHelper();
  assert.deepEqual(reconcileTemplateDraft({
    selectedTemplateId: approved.id,
    templateParameters: { 'header.1': 'Asha' },
  }, []), { selectedTemplateId: '', templateParameters: {} });
});

test('CRM hub uses authenticated template endpoints and submits a verified cached selection', () => {
  const hub = fs.readFileSync(path.join(root, 'src/pages/dashboard/crm/CRMHub.tsx'), 'utf8');
  assert.match(hub, /\/crm\/v2\/whatsapp\/templates\/eligible/);
  assert.match(hub, /\/crm\/v2\/whatsapp\/templates\/sync/);
  assert.match(hub, /selectedTemplateId:/);
  assert.match(hub, /templateLanguage:/);
  assert.match(hub, /templateCategory:/);
  assert.match(hub, /templateParameters:/);
  assert.doesNotMatch(hub, /templateBody:\s*templateName/);
});
