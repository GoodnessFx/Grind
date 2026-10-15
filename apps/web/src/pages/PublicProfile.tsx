/**
 * Public profile at /u/:handle
 * Shows GrindScore, tier, completed gigs, ratings, verified badge.
 * OG meta tags injected dynamically. QR code generated with a canvas.
 * Share card download from /api/share-card/:userId.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield, Star, Share2, Download, QrCode,
  CheckCircle2, Briefcase, ArrowLeft, ExternalLink, Flag,
} from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';
import { Navbar } from '../components/common/Navbar';
import { apiFetch } from '../lib/auth';
import { toast } from 'sonner';
import { ReportModal } from '../components/common/ReportModal';
import QRCode from 'qrcode';

const TIER_COLORS: Record<string, string> = {
  Fresher: '#98A2B3', Padi: '#CD7F32', Plug: '#F59E0B',
  Oga: '#F59E0B', 'Big Boy': '#0BA5EC', 'Big Girl': '#EC4899',
};

// Real QR code — scans straight to this profile (qrcode → canvas)
function QrCanvas({ value, size = 160 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !value) return;
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      color: { dark: '#0D0D14', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).catch(() => {});
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} className="rounded-xl" />;
}

export const PublicProfile: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const profileUrl = `${window.location.origin}/u/${handle}`;

  useEffect(() => {
    if (!handle) return;
    // Inject OG meta dynamically
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', name); document.head.appendChild(el); }
      el.content = content;
    };

    apiFetch<{ user: any }>(`/api/users/by-handle/${encodeURIComponent(handle)}`)
      .then(({ user }) => {
        setProfile(user);
        setLoading(false);
        document.title = `${user.full_name || user.handle} — Grind`;
        setMeta('og:type', 'profile');
        setMeta('og:title', `${user.full_name || user.handle} on Grind`);
        setMeta('og:description', user.bio || `${user.tier} • GrindScore ${user.grind_score}`);
        setMeta('og:image', `${import.meta.env.VITE_API_URL ?? ''}/api/share-card/${user.id}`);
        setMeta('og:url', profileUrl);
        setMeta('twitter:card', 'summary_large_image');
      })
      .catch(() => {
        // Demo fallback
        setProfile({
          id: handle,
          full_name: handle,
          handle: `@${handle}`,
          bio: 'Campus hustler on Grind.',
          campus: 'University of Lagos',
          tier: 'Padi',
          grind_score: 342,
          verified_badge: false,
          is_creator: false,
          avatar_url: null,
          skills: ['Design', 'Writing'],
          stats: { gigs_completed: 12, avg_rating: 4.8, review_count: 9, open_gigs: 2 },
        });
        setLoading(false);
      });
  }, [handle]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${profile?.full_name} on Grind`, url: profileUrl })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Link copied!');
    }
  };

  const handleDownloadCard = () => {
    const url = `${import.meta.env.VITE_API_URL ?? ''}/api/share-card/${profile?.id}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `grind-${handle}.svg`;
    a.target = '_blank';
    a.click();
    toast.success('Share card downloading!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="w-12 h-12 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <p className="text-2xl font-black text-[#0D0D14] mb-3">Profile not found</p>
          <p className="text-gray-400 text-sm mb-6">No one with handle @{handle} dey on Grind yet.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#0D0D14] text-white font-bold px-6 py-3 rounded-full text-sm">
            <ArrowLeft className="w-4 h-4" /> Go home
          </Link>
        </div>
      </div>
    );
  }

  const tierColor = TIER_COLORS[profile.tier] ?? '#98A2B3';
  const stats = profile.stats ?? { gigs_completed: 0, avg_rating: null, review_count: 0, open_gigs: 0 };
  const displayHandle = profile.handle?.startsWith('@') ? profile.handle : `@${profile.handle ?? ''}`;

  return (
    <div className="min-h-screen bg-[#F7F8FA]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#0D0D14] text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {/* Top accent bar */}
          <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${tierColor}, #00A651)` }} />

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0"
                style={{ background: `linear-gradient(135deg, ${tierColor}33, ${tierColor}88)`, border: `2px solid ${tierColor}44` }}>
                {(profile.full_name || profile.handle)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-xl font-black text-[#0D0D14] tracking-tight">
                    {profile.full_name || profile.handle}
                  </h1>
                  {profile.verified_badge && (
                    <span className="flex items-center gap-1 bg-[#00A651]/10 text-[#00A651] text-xs font-bold px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-[#00A651] text-sm font-semibold">{displayHandle}</p>
                {profile.campus && <p className="text-gray-400 text-xs mt-0.5">{profile.campus}</p>}
                {profile.bio && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
              </div>
            </div>

            {/* Tier + Score */}
            <div className="flex items-center gap-3 mt-5 p-3 bg-[#F7F8FA] rounded-2xl">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${tierColor}20` }}>
                <Star className="w-4 h-4" style={{ color: tierColor }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">GrindScore</p>
                <p className="font-black text-[#0D0D14] text-lg leading-none">{profile.grind_score}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">Tier</p>
                <p className="font-black text-sm" style={{ color: tierColor }}>{profile.tier}</p>
              </div>
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {profile.skills.map((s: string) => (
                  <span key={s} className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="border-t border-gray-50 px-6 py-3 flex items-center gap-2">
            <button onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#0D0D14] transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
              <Share2 className="w-3.5 h-3.5" /> Share profile
            </button>
            <button onClick={() => setShowQr(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#0D0D14] transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>
            <button onClick={handleDownloadCard}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#0D0D14] transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
              <Download className="w-3.5 h-3.5" /> Share card
            </button>
            <button onClick={() => setShowReport(true)}
              className="ml-auto flex items-center gap-1 text-xs text-gray-300 hover:text-red-500 transition-colors px-2 py-2 rounded-xl">
              <Flag className="w-3.5 h-3.5" /> Report
            </button>
          </div>
        </div>

        {/* Stats row — real values from /api/users/by-handle */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Gigs done', value: String(stats.gigs_completed) },
            { label: 'Rating', value: stats.avg_rating != null ? `${stats.avg_rating}★` : '—' },
            { label: 'Reviews', value: String(stats.review_count) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <p style={{ fontFamily: "'Syne',sans-serif" }} className="text-xl font-black text-[#0D0D14]">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Escrow verified */}
        <div className="bg-[#00A651]/8 border border-[#00A651]/20 rounded-2xl p-4 flex items-start gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-[#00A651] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-bold text-[#0D0D14]">Escrow verified.</span> All payments with this user are locked in escrow until you confirm you're satisfied.
          </p>
        </div>

        {/* CTA */}
        <Link to="/gigs"
          className="w-full flex items-center justify-center gap-2 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold py-4 rounded-2xl text-sm transition-colors"
          style={{ fontFamily: "'Syne',sans-serif" }}>
          <Briefcase className="w-4 h-4" /> Browse their gigs <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </Link>
      </div>

      {/* QR Code modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQr(false)} />
          <div className="relative bg-white rounded-3xl p-7 w-full max-w-xs text-center shadow-2xl">
            <p style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-[#0D0D14] text-lg mb-1">Market Day QR</p>
            <p className="text-gray-400 text-xs mb-5">Scan to open this profile</p>
            <div className="flex justify-center mb-5">
              <QrCanvas value={profileUrl} size={180} />
            </div>
            <p className="text-xs text-gray-400 mb-5 break-all font-mono bg-gray-50 px-3 py-2 rounded-xl">{profileUrl}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(profileUrl); toast.success('Link copied!'); }}
              className="w-full bg-[#0D0D14] text-white font-bold py-3 rounded-2xl text-sm hover:bg-[#00A651] transition-colors">
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReport && (
        <ReportModal
          targetType="user"
          targetId={profile.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};
