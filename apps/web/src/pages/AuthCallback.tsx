/**
 * /auth/callback
 *
 * Handles ALL Supabase OAuth return flows:
 *   1. PKCE flow  — URL has ?code=...  (default for Supabase >=2.x)
 *   2. Implicit   — URL has #access_token=...  (legacy / some providers)
 *   3. Already    — session already in storage from a tab that stayed open
 *
 * After session is confirmed, creates/updates the user profile row
 * and routes to onboarding (new users) or /profile (returning users).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, fetchProfile, upsertProfile } from '../lib/auth';
import { LogoMark } from '../app/components/brand/LogoMark';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setStatus('Exchanging credentials…');

        // ── Step 1: Try PKCE code exchange ────────────────────────────
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        const errorDesc = urlParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDesc ?? errorParam);
        }

        if (code) {
          const { error: pkceErr } = await supabase.auth.exchangeCodeForSession(code);
          if (pkceErr) throw new Error(pkceErr.message);
          // Clean the URL so a refresh doesn't re-use the code
          window.history.replaceState({}, '', window.location.pathname);
        }

        // ── Step 2: Check hash fragment (implicit flow) ───────────────
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Supabase will auto-detect and set the session from the hash
          // Just wait for onAuthStateChange to pick it up
          await new Promise<void>((resolve) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                subscription.unsubscribe();
                resolve();
              }
            });
            // Timeout after 5 s
            setTimeout(() => { subscription.unsubscribe(); resolve(); }, 5000);
          });
          window.history.replaceState({}, '', window.location.pathname);
        }

        // ── Step 3: Get the session (should exist by now) ─────────────
        setStatus('Fetching session…');
        const { data: { session }, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw new Error(sessErr.message);
        if (!session?.user) throw new Error('No session found. Please try signing in again.');

        const authUser = session.user;
        setStatus('Setting up your profile…');

        // ── Step 4: Upsert profile ────────────────────────────────────
        const existing = await fetchProfile(authUser.id);

        if (!existing) {
          // Brand-new user via Google/OAuth
          const meta = authUser.user_metadata ?? {};
          const rawName = (meta.full_name ?? meta.name ?? 'user').trim();
          const baseHandle = rawName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
          const handle = `${baseHandle}_${Math.floor(Math.random() * 9000) + 1000}`;

          // Capture referral if set
          let referredBy: string | null = null;
          try {
            const refCode = (sessionStorage.getItem('grind_ref') ?? '').replace(/^@/, '').trim().toLowerCase();
            if (refCode) {
              const { data: referrer } = await supabase
                .from('users')
                .select('id')
                .eq('handle', refCode)
                .maybeSingle();
              if (referrer?.id && referrer.id !== authUser.id) referredBy = referrer.id;
            }
          } catch { /* referral best-effort */ }

          await upsertProfile(authUser.id, {
            email: authUser.email ?? '',
            handle,
            full_name: rawName,
            avatar_url: meta.avatar_url ?? meta.picture ?? null,
            onboarding_step: 1,
            ...(referredBy ? { referred_by: referredBy } : {}),
          } as any);

          if (referredBy) {
            try { sessionStorage.removeItem('grind_ref'); } catch {}
          }

          if (!cancelled) navigate('/onboarding', { replace: true });
        } else if (!existing.onboarding_complete) {
          if (!cancelled) navigate('/onboarding', { replace: true });
        } else {
          if (!cancelled) navigate('/profile', { replace: true });
        }
      } catch (err: any) {
        console.error('[AuthCallback]', err);
        if (!cancelled) setError(err.message ?? 'Sign-in failed. Please try again.');
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center" style={{ fontFamily: "'DM Sans',sans-serif" }}>
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>Sign-in failed</h2>
        <p className="text-gray-500 text-sm mb-2 max-w-xs">{error}</p>
        <p className="text-gray-400 text-xs mb-6 max-w-xs">
          If this keeps happening, make sure your Supabase project has Google OAuth enabled with the correct Client ID and Secret.
        </p>
        <div className="flex gap-3">
          <a href="/login" className="bg-[#0D0D14] text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-[#00A651] transition-colors">
            Try again
          </a>
          <a href="/" className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-full text-sm hover:bg-gray-200 transition-colors">
            Go home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-[#00A651] rounded-3xl flex items-center justify-center shadow-lg">
          <LogoMark size={36} tone="light" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">{status}</p>
        </div>
      </div>
    </div>
  );
};
