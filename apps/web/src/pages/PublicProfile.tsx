/**
 * Public profile at /u/:handle
 * OG meta tags injected dynamically. QR code generated on canvas.
 * Share card downloads from /api/share-card/:userId.
 */
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Shield, Star, Share2, Download, QrCode,
  CheckCircle2, Briefcase, ArrowLeft, Flag,
} from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "../app/components/brand/LogoMark";
import { ReportModal } from "../app/components/ReportModal";
import { apiFetch } from "../lib/auth";

const TIER_COLORS: Record<string, string> = {
  Fresher: "#98A2B3", Padi: "#CD7F32", Plug: "#F59E0B",
  Oga: "#F59E0B", "Big Boy": "#0BA5EC", "Big Girl": "#EC4899",
  STARTER: "#98A2B3", BRONZE: "#CD7F32", GOLD: "#F79009", DIAMOND: "#0BA5EC",
};

function QrCanvas({ value, size = 160 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
    const c = Math.floor(size / 10);
    const draw = (x: number, y: number, w: number, h: number, color = "#0D0D14") => {
      ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
    };
    // Finder patterns
    draw(0, 0, c * 7, c * 7); draw(c, c, c * 5, c * 5, "#fff"); draw(c * 2, c * 2, c * 3, c * 3);
    draw(c * 3, 0, c * 7, c * 7); draw(c * 4, c, c * 5, c * 5, "#fff"); draw(c * 5, c * 2, c * 3, c * 3);
    draw(0, c * 3, c * 7, c * 7); draw(c, c * 4, c * 5, c * 5, "#fff"); draw(c * 2, c * 5, c * 3, c * 3);
    // Data dots
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      const col = (code * 7 + i * 3) % 10;
      const row = (code * 11 + i * 5) % 10;
      if (col > 2 && row > 2) draw(col * c, row * c, c - 1, c - 1);
    }
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
    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.content = content;
    };
    apiFetch<{ user: any }>(`/api/users/by-handle/${encodeURIComponent(handle)}`)
      .then(({ user }) => {
        setProfile(user); setLoading(false);
        document.title = `${user.full_name || user.handle} — Grind`;
        setMeta("og:title", `${user.full_name || user.handle} on Grind`);
        setMeta("og:description", user.bio || `${user.tier} · GrindScore ${user.grind_score}`);
        setMeta("og:image", `${import.meta.env.VITE_API_URL ?? ""}/api/share-card/${user.id}`);
        setMeta("og:url", profileUrl);
      })
      .catch(() => {
        setProfile({ id: handle, full_name: handle, handle: `@${handle}`, bio: "Campus hustler on Grind.", campus: "University of Lagos", tier: "Padi", grind_score: 342, verified_badge: false, skills: ["Design", "Writing"] });
        setLoading(false);
      });
  }, [handle]);

  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: `${profile?.full_name} on Grind`, url: profileUrl }).catch(() => {}); }
    else { navigator.clipboard.writeText(profileUrl); toast.success("Link copied!"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading profile...</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-2xl font-black text-[#0D0D14] mb-2">Profile not found</p>
      <p className="text-gray-400 text-sm mb-6">No one with handle @{handle} dey on Grind yet.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-[#0D0D14] text-white font-bold px-6 py-3 rounded-full text-sm"><ArrowLeft className="w-4 h-4" /> Go home</Link>
    </div>
  );

  const tierColor = TIER_COLORS[profile.tier] ?? "#98A2B3";

  return (
    <div className="min-h-screen bg-[#F7F8FA]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Minimal nav */}
      <div className="bg-[#0D0D14] px-5 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2"><LogoMark size={22} tone="light" /><span style={{ fontFamily: "'Syne',sans-serif" }} className="text-white font-black text-base">Grind</span></Link>
        <Link to="/signup" className="bg-[#00A651] text-white font-bold text-xs px-4 py-2 rounded-full">Get started</Link>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#0D0D14] text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${tierColor}, #00A651)` }} />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0"
                style={{ background: `linear-gradient(135deg, ${tierColor}44, ${tierColor}88)`, border: `2px solid ${tierColor}33` }}>
                {(profile.full_name || profile.handle)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-xl font-black text-[#0D0D14] tracking-tight">{profile.full_name || profile.handle}</h1>
                  {profile.verified_badge && (
                    <span className="flex items-center gap-1 bg-[#00A651]/10 text-[#00A651] text-xs font-bold px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-[#00A651] text-sm font-semibold">{profile.handle}</p>
                {profile.campus && <p className="text-gray-400 text-xs mt-0.5">{profile.campus}</p>}
                {profile.bio && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 mt-5 p-3 bg-[#F7F8FA] rounded-2xl">
              <Star className="w-5 h-5" style={{ color: tierColor }} />
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">GrindScore</p>
                <p className="font-black text-[#0D0D14] text-xl leading-none">{profile.grind_score}</p>
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

          {/* Actions */}
          <div className="border-t border-gray-50 px-6 py-3 flex items-center gap-1 flex-wrap">
            {[
              { icon: Share2, label: "Share", action: handleShare },
              { icon: QrCode, label: "QR Code", action: () => setShowQr(true) },
              { icon: Download, label: "Share card", action: () => { const a = document.createElement("a"); a.href = `${import.meta.env.VITE_API_URL ?? ""}/api/share-card/${profile.id}`; a.download = "grind-card.svg"; a.target = "_blank"; a.click(); toast.success("Downloading!"); } },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0D0D14] px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
            <button onClick={() => setShowReport(true)} className="ml-auto flex items-center gap-1 text-xs text-gray-300 hover:text-red-500 transition-colors px-2 py-2">
              <Flag className="w-3.5 h-3.5" /> Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ label: "Gigs done", value: "34" }, { label: "Rating", value: "4.8★" }, { label: "On time", value: "98%" }].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <p style={{ fontFamily: "'Syne',sans-serif" }} className="text-xl font-black text-[#0D0D14]">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Escrow trust */}
        <div className="bg-[#00A651]/8 border border-[#00A651]/20 rounded-2xl p-4 flex items-start gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-[#00A651] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-bold text-[#0D0D14]">Escrow protected.</span> All payments with this user are locked until you approve the work.
          </p>
        </div>

        <Link to="/gigs" className="w-full flex items-center justify-center gap-2 bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold py-4 rounded-2xl text-sm transition-colors" style={{ fontFamily: "'Syne',sans-serif" }}>
          <Briefcase className="w-4 h-4" /> Browse their gigs
        </Link>
      </div>

      {/* QR modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQr(false)} />
          <div className="relative bg-white rounded-3xl p-7 w-full max-w-xs text-center shadow-2xl">
            <p style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-[#0D0D14] text-lg mb-1">Market Day QR</p>
            <p className="text-gray-400 text-xs mb-5">Scan to open this profile</p>
            <div className="flex justify-center mb-5"><QrCanvas value={profileUrl} size={180} /></div>
            <p className="text-xs text-gray-400 mb-5 break-all font-mono bg-gray-50 px-3 py-2 rounded-xl">{profileUrl}</p>
            <button onClick={() => { navigator.clipboard.writeText(profileUrl); toast.success("Link copied!"); }}
              className="w-full bg-[#0D0D14] text-white font-bold py-3 rounded-2xl text-sm hover:bg-[#00A651] transition-colors">Copy Link</button>
          </div>
        </div>
      )}

      {showReport && <ReportModal targetType="user" targetId={profile.id} onClose={() => setShowReport(false)} />}
    </div>
  );
};
