import React, { useState, useEffect } from 'react';
import { DollarSign, Trash2, Plus, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ExpenseItem {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  expenseDate: string;
}

interface PaymentMethodShare {
  name: string;
  amount: number;
}

interface ExpenseCategoryTotal {
  category: string;
  amount: number;
}

interface FinanceData {
  netRevenue: number;
  cogs: number;
  expensesTotal: number;
  profit: number;
  grossMargin: number;
  foodCostPercent: number;
  beverageCostPercent: number;
  expensesCategorized: ExpenseCategoryTotal[];
  paymentsSplit: PaymentMethodShare[];
}

interface FinanceTabProps {
  data: FinanceData;
  token: string | null;
  baseUrl: string;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const COLORS = ['#FF6B35', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const FinanceTab: React.FC<FinanceTabProps> = ({ data, token, baseUrl }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('OPERATIONAL');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]!);

  const fetchExpenses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch expenses');
      setExpenses(resData.expenses || []);
    } catch (e: any) {
      toast.error(e.message || 'Error fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !amount) return;

    try {
      const res = await fetch(`${baseUrl}/analytics/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description: description || null,
          expenseDate: new Date(expenseDate).toISOString(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to add expense');
      toast.success('Expense recorded successfully!');
      setAmount('');
      setDescription('');
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message || 'Error adding expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!token || !window.confirm('Delete this expense?')) return;

    try {
      const res = await fetch(`${baseUrl}/analytics/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to delete expense');
      toast.success('Expense deleted successfully.');
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Profit Margin</p>
          <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{data.grossMargin}%</h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COGS / Recipe Cost</p>
          <h4 className="text-lg font-black text-[#FF6B35] mt-1">{fmt(data.cogs)}</h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Food Cost share</p>
          <h4 className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">{data.foodCostPercent}%</h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Business Profit</p>
          <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{fmt(data.profit)}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Settle Method Shares
            </h3>
          </div>

          <div className="flex flex-col items-center">
            {data.paymentsSplit.filter(p => p.amount > 0).length === 0 ? (
              <p className="text-slate-400 text-xs py-10">No payments collected yet.</p>
            ) : (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.paymentsSplit.filter(p => p.amount > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="amount"
                      >
                        {data.paymentsSplit.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2 text-[10px]">
                  {data.paymentsSplit.filter(p => p.amount > 0).map((p, idx) => (
                    <div key={p.name} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{p.name}: {fmt(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Record New Expense
          </h3>

          <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Amount (₹)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="OPERATIONAL">Operational</option>
                <option value="SALARY">Salary</option>
                <option value="RENT">Rent</option>
                <option value="UTILITIES">Utilities</option>
                <option value="MARKETING">Marketing</option>
                <option value="DEPRECIATION">Depreciation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Date</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Electricity bill"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <button
              type="submit"
              className="col-span-2 py-2.5 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Expense Record
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Expenses Ledger
          </h3>
          <button onClick={fetchExpenses} className="text-slate-400 hover:text-[#FF6B35] transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-6">No expenses logged for this period.</p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 uppercase text-[9px] font-bold">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {expenses.map((ex) => (
                  <tr key={ex.id} className="text-slate-700 dark:text-slate-200">
                    <td className="py-2.5">{new Date(ex.expenseDate).toLocaleDateString('en-US')}</td>
                    <td className="py-2.5"><span className="font-extrabold text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{ex.category}</span></td>
                    <td className="py-2.5">{ex.description || 'N/A'}</td>
                    <td className="py-2.5 text-right font-black text-rose-500">{fmt(ex.amount)}</td>
                    <td className="py-2.5 text-right pr-2">
                      <button onClick={() => handleDeleteExpense(ex.id)} className="text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
