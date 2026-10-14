/**
 * Grind auth layer — wraps Supabase auth.
 * All components should import from here, never directly from supabase-js.
 */
import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('[Grind Auth] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set.');
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL  ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON ?? 'placeholder',
  { auth: { persistSession: true, autoRefreshToken: true } }
);

export type GrindUser = {
  id: string;
  email: string;
  handle: string;
  full_name: string;
  avatar_url: string | null;
  campus: string | null;
  hostel: string | null;
  department: string | null;
  level: string | null;
  bio: string | null;
  phone: string | null;
  grind_score: number;
  tier: string;
  wallet_balance: number;
  streak_count: number;
  weekly_earn_target: number;
  onboarding_step: number;
  onboarding_complete: boolean;
  is_verified: boolean;
  verification_status: string;
  verified_badge: boolean;
  is_creator: boolean;
  referral_code: string | null;
  referred_by: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  paystack_recipient_code: string | null;
  lang: string;
  notif_8am: boolean;
  notif_gigs: boolean;
  notif_chat: boolean;
  notif_wallet: boolean;
  skills: string[];
  role_earn: boolean;
  role_hire: boolean;
  role_sell: boolean;
  role_company: boolean;
  created_at: string;
};

// ── Profile CRUD ──────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<GrindUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) { console.error('[auth] fetchProfile', error.message); return null; }
  return data as GrindUser;
}

export async function upsertProfile(userId: string, updates: Partial<GrindUser>): Promise<GrindUser | null> {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) { console.error('[auth] upsertProfile', error.message); return null; }
  return data as GrindUser;
}

export async function checkHandleAvailable(handle: string): Promise<boolean> {
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('handle', handle);
  return (count ?? 0) === 0;
}

// ── Auth actions ──────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw new Error(error.message);
}

export async function signInWithPhone(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw new Error(error.message);
  return data;
}

export async function sendEmailOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw new Error(error.message);
}

export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── React hook ─────────────────────────────────────────────────────────────────

export type AuthState = {
  user: GrindUser | null;
  session: Session | null;
  authUser: User | null;
  loading: boolean;
  /** Call to refresh profile from DB */
  refreshProfile: () => Promise<void>;
  /** Partial update to user stored in hook (optimistic) */
  updateUser: (updates: Partial<GrindUser>) => void;
};

export function useAuth(): AuthState {
  const [session, setSession]     = useState<Session | null>(null);
  const [authUser, setAuthUser]   = useState<User | null>(null);
  const [user, setUser]           = useState<GrindUser | null>(null);
  const [loading, setLoading]     = useState(true);

  const loadProfile = async (uid: string) => {
    const profile = await fetchProfile(uid);
    setUser(profile);
  };

  const refreshProfile = async () => {
    if (authUser?.id) await loadProfile(authUser.id);
  };

  const updateUser = (updates: Partial<GrindUser>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, authUser, loading, refreshProfile, updateUser };
}

// ── Tier helpers ───────────────────────────────────────────────────────────────

export const TIER_THRESHOLDS: Record<string, number> = {
  Fresher:   0,
  Padi:      300,
  Plug:      600,
  Oga:       800,
  'Big Boy':  950,
  'Big Girl': 950,
};

export const TIER_ORDER = ['Fresher', 'Padi', 'Plug', 'Oga', 'Big Boy'];

export function getTierForScore(score: number, gender?: 'male' | 'female'): string {
  if (score >= 950) return gender === 'female' ? 'Big Girl' : 'Big Boy';
  if (score >= 800) return 'Oga';
  if (score >= 600) return 'Plug';
  if (score >= 300) return 'Padi';
  return 'Fresher';
}

export function getNextTier(currentTier: string): string | null {
  const idx = TIER_ORDER.findIndex((t) => t === currentTier || (currentTier === 'Big Girl' && t === 'Big Boy'));
  if (idx === -1 || idx >= TIER_ORDER.length - 1) return null;
  return TIER_ORDER[idx + 1];
}

export function getNextTierThreshold(currentTier: string): number | null {
  const next = getNextTier(currentTier);
  return next ? TIER_THRESHOLDS[next] : null;
}

// ── API client (authenticated fetch) ──────────────────────────────────────────

const SERVER_BASE = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${SERVER_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
