import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Shield, Zap, History, Download, X, SearchCheck } from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';

export const Home = () => {
  const [search, setSearch] = useState('');
  const [showCookie, setShowCookie] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-[Inter,sans-serif] relative">
      
      {/* ── App Install Banner (Mitao Style) ── */}
      {showBanner && (
        <div className="bg-[#041e42] text-white py-2 px-4 flex justify-between items-center text-sm font-medium z-50 relative border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-[#16a34a] flex items-center gap-1"><Shield size={14} /> Secure Escrow</span>
            <span className="hidden md:inline">Trustless transactions for Nigerian students.</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-gray-300"><Download size={14} /> Install App</button>
            <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <header className="absolute top-0 w-full z-40 bg-transparent pt-10 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark size={40} tone="light" />
            <span className="text-white font-bold text-2xl tracking-tight">Grind</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/marketplace" className="text-white hover:text-gray-300 font-medium">Browse Gigs</Link>
            <Link to="/login" className="text-white hover:text-gray-300 font-medium">Log in</Link>
            <Link to="/signup" className="bg-[#ff6b00] hover:bg-[#e66000] text-white font-semibold px-6 py-2.5 rounded-full transition-colors shadow-lg shadow-[#ff6b00]/30">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Flippa-Style Hero Section ── */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Students working"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#041e42]/90 to-[#041e42]/70" />
        </div>

        <div className="relative z-10 w-full max-w-[1000px] mx-auto px-6 text-center mt-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
            Great Hustlers<br />Deserve Great Rewards.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium mb-12 max-w-3xl mx-auto">
            The premium escrow marketplace for Nigerian campuses. Buy and sell skills, gigs, and products with zero scam risk.
          </p>

          {/* Search Bar */}
          <div className="flex bg-white rounded-full p-2 max-w-3xl mx-auto shadow-2xl">
            <div className="flex-1 flex items-center px-4">
              <Search className="text-gray-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search for web design, tutoring, laptops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-lg text-gray-900 outline-none bg-transparent"
              />
            </div>
            <button className="bg-[#041e42] hover:bg-[#03142d] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-lg flex items-center gap-2">
              Search <SearchCheck size={20} />
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-white/80 text-sm font-medium">
            <Link to="/grindflex" className="hover:text-white underline underline-offset-4">Looking to pay in installments?</Link>
            <span className="w-1 h-1 bg-white/50 rounded-full" />
            <Link to="/marketplace" className="hover:text-white underline underline-offset-4">Explore top sellers</Link>
          </div>
        </div>
      </section>

      {/* ── Partner Directory (University Logos) ── */}
      <section className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <p className="text-[#041e42] font-semibold text-sm tracking-widest uppercase mb-8">Trusted by thousands of students at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['UNILAG', 'O.A.U', 'O.U.I', 'UI', 'UNIBEN', 'UNN'].map(uni => (
              <span key={uni} className="text-2xl font-black text-[#041e42] tracking-tighter">{uni}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2-Column Features ── */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto px-6 space-y-32">
          
          {/* Feature 1: Escrow */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-[#ff6b00]/10 rounded-2xl flex items-center justify-center">
                <Shield className="text-[#ff6b00]" size={32} />
              </div>
              <h2 className="text-4xl font-bold text-[#041e42] tracking-tight">100% Escrow Protection.</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Never worry about "what I ordered vs what I got". When you pay, the money is held safely by Grind's smart contracts. The seller only gets paid when you confirm you are satisfied with the delivery.
              </p>
              <Link to="/marketplace" className="inline-flex items-center gap-2 text-[#041e42] font-bold hover:text-[#ff6b00] transition-colors">
                Browse secure listings <ArrowRight size={20} />
              </Link>
            </div>
            <div className="flex-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative">
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">Protected</div>
              <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000&auto=format&fit=crop" className="rounded-2xl" alt="Secure Payment" />
            </div>
          </div>

          {/* Feature 2: GrindFlex */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-[#041e42]/10 rounded-2xl flex items-center justify-center">
                <Zap className="text-[#041e42]" size={32} />
              </div>
              <h2 className="text-4xl font-bold text-[#041e42] tracking-tight">Pay Small Small with GrindFlex.</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Want to buy a laptop or hire a premium designer but don't have the full cash upfront? GrindFlex lets you lock in a deal and pay in weekly or monthly installments.
              </p>
              <Link to="/grindflex" className="inline-flex items-center gap-2 text-[#041e42] font-bold hover:text-[#ff6b00] transition-colors">
                Start an installment plan <ArrowRight size={20} />
              </Link>
            </div>
            <div className="flex-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
               <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b">
                   <div className="font-bold text-[#041e42]">MacBook Pro M1 (Used)</div>
                   <div className="text-[#ff6b00] font-bold">₦650,000</div>
                 </div>
                 <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                    <div className="bg-[#041e42] h-full w-[60%]" />
                 </div>
                 <div className="flex justify-between text-sm text-gray-500 font-medium">
                   <span>Paid: ₦390,000</span>
                   <span>Balance: ₦260,000</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Cookie Consent Popup ── */}
      {showCookie && (
        <div className="fixed bottom-6 left-6 max-w-sm bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 z-50">
          <h4 className="font-bold text-[#041e42] mb-2">We value your privacy</h4>
          <p className="text-sm text-gray-600 mb-4">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowCookie(false)} className="flex-1 bg-[#041e42] text-white font-medium py-2 rounded-full hover:bg-[#03142d]">Accept All</button>
            <button onClick={() => setShowCookie(false)} className="flex-1 bg-gray-100 text-[#041e42] font-medium py-2 rounded-full hover:bg-gray-200">Reject</button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#041e42] text-white py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <LogoMark size={32} tone="light" />
            <span className="font-bold text-2xl tracking-tight">Grind</span>
          </div>
          <p className="text-white/60 max-w-sm">The trustless campus gig economy. Safe, fast, and built for students.</p>
        </div>
      </footer>
    </div>
  );
};
