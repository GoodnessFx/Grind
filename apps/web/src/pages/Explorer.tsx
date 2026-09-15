import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, ArrowRight, ArrowLeftLeft, ArrowRightRight, History, Banknote } from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';
import { getAllPlans, FlexPlan, FlexTransaction } from './GrindFlex';

export const Explorer = () => {
  const [plans, setPlans] = useState<FlexPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPlans(getAllPlans());
  }, []);

  // Flatten all transactions from all plans for the explorer
  const allTx = plans.flatMap(p => p.transactions.map(t => ({ ...t, planTitle: p.title, escrowAddress: p.escrowAddress })));
  
  // Sort by newest first
  allTx.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const filteredTx = allTx.filter(tx => 
    tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.escrowAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.planTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Link to="/grindflex" className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">GrindFlex</Link>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold text-sm">Explorer</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <History className="text-[#1E56CC]" /> Escrow Explorer
            </h1>
            <p className="text-sm text-gray-500 mt-1">Public ledger of all GrindFlex installment transactions</p>
          </div>
          <div className="relative w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search hash or escrow address..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1E56CC]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">Tx Hash</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Escrow Address</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTx.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTx.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#1E56CC] font-mono text-xs bg-blue-50 px-2 py-1 rounded-md">{tx.hash.slice(0, 14)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${tx.type === 'deposit' ? 'bg-blue-100 text-blue-700' : 
                            tx.type === 'refund' ? 'bg-green-100 text-green-700' : 
                            tx.type === 'fee' ? 'bg-red-100 text-red-700' : 
                            'bg-amber-100 text-amber-700'}`}
                        >
                          {tx.type === 'deposit' && <ArrowRightRight size={12} />}
                          {tx.type === 'refund' && <ArrowLeftLeft size={12} />}
                          {tx.type === 'fee' && <Banknote size={12} />}
                          {tx.type === 'release' && <Shield size={12} />}
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${tx.type === 'fee' ? 'text-red-600' : 'text-gray-900'}`}>
                          {tx.type === 'fee' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 font-mono text-xs">{tx.escrowAddress.slice(0, 16)}...</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(tx.time).toLocaleString('en-NG')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
