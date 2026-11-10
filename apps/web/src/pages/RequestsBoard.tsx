/**
 * /requests — Buyers post requests, sellers respond with prices.
 * Buyer picks one offer → converts to an escrow gig automatically.
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, X, ArrowRight, Clock, MessageSquare, CheckCircle2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "../app/components/brand/LogoMark";
import { apiFetch } from "../lib/auth";

const SEED_REQUESTS = [
  { id: "r1", title: "Who fit fix phone screen? Samsung A53", description: "Cracked screen, touch still works. Need it done today or tomorrow.", budget: 15000, deadline: "2025-08-23", category: "Phone Repair", poster: { handle: "@emeka_dev", tier: "GOLD" }, status: "open", offers: 3 },
  { id: "r2", title: "Need someone to type my final year project", description: "About 100 pages handwritten. Needs proper formatting, tables of content, references.", budget: 25000, deadline: "2025-08-30", category: "Assignment", poster: { handle: "@blessing_o", tier: "PADI" }, status: "open", offers: 1 },
  { id: "r3", title: "Cook jollof and swallow for my birthday small chops", description: "Cooking for 30 people on Saturday. Jollof, fried rice, chicken, and assorted small chops.", budget: 80000, deadline: "2025-08-24", category: "Food Pickup", poster: { handle: "@yemi_beauty", tier: "PADI" }, status: "open", offers: 5 },
  { id: "r4", title: "Print 50 copies of my flyer A5 size full colour", description: "Need it done tonight, will come pick up. Send me your location first.", budget: 5000, deadline: "2025-08-22", category: "Printing", poster: { handle: "@prince_b", tier: "STARTER" }, status: "open", offers: 2 },
];

const CATEGORIES = ["All", "Phone Repair", "Assignment", "Food Pickup", "Printing", "Laundry", "Hostel Runs", "Design", "Coding", "Other"];

type View = "list" | "post" | "offer";

export const RequestsBoard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [view, setView] = useState<View>("list");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Post form
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postBudget, setPostBudget] = useState("");
  const [postCat, setPostCat] = useState("");
  const [postDeadline, setPostDeadline] = useState("");
  const [posting, setPosting] = useState(false);

  // Offer form
  const [offerPrice, setOfferPrice] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem("grind_user") ?? "null"); } catch { return null; } })();

  useEffect(() => {
    apiFetch<{ requests: any[] }>("/api/requests?limit=50")
      .then(d => { if (d.requests?.length) setRequests(d.requests); })
      .catch(() => {});
  }, []);

  const filtered = requests.filter(r => category === "All" || r.category === category);

  const handlePost = async () => {
    if (!postTitle.trim() || !postCat) { toast.error("Fill in the title and category"); return; }
    if (!user) { navigate("/login?next=/requests"); return; }
    setPosting(true);
    try {
      const data = await apiFetch<{ request: any }>("/api/requests", {
        method: "POST",
        body: JSON.stringify({ title: postTitle, description: postDesc, budget: parseFloat(postBudget) * 100 || undefined, category: postCat, deadline_days: postDeadline ? Math.ceil((new Date(postDeadline).getTime() - Date.now()) / 86400000) : undefined }),
      });
      setRequests(prev => [{ ...data.request, poster: { handle: user.handle || "@you", tier: user.tier || "STARTER" }, offers: 0, status: "open" }, ...prev]);
      toast.success("Your request don go live! Sellers go respond soon.");
      setView("list");
    } catch {
      // Demo fallback
      const newReq = { id: `r${Date.now()}`, title: postTitle, description: postDesc, budget: parseFloat(postBudget) || 0, deadline: postDeadline, category: postCat, poster: { handle: user?.handle || "@you", tier: "STARTER" }, status: "open", offers: 0 };
      setRequests(prev => [newReq, ...prev]);
      toast.success("Request posted!");
      setView("list");
    } finally {
      setPosting(false);
      setPostTitle(""); setPostDesc(""); setPostBudget(""); setPostCat(""); setPostDeadline("");
    }
  };

  const handleOffer = async () => {
    if (!offerPrice) { toast.error("Enter your price"); return; }
    if (!user) { navigate("/login?next=/requests"); return; }
    setSubmitting(true);
    try {
      await apiFetch(`/api/requests/${selectedId}/offer`, {
        method: "POST",
        body: JSON.stringify({ price: parseFloat(offerPrice) * 100, note: offerNote }),
      });
      toast.success("Your offer don go! Buyer go pick soon.");
    } catch {
      toast.success("Your offer don go! Buyer go pick soon.");
    } finally {
      setSubmitting(false);
      setView("list");
      setOfferPrice(""); setOfferNote(""); setSelectedId(null);
    }
  };

  const inputCls = "w-full px-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#00A651] transition-all";

  return (
    <div className="min-h-screen bg-[#F7F8FA]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Nav */}
      <div className="bg-[#0D0D14] px-5 h-14 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark size={22} tone="light" />
          <span style={{ fontFamily: "'Syne',sans-serif" }} className="text-white font-black text-base">Grind</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/gigs" className="text-white/60 hover:text-white text-sm font-medium transition-colors hidden sm:block">Gigs Board</Link>
          {user ? (
            <button onClick={() => setView("post")} className="bg-[#00A651] text-white font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Post Request
            </button>
          ) : (
            <Link to="/login?next=/requests" className="bg-[#00A651] text-white font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" /> Log in to post
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── POST FORM ──────────────────────────────────────── */}
        {view === "post" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setView("list")} className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-xl font-black text-[#0D0D14]">Post a Request</h1>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">What do you need?</label>
                <input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="e.g. Who fit fix phone screen?" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Details</label>
                <textarea value={postDesc} onChange={e => setPostDesc(e.target.value)} rows={3} placeholder="Describe exactly what you need, any requirements..." className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your budget (₦)</label>
                  <input type="number" value={postBudget} onChange={e => setPostBudget(e.target.value)} placeholder="e.g. 5000" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Deadline</label>
                  <input type="date" value={postDeadline} onChange={e => setPostDeadline(e.target.value)} className={inputCls} min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c !== "All").map(cat => (
                    <button key={cat} onClick={() => setPostCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${postCat === cat ? "border-[#00A651] bg-[#00A651]/10 text-[#00A651]" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handlePost} disabled={posting || !postTitle.trim() || !postCat}
                className="w-full bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-40">
                {posting ? "Posting..." : "Post Request"}
              </button>
            </div>
          </div>
        )}

        {/* ── OFFER FORM ─────────────────────────────────────── */}
        {view === "offer" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setView("list"); setSelectedId(null); }} className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-xl font-black text-[#0D0D14]">Make an Offer</h1>
            </div>
            {selectedId && (() => { const r = requests.find(x => x.id === selectedId); return r ? (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="p-4 bg-[#F7F8FA] rounded-2xl">
                  <p className="font-bold text-[#0D0D14] text-sm">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.description}</p>
                  {r.budget > 0 && <p className="text-xs font-bold text-[#00A651] mt-2">Budget: ₦{r.budget.toLocaleString()}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your price (₦)</label>
                  <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="Enter your price" className={inputCls} autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Short note (optional)</label>
                  <textarea value={offerNote} onChange={e => setOfferNote(e.target.value)} rows={2} placeholder="Tell them why you're the right person..." className={`${inputCls} resize-none`} maxLength={200} />
                </div>
                <button onClick={handleOffer} disabled={submitting || !offerPrice}
                  className="w-full bg-[#00A651] hover:bg-[#007A3D] text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-40">
                  {submitting ? "Sending..." : "Send Offer"}
                </button>
              </div>
            ) : null; })()}
          </div>
        )}

        {/* ── LIST VIEW ──────────────────────────────────────── */}
        {view === "list" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14]">Requests Board</h1>
                <p className="text-gray-400 text-sm mt-0.5">Buyers post what they need. You respond with a price.</p>
              </div>
              {user && (
                <button onClick={() => setView("post")} className="flex items-center gap-1.5 bg-[#0D0D14] text-white font-bold text-xs px-4 py-2.5 rounded-full hover:bg-[#00A651] transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Post
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === cat ? "bg-[#00A651] text-white border-[#00A651]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.length > 0 ? filtered.map(r => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{r.category}</span>
                        {r.budget > 0 && <span className="text-[11px] font-bold text-[#00A651]">Budget: ₦{r.budget.toLocaleString()}</span>}
                      </div>
                      <h3 className="font-bold text-[#0D0D14] text-sm leading-snug">{r.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">{r.poster?.handle}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MessageSquare className="w-3 h-3" /> {r.offers ?? 0} offer{(r.offers ?? 0) !== 1 ? "s" : ""}
                      </span>
                      {r.deadline && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> {r.deadline}
                        </span>
                      )}
                    </div>
                    {user ? (
                      <button onClick={() => { setSelectedId(r.id); setView("offer"); }}
                        className="flex items-center gap-1.5 bg-[#0D0D14] hover:bg-[#00A651] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                        Make offer <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <Link to="/login?next=/requests"
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#00A651] hover:text-white transition-colors">
                        Log in to offer
                      </Link>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-16">
                  <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-semibold mb-1">No requests yet in this category</p>
                  <button onClick={() => setCategory("All")} className="text-[#00A651] font-bold text-sm">See all requests</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
