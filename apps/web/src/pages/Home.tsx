import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Shield, X, Menu, Star,
  CheckCircle2, TrendingUp, Users, Lock, Briefcase, Award, Download
} from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';
import { FeatureSteps } from '../components/blocks/feature-section';
import { AccordionFeature } from '../components/blocks/accordion-feature-section';
import { HustleDashboard } from '../components/common/HustleDashboard';

// ── Hidden admin trigger — 6 taps in 4 seconds on the footer dot ─────────────
const ADMIN_PATH = '/xk9-admin-console-7f3a';
export const useAdminTap = () => {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);
  return () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 4000), now];
    if (taps.current.length >= 6) { taps.current = []; navigate(ADMIN_PATH); }
  };
};
const AdminDot = () => {
  const tap = useAdminTap();
  return <button onClick={tap} aria-hidden tabIndex={-1} className="block mx-auto mt-6 w-2 h-2 rounded-full bg-white opacity-[0.05] hover:opacity-[0.15] cursor-default" />;
};

// ── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/services',   label: 'Services' },
  { to: '/campus',     label: 'Campus' },
  { to: '/live',       label: 'Live' },
];

const SERVICES = [
  'Content Creation', 'Graphic Design', 'Video Editing', 'Web Development',
  'Tutoring', 'Beauty & Hair', 'Music & Audio', 'Writing',
  'Data Analysis', 'Delivery', 'Hostel Runs', 'Printing',
];

const PRODUCTS = [
  'Fashion & Thrift', 'Food & Catering', 'Phones & Gadgets',
  'Beauty & Hair', 'Laptops & Gadgets', 'Textbooks & Courses',
  'Campus Housing', 'Printing & Binding', 'Health & Fitness', 'Eyewear',
];

const SELLERS = [
  { name: 'Chidera O.', skill: 'Brand Designer', rating: 4.9, reviews: 87, uni: 'UNILAG', avatar: 'C', handle: '@chidera.designs' },
  { name: 'Amara B.', skill: 'Content Creator', rating: 5.0, reviews: 121, uni: 'UI', avatar: 'A', handle: '@amara.b' },
  { name: 'Tunde F.', skill: 'IELTS Tutor', rating: 4.9, reviews: 43, uni: 'OAU', avatar: 'T', handle: '@tunde_f' },
];

const STEPS = [
  { step: '01', title: 'Create your free account', content: 'Sign up in 30 seconds. Pick whether you want to earn, buy, or sell. You can do all three.', image: '/hero/hero4_library.jpg' },
  { step: '02', title: 'Find what you need', content: 'Browse listings from verified Nigerian students. Every seller has a real GrindScore.', image: '/section/work-campus-designer.jpg' },
  { step: '03', title: 'Pay safe, always', content: 'Your money locks in escrow the moment you pay. The other side gets nothing until you approve.', image: '/hero/hero6_success.jpg' },
  { step: '04', title: 'Release and review', content: 'Happy? Release the funds. Leave a review. Your GrindScore grows with every good transaction.', image: '/section/work-campus-collaboration.jpg' },
];

const PROOF_FEATURES = [
  { id: 1, title: 'Your GrindScore is your CV', image: '/section/ui-main-gate.jpg', description: 'Every completed job, positive review, and on-time delivery builds your score. Employers and clients see real verified work, not just words on paper.', badge: 'Proof of Work' },
  { id: 2, title: 'Only real Nigerian students', image: '/section/ui-faculty-of-arts-library.jpg', description: 'Every user verifies their student email and university. No catfish. No ghost sellers. If something goes wrong, there is a real person accountable.', badge: 'Verification' },
  { id: 3, title: 'A portfolio that proves it', image: '/section/ui-wole-soyinka-theatre.jpg', description: 'Completed projects land on your public Grind profile automatically. Show it to employers, clients, internships — it is the most honest portfolio you can build.', badge: 'Portfolio' },
  { id: 4, title: 'GrindFlex: pay small small', image: '/section/work-campus-collaboration.jpg', description: 'GrindFlex splits any purchase into weekly or monthly payments. Secured by escrow. Sellers get paid as milestones hit.', badge: 'GrindFlex' },
  { id: 5, title: 'Campus Connect: link up', image: '/section/work-campus-designer.jpg', description: 'Post what you are working on, find a study partner, announce a stroll, or simply stay in the loop with what is happening around campus.', badge: 'Community' },
];

const STATS = [
  { v: '₦50k+', l: 'Paid to students' },
  { v: '48+', l: 'Active listings' },
  { v: '3+', l: 'Students registered' },
  { v: '4.9', l: 'Average satisfaction' },
];

const UNIS = ['UNILAG', 'O.A.U', 'OUI', 'UNIBEN', 'UNN', 'ABU ZARIA', 'UNILORIN', 'FUTA', 'EKSU', 'COVENANT'];

const HERO_IMAGES = [
  '/hero/hero1_oau.jpg', '/hero/hero2_tech.jpg', '/hero/hero3_creative.jpg',
  '/hero/hero4_library.jpg', '/hero/hero5_hustle.jpg', '/hero/hero6_success.jpg',
];

// ── PWA install prompt ────────────────────────────────────────────────────────
function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  return { canInstall: !!prompt && !installed, install };
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Home = () => {
  const [search, setSearch]       = useState('');
  const [menuOpen, setMenuOpen]   = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [user, setUser]           = useState<any>(null);
  const [showCookie, setShowCookie] = useState(() => {
    try { return !sessionStorage.getItem('grind_cookie_ok'); } catch { return true; }
  });
  const navigate = useNavigate();
  const { canInstall, install } = useInstallPrompt();

  useEffect(() => {
    try {
      const s = localStorage.getItem('grind_user');
      if (s) setUser(JSON.parse(s));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    HERO_IMAGES.forEach((src) => { const img = new Image(); img.src = src; });
    const id = setInterval(() => {
      if (document.visibilityState === 'visible')
        setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => { localStorage.removeItem('grind_user'); setUser(null); navigate('/login'); };
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); navigate(`/marketplace?q=${encodeURIComponent(search)}`); };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top notice bar ── */}
      <div className="bg-[#0D0D14] text-white/70 text-xs text-center py-2.5 px-4 flex items-center justify-center gap-6">
        <span className="flex items-center gap-1.5"><Shield size={11} className="text-[#00A651]" /> Every transaction is escrow-protected</span>
        {canInstall && (
          <button onClick={install} className="flex items-center gap-1.5 text-[#00A651] font-bold hover:text-white transition-colors">
            <Download size={11} /> Add to home screen
          </button>
        )}
      </div>

      {/* ── NAVBAR — dark, clean, matches reference image ── */}
      <header className="sticky top-0 z-50 bg-[#0D0D14]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">

          {/* Logo + wordmark */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark size={28} tone="light" />
            <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-white font-bold text-lg tracking-tight">Grind</span>
          </Link>

          {/* Desktop nav links — clean, no underlines, tight */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="text-white/60 hover:text-white text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#00A651] flex items-center justify-center text-white font-bold text-xs">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span>{user.name || 'Profile'}</span>
                </Link>
                <button onClick={handleLogout} className="text-white/40 hover:text-white text-sm font-medium transition-colors">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Log in</Link>
                <Link to="/signup" className="bg-[#00A651] hover:bg-[#008040] text-white font-bold text-sm px-5 py-2 rounded-full transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden text-white/70 hover:text-white p-1.5 -mr-1" aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0D0D14] border-t border-white/[0.06] px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className="px-3 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-white/[0.06] mt-1">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-white/70 text-sm font-semibold py-2.5 rounded-full border border-white/10">Profile</Link>
                  <button onClick={handleLogout} className="flex-1 text-center text-white text-sm font-bold py-2.5 rounded-full bg-red-700">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-white/70 text-sm font-semibold py-2.5 rounded-full border border-white/10">Log in</Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-white text-sm font-bold py-2.5 rounded-full bg-[#00A651]">Get started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0D0D14]">
        {/* Background images — crossfade */}
        {HERO_IMAGES.map((src, i) => (
          <img key={src} src={src} alt="" aria-hidden decoding="async" loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out will-change-[opacity] ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`} />
        ))}
        {/* Overlay — heavier at top for navbar legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D14]/80 via-[#0D0D14]/55 to-[#0D0D14]/75" />
        {/* Subtle green tint bottom-right */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#00A651]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-[860px] mx-auto px-6 text-center pt-16">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/80 text-xs font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-[#00A651] rounded-full animate-pulse" />
            Nigeria's campus hustle platform
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black text-white leading-[1.0] tracking-[-0.04em] mb-6">
            Built for the<br />
            <span className="text-[#00A651]">ones who grind.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 font-normal mb-10 max-w-xl mx-auto leading-relaxed">
            Post a gig. Earn real money. Build a rep that follows you past campus.
            Every kobo stays locked until the work gets done.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch}
            className="flex bg-white rounded-2xl overflow-hidden max-w-2xl mx-auto shadow-2xl shadow-black/40 mb-6 border border-white/10">
            <div className="flex-1 flex items-center px-5 min-w-0">
              <Search className="text-gray-400 mr-3 shrink-0" size={18} />
              <input type="text" placeholder="Search gigs, services, products…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-base text-gray-900 outline-none bg-transparent placeholder:text-gray-400 min-w-0 py-4" />
            </div>
            <button type="submit"
              className="bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold px-6 py-4 text-sm transition-colors shrink-0">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white/50 text-xs font-medium">
            {['100% Escrow', 'Verified students', 'GrindFlex payments', 'Instant withdrawals'].map(f => (
              <span key={f} className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#00A651]" />{f}</span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-12 bg-white/40" />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-[#0D0D14] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.l} className="text-center">
              <div style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl font-black text-white mb-1">{s.v}</div>
              <div className="text-white/40 text-xs font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── University marquee ── */}
      <section className="bg-white border-b border-gray-100 py-8 overflow-hidden">
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase font-semibold mb-6">Students grinding at</p>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee gap-14 md:gap-24">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {UNIS.map(u => (
                  <span key={u + i} className="text-xl font-black text-gray-200 tracking-tighter whitespace-nowrap uppercase">{u}</span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hustle dashboard: Sapa Meter · Daily Spin · Seller of the Week ── */}
      <HustleDashboard />

      {/* ── Categories ── */}
      <section className="py-20 bg-[#F7F8FA] border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00A651] mb-3">Everything in one place</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-[#0D0D14] tracking-tight mb-3">
              On campus. On demand.
            </h2>
            <p className="text-gray-500 text-base max-w-lg">Skills, products, and services — all from verified Nigerian students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[{ title: 'Services', icon: Briefcase, items: SERVICES, base: '/services' }, { title: 'Products & Marketplace', icon: TrendingUp, items: PRODUCTS, base: '/marketplace' }].map(col => (
              <div key={col.title}>
                <div className="flex items-center gap-2 mb-5">
                  <col.icon size={16} className="text-[#0D0D14]" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#0D0D14]">{col.title}</h3>
                </div>
                <div className="space-y-1.5">
                  {col.items.map(item => (
                    <Link key={item} to={`${col.base}?cat=${encodeURIComponent(item)}`}
                      className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm transition-all group">
                      <span className="text-gray-600 font-medium text-sm group-hover:text-[#0D0D14] transition-colors">{item}</span>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#00A651] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-4 border-b border-gray-100">
        <FeatureSteps features={STEPS} title="How it works" titleClassName="font-display" autoPlayInterval={4500} />
      </section>

      {/* ── Sellers ── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#00A651] mb-3">Talent on campus</p>
              <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-[#0D0D14] tracking-tight">
                Meet your next hire
              </h2>
              <p className="text-gray-500 mt-2 text-base">Top-rated student freelancers from across Nigeria.</p>
            </div>
            <Link to="/marketplace?sort=Highest+Rated"
              className="flex items-center gap-2 text-[#0D0D14] font-bold text-sm border border-gray-200 px-5 py-3 rounded-full hover:border-gray-400 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SELLERS.map(s => (
              <Link key={s.name} to={`/marketplace?q=${encodeURIComponent(s.name)}`}
                className="bg-gray-50 border border-gray-100 hover:border-[#00A651]/30 rounded-2xl p-5 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#0D0D14] text-white flex items-center justify-center font-bold">{s.avatar}</div>
                  <div>
                    <p className="font-bold text-[#0D0D14] text-sm">{s.name}</p>
                    <p className="text-gray-500 text-xs">{s.skill} · {s.uni}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={13} fill="#F59E0B" className="text-yellow-500" />
                    <span className="text-gray-600 text-xs font-medium">{s.rating} ({s.reviews})</span>
                  </div>
                  <span className="text-[#00A651] text-xs font-bold bg-[#00A651]/8 px-2 py-0.5 rounded-full">Top Rated</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="block text-center bg-[#0D0D14] group-hover:bg-[#00A651] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                    Connect
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-6">Prices are agreed directly with each seller.</p>
        </div>
      </section>

      {/* ── Proof of work accordion ── */}
      <AccordionFeature
        features={PROOF_FEATURES}
        heading="Grind is more than a marketplace"
        headingClassName="font-display"
        subheading="It is proof that you showed up, delivered, and earned it."
      />

      {/* ── Escrow feature ── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center">
              <Lock className="text-[#0D0D14]" size={24} />
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-[#0D0D14] tracking-tight leading-tight">
              Your money never moves until you say so.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              When you pay on Grind, the money goes into a secure escrow vault — not to the seller.
              They only get it when you confirm the work is exactly what was promised.
            </p>
            <Link to="/marketplace" className="inline-flex items-center gap-2 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
              Browse listings <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -top-3 -right-3 bg-[#00A651] text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg z-10 flex items-center gap-1.5">
              <Shield size={12} /> Protected
            </div>
            <img src="/hero/hero2_tech.jpg" className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]" alt="Campus developer paid through Grind escrow" />
          </div>
        </div>
      </section>

      {/* ── GrindFlex ── */}
      <section className="py-24 bg-[#F7F8FA] border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-white p-7 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex justify-between items-center pb-5 mb-5 border-b border-gray-100">
              <div><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Active plan</p><p className="font-black text-[#0D0D14]">MacBook Pro M1 (Used)</p></div>
              <div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total</p><p className="font-black text-[#0D0D14]">₦650,000</p></div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Progress</p>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="bg-[#00A651] h-full w-[60%] rounded-full" />
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[#00A651]">₦390,000 paid</span>
              <span className="text-gray-400">₦260,000 left</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[1, 2, 3].map(n => (
                <div key={n} className={`text-center p-3 rounded-xl ${n <= 2 ? 'bg-[#00A651]/8 text-[#00A651]' : 'bg-gray-50 text-gray-300'}`}>
                  <CheckCircle2 size={15} className="mx-auto mb-1" />
                  <p className="text-xs font-bold">Week {n}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="w-12 h-12 bg-[#0D0D14] rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-white" size={22} />
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-[#0D0D14] tracking-tight leading-tight">
              Pay small small with GrindFlex.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Can't afford the full amount upfront? GrindFlex splits any purchase into weekly or monthly payments, all secured by escrow.
            </p>
            <Link to="/grindflex" className="inline-flex items-center gap-2 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
              Start a flex plan <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Leaderboard CTA ── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-[#0D0D14] rounded-full flex items-center justify-center mx-auto mb-8">
            <Award className="text-white" size={32} />
          </div>
          <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-[#0D0D14] tracking-tight mb-5">
            Your score. Your legacy.
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            The Grind Leaderboard shows the top earners across Nigerian campuses. Make your name.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="bg-[#0D0D14] hover:bg-[#00A651] text-white font-black px-8 py-4 rounded-full text-base transition-colors">
              Start earning today
            </Link>
            <Link to="/leaderboard" className="border-2 border-gray-200 hover:border-[#0D0D14] text-[#0D0D14] font-black px-8 py-4 rounded-full text-base transition-colors">
              View leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-[#F7F8FA] border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl font-black text-[#0D0D14] tracking-tight mb-12 text-center">
            Real students. Real results.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Chisom A.', uni: 'UNN, 400L', text: 'I made over ₦200,000 in one semester from just graphic design. The escrow meant no client ever ran away with my work again.' },
              { name: 'Kunle O.', uni: 'UNILAG, Engineering', text: 'As a buyer, escrow is everything. I hired a developer and knew my money was safe until I approved the final result. Zero stress.' },
              { name: 'Ngozi B.', uni: 'OAU, MBA', text: 'GrindFlex let me buy a laptop for my thesis without emptying my account. Paid weekly, now I own it outright.' },
            ].map(t => (
              <div key={t.name} className="bg-white p-7 rounded-2xl border border-gray-100">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" className="text-yellow-500" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0D0D14] text-white flex items-center justify-center font-bold text-sm">{t.name[0]}</div>
                  <div><p className="font-bold text-[#0D0D14] text-sm">{t.name}</p><p className="text-gray-400 text-xs">{t.uni}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#0D0D14] py-24 text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            Ready to start?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Join the students already earning, buying and connecting on Nigeria's most trusted campus platform.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-3 bg-[#00A651] hover:bg-[#008040] text-white font-black text-lg px-10 py-4 rounded-full transition-colors shadow-xl shadow-[#00A651]/20">
            Create free account <ArrowRight size={20} />
          </Link>
          <p className="text-white/20 text-xs mt-5">No credit card. Free to join.</p>
        </div>
      </section>

      {/* ── Founder's desk ── */}
      <section className="bg-[#0D0D14] pb-20 px-6 border-t border-white/5">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                  <LogoMark size={44} tone="light" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">Founder, Grind</p>
                  <p className="text-white/30 text-xs">Reply within 24h</p>
                </div>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
                  Not sure where to start? Ask me.
                </h2>
                <p className="text-white/50 text-base leading-relaxed mb-6">
                  Confused which skill to learn? Got a business idea and need direction? Message me on WhatsApp.
                  I personally read every message from students and aspiring founders.
                </p>
                <a href="https://wa.me/2348072027335?text=Hi%2C+I%27m+a+student+and+I%27d+love+some+advice."
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold px-7 py-3.5 rounded-full text-sm transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0D0D14] border-t border-white/5 py-16">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <LogoMark size={26} tone="light" />
              <span style={{ fontFamily: "'Syne',sans-serif" }} className="text-white font-bold text-lg tracking-tight">Grind</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-[260px] mb-5">
              Way for poor people. The trustless campus gig economy for Nigerian students.
            </p>
            <div className="flex gap-2.5">
              {[
                { href: 'https://x.com/', label: 'X', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { href: 'https://instagram.com/', label: 'Instagram', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> },
                { href: 'https://wa.me/2348072027335', label: 'WhatsApp', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#00A651] flex items-center justify-center text-white transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: ['/marketplace', '/gigs', '/requests', '/services', '/campus', '/live', '/grindflex', '/leaderboard'].map((to, i) => ({ to, label: ['Marketplace', 'Gigs', 'Requests', 'Services', 'Campus', 'Live', 'GrindFlex', 'Leaderboard'][i] })) },
            { title: 'Support', links: ['/support', '/legal/safety-center', '/legal/buyer-protection'].map((to, i) => ({ to, label: ['Help Center', 'Safety Center', 'Buyer Protection'][i] })) },
            { title: 'Legal', links: ['/legal/privacy-policy', '/legal/terms-of-service', '/legal/escrow-agreement'].map((to, i) => ({ to, label: ['Privacy Policy', 'Terms of Service', 'Escrow Agreement'][i] })) },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white/40 text-xs font-black uppercase tracking-widest mb-5">{col.title}</h4>
              <ul className="space-y-3.5">
                {col.links.map(l => (
                  <li key={l.to}><Link to={l.to} className="text-white/40 hover:text-white text-sm font-medium transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1400px] mx-auto px-6 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-white/20 text-xs">
          <span>© {new Date().getFullYear()} Grind Africa Ltd. All rights reserved.</span>
          <span>Made for Nigerian campus hustlers.</span>
        </div>
        <AdminDot />
      </footer>

      {/* Cookie bar */}
      {showCookie && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 bg-[#0D0D14] border border-white/10 rounded-2xl p-5 z-50 shadow-2xl">
          <p className="text-white text-sm font-semibold mb-1.5">Cookies</p>
          <p className="text-white/50 text-xs leading-relaxed mb-4">We use cookies to personalise your experience. <Link to="/legal/cookie-policy" className="text-[#00A651] hover:underline">Learn more</Link>.</p>
          <div className="flex gap-2">
            <button onClick={() => { try { sessionStorage.setItem('grind_cookie_ok', '1'); } catch {} setShowCookie(false); }}
              className="flex-1 bg-[#00A651] hover:bg-[#008040] text-white font-bold py-2 rounded-xl text-xs transition-colors">Accept</button>
            <button onClick={() => setShowCookie(false)} className="flex-1 bg-white/8 hover:bg-white/12 text-white/70 py-2 rounded-xl text-xs transition-colors">Decline</button>
          </div>
        </div>
      )}
    </div>
  );
};
