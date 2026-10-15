/**
 * Settings — /settings — language toggle (Pidgin/English), notification
 * preferences and Refer & Earn. Persists to localStorage immediately and
 * to the user profile when signed in.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Copy, Check, Globe, Bell, Users, Shield, LogOut, Loader2,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useAuth, upsertProfile, signOut, type GrindUser } from '../lib/auth';
import { useTranslation, type Lang } from '../lib/i18n';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  const { t, lang, changeLang } = useTranslation();
  const { user, session, updateUser } = useAuth();
  const [notifs, setNotifs] = useState({
    notif_8am: true, notif_gigs: true, notif_chat: true, notif_wallet: true, notif_promo: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNotifs({
        notif_8am: user.notif_8am ?? true,
        notif_gigs: user.notif_gigs ?? true,
        notif_chat: user.notif_chat ?? true,
        notif_wallet: user.notif_wallet ?? true,
        notif_promo: (user as any).notif_promo ?? false,
      });
    }
  }, [user?.id]);

  const pickLang = async (l: Lang) => {
    changeLang(l); // localStorage + re-render event
    if (user?.id) {
      try { await upsertProfile(user.id, { lang: l } as Partial<GrindUser>); } catch { /* offline */ }
    }
    toast.success(t('settings.saved'));
  };

  const toggleNotif = async (key: keyof typeof notifs) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    updateUser(next as Partial<GrindUser>);
    if (user?.id) {
      setSaving(true);
      try {
        await upsertProfile(user.id, next as Partial<GrindUser>);
        toast.success(t('settings.saved'));
      } catch {
        toast.error(t('error.network'));
      } finally {
        setSaving(false);
      }
    }
  };

  const handle = String(user?.handle ?? '').replace(/^@/, '');
  const refLink = handle ? `${window.location.origin}/ref/${handle}` : '';

  const copyRef = async () => {
    if (!refLink) { toast.error(t('error.generic')); return; }
    try { await navigator.clipboard.writeText(refLink); toast.success(t('success.copied')); }
    catch { toast.error(t('error.generic')); }
  };

  const handleLogout = async () => {
    try { await signOut(); } catch { /* ignore */ }
    try { localStorage.removeItem('grind_user'); } catch { /* ignore */ }
    window.location.href = '/';
  };

  const NOTIF_ROWS: { key: keyof typeof notifs; label: string; desc: string }[] = [
    { key: 'notif_8am',    label: 'Morning gig alert (8am)', desc: 'Fresh gigs for your skills' },
    { key: 'notif_gigs',   label: 'Gig matches',             desc: 'When a gig matches your skills' },
    { key: 'notif_chat',   label: 'Chat messages',           desc: 'New messages from clients' },
    { key: 'notif_wallet', label: 'Wallet activity',         desc: 'Deposits, withdrawals, earnings' },
    { key: 'notif_promo',  label: 'Promotions',              desc: 'Offers and referral bonuses' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#0D0D14] text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl font-black text-[#0D0D14] tracking-tight mb-8">
          {t('settings.title')}
        </h1>

        {/* ── Language ── */}
        <section className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="w-9 h-9 rounded-xl bg-[#00A651]/10 text-[#00A651] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </span>
            <h2 className="font-black text-[#0D0D14]">{t('settings.language')}</h2>
          </div>
          <p className="text-gray-400 text-xs mb-4 ml-12">Every screen switches instantly. We save your choice.</p>
          <div className="grid grid-cols-2 gap-2 ml-0 sm:ml-12">
            {(['pidgin', 'english'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => pickLang(l)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border font-bold text-sm transition-colors ${
                  lang === l
                    ? 'border-[#00A651] bg-[#00A651]/8 text-[#00A651]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {l === 'pidgin' ? 'Naija Pidgin' : 'English'}
                {lang === l && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="w-9 h-9 rounded-xl bg-[#00A651]/10 text-[#00A651] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </span>
            <h2 className="font-black text-[#0D0D14]">{t('settings.notifications')}</h2>
            {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>
          <p className="text-gray-400 text-xs mb-4 ml-12">{session ? 'Saved to your profile.' : 'Log in to save these to your profile.'}</p>
          <div className="space-y-1 ml-0 sm:ml-12">
            {NOTIF_ROWS.map((row) => (
              <button
                key={row.key}
                onClick={() => toggleNotif(row.key)}
                className="w-full flex items-center justify-between gap-3 px-1 py-2.5 text-left"
              >
                <span>
                  <span className="block font-bold text-sm text-gray-700">{row.label}</span>
                  <span className="block text-xs text-gray-400">{row.desc}</span>
                </span>
                <span
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifs[row.key] ? 'bg-[#00A651]' : 'bg-gray-200'}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifs[row.key] ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Refer & Earn ── */}
        {session && handle && (
          <section className="bg-[#0D0D14] rounded-3xl p-5 sm:p-6 shadow-sm mb-4 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#00A651]/20 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative">
              <span className="w-9 h-9 rounded-xl bg-white/10 text-[#00A651] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-black">Refer & Earn ₦500</h2>
                <p className="text-white/50 text-xs">Your invite completes their first gig → you chop ₦500.</p>
              </div>
            </div>
            <div className="flex gap-2 relative">
              <input
                readOnly
                value={refLink}
                onFocus={(e) => e.target.select()}
                className="flex-1 min-w-0 bg-white/8 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 outline-none"
              />
              <button
                onClick={copyRef}
                className="bg-[#00A651] hover:bg-[#008040] text-white font-bold text-xs px-4 rounded-2xl transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </section>
        )}

        {/* ── Links + logout ── */}
        <section className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm mb-4">
          <div className="space-y-1">
            <Link to="/support" className="flex items-center justify-between px-1 py-3 font-bold text-sm text-gray-700 hover:text-[#0D0D14]">
              {t('settings.help')} <span className="text-gray-300">→</span>
            </Link>
            <Link to="/legal/terms-of-service" className="flex items-center justify-between px-1 py-3 font-bold text-sm text-gray-700 hover:text-[#0D0D14]">
              {t('settings.terms')} <span className="text-gray-300">→</span>
            </Link>
          </div>
          {session && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm py-3.5 rounded-2xl transition-colors"
            >
              <LogOut className="w-4 h-4" /> {t('settings.logout')}
            </button>
          )}
        </section>

        <p className="text-center text-gray-300 text-xs flex items-center justify-center gap-1.5 pb-8">
          <Shield className="w-3 h-3" /> Grind Africa Ltd · escrow-protected
        </p>
      </div>
    </div>
  );
};
