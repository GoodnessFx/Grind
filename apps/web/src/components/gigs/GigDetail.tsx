/**
 * GigDetail — drawer with the full gig lifecycle:
 * apply (pitch) · view/accept applicants · mark done · approve & release
 * (→ one-tap Share card) · dispute · report poster.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Shield, Flag, Clock, Send, Loader2, CheckCircle2, Users,
  Award, Share2, AlertTriangle,
} from 'lucide-react';
import { apiFetch, useAuth } from '../../lib/auth';
import { useTranslation } from '../../lib/i18n';
import { toast } from 'sonner';
import { ReportModal, type ReportTargetType } from '../common/ReportModal';
import { ShareCardModal } from '../common/ShareCardModal';

const naira = (kobo: number) => `₦${Math.round((kobo ?? 0) / 100).toLocaleString('en-NG')}`;

function deadlineLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = d.getTime() - Date.now();
  if (diff > 0 && diff < 2 * 3600_000) return 'Due in a few hours';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

interface GigDetailProps {
  gigId: string;
  onClose: () => void;
  onChanged?: () => void;
}

export const GigDetail: React.FC<GigDetailProps> = ({ gigId, onClose, onChanged }) => {
  const { t } = useTranslation();
  const { user, session } = useAuth();
  const [gig, setGig] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pitch, setPitch] = useState('');
  const [busy, setBusy] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [report, setReport] = useState<{ type: ReportTargetType; id: string } | null>(null);
  const [showShare, setShowShare] = useState(false);

  const load = useCallback(async () => {
    try {
      const { gig: g } = await apiFetch<{ gig: any }>(`/api/gigs/${gigId}`);
      setGig(g);
      if (user?.id && g.poster_id === user.id && g.status === 'open') {
        try {
          const d = await apiFetch<{ applications: any[] }>(`/api/gigs/${gigId}/applications`);
          setApps(d.applications ?? []);
        } catch { /* not allowed */ }
      } else {
        setApps([]);
      }
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [gigId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const post = async (path: string, body?: unknown, okMsg?: string): Promise<boolean> => {
    if (busy) return false;
    setBusy(true);
    try {
      await apiFetch(`/api/gigs/${gigId}${path}`, {
        method: 'POST',
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      if (okMsg) toast.success(okMsg);
      await load();
      onChanged?.();
      return true;
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleApply = async () => {
    if (pitch.trim().length < 10) { toast.error('Write at least 10 characters'); return; }
    const ok = await post('/apply', { pitch: pitch.trim() }, t('gig.apply_success'));
    if (ok) setPitch('');
  };

  const handleApprove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await apiFetch<{ doer_earnings: number }>(`/api/gigs/${gigId}/approve`, { method: 'POST' });
      toast.success(`Approved! ₦${Math.round((res.doer_earnings ?? 0) / 100).toLocaleString()} released.`);
      await load();
      onChanged?.();
      setShowShare(true); // one-tap share card right after completion
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
    } finally {
      setBusy(false);
    }
  };

  const handleDispute = async () => {
    if (disputeReason.trim().length < 10) { toast.error('Give a reason of at least 10 characters'); return; }
    const ok = await post('/dispute', { reason: disputeReason.trim() }, 'Dispute opened. Admin go review am.');
    if (ok) { setDisputeOpen(false); setDisputeReason(''); }
  };

  const isPoster = !!user && gig?.poster_id === user.id;
  const isDoer = !!user && gig?.doer_id === user.id;
  const poster = gig?.poster;
  const posterHandle = String(poster?.handle ?? '').replace(/^@/, '');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-3 rounded-t-3xl z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {gig?.is_urgent && (
                <span className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{t('gig.urgent')}</span>
              )}
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00A651] bg-[#00A651]/10 px-2 py-0.5 rounded-full">
                {gig?.category}
              </span>
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-lg text-[#0D0D14] leading-snug truncate">
              {gig?.title ?? '…'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !gig ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-[#00A651]" />
          </div>
        ) : (
          <div className="px-6 py-5">
            {/* Budget / deadline / escrow */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#00A651]/8 border border-[#00A651]/20 rounded-2xl p-3.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#00A651] mb-0.5">Budget</p>
                <p style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-xl text-[#0D0D14]">{naira(gig.budget)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">Deadline</p>
                <p className="font-black text-xl text-[#0D0D14] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" /> {deadlineLabel(gig.deadline)}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-5">{gig.description}</p>

            {/* Poster */}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D14] text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                {poster?.avatar_url
                  ? <img src={poster.avatar_url} alt="" className="w-full h-full object-cover" />
                  : String(poster?.full_name || poster?.handle || '?')[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                {posterHandle ? (
                  <Link to={`/u/${encodeURIComponent(posterHandle)}`} className="font-bold text-sm text-[#0D0D14] hover:text-[#00A651] transition-colors block truncate">
                    {poster?.full_name || poster?.handle}
                  </Link>
                ) : (
                  <p className="font-bold text-sm text-[#0D0D14] truncate">{poster?.full_name}</p>
                )}
                <p className="text-gray-500 text-xs flex items-center gap-1.5">
                  {poster?.tier} · Score {poster?.grind_score ?? 0}
                  {poster?.verified_badge && <Shield className="w-3 h-3 text-[#00A651] inline" />}
                </p>
              </div>
              {poster?.id && (
                <button
                  onClick={() => setReport({ type: 'user', id: poster.id })}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
              <Shield className="w-3.5 h-3.5 text-[#00A651]" /> {t('gig.escrow')} · {gig.application_count ?? 0} <Users className="w-3.5 h-3.5" /> applied
            </p>

            {/* ── Action zone ─────────────────────────────────────────────── */}

            {/* Apply (visitor, gig open) */}
            {gig.status === 'open' && session && !isPoster && (
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">{t('gig.apply')}</label>
                <textarea
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder={t('gig.pitch_placeholder')}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00A651] resize-none mb-3"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray-400">{pitch.length}/500</span>
                  <button
                    onClick={handleApply}
                    disabled={busy || pitch.trim().length < 10}
                    className="bg-[#0D0D14] hover:bg-[#00A651] disabled:opacity-40 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-colors flex items-center gap-2"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {t('gig.apply')}
                  </button>
                </div>
              </div>
            )}

            {!session && gig.status === 'open' && (
              <Link to="/login" className="block text-center bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold text-sm py-3.5 rounded-2xl transition-colors">
                {t('gig.apply')}
              </Link>
            )}

            {/* Poster: applicants */}
            {isPoster && gig.status === 'open' && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Applicants ({apps.length})
                </p>
                {apps.length === 0 ? (
                  <p className="text-sm text-gray-400">Nobody don apply yet.</p>
                ) : (
                  <div className="space-y-3">
                    {apps.map((a) => (
                      <div key={a.id} className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <Link to={`/u/${encodeURIComponent(String(a.applicant?.handle ?? '').replace(/^@/, ''))}`} className="font-bold text-sm text-[#0D0D14] hover:text-[#00A651]">
                            {a.applicant?.full_name || a.applicant?.handle}
                          </Link>
                          <span className="text-[10px] font-black bg-white border border-gray-200 px-2 py-0.5 rounded-full">Score {a.applicant?.grind_score ?? 0}</span>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed mb-3">{a.pitch}</p>
                        <button
                          onClick={() => post(`/accept/${a.applicant_id}`, undefined, 'Applicant accepted!')}
                          disabled={busy || a.status === 'accepted'}
                          className="w-full bg-[#00A651] hover:bg-[#008040] disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
                        >
                          {a.status === 'accepted' ? 'Accepted ✓' : t('gig.accept')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Doer: submit work */}
            {isDoer && gig.status === 'accepted' && (
              <div className="border-t border-gray-100 pt-4">
                <button
                  onClick={() => post('/submit', undefined, 'Work submitted for review!')}
                  disabled={busy}
                  className="w-full bg-[#00A651] hover:bg-[#008040] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {t('gig.mark_done')}
                </button>
              </div>
            )}

            {/* Poster: approve & release (→ share card) */}
            {isPoster && gig.status === 'submitted' && (
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="w-full bg-[#00A651] hover:bg-[#008040] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} {t('gig.approve')}
                </button>
                <p className="text-[11px] text-gray-400 text-center">Funds go land for the doer wallet immediately.</p>
              </div>
            )}

            {/* Completed → one-tap share card */}
            {gig.status === 'completed' && (isPoster || isDoer) && (
              <div className="border-t border-gray-100 pt-4">
                <div className="bg-[#00A651]/8 border border-[#00A651]/20 rounded-2xl p-4 flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00A651] shrink-0" />
                  <p className="text-sm text-gray-700"><span className="font-bold text-[#0D0D14]">Gig complete.</span> Money don land. Share your win!</p>
                </div>
                <button
                  onClick={() => setShowShare(true)}
                  className="w-full bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> {t('share.title')}
                </button>
              </div>
            )}

            {/* Dispute */}
            {session && ['accepted', 'submitted'].includes(gig.status) && (isPoster || isDoer) && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                {!disputeOpen ? (
                  <button
                    onClick={() => setDisputeOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 py-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> {t('gig.dispute')}
                  </button>
                ) : (
                  <div>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="Wetin happen? Give details..."
                      className="w-full bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-red-300 resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setDisputeOpen(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold text-xs py-2.5 rounded-xl">Cancel</button>
                      <button
                        onClick={handleDispute}
                        disabled={busy}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl"
                      >
                        {t('gig.dispute')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status pill for everyone else */}
            {gig.status !== 'open' && !['completed'].includes(gig.status) && (
              <p className="text-center text-xs font-bold text-gray-400 border-t border-gray-100 pt-4 mt-4 capitalize">
                Status: {gig.status}
              </p>
            )}
          </div>
        )}

        {/* Report modal */}
        {report && (
          <ReportModal targetType={report.type} targetId={report.id} onClose={() => setReport(null)} />
        )}

        {/* Share card modal — one-tap after completion */}
        {showShare && user && (
          <ShareCardModal userId={user.id} onClose={() => setShowShare(false)} />
        )}
      </div>
    </div>
  );
};

