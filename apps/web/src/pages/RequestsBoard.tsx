/**
 * RequestsBoard — /requests — browse open requests, post a request,
 * make offers, and accept offers (auto-converts to an escrow gig).
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Inbox, Clock, Shield, ChevronDown } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { apiFetch, useAuth } from '../lib/auth';
import { useTranslation } from '../lib/i18n';
import { toast } from 'sonner';

const naira = (kobo: number | null | undefined) =>
  kobo == null ? 'Negotiable' : `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`;

export const RequestsBoard: React.FC = () => {
  const { t } = useTranslation();
  const { session, user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<any>(null);
  const [expandedOffers, setExpandedOffers] = useState<any[]>([]);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [offerBusy, setOfferBusy] = useState(false);

  // Post form
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fBudget, setFBudget] = useState('');
  const [fDays, setFDays] = useState('3');
  const [postBusy, setPostBusy] = useState(false);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const d = await apiFetch<{ requests: any[]; total: number }>(`/api/requests?page=${p}&limit=20`);
      setRequests((prev) => (p === 1 ? d.requests : [...prev, ...d.requests]));
      setTotal(d.total ?? 0);
      setPage(p);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const openDetail = async (id: string) => {
    setExpandedLoading(true);
    try {
      const d = await apiFetch<{ request: any; offers: any[] }>(`/api/requests/${id}`);
      setExpanded(d.request);
      setExpandedOffers(d.offers ?? []);
      setOfferPrice('');
      setOfferNote('');
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
    } finally {
      setExpandedLoading(false);
    }
  };

  const postRequest = async () => {
    if (fTitle.trim().length < 10) { toast.error('Title needs at least 10 characters'); return; }
    if (fDesc.trim().length < 10) { toast.error('Describe wetin you need'); return; }
    setPostBusy(true);
    try {
      await apiFetch('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          title: fTitle.trim(),
          description: fDesc.trim(),
          budget: fBudget ? Number(fBudget.replace(/[^0-9]/g, '')) * 100 : undefined,
          deadline_days: Number(fDays) || undefined,
        }),
      });
      toast.success(t('success.submitted'));
      setFTitle(''); setFDesc(''); setFBudget(''); setFDays('3');
      setShowForm(false);
      load(1);
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
    } finally {
      setPostBusy(false);
    }
  };

  const makeOffer = async () => {
    if (!expanded) return;
    const priceNaira = Number(offerPrice.replace(/[^0-9]/g, ''));
    if (!priceNaira || priceNaira < 100) { toast.error('Offer at least ₦100'); return; }
    setOfferBusy(true);
    try {
      await apiFetch(`/api/requests/${expanded.id}/offer`, {
        method: 'POST',
        body: JSON.stringify({ price: priceNaira * 100, note: offerNote.trim() || undefined }),
      });
      toast.success(t('success.submitted'));
      openDetail(expanded.id);
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
    } finally {
      setOfferBusy(false);
    }
  };

  const acceptOffer = async (offererId: string) => {
    if (!expanded) return;
    setOfferBusy(true);
    try {
      await apiFetch<{ gig: any }>(`/api/requests/${expanded.id}/accept/${offererId}`, { method: 'POST' });
      toast.success('Accepted! Gig is live — escrow locked.');
      setExpanded(null);
      load(1);
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
    } finally {
      setOfferBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl font-black text-[#0D0D14] tracking-tight">
              Requests board
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {total} open request{total === 1 ? '' : 's'} · money locks in escrow when you accept
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/gigs" className="border border-gray-200 hover:border-gray-400 text-[#0D0D14] font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
              {t('home.browse_gigs')}
            </Link>
            {session ? (
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-1.5 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors"
              >
                <Plus size={15} /> New request
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
                <Plus size={15} /> New request
              </Link>
            )}
          </div>
        </div>

        {/* Post form */}
        {session && showForm && (
          <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 mb-6 shadow-sm">
            <input
              value={fTitle}
              onChange={(e) => setFTitle(e.target.value)}
              maxLength={120}
              placeholder="Wetin you need? e.g. Braid my hair this weekend"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00A651] mb-3"
            />
            <textarea
              value={fDesc}
              onChange={(e) => setFDesc(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Give details — where, when, how you go pay..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00A651] resize-none mb-3"
            />
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-2xl px-4">
                <span className="text-gray-500 font-bold text-sm">₦</span>
                <input value={fBudget} onChange={(e) => setFBudget(e.target.value)} inputMode="numeric" placeholder="Budget (optional)" className="flex-1 min-w-0 bg-transparent py-3 text-sm outline-none" />
              </div>
              <input value={fDays} onChange={(e) => setFDays(e.target.value)} inputMode="numeric" placeholder="Days (optional)" className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00A651]" />
            </div>
            <button
              onClick={postRequest}
              disabled={postBusy}
              className="w-full bg-[#00A651] hover:bg-[#008040] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {postBusy && <Loader2 className="w-4 h-4 animate-spin" />} Post request
            </button>
          </div>
        )}

        {/* List */}
        {loading && requests.length === 0 ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#00A651]" /></div>
        ) : requests.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400 bg-white rounded-3xl border border-gray-100">
            <Inbox className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-medium">No request yet. Post the first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => {
              const isOwn = !!user && r.poster_id === user.id;
              const open = expanded?.id === r.id;
              return (
                <article key={r.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:border-[#00A651]/30 transition-all">
                  <div onClick={() => (open ? setExpanded(null) : openDetail(r.id))} className="cursor-pointer">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-lg text-[#0D0D14] leading-snug">{r.title}</h2>
                      <span className="font-black text-[#0D0D14] text-base whitespace-nowrap">{naira(r.budget)}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{r.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                      <span>@{String(r.poster?.handle ?? '').replace(/^@/, '')}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {r.deadline ? new Date(r.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Flexible'}</span>
                      {r.campus && <span>{r.campus}</span>}
                    </div>
                  </div>
                  <RequestDetail
                    open={open}
                    busy={expandedLoading}
                    offers={open ? expandedOffers : []}
                    session={!!session}
                    isOwn={isOwn}
                    price={offerPrice}
                    setPrice={setOfferPrice}
                    note={offerNote}
                    setNote={setOfferNote}
                    offerBusy={offerBusy}
                    onOffer={makeOffer}
                    onAccept={acceptOffer}
                  />
                </article>
              );
            })}

            {requests.length < total && (
              <button
                onClick={() => load(page + 1)}
                disabled={loading}
                className="w-full border border-gray-200 hover:border-gray-400 disabled:opacity-50 text-gray-600 font-bold text-sm py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Load more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** Expanded offers/offer-form block for one request */
const RequestDetail: React.FC<{
  open: boolean;
  busy: boolean;
  offers: any[];
  session: boolean;
  isOwn: boolean;
  price: string;
  setPrice: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  offerBusy: boolean;
  onOffer: () => void;
  onAccept: (offererId: string) => void;
}> = ({ open, busy, offers, session, isOwn, price, setPrice, note, setNote, offerBusy, onOffer, onAccept }) => {
  if (!open) return null;
  const nairaIn = (kobo: number) => `₦${Math.round((kobo ?? 0) / 100).toLocaleString('en-NG')}`;
  return (
    <div className="border-t border-gray-100 mt-4 pt-4">
      {busy ? (
        <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#00A651]" /></div>
      ) : (
        <>
          <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
            Offers ({offers.length})
          </p>
          {offers.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">No offer yet. Be the first!</p>
          ) : (
            <div className="space-y-2.5 mb-4">
              {offers.map((o) => (
                <div key={o.id} className="bg-gray-50 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#0D0D14] truncate">
                      @{String(o.offerer?.handle ?? '').replace(/^@/, '')} · {nairaIn(o.price)}
                    </p>
                    {o.note && <p className="text-xs text-gray-500 mt-0.5">{o.note}</p>}
                  </div>
                  {isOwn && o.status === 'pending' && (
                    <button
                      onClick={() => onAccept(o.offerer_id)}
                      disabled={offerBusy}
                      className="bg-[#00A651] hover:bg-[#008040] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shrink-0"
                    >
                      Accept
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {session && !isOwn && (
            <div className="bg-[#F7F8FA] rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">Make an offer</p>
              <div className="flex gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3.5 flex-1">
                  <span className="text-gray-500 font-bold text-sm">₦</span>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" placeholder="Your price" className="flex-1 min-w-0 bg-transparent py-2.5 text-sm outline-none" />
                </div>
                <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Note (optional)" className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00A651]" />
              </div>
              <button
                onClick={onOffer}
                disabled={offerBusy}
                className="w-full bg-[#0D0D14] hover:bg-[#00A651] disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {offerBusy && <Loader2 className="w-4 h-4 animate-spin" />} <Shield className="w-4 h-4" /> Send offer
              </button>
            </div>
          )}
          {!session && (
            <Link to="/login" className="block text-center border border-gray-200 text-gray-600 font-bold text-sm py-3 rounded-xl">
              Log in to make an offer
            </Link>
          )}
        </>
      )}
    </div>
  );
};


