import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Shield, MessageSquare, Briefcase, Zap, History } from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';

export const Home = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">

      {/* ── Navbar (Monochrome Chrome) ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e6e6e6]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <LogoMark size={32} tone="dark" framed />
            <span className="text-black font-bold text-lg tracking-tight">Grind</span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-black hover:text-gray-600 text-sm font-semibold transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="bg-black hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-[50px] transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Marquee Strip (Monochrome) ── */}
      <div className="bg-black py-2.5 border-b border-black">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-center items-center gap-4 text-xs font-semibold uppercase tracking-widest text-white">
          <span>Trustless</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-50" />
          <span>Campus Gigs</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-50" />
          <span>cNGN Escrow</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-50" />
          <span>No Scams</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h1 className="text-6xl md:text-[86px] font-black text-black leading-[1.0] tracking-[-1.72px] mb-8">
            The marketplace for serious hustlers.
          </h1>
          <p className="text-2xl text-gray-700 font-medium tracking-[-0.26px] max-w-2xl mb-12">
            Buy services, sell skills, and trade products across Nigerian campuses — protected by escrow.
          </p>

          <div className="w-full max-w-2xl bg-white border border-[#e6e6e6] rounded-[50px] flex p-2 shadow-sm">
            <input
              placeholder="What are you looking for?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-6 text-lg text-black outline-none placeholder-gray-400 bg-transparent"
            />
            <button className="bg-black hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-[50px] transition-colors flex items-center gap-2">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature: Escrow (Lime Block) ── */}
      <section className="px-6 pb-24">
        <div className="max-w-[1400px] mx-auto bg-[#dceeb1] rounded-[24px] p-12 md:p-24 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
            <Shield size={32} className="text-black" />
          </div>
          <h2 className="text-4xl md:text-[64px] font-black text-black leading-[1.10] tracking-[-0.96px] mb-6 max-w-3xl">
            100% Escrow Protected.
          </h2>
          <p className="text-2xl text-black/70 font-medium tracking-[-0.26px] max-w-2xl mb-10">
            Never get scammed again. Funds are held safely in a smart contract and only released when you approve the work.
          </p>
          <Link to="/marketplace" className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-[50px] transition-colors text-lg inline-flex items-center gap-2">
            Explore Marketplace <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Feature: GrindFlex (Lilac Block) ── */}
      <section className="px-6 pb-24">
        <div className="max-w-[1400px] mx-auto bg-[#c5b0f4] rounded-[24px] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-[50px] font-bold text-sm tracking-widest uppercase mb-8">
              <Zap size={14} /> New Feature
            </div>
            <h2 className="text-4xl md:text-[64px] font-black text-black leading-[1.10] tracking-[-0.96px] mb-6">
              Pay Small Small.
            </h2>
            <p className="text-xl text-black/70 font-medium tracking-[-0.26px] mb-10">
              Want to buy a laptop or pay for a big service? GrindFlex lets you save up in installments. Funds are held in escrow and easily tracked via the Explorer.
            </p>
            <Link to="/grindflex" className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-[50px] transition-colors text-lg inline-flex items-center gap-2">
              Start a Flex Plan <ArrowRight size={20} />
            </Link>
          </div>
          <div className="flex-1 w-full max-w-md bg-white rounded-[24px] p-8 shadow-xl border border-black/5 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="font-bold text-black">MacBook Pro M1</div>
              <div className="text-sm font-semibold bg-[#c8e6cd] text-black px-3 py-1 rounded-[50px]">Active</div>
            </div>
            <div className="w-full bg-[#f1f1f1] h-3 rounded-full mb-2 overflow-hidden">
              <div className="bg-black h-full w-[45%]" />
            </div>
            <div className="flex justify-between text-sm font-semibold mb-8">
              <span>₦315,000 Saved</span>
              <span className="text-black/50">Target: ₦700,000</span>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-[#e6e6e6]">
              <div className="flex items-center gap-2 text-sm font-semibold text-black/50">
                <History size={16} /> Weekly Drops
              </div>
              <button className="bg-black text-white px-6 py-2 rounded-[50px] font-semibold text-sm">Deposit Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature: Leaderboard (Pink Block) ── */}
      <section className="px-6 pb-24">
        <div className="max-w-[1400px] mx-auto bg-[#efd4d4] rounded-[24px] p-12 md:p-24 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-[64px] font-black text-black leading-[1.10] tracking-[-0.96px] mb-6 max-w-3xl">
            Reputation is everything.
          </h2>
          <p className="text-2xl text-black/70 font-medium tracking-[-0.26px] max-w-2xl mb-10">
            Build your GrindScore through successful transactions. The higher your score, the more visible you become.
          </p>
          <Link to="/leaderboard" className="bg-white hover:bg-gray-50 text-black border-2 border-black font-semibold px-8 py-4 rounded-[50px] transition-colors text-lg inline-flex items-center gap-2">
            View Leaderboard <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── CTA (Navy Block) ── */}
      <section className="px-6 pb-24">
        <div className="max-w-[1400px] mx-auto bg-[#1f1d3d] rounded-[24px] p-12 md:p-32 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-[64px] font-black text-white leading-[1.10] tracking-[-0.96px] mb-8 max-w-3xl">
            Start grinding today.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup" className="bg-white hover:bg-gray-100 text-black font-semibold px-10 py-4 rounded-[50px] transition-colors text-lg">
              Create Free Account
            </Link>
            <Link to="/marketplace" className="bg-transparent border-2 border-white/20 hover:border-white text-white font-semibold px-10 py-4 rounded-[50px] transition-colors text-lg">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer (Monochrome) ── */}
      <footer className="bg-white border-t border-[#e6e6e6] py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <LogoMark size={32} tone="dark" framed />
                <span className="text-black font-bold text-xl tracking-tight">Grind</span>
              </Link>
              <p className="text-sm font-medium text-black/60 leading-relaxed max-w-xs">
                The real-work marketplace for Nigerian students and young professionals.
              </p>
            </div>
            {[
              { title: 'Platform', links: [{ label: 'Marketplace', path: '/marketplace' }, { label: 'GrindFlex', path: '/grindflex' }, { label: 'Leaderboard', path: '/leaderboard' }, { label: 'Explorer', path: '/explorer' }] },
              { title: 'Company', links: [{ label: 'About Us', path: '#' }, { label: 'Careers', path: '#' }, { label: 'Admin Panel', path: '/admin' }] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-mono text-sm uppercase tracking-widest font-semibold mb-6 text-black">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link to={l.path} className="text-base font-medium text-black/60 hover:text-black transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#e6e6e6] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-black/40">
            <span>© 2025 Grind Technologies Ltd. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
