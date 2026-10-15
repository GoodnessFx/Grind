/**
 * GigsPage — /gigs — real gig board (GET /api/gigs) with search, category
 * filter, sort, pagination. Every card carries a Report button; opening a
 * card shows GigDetail with the full lifecycle.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Flag, Clock, Shield, ChevronDown, Plus, Loader2, Inbox } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { GigDetail } from '../components/gigs/GigDetail';
import { ReportModal } from '../components/common/ReportModal';
import { apiFetch } from '../lib/auth';
import { useTranslation } from '../lib/i18n';

const CATEGORIES = [
  'All', 'Writing', 'Design', 'Coding', 'Tutoring', 'Delivery', 'Research',
  'Video', 'Hostel Runs', 'Food Pickup', 'Assignment', 'Braid and Barb',
  'Thrift', 'Phone Repair', 'Printing', 'Laundry', 'Other',
];

const SORTS = [
  { v: 'newest', label: 'Newest' },
  { v: 'price_high', label: 'Highest pay' },
  { v: 'price_low', label: 'Lowest pay' },
  { v: 'urgent', label: 'Due soon' },
];

const naira = (kobo: number) => `₦${Math.round((kobo ?? 0) / 100).toLocaleString('en-NG')}`;

function deadlineLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = d.getTime() - Date.now();
  if (diff > 0 && diff < 2 * 3600_000) return 'Due in a few hours';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export const GigsPage: React.FC = () => {
  const { t } = useTranslation();
  const [gigs, setGigs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [qDraft, setQDraft] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [openGigId, setOpenGigId] = useState<string | null>(null);
  const [reportGig, setReportGig] = useState<any>(null);

  const LIMIT = 20;

  const load = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageToLoad), limit: String(LIMIT), sort });
      if (q.trim()) params.set('q', q.trim());
      if (category && category !== 'All') params.set('category', category);
      const d = await apiFetch<{ gigs: any[]; total: number }>(`/api/gigs?${params.toString()}`);
      setGigs((prev) => (pageToLoad === 1 ? d.gigs : [...prev, ...d.gigs]));
      setTotal(d.total ?? 0);
      setPage(pageToLoad);
    } catch {
      setGigs([]);
    } finally {
      setLoading(false);
    }
  }, [q, category, sort]);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl font-black text-[#0D0D14] tracking-tight">
              {t('home.browse_gigs')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{total} gig{total === 1 ? '' : 's'} available · every payment escrow-protected</p>
          </div>
          <div className="flex gap-2">
            <Link to="/requests" className="border border-gray-200 hover:border-gray-400 text-[#0D0D14] font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
              Requests
            </Link>
            <Link to="/post-gig" className="flex items-center gap-1.5 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
              <Plus size={15} /> {t('home.post_gig')}
            </Link>
          </div>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <form onSubmit={(e) => { e.preventDefault(); setQ(qDraft); }} className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="Search gigs — logo, tutoring, delivery..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#00A651]"
              />
            </div>
            <button type="submit" className="bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold text-sm px-5 rounded-xl transition-colors">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-full pl-4 pr-8 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-[#00A651] cursor-pointer"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-full pl-4 pr-8 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-[#00A651] cursor-pointer"
              >
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Gig list */}
        {loading && gigs.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-[#00A651]" />
            <p className="text-sm font-medium">{t('gig.loading')}</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400 bg-white rounded-3xl border border-gray-100">
            <Inbox className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-medium">{q ? t('gig.no_results') : t('empty.gigs')}</p>
            <Link to="/post-gig" className="bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors">
              {t('home.post_gig')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {gigs.map((gig) => {
              const posterHandle = String(gig.poster?.handle ?? '').replace(/^@/, '');
              return (
                <article
                  key={gig.id}
                  onClick={() => setOpenGigId(gig.id)}
                  className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:border-[#00A651]/30 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {gig.is_urgent && (
                        <span className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{t('gig.urgent')}</span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00A651] bg-[#00A651]/10 px-2 py-0.5 rounded-full">
                        {gig.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setReportGig(gig); }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                      aria-label="Report this gig"
                      title="Report this gig"
                    >
                      <Flag size={15} />
                    </button>
                  </div>

                  <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-lg text-[#0D0D14] mb-1.5 group-hover:text-[#00A651] transition-colors leading-snug">
                    {gig.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{gig.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-[#0D0D14] text-base">{naira(gig.budget)}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {deadlineLabel(gig.deadline)}</span>
                      <span className="hidden sm:flex items-center gap-1"><Shield size={12} className="text-[#00A651]" /> escrow</span>
                    </div>
                    {posterHandle && (
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full"
                      >
                        @{posterHandle} · {gig.poster?.tier ?? 'Fresher'}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}

            {/* Pagination */}
            {gigs.length < total && (
              <button
                onClick={() => load(page + 1)}
                disabled={loading}
                className="w-full border border-gray-200 hover:border-gray-400 disabled:opacity-50 text-gray-600 font-bold text-sm py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} {t('gig.load_more')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Gig detail drawer */}
      {openGigId && (
        <GigDetail gigId={openGigId} onClose={() => setOpenGigId(null)} onChanged={() => load(page)} />
      )}

      {/* Report modal (from card flag) */}
      {reportGig && (
        <ReportModal targetType="gig" targetId={reportGig.id} onClose={() => setReportGig(null)} />
      )}
    </div>
  );
};

