const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/menu-image.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loadedModule = { exports: {} };
new Function('module', 'exports', output)(loadedModule, loadedModule.exports);
const {
  MAX_IMAGE_FILE_BYTES,
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_PIXELS,
  MAX_FINAL_IMAGE_DATA_URL_BYTES,
  MenuImageValidationError,
  validateMenuImageFile,
  validateMenuImageDimensions,
  validateMenuImagePayload,
} = loadedModule.exports;

test('SEC-002: menu upload accepts supported normal images before browser decoding', () => {
  assert.equal(validateMenuImageFile({ type: 'image/jpeg', size: 1024 }), 'image/jpeg');
  assert.equal(validateMenuImageFile({ type: 'image/png', size: MAX_IMAGE_FILE_BYTES }), 'image/png');
});

test('SEC-002: menu upload rejects unsupported and oversized raw files before decoding', () => {
  assert.throws(() => validateMenuImageFile({ type: 'image/svg+xml', size: 100 }), MenuImageValidationError);
  assert.throws(() => validateMenuImageFile({ type: 'image/jpeg', size: MAX_IMAGE_FILE_BYTES + 1 }), MenuImageValidationError);
});

test('SEC-002: decoded dimension and final payload limits are enforced', () => {
  validateMenuImageDimensions(1200, 800);
  assert.throws(() => validateMenuImageDimensions(MAX_IMAGE_WIDTH + 1, 1), MenuImageValidationError);
  assert.throws(() => validateMenuImageDimensions(MAX_IMAGE_WIDTH, Math.ceil(MAX_IMAGE_PIXELS / MAX_IMAGE_WIDTH) + 1), MenuImageValidationError);
  validateMenuImagePayload('data:image/jpeg;base64,ZmFrZQ==');
  assert.throws(() => validateMenuImagePayload('data:image/png;base64,ZmFrZQ=='), MenuImageValidationError);
  assert.throws(() => validateMenuImagePayload(`data:image/jpeg;base64,${'A'.repeat(MAX_FINAL_IMAGE_DATA_URL_BYTES)}`), MenuImageValidationError);
});

test('SEC-002: validation is retry-safe and does not retain rejected file state', () => {
  assert.throws(() => validateMenuImageFile({ type: 'text/plain', size: 1 }), MenuImageValidationError);
  assert.equal(validateMenuImageFile({ type: 'image/webp', size: 100 }), 'image/webp');
});
