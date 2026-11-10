/**
 * /post-gig — public-facing post gig wizard.
 * Wraps the existing PostTask app component in the web Router layout.
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogoMark } from "../app/components/brand/LogoMark";
import { PostTask } from "../app/components/PostTask";

export const PostGigPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Nav */}
      <div className="bg-[#0D0D14] px-5 h-14 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark size={22} tone="light" />
          <span style={{ fontFamily: "'Syne',sans-serif" }} className="text-white font-black text-base">Grind</span>
        </Link>
        <Link to="/gigs" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Browse Gigs</Link>
      </div>

      {/* PostTask fills remaining height */}
      <div className="flex-1 overflow-y-auto">
        <PostTask
          onBack={() => navigate("/gigs")}
          onPostSuccess={() => { navigate("/gigs"); }}
        />
      </div>
    </div>
  );
};
