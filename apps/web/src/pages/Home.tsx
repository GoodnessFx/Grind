import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Shield, X, Menu, Star, CheckCircle2, TrendingUp, Lock, Award, Download } from "lucide-react";
import { LogoMark } from "../app/components/brand/LogoMark";
import { FeatureSteps } from "../components/blocks/feature-section";
import { AccordionFeature } from "../components/blocks/accordion-feature-section";

const ADMIN_PATH = "/xk9-admin-console-7f3a";
const AdminDot = () => {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);
  const tap = () => { const now = Date.now(); taps.current = [...taps.current.filter(t => now - t < 4000), now]; if (taps.current.length >= 6) { taps.current = []; navigate(ADMIN_PATH); } };
  return <button onClick={tap} aria-hidden tabIndex={-1} className="block mx-auto mt-6 w-2 h-2 rounded-full bg-white opacity-[0.04] cursor-default" />;
};

const NAV_LINKS = [
  { to: "/gigs", label: "Gigs" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/requests", label: "Requests" },
  { to: "/campus", label: "Campus" },
  { to: "/live", label: "Live" },
];

const SERVICES = ["Content Writing", "Graphic Design", "Video Editing", "Web Development", "Tutoring", "Hair & Beauty", "Music & Audio", "Research"];
const PRODUCTS = ["Fashion & Thrift", "Phones & Gadgets", "Food & Catering", "Textbooks", "Campus Housing", "Printing", "Health Products", "Eyewear"];

const SELLERS = [
  { name: "Chidera O.", skill: "Brand Designer", rating: 4.9, reviews: 87, uni: "UNILAG", avatar: "C", handle: "chidera_designs" },
  { name: "Amara B.", skill: "Content Creator", rating: 5.0, reviews: 121, uni: "UI", avatar: "A", handle: "amara_b" },
  { name: "Tunde F.", skill: "IELTS Tutor", rating: 4.9, reviews: 43, uni: "OAU", avatar: "T", handle: "tunde_f" },
];

const STEPS = [
  { step: "01", title: "Create your free account", content: "Sign up in 30 seconds. Pick whether you want to earn, buy, or sell. All three is fine too.", image: "/hero/hero4_library.jpg" },
  { step: "02", title: "Find what you need", content: "Browse gigs and listings from verified Nigerian students. Every seller has a real GrindScore you can check.", image: "/hero/hero2_tech.jpg" },
  { step: "03", title: "Pay safe — always", content: "Your money locks in escrow the moment you pay. Nobody gets it until you say the work is done.", image: "/hero/hero6_success.jpg" },
  { step: "04", title: "Collect your money", content: "Approve the work, release the funds. It moves to your wallet in seconds. Cash out to any Nigerian bank.", image: "/hero/hero3_creative.jpg" },
];

const PROOF_FEATURES = [
  { id: 1, title: "GrindScore — your real CV", image: "/section/ui-main-gate.jpg", description: "Every completed job, positive review, and on-time delivery builds your score. Employers and clients see real verified work, not just words.", badge: "Proof of Work" },
  { id: 2, title: "Verified Nigerian students only", image: "/section/ui-faculty-of-arts-library.jpg", description: "Every user verifies their student email. No catfish, no ghost sellers. If something goes wrong, there is a real person accountable.", badge: "Verification" },
  { id: 3, title: "Portfolio that proves it", image: "/section/ui-wole-soyinka-theatre.jpg", description: "Completed projects land on your public Grind profile. Show it in your CV, LinkedIn, or bio. It is the most honest portfolio you will ever build.", badge: "Portfolio" },
  { id: 4, title: "GrindFlex — pay small small", image: "/section/work-campus-collaboration.jpg", description: "GrindFlex splits any purchase into weekly or monthly payments. Secured by escrow. Sellers get paid as milestones hit.", badge: "GrindFlex" },
  { id: 5, title: "Campus Connect", image: "/section/work-campus-designer.jpg", description: "Post what you are working on, find a study partner, announce a collab, or stay in the loop with campus gist.", badge: "Community" },
];

const STATS = [{ v: "₦50k+", l: "Paid to students" }, { v: "48+", l: "Active listings" }, { v: "3+", l: "Students registered" }, { v: "4.9", l: "Avg satisfaction" }];
const UNIS = ["UNILAG", "O.A.U", "OUI", "UNIBEN", "UNN", "ABU ZARIA", "UNILORIN", "FUTA", "EKSU", "COVENANT"];
const HERO_IMAGES = ["/hero/hero1_oau.jpg", "/hero/hero2_tech.jpg", "/hero/hero3_creative.jpg", "/hero/hero4_library.jpg", "/hero/hero5_hustle.jpg", "/hero/hero6_success.jpg"];

function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  useEffect(() => { const h = (e: Event) => { e.preventDefault(); setPrompt(e); }; window.addEventListener("beforeinstallprompt", h); return () => window.removeEventListener("beforeinstallprompt", h); }, []);
  const install = async () => { if (!prompt) return; prompt.prompt(); await prompt.userChoice; setPrompt(null); };
  return { canInstall: !!prompt, install };
}

export const Home: React.FC = () => {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showCookie, setShowCookie] = useState(() => { try { return !sessionStorage.getItem("grind_cookie_ok"); } catch { return true; } });
  const navigate = useNavigate();
  const { canInstall, install } = useInstallPrompt();

  useEffect(() => { try { const s = localStorage.getItem("grind_user"); if (s) setUser(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { HERO_IMAGES.forEach(src => { const img = new Image(); img.src = src; }); const id = setInterval(() => { if (document.visibilityState === "visible") setHeroIndex(i => (i + 1) % HERO_IMAGES.length); }, 6000); return () => clearInterval(id); }, []);

  const handleLogout = () => { localStorage.removeItem("grind_user"); setUser(null); };
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); navigate(`/gigs?q=${encodeURIComponent(search)}`); };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* Notice bar */}
      <div className="bg-[#111] text-white/50 text-xs text-center py-2.5 px-4 flex items-center justify-center gap-6">
        <span className="flex items-center gap-1.5"><Shield size={11} className="text-[#00FF7F]" /> All transactions are escrow-protected</span>
        {canInstall && (
          <button onClick={install} className="flex items-center gap-1.5 text-[#00FF7F] font-bold hover:text-white transition-colors">
            <Download size={11} /> Add to home screen
          </button>
        )}
      </div>

      {/* ── NAVBAR — pure black, YWO style ───────────────────── */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark size={30} tone="light" />
            <span style={{ fontFamily: "'Syne',sans-serif" }} className="text-white font-black text-xl tracking-tight">Grind</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="text-white/50 hover:text-white text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#00FF7F] flex items-center justify-center text-black font-bold text-xs">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.name || "Profile"}</span>
                </Link>
                <button onClick={handleLogout} className="text-white/30 hover:text-white text-sm font-medium transition-colors">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/50 hover:text-white text-sm font-medium transition-colors">Log in</Link>
                <Link to="/signup" className="bg-[#00FF7F] hover:bg-[#00D96B] text-black font-black text-sm px-5 py-2.5 rounded-full transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden text-white/60 hover:text-white p-1.5" aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black border-t border-white/[0.06] px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="px-3 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-white/[0.06] mt-1">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-white/60 text-sm font-semibold py-2.5 rounded-full border border-white/10">Log in</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-black text-sm font-black py-2.5 rounded-full bg-[#00FF7F]">Get started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO — full black, big type ──────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-black">
        {HERO_IMAGES.map((src, i) => (
          <img key={src} src={src} alt="" aria-hidden decoding="async" loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${i === heroIndex ? "opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/80" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00FF7F]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-[900px] mx-auto px-6 text-center pt-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/6 border border-white/10 text-white/60 text-xs font-semibold px-4 py-2 rounded-full mb-10 backdrop-blur-sm uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full animate-pulse" />
            Nigeria's campus hustle platform
          </div>

          {/* BIG headline — YWO style uppercase */}
          <h1 style={{ fontFamily: "'Syne',sans-serif" }}
            className="text-[clamp(3rem,9vw,7rem)] font-black text-white leading-[0.95] tracking-[-0.04em] mb-8 uppercase">
            WAY FOR<br />
            <span className="text-[#00FF7F]">POOR PEOPLE</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 font-normal mb-10 max-w-lg mx-auto leading-relaxed">
            Post gigs. Earn real money. Build a rep that follows you past campus.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}
            className="flex bg-white rounded-2xl overflow-hidden max-w-2xl mx-auto shadow-2xl shadow-black/60 mb-7 border border-white/10">
            <div className="flex-1 flex items-center px-5 min-w-0">
              <Search className="text-gray-400 mr-3 shrink-0" size={18} />
              <input type="text" placeholder="Search gigs, services, products..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-base text-gray-900 outline-none bg-transparent placeholder:text-gray-400 py-4 min-w-0" />
            </div>
            <button type="submit"
              className="bg-[#00FF7F] hover:bg-[#00D96B] text-black font-black px-7 py-4 text-sm transition-colors shrink-0">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/30 text-xs font-medium">
            {["Escrow protected", "Verified students", "GrindFlex payments", "Instant withdrawal"].map(f => (
              <span key={f} className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#00FF7F]" />{f}</span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
          <div className="w-px h-12 bg-white/50" />
        </div>
      </section>

      {/* ── STATS — black strip ──────────────────────────────── */}
      <section className="bg-black border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.l} className="text-center">
              <div style={{ fontFamily: "'Syne',sans-serif" }} className="text-4xl font-black text-white mb-1">{s.v}</div>
              <div className="text-white/30 text-xs font-medium uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── UNIS marquee ────────────────────────────────────── */}
      <section className="bg-black border-t border-white/5 py-8 overflow-hidden">
        <p className="text-center text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold mb-6">Students grinding at</p>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee gap-16">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {UNIS.map(u => <span key={u + i} className="text-2xl font-black text-white/10 tracking-tighter whitespace-nowrap uppercase">{u}</span>)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY GRIND — dark cards, YWO "why us" style ───────── */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs font-black text-[#00FF7F] uppercase tracking-[0.2em] mb-4">Why Grind</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase">
              Built different.<br />For us.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "⚡", title: "Post in 60 seconds", body: "No long forms, no verification delay. Post your gig, go live, start getting applicants." },
              { icon: "🔒", title: "Escrow on every deal", body: "Your money locks in a smart contract. It moves only when you approve. Full stop." },
              { icon: "📊", title: "GrindScore = your CV", body: "Every completed job, every good review builds your score. It follows you everywhere." },
              { icon: "💳", title: "Pay small small", body: "GrindFlex splits any purchase into weekly payments. No bank needed, no credit check." },
            ].map(card => (
              <div key={card.title} className="bg-[#111] border border-white/[0.07] rounded-2xl p-6 hover:border-[#00FF7F]/30 transition-colors">
                <span className="text-3xl block mb-4">{card.icon}</span>
                <h3 style={{ fontFamily: "'Syne',sans-serif" }} className="text-base font-black text-white mb-2 tracking-tight">{card.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES — white section ───────────────────────── */}
      <section className="py-20 bg-[#F7F8FA] border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-black text-[#00A651] uppercase tracking-widest mb-3">On campus. On demand.</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-black tracking-tight">Everything in one place.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[{ title: "Services", items: SERVICES, base: "/gigs" }, { title: "Products & Marketplace", items: PRODUCTS, base: "/marketplace" }].map(col => (
              <div key={col.title}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-5">{col.title}</h3>
                <div className="space-y-1">
                  {col.items.map(item => (
                    <Link key={item} to={`${col.base}?cat=${encodeURIComponent(item)}`}
                      className="flex justify-between items-center py-3.5 px-4 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm transition-all group">
                      <span className="text-gray-600 font-medium text-sm group-hover:text-black transition-colors">{item}</span>
                      <ArrowRight size={14} className="text-gray-200 group-hover:text-[#00A651] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW LEGENDS ARE MADE — black + right panel ───────── */}
      <section className="bg-black py-4 border-b border-white/5">
        <FeatureSteps
          features={STEPS.map(s => ({ step: s.step, title: s.title, content: s.content, image: s.image }))}
          title="HOW LEGENDS ARE MADE"
          titleClassName="font-display uppercase"
          autoPlayInterval={4500}
        />
      </section>

      {/* ── SELLERS ──────────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <p className="text-xs font-black text-[#00A651] uppercase tracking-widest mb-3">Talent on campus</p>
              <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">Meet your next hire</h2>
            </div>
            <Link to="/gigs?sort=rating" className="flex items-center gap-2 text-black font-bold text-sm border-2 border-gray-200 px-5 py-3 rounded-full hover:border-black transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SELLERS.map(s => (
              <Link key={s.name} to={`/u/${s.handle}`}
                className="bg-[#F7F8FA] border border-gray-100 hover:border-[#00A651]/40 rounded-2xl p-5 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold">{s.avatar}</div>
                  <div>
                    <p className="font-bold text-black text-sm">{s.name}</p>
                    <p className="text-gray-400 text-xs">{s.skill} · {s.uni}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={13} fill="#F59E0B" className="text-yellow-500" />
                    <span className="text-gray-500 text-xs font-medium">{s.rating} ({s.reviews})</span>
                  </div>
                  <span className="text-[#00A651] text-xs font-black bg-[#00A651]/8 px-2 py-0.5 rounded-full">Top Rated</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="block text-center bg-black group-hover:bg-[#00A651] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                    View profile
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF ACCORDION ─────────────────────────────────── */}
      <AccordionFeature features={PROOF_FEATURES} heading="GRIND IS MORE THAN A MARKETPLACE" headingClassName="font-display uppercase" subheading="It is proof that you showed up, delivered, and earned it." />

      {/* ── ESCROW ───────────────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center"><Lock className="text-white" size={22} /></div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase leading-tight">
              Your money never moves until you say so.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              When you pay on Grind, the money goes into a secure escrow vault — not to the seller. They only get it when you confirm the work is exactly what was promised.
            </p>
            <Link to="/gigs" className="inline-flex items-center gap-2 bg-black hover:bg-[#00A651] text-white font-black px-6 py-3.5 rounded-full text-sm transition-colors">
              Browse gigs <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -top-3 -right-3 bg-[#00FF7F] text-black px-4 py-1.5 rounded-full text-xs font-black shadow-lg z-10 flex items-center gap-1.5">
              <Shield size={12} /> Protected
            </div>
            <img src="/hero/hero2_tech.jpg" className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]" alt="" />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — full black ───────────────────────────── */}
      <section className="bg-black py-28 text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <h2 style={{ fontFamily: "'Syne',sans-serif" }}
            className="text-5xl sm:text-6xl font-black text-white tracking-tight mb-5 uppercase leading-tight">
            READY TO START?
          </h2>
          <p className="text-white/40 text-lg mb-10 leading-relaxed">
            Join the students already earning, buying and connecting on Nigeria's most trusted campus platform.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-3 bg-[#00FF7F] hover:bg-[#00D96B] text-black font-black text-lg px-12 py-5 rounded-full transition-colors">
            Create free account <ArrowRight size={20} />
          </Link>
          <p className="text-white/15 text-xs mt-5">Free forever. No credit card.</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-black border-t border-white/5 py-16">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <LogoMark size={26} tone="light" />
              <span style={{ fontFamily: "'Syne',sans-serif" }} className="text-white font-black text-lg tracking-tight">Grind</span>
            </div>
            <p className="text-white/25 text-sm leading-relaxed max-w-[260px] mb-5">Way for poor people. The trustless campus gig economy for Nigerian students.</p>
            <div className="flex gap-2.5">
              {[{ href: "https://x.com/", label: "X", icon: "𝕏" }, { href: "https://instagram.com/", label: "IG", icon: "📸" }, { href: "https://wa.me/2348072027335", label: "WA", icon: "💬" }].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#00FF7F]/20 flex items-center justify-center text-white text-xs transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Platform", links: [{ to: "/gigs", l: "Gigs" }, { to: "/marketplace", l: "Marketplace" }, { to: "/requests", l: "Requests" }, { to: "/campus", l: "Campus" }, { to: "/live", l: "Live" }] },
            { title: "Support", links: [{ to: "/support", l: "Help Center" }, { to: "/legal/safety", l: "Safety Center" }, { to: "/legal/buyer-protection", l: "Buyer Protection" }] },
            { title: "Legal", links: [{ to: "/legal/privacy-policy", l: "Privacy Policy" }, { to: "/legal/terms-of-service", l: "Terms of Service" }] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-5">{col.title}</h4>
              <ul className="space-y-3.5">
                {col.links.map(link => (
                  <li key={link.to}><Link to={link.to} className="text-white/30 hover:text-white text-sm font-medium transition-colors">{link.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1400px] mx-auto px-6 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-white/15 text-xs">
          <span>© {new Date().getFullYear()} Grind Africa Ltd. All rights reserved.</span>
          <span>Made for Nigerian campus hustlers.</span>
        </div>
        <AdminDot />
      </footer>

      {/* Cookie banner */}
      {showCookie && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 bg-[#111] border border-white/10 rounded-2xl p-5 z-50 shadow-2xl">
          <p className="text-white text-sm font-bold mb-1">Cookies</p>
          <p className="text-white/40 text-xs leading-relaxed mb-4">We use cookies to personalise your experience. <Link to="/legal/cookie-policy" className="text-[#00FF7F] hover:underline">Learn more</Link>.</p>
          <div className="flex gap-2">
            <button onClick={() => { try { sessionStorage.setItem("grind_cookie_ok", "1"); } catch {} setShowCookie(false); }}
              className="flex-1 bg-[#00FF7F] hover:bg-[#00D96B] text-black font-black py-2 rounded-xl text-xs transition-colors">Accept</button>
            <button onClick={() => setShowCookie(false)}
              className="flex-1 bg-white/8 hover:bg-white/12 text-white/60 py-2 rounded-xl text-xs transition-colors">Decline</button>
          </div>
        </div>
      )}
    </div>
  );
};
