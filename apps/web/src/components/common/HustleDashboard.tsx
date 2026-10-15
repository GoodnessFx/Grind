/**
 * HustleDashboard — the Home section with:
 *  1. Sapa Meter (weekly earnings vs weekly_earn_target)
 *  2. Daily Spin (GET/POST /api/spin)
 *  3. Seller of the Week (GET /api/leaderboard)
 * Guests see teaser cards with a login CTA; Seller of the Week is public.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Target, Sparkles, Trophy, ArrowRight, Pencil, Check, Loader2, Lock } from 'lucide-react';
import { apiFetch, useAuth, upsertProfile } from '../../lib/auth';
import { useTranslation } from '../../lib/i18n';
import { toast } from 'sonner';

const naira = (kobo: number) => `₦${Math.round((kobo ?? 0) / 100).toLocaleString('en-NG')}`;

function weekStart(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Guest lock card ────────────────────────────────────────────────────────────
const GuestLock: React.FC<{ text: string; dark?: boolean }> = ({ text, dark }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${dark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-400'}`}>
      <Lock className="w-4 h-4" />
    </span>
    <p className={`text-xs font-medium max-w-[200px] ${dark ? 'text-white/60' : 'text-gray-400'}`}>{text}</p>
    <Link
      to="/login"
      className={`font-black text-xs px-5 py-2.5 rounded-full transition-colors ${dark ? 'bg-[#00A651] hover:bg-[#008040] text-white' : 'bg-[#0D0D14] hover:bg-[#00A651] text-white'}`}
    >
      Log in
    </Link>
  </div>
);

// ── 1. Sapa Meter ──────────────────────────────────────────────────────────────
const SapaMeter: React.FC<{
  authed: boolean;
  target: number;
  onSavedTarget: (kobo: number) => void;
}> = ({ authed, target, onSavedTarget }) => {
  const { t } = useTranslation();
  const [earned, setEarned] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authed) return;
    apiFetch<{ transactions: any[] }>('/api/wallet')
      .then(({ transactions }) => {
        const from = weekStart().getTime();
        const sum = (transactions ?? [])
          .filter((x) => x.status === 'success' && (x.amount ?? 0) > 0 && Date.parse(x.created_at) >= from)
          .reduce((s, x) => s + x.amount, 0);
        setEarned(sum);
      })
      .catch(() => setEarned(0));
  }, [authed]);

  const startEdit = () => {
    setDraft(String(Math.round((target ?? 0) / 100)));
    setEditing(true);
  };

  const saveTarget = async () => {
    const nairaVal = Number(draft.replace(/[^0-9]/g, ''));
    if (!nairaVal || nairaVal < 100) { toast.error('Enter at least ₦100'); return; }
    setSaving(true);
    try {
      onSavedTarget(nairaVal * 100);
      setEditing(false);
      toast.success(t('success.saved'));
    } finally {
      setSaving(false);
    }
  };

  const pct = target > 0 && earned !== null ? Math.min(100, Math.round((earned / target) * 100)) : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00A651]">
          <Target className="w-3.5 h-3.5" /> {t('home.sapa_meter')}
        </span>
        {authed && !editing && (
          <button onClick={startEdit} className="text-gray-400 hover:text-[#0D0D14] p-1" aria-label="Edit target">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!authed ? (
        <GuestLock text={t('home.sign_in_track')} />
      ) : (
        <>
          <p style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl font-black text-[#0D0D14] mb-1">
            {earned === null ? '…' : naira(earned)}
          </p>
          <p className="text-gray-400 text-xs font-medium mb-4">{t('home.sapa_earned')}</p>

          {editing ? (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500 font-bold text-sm">₦</span>
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTarget(); }}
                placeholder="e.g. 20000"
                className="flex-1 min-w-0 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00A651]"
              />
              <button
                onClick={saveTarget}
                disabled={saving}
                className="bg-[#00A651] hover:bg-[#008040] disabled:opacity-50 text-white rounded-xl p-2"
                aria-label={t('home.sapa_save_target')}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
            </div>
          ) : target > 0 ? (
            <p className="text-xs text-gray-500 mb-2 font-semibold">
              {t('home.sapa_vs_target', { done: naira(earned ?? 0), target: naira(target) })}
            </p>
          ) : (
            <button onClick={startEdit} className="text-xs font-bold text-[#00A651] hover:underline text-left mb-2">
              {t('home.sapa_target')} →
            </button>
          )}

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-auto">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct !== null && pct >= 100 ? 'bg-[#00A651]' : 'bg-gradient-to-r from-[#00A651] to-[#34D07F]'}`}
              style={{ width: `${pct ?? (earned ? 4 : 0)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold mt-1.5">
            <span className="text-[#00A651]">{earned !== null ? naira(earned) : ''}</span>
            <span className="text-gray-400">{target > 0 ? naira(target) : t('home.sapa_no_target')}</span>
          </div>
        </>
      )}
    </div>
  );
};

// ── 2. Daily Spin ──────────────────────────────────────────────────────────────
type SpinPrize = { type: string; value: number; label: string };

const DailySpin: React.FC<{ authed: boolean; onWin: () => void }> = ({ authed, onWin }) => {
  const { t } = useTranslation();
  const [spunToday, setSpunToday] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [prize, setPrize] = useState<SpinPrize | null>(null);

  useEffect(() => {
    if (!authed) return;
    apiFetch<{ spun_today: boolean; last_spin: any }>('/api/spin/status')
      .then((d) => setSpunToday(d.spun_today))
      .catch(() => {});
  }, [authed]);

  const spin = async () => {
    if (spinning || spunToday) return;
    setSpinning(true);
    setPrize(null);
    setDeg((d) => d + 3600 + Math.floor(Math.random() * 360));
    try {
      const [res] = await Promise.all([
        apiFetch<{ prize: SpinPrize }>('/api/spin', { method: 'POST' }),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
      setSpunToday(true);
      setPrize(res.prize);
      if (res.prize.type === 'credit') onWin();
      toast.success(
        res.prize.type === 'credit'
          ? t('spin.won_credit', { amount: res.prize.value / 100 })
          : res.prize.type === 'free_gig_post'
            ? t('spin.won_free_gig')
            : t('spin.try_again'),
      );
    } catch (err: any) {
      const msg = String(err?.message ?? t('error.generic'));
      if (msg.includes('spin today')) {
        setSpunToday(true);
        toast.error(t('spin.already_spun'));
      } else {
        toast.error(msg || t('error.generic'));
      }
    } finally {
      setSpinning(false);
    }
  };

  const prizeMessage = prize
    ? prize.type === 'credit'
      ? t('spin.won_credit', { amount: prize.value / 100 })
      : prize.type === 'free_gig_post'
        ? t('spin.won_free_gig')
        : t('spin.try_again')
    : spunToday
      ? t('spin.already_spun')
      : t('spin.sub');

  return (
    <div className="bg-[#0D0D14] rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#00A651]/20 blur-3xl rounded-full pointer-events-none" />
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00A651] mb-4 relative">
        <Sparkles className="w-3.5 h-3.5" /> {t('spin.title')}
      </span>

      {!authed ? (
        <GuestLock dark text={t('home.sign_in_track')} />
      ) : (
        <div className="flex items-center gap-5 relative">
          <button
            onClick={spin}
            disabled={spinning || spunToday}
            className="shrink-0 relative w-24 h-24 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00A651]/50 disabled:cursor-not-allowed"
            aria-label={t('spin.spin')}
          >
            <div
              className="w-full h-full rounded-full border-4 border-[#00A651] flex items-center justify-center"
              style={{
                background: 'conic-gradient(#00A651 0deg 45deg, #141417 45deg 90deg, #00A651 90deg 135deg, #141417 135deg 180deg, #00A651 180deg 225deg, #141417 225deg 270deg, #00A651 270deg 315deg, #141417 315deg 360deg)',
                transform: `rotate(${deg}deg)`,
                transition: spinning ? 'transform 2.4s cubic-bezier(0.15, 0.65, 0.15, 1)' : 'none',
              }}
            >
              <span className={`text-3xl drop-shadow ${spinning ? 'opacity-40' : ''}`}>💸</span>
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[10px] border-t-[#00A651]" />
          </button>

          <div className="min-w-0">
            <p className="text-white font-bold text-sm mb-2 leading-snug">{prizeMessage}</p>
            <button
              onClick={spin}
              disabled={spinning || spunToday}
              className="bg-[#00A651] hover:bg-[#008040] disabled:opacity-40 text-white font-black text-sm px-5 py-2.5 rounded-full transition-colors"
            >
              {spinning ? t('loading.default') : spunToday ? t('spin.try_again') : t('spin.spin')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 3. Seller of the Week ──────────────────────────────────────────────────────
const SellerOfWeek: React.FC = () => {
  const { t } = useTranslation();
  const [seller, setSeller] = useState<any | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const normalize = (row: any) =>
      row?.user ? { ...row.user, gigs_week: row.gigs_completed, earnings_week: row.earnings_kobo } : row;
    apiFetch<{ leaderboard: any[] }>('/api/leaderboard?limit=1')
      .then((d) => {
        if (d.leaderboard?.length) { setSeller(normalize(d.leaderboard[0])); return; }
        // Weekly snapshot empty (cron not run yet) → fall back to all-time top
        return apiFetch<{ leaderboard: any[] }>('/api/leaderboard/global?limit=1').then((g) => {
          setSeller(g.leaderboard?.length ? normalize(g.leaderboard[0]) : null);
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const handle = String(seller?.handle ?? '').replace(/^@/, '');

  return (
    <div className="bg-gradient-to-br from-[#00A651] to-[#008040] rounded-3xl p-6 shadow-sm flex flex-col text-white relative overflow-hidden">
      <div className="absolute -bottom-14 -left-14 w-44 h-44 bg-white/10 blur-2xl rounded-full pointer-events-none" />
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80 mb-4 relative">
        <Trophy className="w-3.5 h-3.5" /> {t('home.seller_week')}
      </span>

      {!loaded ? (
        <div className="flex-1 flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-white/70" />
        </div>
      ) : !seller ? (
        <p className="text-white/80 text-sm font-medium relative">{t('home.no_leader')}</p>
      ) : (
        <div className="flex items-center gap-3.5 relative">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-xl font-black overflow-hidden shrink-0">
            {seller.avatar_url
              ? <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
              : String(seller.full_name || seller.handle || '?')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-lg leading-tight truncate">
              {seller.full_name || seller.handle}
            </p>
            <p className="text-white/70 text-xs font-semibold truncate">
              @{handle} · {seller.campus ?? 'Grind'}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-black bg-white/15 px-2 py-0.5 rounded-full">{seller.tier ?? 'Fresher'}</span>
              <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">Score {seller.grind_score ?? seller.score ?? 0}</span>
              {seller.gigs_week != null && (
                <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">{seller.gigs_week} gigs</span>
              )}
            </div>
          </div>
        </div>
      )}

      {seller && handle && (
        <Link
          to={`/u/${encodeURIComponent(handle)}`}
          className="mt-4 relative flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
        >
          {t('home.view_profile')} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
};

// ── Section wrapper ────────────────────────────────────────────────────────────
export const HustleDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, session, refreshProfile, updateUser } = useAuth();
  const authed = !!session;

  const handleSavedTarget = useCallback(async (kobo: number) => {
    updateUser({ weekly_earn_target: kobo });
    if (user?.id) {
      try { await upsertProfile(user.id, { weekly_earn_target: kobo } as any); } catch { /* offline */ }
    }
  }, [user?.id, updateUser]);

  return (
    <section className="py-16 bg-[#F7F8FA] border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#00A651] mb-3">Grind daily</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-3xl sm:text-4xl font-black text-[#0D0D14] tracking-tight">
              {authed ? t('home.hustle_today') : t('home.hustle_guest')}
            </h2>
            {!authed && <p className="text-gray-500 mt-2 text-sm">{t('home.sign_in_track')}</p>}
          </div>
          <div className="flex gap-2">
            <Link to="/gigs" className="flex items-center gap-2 text-[#0D0D14] font-bold text-sm border border-gray-200 px-5 py-2.5 rounded-full hover:border-gray-400 transition-colors">
              {t('home.browse_gigs')}
            </Link>
            <Link to="/post-gig" className="flex items-center gap-2 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
              {t('home.post_gig')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SapaMeter authed={authed} target={user?.weekly_earn_target ?? 0} onSavedTarget={handleSavedTarget} />
          <DailySpin authed={authed} onWin={() => refreshProfile()} />
          <SellerOfWeek />
        </div>
      </div>
    </section>
  );
};