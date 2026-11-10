/**
 * /auth/reset-password
 * Handles the redirect from "Forgot password" email.
 * Supabase sends the user here with a session already set via the email link.
 * We just show a form to enter the new password.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, updatePassword } from '../lib/auth';
import { LogoMark } from '../app/components/brand/LogoMark';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Supabase sets the session from the email link hash automatically
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });

    // Also listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setHasSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      toast.success('Password updated! You can now log in.');
      setTimeout(() => navigate('/profile', { replace: true }), 2000);
    } catch (err: any) {
      toast.error(err.message ?? 'Could not update password. Try requesting a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="w-full max-w-[400px]">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <LogoMark size={28} tone="dark" framed />
          <span style={{ fontFamily: "'Syne',sans-serif" }} className="text-black font-black text-xl tracking-tight">Grind</span>
        </Link>

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-black mb-2">Password updated!</h2>
            <p className="text-gray-400 text-sm">Taking you to your profile…</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-black mb-1 tracking-tight">Set new password</h2>
            <p className="text-gray-400 text-sm mb-8">
              {hasSession
                ? 'Enter your new password below.'
                : 'The reset link may have expired. Request a new one from the login page.'}
            </p>

            {!hasSession ? (
              <Link to="/login"
                className="w-full flex items-center justify-center bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold py-4 rounded-full text-sm transition-colors">
                Back to Login
              </Link>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full px-4 py-3.5 pr-12 bg-[#F7F8FA] border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#00A651] transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full px-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#00A651] transition-all"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#00A651] hover:bg-[#008040] text-white font-bold py-4 rounded-full text-sm transition-colors disabled:opacity-60 mt-2">
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
