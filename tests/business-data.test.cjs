const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '../src/pages/dashboard');
const dashboard = fs.readFileSync(path.join(root, 'DashboardOverview.tsx'), 'utf8');
const tree = ts.createSourceFile('dashboard.tsx', dashboard, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function chart(name, orders) {
  let expression;
  function find(node) { if (ts.isVariableDeclaration(node) && node.name.getText(tree) === name) expression = node.initializer.getText(tree); ts.forEachChild(node, find); } find(tree);
  const code = ts.transpileModule(`const chart = ${expression}; result = chart();`, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const context = { allOrders: orders, salesPeriod: 'today', restaurantTimeZone: 'UTC', Date, result: null,
    localDate: d => new Date(d).toISOString().slice(0, 10), localHour: d => new Date(d).getUTCHours() };
  vm.runInNewContext(code, context); return JSON.parse(JSON.stringify(context.result));
}
test('Dashboard: empty feed has no fabricated sales, order shares or payments', () => {
  for (const name of ['getSalesChartData','getRevenueTypeData','getPaymentTypeData']) assert.deepEqual(chart(name, []), []);
  assert.doesNotMatch(dashboard, /MOCK_|\bspark:|₹42,800|₹320|Rahul K\.|revenue: 1200|val: '73%'/);
});
test('Dashboard: charts use actual rows and do not assume unknown payments are cards or invent delivery split', () => {
  const order = { status: 'PAID', createdAt: new Date().toISOString(), totalAmount: 10, table: null, payments: [] };
  assert.equal(chart('getSalesChartData', [order]).reduce((sum, row) => sum + row.revenue, 0), 10);
  assert.deepEqual(chart('getPaymentTypeData', [order]), []);
  const shares = chart('getRevenueTypeData', [order]); assert.equal(shares.find(row => row.name === 'Other').value, 100);
  assert.ok(shares.every(row => row.name !== 'Delivery' && row.name !== 'Takeaway'));
  const payments = chart('getPaymentTypeData', [{ ...order, payments: [{ status: 'SUCCESS', paymentMethod: 'UNKNOWN' }, { status: 'FAILED', paymentMethod: 'CARD' }] }]);
  assert.equal(payments.find(row => row.name === 'Other').value, 100); assert.equal(payments.find(row => row.name === 'Card').value, 0);
});

function renderTab(name, data) {
  const file = path.join(root, 'analytics', name + '.tsx'); let source = fs.readFileSync(file, 'utf8');
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), edits=[];
  function find(node) {
    if(ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) && node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText(parsed)==='useState') {
      edits.push([node.initializer.getStart(parsed),node.initializer.end,`__state(${JSON.stringify(node.name.elements[0].getText(parsed))})`]);
    }
    ts.forEachChild(node,find);
  }find(parsed);
  for(const [a,b,v] of edits.sort((a,b)=>b[0]-a[0]))source=source.slice(0,a)+v+source.slice(b);
  const output = {};
  const box = ({ children }) => React.createElement('div', null, children);
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText, {
    exports: output, __state: name => [name==='data'?data:name==='loading'?false:name==='searchQuery'?'':null,()=>{}],
    require: name => {
      if(name==='react')return {...React,useEffect:()=>{}};
      if(name==='sonner')return {toast:{error:()=>{}}};
      if(name==='lucide-react'||name==='recharts')return new Proxy({}, {get:()=>box});
      throw Error('Unexpected dependency '+name);
    }, console,
  });
  return renderToStaticMarkup(React.createElement(output[name], { startDate:'2026-07-01',endDate:'2026-08-31',token:'test',baseUrl:'unused',refreshTrigger:0 }));
}
test('Analytics UI: unavailable values render N/A rather than zero or fabricated metrics', () => {
  const menu=renderTab('MenuTab',{menuPerformance:[{id:'one',name:'Unknown cost',sold:1,revenue:10,cost:null,profit:null,views:null,conversion:null}],bundles:[]});
  assert.match(menu,/Unknown cost/); assert.match(menu,/N\/A/); assert.doesNotMatch(menu,/NaN/);
  const orders=renderTab('OrderTab',{timing:{avgPrepTime:null,avgDeliveryTime:null,avgTableTurnaround:null,delayPercentage:{kitchen:null,waiter:null}},statuses:{completed:0,cancelled:0,rejected:0,pending:0},conversion:{qrViews:0,cartSessions:0,ordersPlaced:0,cartAbandonmentRate:null}});
  assert.match(orders,/N\/A/); assert.doesNotMatch(orders,/14\.5|18\.2|3\.1%|NaN/);
  const customers=renderTab('CustomerTab',{summary:{total:0,new:0,returning:0},segmentation:{vip:0,dormant:0,churned:0,active:0},behavior:{avgSpend:0,frequencyDays:null,clv:0},upcomingEvents:{birthdays:0,anniversaries:0},retentionMatrix:[]});
  assert.match(customers,/No cohort data/);assert.doesNotMatch(customers,/Jan 2026|12\.5 days/);
  const loyalty=renderTab('LoyaltyTab',{members:{joined:0,active:0},points:{issued:0,redeemed:0,redemptionRate:0},couponRoi:[]});
  assert.match(loyalty,/No active coupon redemptions/);assert.doesNotMatch(loyalty,/ORDIO50|WELCOME100|4,200/);
});
