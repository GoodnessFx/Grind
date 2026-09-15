/**
 * GrindFlex — "Pay Small Small" installment / escrow savings feature
 * All data stored in localStorage: grind_flex_plans
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet, PiggyBank, TrendingUp, Lock, CheckCircle2,
  AlertTriangle, Clock, ArrowRight, Plus, ChevronRight,
  Shield, Banknote, History, ExternalLink,
} from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';

// ─── Types ──────────────────────────────────────────────
export interface FlexPlan {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  paidAmount: number;
  installmentAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'active' | 'complete' | 'cancelled' | 'requested';
  escrowAddress: string;
  transactions: FlexTransaction[];
  sellerId: string;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
  cancellationFeeRate: number; // e.g. 0.10 = 10%
  requestedAt?: string;
}

export interface FlexTransaction {
  id: string;
  planId: string;
  amount: number;
  type: 'deposit' | 'refund' | 'fee' | 'release';
  note: string;
  time: string;
  hash: string; // fake on-chain hash for display
}

const PLANS_KEY = 'grind_flex_plans';

function genId() { return Math.random().toString(36).slice(2, 10); }
function genHash() { return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''); }
function now() { return new Date().toISOString(); }

export function getAllPlans(): FlexPlan[] {
  try { return JSON.parse(localStorage.getItem(PLANS_KEY) || '[]'); }
  catch { return []; }
}
function savePlans(plans: FlexPlan[]) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function createPlan(data: {
  title: string; description: string; targetAmount: number;
  installmentAmount: number; frequency: FlexPlan['frequency'];
  sellerId: string; sellerName: string;
}): FlexPlan {
  const plans = getAllPlans();
  const plan: FlexPlan = {
    id: 'fp_' + genId(),
    ...data,
    paidAmount: 0,
    status: 'active',
    escrowAddress: genHash().slice(0, 42),
    transactions: [],
    createdAt: now(),
    updatedAt: now(),
    cancellationFeeRate: 0.10,
  };
  plans.push(plan);
  savePlans(plans);
  return plan;
}

export function makeDeposit(planId: string, amount: number): FlexPlan | null {
  const plans = getAllPlans();
  const idx = plans.findIndex(p => p.id === planId);
  if (idx === -1) return null;
  const plan = plans[idx];

  const tx: FlexTransaction = {
    id: genId(), planId, amount, type: 'deposit',
    note: `Installment deposit`,
    time: now(), hash: genHash(),
  };
  plan.transactions.push(tx);
  plan.paidAmount = Math.min(plan.paidAmount + amount, plan.targetAmount);
  plan.updatedAt = now();
  if (plan.paidAmount >= plan.targetAmount) plan.status = 'complete';

  savePlans(plans);
  return plan;
}

export function cancelPlan(planId: string): { plan: FlexPlan; feeAmount: number; refundAmount: number } | null {
  const plans = getAllPlans();
  const idx = plans.findIndex(p => p.id === planId);
  if (idx === -1) return null;
  const plan = plans[idx];

  const feeAmount = Math.round(plan.paidAmount * plan.cancellationFeeRate);
  const refundAmount = plan.paidAmount - feeAmount;

  plan.transactions.push({
    id: genId(), planId, amount: feeAmount, type: 'fee',
    note: `Cancellation fee (${plan.cancellationFeeRate * 100}%)`,
    time: now(), hash: genHash(),
  });
  plan.transactions.push({
    id: genId(), planId, amount: refundAmount, type: 'refund',
    note: `Refund after cancellation fee`,
    time: now(), hash: genHash(),
  });
  plan.status = 'cancelled';
  plan.updatedAt = now();
  savePlans(plans);
  return { plan, feeAmount, refundAmount };
}

export function requestProduct(planId: string): FlexPlan | null {
  const plans = getAllPlans();
  const idx = plans.findIndex(p => p.id === planId);
  if (idx === -1) return null;
  const plan = plans[idx];
  if (plan.status !== 'complete') return null;

  plan.transactions.push({
    id: genId(), planId, amount: plan.paidAmount, type: 'release',
    note: `Escrow released to seller — product request initiated`,
    time: now(), hash: genHash(),
  });
  plan.status = 'requested';
  plan.requestedAt = now();
  plan.updatedAt = now();
  savePlans(plans);
  return plan;
}

// ─── Sample / seed plans ────────────────────────────────
function seedIfEmpty() {
  const plans = getAllPlans();
  if (plans.length > 0) return;
  const demo = createPlan({
    title: 'iPhone 15 Pro Max — 256GB Black',
    description: 'Buy the latest iPhone in installments. Fully secured in Grind escrow.',
    targetAmount: 850000,
    installmentAmount: 85000,
    frequency: 'monthly',
    sellerId: 'demo_seller',
    sellerName: 'TechStore NG',
  });
  makeDeposit(demo.id, 85000);
  makeDeposit(demo.id, 85000);
  makeDeposit(demo.id, 85000);
}

// ─── Components ─────────────────────────────────────────
const STATUS_STYLE: Record<FlexPlan['status'], string> = {
  active: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  requested: 'bg-amber-100 text-amber-700',
};
const STATUS_LABEL: Record<FlexPlan['status'], string> = {
  active: 'In Progress',
  complete: 'Ready to Claim',
  cancelled: 'Cancelled',
  requested: 'Product Requested',
};

function PlanCard({ plan, onRefresh }: { plan: FlexPlan; onRefresh: () => void }) {
  const pct = Math.round((plan.paidAmount / plan.targetAmount) * 100);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState(String(plan.installmentAmount));
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDeposit = () => {
    const amt = parseInt(depositAmt.replace(/,/g, ''), 10);
    if (!amt || amt <= 0) return;
    makeDeposit(plan.id, amt);
    setResult('Deposit successful! Transaction recorded in escrow.');
    setShowDeposit(false);
    onRefresh();
  };

  const handleCancel = () => {
    const r = cancelPlan(plan.id);
    if (!r) return;
    setResult(`Plan cancelled. Fee: ₦${r.feeAmount.toLocaleString()}. Refund: ₦${r.refundAmount.toLocaleString()}`);
    setConfirmCancel(false);
    onRefresh();
  };

  const handleRequest = () => {
    requestProduct(plan.id);
    setResult('Product request sent! The seller has been notified. Escrow funds released.');
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base mb-1">{plan.title}</h3>
            <p className="text-sm text-gray-500">Seller: {plan.sellerName}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLE[plan.status]}`}>
            {STATUS_LABEL[plan.status]}
          </span>
        </div>

        {/* Escrow address */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 mb-4">
          <Shield size={14} className="text-[#1E56CC] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-400 font-medium mb-0.5">Escrow Address</div>
            <code className="text-xs text-gray-600 truncate block">{plan.escrowAddress}</code>
          </div>
          <Link to="/explorer" className="text-[#1E56CC] hover:text-[#1848B0]">
            <ExternalLink size={14} />
          </Link>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Saved</span>
            <span className="font-bold text-gray-900">₦{plan.paidAmount.toLocaleString()} / ₦{plan.targetAmount.toLocaleString()}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1E56CC] to-[#4A90FF] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{pct}% complete</span>
            <span>₦{(plan.targetAmount - plan.paidAmount).toLocaleString()} remaining</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50">
        <div className="px-4 py-3 text-center">
          <div className="text-sm font-bold text-gray-900">₦{plan.installmentAmount.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 mt-0.5 capitalize">{plan.frequency} payment</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-sm font-bold text-gray-900">{plan.transactions.filter(t => t.type === 'deposit').length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Deposits made</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-sm font-bold text-amber-600">{plan.cancellationFeeRate * 100}%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Cancel fee</div>
        </div>
      </div>

      {/* Actions */}
      {plan.status === 'active' && (
        <div className="p-4 space-y-3">
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 size={14} /> {result}
            </div>
          )}
          {showDeposit ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₦</span>
                <input
                  type="number"
                  value={depositAmt}
                  onChange={e => setDepositAmt(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]"
                />
              </div>
              <button onClick={handleDeposit} className="bg-[#1E56CC] hover:bg-[#1848B0] text-white text-sm font-semibold px-4 rounded-xl transition-all">
                Pay
              </button>
              <button onClick={() => setShowDeposit(false)} className="text-gray-400 text-sm px-3">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setShowDeposit(true)} className="w-full bg-[#0A0F1E] hover:bg-[#1E2640] text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
              <Plus size={15} /> Make Installment Payment
            </button>
          )}
          {confirmCancel ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium mb-1 flex items-center gap-2">
                <AlertTriangle size={14} /> Confirm cancellation?
              </p>
              <p className="text-xs text-red-600 mb-3">
                A {plan.cancellationFeeRate * 100}% fee (₦{Math.round(plan.paidAmount * plan.cancellationFeeRate).toLocaleString()}) will be deducted. You will receive ₦{(plan.paidAmount - Math.round(plan.paidAmount * plan.cancellationFeeRate)).toLocaleString()} back.
              </p>
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg">Yes, Cancel Plan</button>
                <button onClick={() => setConfirmCancel(false)} className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-lg">Keep Saving</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmCancel(true)} className="w-full border border-red-200 text-red-500 hover:bg-red-50 text-sm py-2 rounded-xl transition-all">
              Cancel Plan
            </button>
          )}
        </div>
      )}

      {plan.status === 'complete' && (
        <div className="p-4">
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700 mb-3">
              <CheckCircle2 size={14} /> {result}
            </div>
          )}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3">
            <p className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-1">
              <CheckCircle2 size={15} /> Savings complete!
            </p>
            <p className="text-xs text-green-700">All ₦{plan.targetAmount.toLocaleString()} has been saved. You can now request your product.</p>
          </div>
          <button onClick={handleRequest} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            Request Product Now <ArrowRight size={15} />
          </button>
        </div>
      )}

      {plan.status === 'requested' && (
        <div className="p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-1">
              <Clock size={15} /> Product request sent
            </p>
            <p className="text-xs text-amber-700">
              Requested on {new Date(plan.requestedAt!).toLocaleDateString('en-NG')}. The seller will deliver and confirm. Escrow released.
            </p>
          </div>
        </div>
      )}

      {/* Transaction mini-list */}
      {plan.transactions.length > 0 && (
        <div className="border-t border-gray-100 p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Transaction History</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {plan.transactions.slice().reverse().map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-blue-100' : tx.type === 'refund' ? 'bg-green-100' : tx.type === 'fee' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    {tx.type === 'deposit' && <Plus size={10} className="text-blue-600" />}
                    {tx.type === 'refund' && <ArrowRight size={10} className="text-green-600" />}
                    {tx.type === 'fee' && <AlertTriangle size={10} className="text-red-600" />}
                    {tx.type === 'release' && <CheckCircle2 size={10} className="text-amber-600" />}
                  </div>
                  <span className="text-gray-600 truncate max-w-[120px]">{tx.note}</span>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${tx.type === 'fee' ? 'text-red-600' : 'text-gray-800'}`}>
                    {tx.type === 'fee' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-[10px]">{new Date(tx.time).toLocaleDateString('en-NG')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export const GrindFlex = () => {
  const [plans, setPlans] = useState<FlexPlan[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', targetAmount: '', installmentAmount: '',
    frequency: 'monthly' as FlexPlan['frequency'], sellerName: '',
  });
  const navigate = useNavigate();

  const refresh = () => setPlans(getAllPlans());

  useEffect(() => {
    seedIfEmpty();
    refresh();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPlan({
      title: form.title,
      description: form.description,
      targetAmount: parseInt(form.targetAmount.replace(/,/g, ''), 10),
      installmentAmount: parseInt(form.installmentAmount.replace(/,/g, ''), 10),
      frequency: form.frequency,
      sellerId: 'user_demo',
      sellerName: form.sellerName || 'Verified Seller',
    });
    setShowCreate(false);
    setForm({ title: '', description: '', targetAmount: '', installmentAmount: '', frequency: 'monthly', sellerName: '' });
    refresh();
  };

  const totalSaved = plans.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalTarget = plans.reduce((sum, p) => sum + p.targetAmount, 0);
  const activePlans = plans.filter(p => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-[Inter,sans-serif]">
      {/* Nav */}
      <header className="bg-[#0A0F1E] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <LogoMark size={24} tone="light" />
              <span className="text-white font-bold">Grind</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold">GrindFlex</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/explorer" className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
              <History size={15} /> Transaction Explorer
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#1E56CC] hover:bg-[#1848B0] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Plus size={15} /> New Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="bg-[#0A0F1E] rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#1E56CC] opacity-10 blur-[60px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank size={20} className="text-[#4A90FF]" />
              <span className="text-[#4A90FF] text-sm font-semibold">GrindFlex — Pay Small Small</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Buy anything on Grind in installments.</h1>
            <p className="text-gray-400 max-w-lg">
              Set a savings target, pay at your own pace, and watch your escrow balance grow. When you hit the target — claim your product. Cancel anytime (10% fee applies).
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Wallet, label: 'Total Saved', value: `₦${totalSaved.toLocaleString()}` },
              { icon: TrendingUp, label: 'Active Plans', value: `${activePlans}` },
              { icon: Lock, label: 'In Escrow', value: `₦${(totalSaved).toLocaleString()}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-4">
                <Icon size={18} className="text-[#4A90FF] mb-2" />
                <div className="text-xl font-black text-white">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Create plan modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-900">Create New GrindFlex Plan</h2>
                <p className="text-sm text-gray-500 mt-1">Define your savings goal and installment schedule.</p>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product / Service Title</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. iPhone 15 Pro Max" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Seller Name</label>
                  <input required value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} placeholder="e.g. TechStore NG" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Amount (₦)</label>
                    <input required type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} placeholder="850000" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Installment (₦)</label>
                    <input required type="number" value={form.installmentAmount} onChange={e => setForm({ ...form, installmentAmount: e.target.value })} placeholder="85000" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Frequency</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as FlexPlan['frequency'] })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC] bg-white">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  A 10% cancellation fee applies if you cancel before completing your savings. Your money is locked in escrow and released to the seller only when you request the product.
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-[#1E2640] text-white font-bold py-3 rounded-xl transition-all">Create Plan</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plans grid */}
        {plans.length === 0 ? (
          <div className="text-center py-20">
            <PiggyBank size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-500 mb-2">No plans yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start a GrindFlex plan to buy anything in installments.</p>
            <button onClick={() => setShowCreate(true)} className="bg-[#0A0F1E] text-white font-bold px-8 py-3 rounded-xl">
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onRefresh={refresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
