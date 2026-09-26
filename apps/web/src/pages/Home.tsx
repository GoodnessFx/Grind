import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Shield, Zap, Download, X, SearchCheck,
  Star, CheckCircle2, TrendingUp, Users, Lock, Globe, Briefcase, Award
} from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';
import { FeatureSteps } from '../components/blocks/feature-section';
import { AccordionFeature } from '../components/blocks/accordion-feature-section';

// ── Hidden admin trigger ─────────────────────────────────────────────────────
// Invisible 6px dot in the footer. Tap / click it 6 times inside 4 seconds to
// open the admin console. There is no visible link, label or shortcut to it.
const ADMIN_PATH = '/xk9-admin-console-7f3a';
const ADMIN_TAPS = 6;
const ADMIN_TAP_WINDOW_MS = 4000;

export const useAdminTap = (requiredTaps = ADMIN_TAPS, windowMs = ADMIN_TAP_WINDOW_MS) => {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);
  return () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < windowMs), now];
    if (taps.current.length >= requiredTaps) {
      taps.current = [];
      navigate(ADMIN_PATH);
    }
  };
};

const AdminDot = () => {
  const handleTap = useAdminTap();
  return (
    <button
      type="button"
      onClick={handleTap}
      aria-hidden="true"
      tabIndex={-1}
      title=""
      className="block mx-auto mt-6 w-[8px] h-[8px] rounded-full bg-white opacity-[0.06] hover:opacity-[0.16] cursor-default"
    />
  );
};

// ── Static Data ──────────────────────────────────────────────────────────────
const SERVICES_CATEGORIES = [
  { label: 'Web Design & Dev', count: '340+' },
  { label: 'Graphic Design', count: '280+' },
  { label: 'Content Writing', count: '195+' },
  { label: 'Video Editing', count: '142+' },
  { label: 'Photography', count: '98+' },
  { label: 'UI/UX Design', count: '130+' },
  { label: 'Data Analysis', count: '85+' },
  { label: 'Python & Automation', count: '64+' },
  { label: 'Mobile App Dev', count: '72+' },
  { label: 'Cybersecurity', count: '41+' },
  { label: '3D & Motion Graphics', count: '55+' },
  { label: 'Virtual Assistance', count: '160+' },
  { label: 'Copywriting', count: '118+' },
  { label: 'SEO & Digital Marketing', count: '92+' },
  { label: 'Cloud & DevOps', count: '38+' },
  { label: 'Tutoring & Teaching', count: '210+' },
  { label: 'Music & Audio', count: '76+' },
  { label: 'Social Media Mgmt', count: '120+' },
];

const PRODUCT_CATEGORIES = [
  { label: 'Laptops & Gadgets', count: '85+' },
  { label: 'Textbooks & Courses', count: '430+' },
  { label: 'Fashion & Clothing', count: '190+' },
  { label: 'Food & Catering', count: '65+' },
  { label: 'Event Planning', count: '44+' },
  { label: 'Accommodation', count: '32+' },
  { label: 'Transport & Rides', count: '57+' },
  { label: 'Printing & Binding', count: '89+' },
];

const FEATURED_SELLERS = [
  { name: 'Chidera O.', skill: 'Brand Designer', rating: 4.9, reviews: 87, uni: 'UNILAG', avatar: 'C', badge: 'Top Rated', price: '₦15,000/project' },
  { name: 'Emeka A.', skill: 'Full-Stack Dev', rating: 4.8, reviews: 64, uni: 'FUTA', avatar: 'E', badge: 'Verified Pro', price: '₦25,000/project' },
  { name: 'Amara B.', skill: 'Video Editor', rating: 5.0, reviews: 121, uni: 'UI', avatar: 'A', badge: 'Top Rated', price: '₦10,000/project' },
  { name: 'Tunde F.', skill: 'IELTS Tutor', rating: 4.9, reviews: 43, uni: 'OAU', avatar: 'T', badge: 'New Star', price: '₦5,000/session' },
];

const GRIND_FEATURES = [
  {
    step: 'Step 1',
    title: 'Create Your Free Account',
    content: 'Sign up in 30 seconds with your school email or Google. Choose whether you want to buy, sell, or both — you can always switch later.',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop',
  },
  {
    step: 'Step 2',
    title: 'Discover Verified Talent & Products',
    content: 'Browse hundreds of listings from verified Nigerian students. Filter by university, price, or category. Every seller has a Grind Score you can trust.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
  },
  {
    step: 'Step 3',
    title: 'Pay Safely Through Escrow',
    content: 'Your payment is locked securely in Grind\'s Escrow vault. The seller cannot touch the money until you confirm you are 100% satisfied.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1600&auto=format&fit=crop',
  },
  {
    step: 'Step 4',
    title: 'Release Funds & Leave a Review',
    content: 'Once you\'re happy with your order, release the funds with one click. Leave a review to help others, and build your Grind Score with every interaction.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
  },
];

const PROOF_OF_WORK_FEATURES = [
  {
    id: 1,
    title: 'Your Grind Score is Your CV',
    image: '/section/ui-main-gate.jpg',
    description:
      'Every completed order, positive review, and on-time delivery contributes to your Grind Score. It is a real, verifiable reputation that follows you beyond campus — into internships, jobs, and partnerships.',
    badge: 'Proof of Work',
  },
  {
    id: 2,
    title: 'Verified Student Profiles',
    image: '/section/ui-faculty-of-arts-library.jpg',
    description:
      'Every user on Grind verifies their student email and university. This means every buyer and seller is a real, accountable Nigerian student. No catfishes, no scammers.',
    badge: 'Verification',
  },
  {
    id: 3,
    title: 'Build a Portfolio That Matters',
    image: '/section/ui-wole-soyinka-theatre.jpg',
    description:
      'Completed projects are automatically added to your public Grind Portfolio. Show employers and clients real work you\'ve done, rated by real people. It\'s the most honest portfolio you can build.',
    badge: 'Portfolio',
  },
  {
    id: 4,
    title: 'GrindFlex: Installment Payments',
    image: '/section/work-campus-collaboration.jpg',
    description:
      'GrindFlex lets buyers purchase high-value items or services in flexible weekly or monthly payments — all secured by Escrow. Sellers get paid as milestones are completed.',
    badge: 'GrindFlex',
  },
  {
    id: 5,
    title: 'Social Connect — Link Up & Vibe',
    image: '/section/work-campus-designer.jpg',
    description:
      'Grind isn\'t just a marketplace. Connect with students on Campus Connect — post what you\'re working on, find a study partner, or simply say you\'re going for a stroll and see who links up.',
    badge: 'Community',
  },
];

const STATS = [
  { v: '₦850k+', l: 'Paid to students' },
  { v: '120+', l: 'Active listings' },
  { v: '500+', l: 'Registered users' },
  { v: '4.9/5', l: 'Average satisfaction' },
];

// ── Hero background imagery ──────────────────────────────────────────────────
// Six Nigerian campus / grind photographs crossfading on a 6s loop.
// Every frame is stacked and only opacity changes, so the hero is never blank
// mid-transition (no unmount/remount, no video buffering, no flash).
const HERO_IMAGES = [
  '/hero/hero1_oau.jpg',       // Obafemi Awolowo University — Oduduwa Hall
  '/hero/hero2_tech.jpg',      // Nigerian tech hub, students shipping code
  '/hero/hero3_creative.jpg',  // Creative students working together on campus
  '/hero/hero4_library.jpg',   // University of Ibadan library —study grind
  '/hero/hero5_hustle.jpg',    // University of Ibadan — campus hustle & delivery
  '/hero/hero6_success.jpg',   // University of Ibadan — graduates, laptops in hand
];
const HERO_INTERVAL_MS = 6000;

// ── Component ─────────────────────────────────────────────────────────────────
export const Home = () => {
  const [search, setSearch] = useState('');
  const [showCookie, setShowCookie] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const stored = localStorage.getItem('grind_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Rotate the hero imagery. All six frames stay mounted (stacked) and only the
  // opacity changes, so there is always a fully painted image behind the copy —
  // the hero can never flash/blank between slides.
  React.useEffect(() => {
    // Warm the cache up-front so the very first crossfades are instant.
    HERO_IMAGES.forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });

    const id = window.setInterval(() => {
      // Skip while the tab is hidden — no point animating off-screen.
      if (document.visibilityState === 'visible') {
        setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
      }
    }, HERO_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('grind_user');
    setUser(null);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/marketplace?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif] relative">

      {/* ── App Install Banner ── */}
      {showBanner && (
        <aside className="bg-black text-white py-2.5 px-4 flex justify-between items-center text-sm font-medium z-50 relative">
          <div className="flex items-center gap-4">
            <span className="text-green-400 flex items-center gap-1"><Shield size={14} /> Secure Escrow</span>
            <span className="hidden md:inline text-white/80">Trustless campus marketplace for Nigerian students.</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 bg-black hover:bg-[#006400] px-4 py-1 rounded-full transition-colors text-xs font-bold">
              <Download size={12} /> Get the App
            </button>
            <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-white p-1"><X size={14} /></button>
          </div>
        </aside>
      )}

      {/* ── Navbar ── */}
      <header className="absolute top-10 w-full z-40 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark size={40} tone="light" />
            <span className="text-white font-bold text-2xl tracking-tight">Grind</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/marketplace" className="text-white/90 hover:text-white font-medium transition-colors">Marketplace</Link>
            <Link to="/marketplace" className="text-white/90 hover:text-white font-medium transition-colors">Services</Link>
            <Link to="/admin" className="text-white/90 hover:text-white font-medium transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--grind-primary)] text-white flex items-center justify-center font-bold text-sm">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span>{user.name || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-black hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full transition-colors shadow-lg"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/90 hover:text-white font-medium transition-colors">Log in</Link>
                <Link
                  to="/signup"
                  className="bg-black hover:bg-[#006400] text-white font-bold px-6 py-2.5 rounded-full transition-colors shadow-lg shadow-[var(--grind-nigeria)]/30"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#020d1f]">
          {/* Six Nigerian campus / grind photographs, stacked and cross-fading.
              Every frame stays mounted and only its opacity animates, so a fully
              painted image is always behind the hero copy — it never blanks. */}
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out will-change-[opacity] ${
                i === heroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/45 to-[#006400]/40" />
        </div>

        <div className="relative z-10 w-full max-w-[900px] mx-auto px-6 text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Nigeria's #1 Campus Gig Economy
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-5">
            Built for Campus<br />
            <span className="text-[#60a5fa]">Grinders.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/75 font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
            LinkedIn meets X for Nigerian students who grind. Sell your skills, buy from trusted coursemates, and start that business you keep dreaming about. Every kobo stays locked in escrow until the job is done right.
          </p>

          <form onSubmit={handleSearch} className="flex bg-white rounded-full p-1.5 max-w-2xl mx-auto shadow-2xl mb-5">
            <div className="flex-1 flex items-center px-5">
              <Search className="text-gray-400 mr-3 shrink-0" size={22} />
              <input
                type="text"
                placeholder="Search for web design, tutoring, laptops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-lg text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-black hover:bg-[#006400] text-white font-bold px-8 py-3.5 rounded-full transition-all text-base flex items-center gap-2 shadow-lg"
            >
              Search <SearchCheck size={20} />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/70 text-sm font-medium">
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> 100% Escrow</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> Verified Students Only</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> GrindFlex Installments</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> Instant Withdrawals</span>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-black text-white py-8">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-black mb-1">{s.v}</div>
              <div className="text-blue-200 text-sm font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Partner Marquee ── */}
      <section className="bg-white border-b border-gray-100 py-10 overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-gray-400 font-semibold text-xs tracking-widest uppercase">Trusted by thousands of students at</p>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee gap-16 md:gap-32">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {['UNILAG', 'O.A.U', 'OUI', 'UNIBEN', 'UNN', 'ABU ZARIA', 'UNILORIN', 'FUTA', 'EKSU', 'COVENANT'].map(uni => (
                  <span key={uni + i} className="text-2xl font-black text-gray-300 tracking-tighter whitespace-nowrap uppercase">{uni}</span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flippa-style Categories Section ── */}
      <section className="py-20 bg-[#f8fafc] border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[var(--grind-primary)] tracking-tight mb-4">Everything You Need, On Campus</h2>
            <p className="text-xl text-gray-500">From digital skills to physical products — find it all on Grind.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Services Column */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Briefcase size={20} className="text-black" />
                <h3 className="text-sm font-black text-[var(--grind-primary)] uppercase tracking-widest">Services</h3>
              </div>
              <div className="space-y-3">
                {SERVICES_CATEGORIES.map(cat => (
                  <Link
                    key={cat.label}
                    to={`/marketplace?cat=${encodeURIComponent(cat.label)}`}
                    className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <span className="text-gray-700 font-medium group-hover:text-[var(--grind-primary)] transition-colors">{cat.label}</span>
                    <span className="text-black text-sm font-bold">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Products Column */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Globe size={20} className="text-black" />
                <h3 className="text-sm font-black text-[var(--grind-primary)] uppercase tracking-widest">Products & Marketplace</h3>
              </div>
              <div className="space-y-3">
                {PRODUCT_CATEGORIES.map(cat => (
                  <Link
                    key={cat.label}
                    to={`/marketplace?cat=${encodeURIComponent(cat.label)}`}
                    className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <span className="text-gray-700 font-medium group-hover:text-[var(--grind-primary)] transition-colors">{cat.label}</span>
                    <span className="text-black text-sm font-bold">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Animated Feature Steps (How it Works) ── */}
      <section className="bg-white py-4 border-b border-gray-100">
        <FeatureSteps
          features={GRIND_FEATURES}
          title="Your Journey Starts Here"
          autoPlayInterval={4500}
        />
      </section>

      {/* ── Featured Sellers Section ── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4">
            <div>
              <p className="text-black font-bold text-sm uppercase tracking-widest mb-3">Talent on Campus</p>
              <h2 className="text-4xl font-black text-black tracking-tight">Meet Your Next Hire</h2>
              <p className="text-black/60 mt-3 text-lg">Top-rated student freelancers across Nigeria's campuses.</p>
            </div>
            <Link to="/marketplace" className="flex items-center gap-2 text-black hover:text-black font-bold transition-colors border border-gray-300 px-6 py-3 rounded-full hover:border-gray-500">
              View All Sellers <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_SELLERS.map(seller => (
              <Link
                key={seller.name}
                to="/marketplace"
                className="bg-gray-50 border border-gray-100 hover:border-[#006400]/50 hover:bg-gray-100 rounded-2xl p-6 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--grind-primary)] text-white flex items-center justify-center font-bold text-xl">
                    {seller.avatar}
                  </div>
                  <div>
                    <h4 className="text-black font-bold">{seller.name}</h4>
                    <p className="text-gray-500 text-sm">{seller.uni}</p>
                  </div>
                </div>
                <p className="text-gray-700 font-medium mb-4">{seller.skill}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-gray-600 text-sm font-medium">{seller.rating} ({seller.reviews})</span>
                  </div>
                  <span className="text-[#006400] text-xs font-bold bg-[#006400]/10 px-2 py-1 rounded-full">{seller.badge}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-black font-bold text-sm">{seller.price}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accordion Feature Section (Proof of Work / Why Grind?) ── */}
      <AccordionFeature
        features={PROOF_OF_WORK_FEATURES}
        heading="Grind Is More Than a Marketplace"
        subheading="It is proof that you showed up, delivered, and earned it. Every feature on Grind is designed to give you a real shot."
      />

      {/* ── 2-Column Feature Highlights ── */}
      <section className="py-28 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 space-y-32">

          {/* Escrow Feature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Lock className="text-black" size={32} />
              </div>
              <h2 className="text-4xl font-black text-[var(--grind-primary)] tracking-tight leading-tight">
                100% Escrow Protection. Every Time.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                When you pay on Grind, your money goes into a secure Escrow vault — not to the seller. 
                The seller only gets paid when <em>you</em> confirm you received exactly what was promised. Zero risk of being defrauded.
              </p>
              <Link to="/marketplace" className="inline-flex items-center gap-2 bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-[var(--grind-nigeria)] transition-colors">
                Browse Secure Listings <ArrowRight size={18} />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg z-10 flex items-center gap-2">
                <Shield size={14} /> Protected
              </div>
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000&auto=format&fit=crop"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
                alt="Secure payment"
              />
            </div>
          </div>

          {/* GrindFlex Feature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center pb-5 mb-5 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Active Plan</p>
                    <p className="font-black text-[var(--grind-primary)] text-lg">MacBook Pro M1 (Used)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total</p>
                    <p className="text-black font-black text-lg">₦650,000</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Progress</p>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-3">
                  <div className="bg-[#006400] h-full w-[60%] rounded-full" />
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-green-600">Paid: ₦390,000</span>
                  <span className="text-gray-500">Remaining: ₦260,000</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className={`text-center p-3 rounded-xl ${n <= 2 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                      <CheckCircle2 size={16} className="mx-auto mb-1" />
                      <p className="text-xs font-bold">Week {n}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-16 h-16 bg-[var(--grind-primary)] rounded-2xl flex items-center justify-center">
                <Zap className="text-white" size={32} />
              </div>
              <h2 className="text-4xl font-black text-[var(--grind-primary)] tracking-tight leading-tight">
                Pay Small Small with GrindFlex.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Want a high-value laptop, service, or course but can't pay upfront? GrindFlex splits any purchase into manageable weekly or monthly installments, all protected by Escrow.
              </p>
              <Link to="/grindflex" className="inline-flex items-center gap-2 bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-[var(--grind-nigeria)] transition-colors">
                Start a Flex Plan <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Social Connect Feature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Users className="text-[var(--grind-nigeria)]" size={32} />
              </div>
              <h2 className="text-4xl font-black text-[var(--grind-primary)] tracking-tight leading-tight">
                More Than Gigs. It's a Community.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Campus Connect lets you post casual updates, say you're heading to the library, find a study partner, or simply link up for a stroll. Share your wins and services to your socials too — Instagram, X, WhatsApp.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-2 bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-[var(--grind-nigeria)] transition-colors">
                Join the Community <ArrowRight size={18} />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
                alt="Students community"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Grind Score / Leaderboard CTA ── */}
      <section className="bg-[#f8fafc] py-24 border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30">
            <Award className="text-white" size={40} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--grind-primary)] tracking-tight mb-6">
            Your Score. Your Legacy.
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The Grind Leaderboard celebrates the top earners, most reliable sellers, and highest rated students on the platform. Make your name known across Nigerian campuses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-black hover:bg-blue-700 text-white font-black px-8 py-4 rounded-full transition-colors text-lg shadow-xl shadow-blue-500/25">
              Start Earning Today
            </Link>
            <Link to="/leaderboard" className="border-2 border-[var(--grind-primary)] text-[var(--grind-primary)] hover:bg-[var(--grind-primary)] hover:text-white font-black px-8 py-4 rounded-full transition-all text-lg">
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[var(--grind-primary)] tracking-tight mb-4">Real Students. Real Results.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Chisom A.', uni: 'UNN, 400L', text: 'Grind changed my life. I made over ₦200,000 in one semester from just graphic design jobs. The escrow means no client ever ran away with my work again.', rating: 5 },
              { name: 'Kunle O.', uni: 'UNILAG, Engineering', text: 'As a buyer, the escrow system is everything. I hired a developer and knew my money was safe until I approved the final site. Zero stress.', rating: 5 },
              { name: 'Ngozi B.', uni: 'OAU, MBA', text: 'GrindFlex let me buy a laptop for my thesis without emptying my account. Paid weekly and now I own it outright. This feature is amazing.', rating: 5 },
            ].map(t => (
              <div key={t.name} className="bg-[#f8fafc] p-8 rounded-3xl border border-gray-100">
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="var(--grind-nigeria)" className="text-[var(--grind-nigeria)]" />
                  ))}
                </div>
                <p className="text-gray-700 font-medium mb-6 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--grind-primary)] text-white flex items-center justify-center font-bold">{t.name[0]}</div>
                  <div>
                    <p className="font-bold text-[var(--grind-primary)]">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.uni}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[var(--grind-primary)] py-24 text-center">
        <div className="max-w-[800px] mx-auto px-6">
          <TrendingUp size={48} className="text-black mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
            Ready to Start Your Grind?
          </h2>
          <p className="text-xl text-white/70 mb-10">
            Join 42,000+ students already earning, buying, and connecting on Nigeria's most trusted campus platform.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 bg-black hover:bg-[#006400] text-white font-black text-xl px-12 py-5 rounded-full transition-all shadow-2xl shadow-blue-500/30"
          >
            Create Free Account <ArrowRight size={24} />
          </Link>
          <p className="text-white/40 text-sm mt-6">No credit card required. Free forever for basic use.</p>
        </div>
      </section>

      {/* ── Cookie Consent ── */}
      {showCookie && (
        <div className="fixed bottom-6 left-6 max-w-sm bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-bottom-4">
          <h4 className="font-black text-[var(--grind-primary)] mb-2">We value your privacy</h4>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            We use cookies to enhance your experience, personalize content, and analyze traffic. Read our <a href="#" className="text-[var(--grind-nigeria)] font-medium hover:underline">Cookie Policy</a>.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowCookie(false)} className="flex-1 bg-[var(--grind-primary)] hover:bg-[var(--grind-nigeria)] text-white font-bold py-2.5 rounded-full transition-colors text-sm">Accept All</button>
            <button onClick={() => setShowCookie(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-[var(--grind-primary)] font-bold py-2.5 rounded-full transition-colors text-sm">Decline</button>
          </div>
        </div>
      )}

      {/* ── Founder's Desk ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-black rounded-3xl p-8 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#60a5fa] opacity-10 blur-[80px]" />
            <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start relative z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                  <LogoMark size={56} tone="dark" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">Founder, Grind</p>
                  <p className="text-white/50 text-sm">Message me directly</p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Not sure what to learn? Ask me.</h2>
                <p className="text-white/70 text-lg leading-relaxed mb-4">
                  Confused about which digital skill fits you? Want to add a new skill but don't know where to start? Got a business idea and need direction on how to actually launch it? You are not alone, and you don't have to figure it out by yourself.
                </p>
                <p className="text-white/70 text-lg leading-relaxed mb-8">
                  Message me directly on WhatsApp. I personally read and reply to every student and aspiring business owner who reaches out. No forms, no bots, no middlemen. Just real advice to get you grinding.
                </p>
                <a
                  href="https://wa.me/2348072027335?text=Hi%2C%20I%27m%20a%20student%20and%20I%27d%20love%20some%20advice%20on%20what%20to%20learn%20or%20how%20to%20start%20my%20business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold px-8 py-4 rounded-full transition-colors text-base"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat the Founder on WhatsApp
                </a>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#020d1f] text-white py-20 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <LogoMark size={32} tone="light" />
              <span className="font-bold text-2xl tracking-tight">Grind</span>
            </div>
            <p className="text-white/50 mb-6 font-medium max-w-xs leading-relaxed">The trustless campus gig economy. Built exclusively for Nigerian students who are ready to earn their shot.</p>
            <div className="flex gap-3">
              {['X', 'IG', 'LI', 'TG'].map(s => (
                <button key={s} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--grind-nigeria)] flex items-center justify-center transition-colors text-white text-xs font-black">{s}</button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-white/80">Platform</h4>
            <ul className="space-y-4 text-white/50 font-medium">
              {['Marketplace', 'GrindFlex', 'Leaderboard', 'Dashboard', 'Campus Connect'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-white/80">Support</h4>
            <ul className="space-y-4 text-white/50 font-medium">
              <li><Link to="/support" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Chat with Support</Link></li>
              {['Safety Center', 'Selling on Grind', 'Buyer Protection'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-white/80">Legal</h4>
            <ul className="space-y-4 text-white/50 font-medium">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Escrow Agreement'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-sm">
          <span>&copy; {new Date().getFullYear()} Grind Africa Ltd. All rights reserved.</span>
          <span>Made with care for Nigerian campus hustlers.</span>
        </div>
        <AdminDot />
      </footer>
    </div>
  );
};
