/**
 * /auth/callback — Supabase OAuth redirect landing page.
 * Supabase passes the session in the URL hash. We extract it, let the
 * Supabase client parse it, then redirect to the correct page.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, fetchProfile, upsertProfile } from '../lib/auth';
import { LogoMark } from '../app/components/brand/LogoMark';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError]   = useState('');

  useEffect(() => {
    const handle = async () => {
      // Let Supabase parse the hash fragment (access_token etc.)
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        // Try exchanging the code from the URL query param (PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code   = params.get('code');
        if (code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) { setError(exchangeErr.message); return; }
        } else {
          setError('Could not complete sign-in. Please try again.');
          return;
        }
      }

      const { data: fresh } = await supabase.auth.getSession();
      const user = fresh.session?.user;
      if (!user) { setError('Sign-in failed. Please try again.'); return; }

      // Upsert a minimal profile row if this is a new Google/OAuth user
      const existing = await fetchProfile(user.id);
      if (!existing) {
        const meta  = user.user_metadata ?? {};
        const base  = (meta.full_name ?? meta.name ?? 'user').toLowerCase().replace(/\s+/g, '_');
        const handle = `${base}_${Math.floor(Math.random() * 9000) + 1000}`;
        await upsertProfile(user.id, {
          email:      user.email ?? '',
          handle,
          full_name:  meta.full_name ?? meta.name ?? '',
          avatar_url: meta.avatar_url ?? meta.picture ?? null,
          onboarding_step: 1,
        } as any);
        navigate('/onboarding', { replace: true });
      } else if (!existing.onboarding_complete) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    };

    handle();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Sign-in failed</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <a href="/login" className="bg-[#0A2540] text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-[#00A651] transition-colors">
          Try again
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 bg-[#00A651] rounded-3xl flex items-center justify-center shadow-lg animate-pulse">
          <LogoMark size={32} tone="light" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  );
};
