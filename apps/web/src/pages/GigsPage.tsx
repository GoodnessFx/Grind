/**
 * /gigs — Full gig board with search, filter, sort, pagination.
 * Renders inside the web Router (not the mobile app tab).
 */
import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ArrowRight, Briefcase } from "lucide-react";
import { LogoMark } from "../app/components/brand/LogoMark";
import { ReportModal } from "../app/components/ReportModal";
import { apiFetch } from "../lib/auth";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["All", "Writing", "Design", "Coding", "Tutoring", "Delivery", "Research", "Video", "Hostel Runs", "Food Pickup", "Assignment", "Braid and Barb", "Thrift", "Phone Repair", "Printing", "Laundry", "Other"];

const SEED_GIGS = [
  { id: 1, category: "Writing", budget: 350000, title: "Write my BUS 301 Business Law essay (1500 words)", description: "Need a well-researched essay on corporate governance. Due Friday before 5pm.", poster: { handle: "@emeka_dev", tier: "GOLD", grind_score: 672, verified_badge: false }, deadline: "2025-08-25T17:00:00Z", is_urgent: false },
  { id: 2, category: "Design", budget: 500000, title: "Design event flyer for Faculty Week", description: "Creative flyer for our Faculty Week event. Must be delivered as PDF + PNG.", poster: { handle: "@fatimah.writes", tier: "BRONZE", grind_score: 423, verified_badge: false }, deadline: "2025-08-28T17:00:00Z", is_urgent: false },
  { id: 3, category: "Tutoring", budget: 850000, title: "Tutor me in Calculus before my exam", description: "Integration and differentiation. 3 sessions needed.", poster: { handle: "@seun_designs", tier: "DIAMOND", grind_score: 847, verified_badge: true }, deadline: "2025-08-24T12:00:00Z", is_urgent: true },
  { id: 4, category: "Hostel Runs", budget: 200000, title: "Pick up my package from Block D gate", description: "Need someone to pick up a parcel from Block D main gate and bring to Room 203.", poster: { handle: "@chidi_codes", tier: "STARTER", grind_score: 180, verified_badge: false }, deadline: "2025-08-22T16:00:00Z", is_urgent: true },
  { id: 5, category: "Coding", budget: 1200000, title: "Build a simple portfolio website in React", description: "4-5 pages, clean design, deployed to Vercel. Mobile responsive.", poster: { handle: "@ada_tech", tier: "GOLD", grind_score: 701, verified_badge: true }, deadline: "2025-09-01T17:00:00Z", is_urgent: false },
  { id: 6, category: "Braid and Barb", budget: 400000, title: "Need knotless braids done on Saturday", description: "Medium length, natural color. I'll provide the hair. 4 hours max.", poster: { handle: "@yemi_beauty", tier: "PADI", grind_score: 290, verified_badge: false }, deadline: "2025-08-23T10:00:00Z", is_urgent: true },
  { id: 7, category: "Printing", budget: 100000, title: "Print and bind my project report (120 pages)", description: "A4, hardcover, spiral bind. Need it by 8am tomorrow.", poster: { handle: "@prince_b", tier: "STARTER", grind_score: 95, verified_badge: false }, deadline: "2025-08-22T08:00:00Z", is_urgent: true },
  { id: 8, category: "Food Pickup", budget: 150000, title: "Pick up jollof from Mama Nkechi canteen", description: "2 plates of jollof, one with fish, one with chicken. Delivery to Moremi Block A.", poster: { handle: "@blessing_o", tier: "PADI", grind_score: 320, verified_badge: false }, deadline: "2025-08-22T13:00:00Z", is_urgent: true },
  { id: 9, category: "Assignment", budget: 250000, title: "Type and format my handwritten notes (40 pages)", description: "Scan to Word format. Must be neatly formatted with headers and subheadings.", poster: { handle: "@samuel_k", tier: "STARTER", grind_score: 210, verified_badge: false }, deadline: "2025-08-26T20:00:00Z", is_urgent: false },
  { id: 10, category: "Laundry", budget: 200000, title: "Wash, dry and fold 2 bags of clothes", description: "No whites with colors. Iron what can be ironed. Deliver same day.", poster: { handle: "@mike_c", tier: "STARTER", grind_score: 130, verified_badge: false }, deadline: "2025-08-23T17:00:00Z", is_urgent: false },
];

const TIER_COLORS: Record<string, string> = {
  STARTER: "#98A2B3", BRONZE: "#CD7F32", GOLD: "#F79009", DIAMOND: "#0BA5EC", PADI: "#CD7F32",
};

export const GigsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [gigs, setGigs] = useState(SEED_GIGS);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [reportTarget, setReportTarget] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ gigs: any[] }>(`/api/gigs?status=open&limit=50`).then(d => { if (d.gigs?.length) setGigs(d.gigs); }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = gigs.filter(g => {
      const matchCat = category === "All" || g.category === category;
      const q = query.toLowerCase();
      const matchQ = !q || g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    // Sort urgent first, then by sort mode
    list = [...list].sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      if (sort === "price_high") return b.budget - a.budget;
      if (sort === "price_low") return a.budget - b.budget;
      return 0;
    });
    return list;
  }, [gigs, query, category, sort]);

  return (
    <div className="min-h-screen bg-[#F7F8FA]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Nav */}
      <div className="bg-[#0D0D14] px-5 h-14 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2"><LogoMark size={22} tone="light" /><span style={{ fontFamily: "'Syne',sans-serif" }} className="text-white font-black text-base">Grind</span></Link>
        <div className="flex items-center gap-3">
          <Link to="/requests" className="text-white/60 hover:text-white text-sm font-medium transition-colors hidden sm:block">Requests Board</Link>
          <Link to="/post-gig" className="bg-[#00A651] text-white font-bold text-xs px-4 py-2 rounded-full">Post Gig</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14] mb-1">Available Gigs</h1>
          <p className="text-gray-400 text-sm">{filtered.length} gigs open right now</p>
        </div>

        {/* Search + filter bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search gigs..." value={query} onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651]" />
            {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className={cn("w-11 h-11 rounded-2xl border flex items-center justify-center transition-all", showFilters ? "bg-[#00A651] border-[#00A651] text-white" : "bg-white border-gray-200 text-gray-600")}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Category chips */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn("flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all", category === cat ? "bg-[#00A651] text-white border-[#00A651]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gig list */}
        <div className="space-y-3">
          {filtered.length > 0 ? filtered.map(gig => (
            <div key={gig.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">{gig.category}</span>
                  {gig.is_urgent && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-400 text-yellow-900">⚡ Urgent Now</span>}
                </div>
                <span className="font-extrabold text-[#0D0D14]">₦{(gig.budget / 100).toLocaleString()}</span>
              </div>
              <h3 className="font-bold text-[#0D0D14] text-sm mb-1 line-clamp-2">{gig.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-1 mb-3">{gig.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00A651]/10 flex items-center justify-center text-[10px] font-bold text-[#00A651]">
                    {(gig.poster?.handle ?? "?")[1]?.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-gray-700">{gig.poster?.handle}</span>
                    {gig.poster?.verified_badge && <Shield className="w-3 h-3 text-[#00A651]" />}
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TIER_COLORS[gig.poster?.tier] ?? "#98A2B3" }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setReportTarget(gig.id)} className="text-gray-200 hover:text-red-400 transition-colors p-1"><X className="w-3.5 h-3.5" /></button>
                  <Link to={`/gigs/${gig.id}`} className="flex items-center gap-1.5 bg-[#0D0D14] hover:bg-[#00A651] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                    Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-16">
              <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold mb-1">No gig dey here</p>
              <p className="text-gray-400 text-sm mb-4">Try a different search or clear filters</p>
              <button onClick={() => { setCategory("All"); setQuery(""); }} className="text-[#00A651] font-bold text-sm">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {reportTarget !== null && <ReportModal targetType="gig" targetId={reportTarget} onClose={() => setReportTarget(null)} />}
    </div>
  );
};
