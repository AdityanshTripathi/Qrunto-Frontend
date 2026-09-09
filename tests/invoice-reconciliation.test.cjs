const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const mod = { exports: {} };
new Function('exports', ts.transpileModule(fs.readFileSync('src/lib/invoice.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(mod.exports);
test('Invoice stored subtotal + GST - discount equals grand total, including odd cents and zero', () => {
  for (const [subtotal,taxAmount,totalAmount,discount] of [[100,5,95,10],[0.1,0.01,0.1,0.01],[0,0,0,0],[100,0,100,0]]) {
    const actual=mod.exports.invoiceDiscount({subtotal,taxAmount,totalAmount});
    assert.equal(actual,discount);
    assert.equal(Math.round(subtotal*100)+Math.round(taxAmount*100)-Math.round(actual*100),Math.round(totalAmount*100));
  }
});
