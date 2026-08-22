import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, Plus, ChevronDown } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { UserData } from "../App";
import { cn } from "../../lib/utils";

interface TaskBoardProps {
  user: UserData;
  onTaskClick: (taskId: number) => void;
  onPostTask: () => void;
}

const CATEGORIES = ["All", "Writing", "Design", "Coding", "Tutoring", "Squads", "Delivery", "Research", "Video"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-high", label: "Highest Pay" },
  { value: "price-low", label: "Lowest Pay" },
  { value: "urgent", label: "Most Urgent" },
];

export const ALL_TASKS = [
  { id: 1, category: "Writing", price: 3500, title: "Write my BUS 301 Business Law essay (1500 words)", description: "Need a well-researched essay on corporate governance. Due Friday before 5pm.", posterHandle: "@emeka_dev", posterTier: "GOLD" as const, posterScore: 672, deadline: "Due in 2 days" },
  { id: 2, category: "Design", price: 5000, title: "Design event flyer for Faculty Week", description: "Creative flyer design for our upcoming Faculty Week event.", posterHandle: "@fatimah.writes", posterTier: "BRONZE" as const, posterScore: 423, deadline: "Due in 4 days" },
  { id: 11, category: "Squads", price: 150000, title: "Build UNILAG Campus Voting DApp", description: "Need a full-stack squad (Frontend, Smart Contract, Design) for SG elections.", posterHandle: "@unilag_sg", posterTier: "DIAMOND" as const, posterScore: 990, deadline: "Due in 20 days", squadSize: 4 },
  { id: 3, category: "Tutoring", price: 8500, title: "Tutor me in Calculus before my exam on Friday", description: "Need help with integration and differentiation. 3 sessions needed.", posterHandle: "@seun_designs", posterTier: "DIAMOND" as const, posterScore: 847, deadline: "Due in 3 days" },
  { id: 4, category: "Delivery", price: 2000, title: "Help me move my things from Akoka to Yaba", description: "Need someone with a bike to help move some boxes and bags.", posterHandle: "@chidi_codes", posterTier: "STARTER" as const, posterScore: 312, deadline: "Due in 1 day" },
  { id: 12, category: "Squads", price: 40000, title: "Market Research & Field Survey for Startup", description: "Looking for a squad of 5 to conduct surveys across 3 campuses.", posterHandle: "@campus_connect", posterTier: "GOLD" as const, posterScore: 810, deadline: "Due in 7 days", squadSize: 5 },
  { id: 5, category: "Coding", price: 12000, title: "Build a simple portfolio website in React", description: "Need a React developer to build a clean portfolio website with 4-5 pages.", posterHandle: "@ada_tech", posterTier: "GOLD" as const, posterScore: 701, deadline: "Due in 7 days" },
  { id: 6, category: "Research", price: 4000, title: "Market research on Lagos Gen-Z buying habits", description: "Survey and analysis on youth consumer trends. 2000-word report.", posterHandle: "@temi_biz", posterTier: "BRONZE" as const, posterScore: 389, deadline: "Due in 5 days" },
  { id: 7, category: "Video", price: 7500, title: "Edit my YouTube vlog from the Lekki festival", description: "30-minute raw footage → 8-min polished video. Add captions and transitions.", posterHandle: "@kolade_vlog", posterTier: "GOLD" as const, posterScore: 590, deadline: "Due in 3 days" },
  { id: 8, category: "Writing", price: 2500, title: "Proofread my MBA admission statement (800 words)", description: "Need grammar and flow corrections on my personal statement.", posterHandle: "@yinka_mba", posterTier: "STARTER" as const, posterScore: 280, deadline: "Due in 2 days" },
  { id: 9, category: "Coding", price: 18000, title: "Build a REST API for a simple e-commerce site", description: "Node.js + Express. Products, cart, and orders endpoints.", posterHandle: "@tech_unilag", posterTier: "DIAMOND" as const, posterScore: 910, deadline: "Due in 14 days" },
  { id: 10, category: "Tutoring", price: 5000, title: "Physics tutoring — wave mechanics & optics", description: "Undergraduate level. 2 x 2-hour sessions before JAMB resit.", posterHandle: "@amara_sci", posterTier: "BRONZE" as const, posterScore: 450, deadline: "Due in 6 days" },
];

export function TaskBoard({ user, onTaskClick, onPostTask }: TaskBoardProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let list = ALL_TASKS.filter((t) => {
      const matchCat = category === "All" || t.category === category;
      const q = query.toLowerCase();
      const matchQ = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "urgent") list = [...list].sort((a, b) => a.posterScore - b.posterScore);

    return list;
  }, [query, category, sort]);

  return (
    <div className="pb-28">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white px-5 pt-12 pb-3 sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Available Gigs</h2>
          <button
            onClick={onPostTask}
            className="flex items-center gap-1.5 bg-accent text-white px-4 py-2.5 rounded-[14px] text-sm font-bold hover:bg-grind-accent-dark active:scale-95 transition-all shadow-[0_8px_16px_-4px_rgba(0,166,81,0.4)]"
          >
            <Plus className="w-4 h-4" />
            Post Gig
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search gigs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-gray-50 border border-gray-200 rounded-[16px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "w-12 h-12 rounded-[16px] border flex items-center justify-center transition-all",
              showFilters ? "bg-gray-900 border-gray-900 text-white shadow-md" : "bg-gray-50 border-gray-200 text-gray-600"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSort((v) => !v)}
            className="flex items-center gap-1.5 px-4 h-12 bg-gray-50 border border-gray-200 rounded-[16px] text-xs font-bold text-gray-600 transition-all hover:border-gray-300 active:bg-gray-100"
          >
            Sort <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Sort dropdown */}
        {showSort && (
          <div className="absolute right-5 top-[120px] bg-white border border-gray-100 rounded-[20px] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] z-30 overflow-hidden min-w-[160px]">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSort(opt.value); setShowSort(false); }}
                className={cn(
                  "w-full px-5 py-3.5 text-left text-[13px] font-bold transition-colors",
                  sort === opt.value ? "text-accent bg-grind-accent-light" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Category chips */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-2 mt-4 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all uppercase tracking-wide",
                  category === cat
                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Results count ────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">
          <span className="font-extrabold text-gray-900">{filtered.length}</span> gigs available
        </p>
        {(category !== "All" || query) && (
          <button
            onClick={() => { setCategory("All"); setQuery(""); }}
            className="text-[11px] text-accent font-bold uppercase tracking-wide flex items-center gap-1 bg-grind-accent-light px-2.5 py-1 rounded-lg"
          >
            Clear filters <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ── Task List ───────────────────────────────────────── */}
      <div className="px-4 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((task) => (
            <TaskCard key={task.id} {...task} onClick={() => onTaskClick(task.id)} />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-900 font-extrabold text-[15px] mb-1">No gigs found</p>
            <p className="text-gray-500 text-sm font-medium mb-4">Try a different search or clear filters</p>
            <button
              onClick={() => { setCategory("All"); setQuery(""); }}
              className="text-accent font-bold text-sm bg-grind-accent-light px-4 py-2 rounded-xl"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
