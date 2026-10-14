import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Phone, Mail, ChevronLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { LogoMark } from '../app/components/brand/LogoMark';
import {
  signInWithEmail, signInWithGoogle, signInWithPhone,
  verifyPhoneOtp, sendEmailOtp, verifyEmailOtp,
  supabase, fetchProfile,
} from '../lib/auth';
import { supportApi } from '../lib/supportApi';

type Step = 'welcome' | 'email' | 'password' | 'phone' | 'phone_otp' | 'email_otp' | 'reset_sent';

export const Login: React.FC = () => {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(params.get('next') ?? '/profile', { replace: true });
    });
  }, []);

  // Handle Google OAuth redirect callback (hash fragment from implicit flow)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const p = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = p.get('access_token');
    if (!accessToken) return;
    supabase.auth.getUser(accessToken).then(({ data }) => {
      if (data.user) {
        supportApi.logLogin(data.user.email ?? '', data.user.user_metadata?.full_name ?? null, 'google');
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(params.get('next') ?? '/profile', { replace: true });
      }
    });
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // redirect happens via Supabase OAuth flow, above useEffect handles return
    } catch (err: any) {
      toast.error(err.message ?? 'Google sign-in failed. Try again.');
      setLoading(false);
    }
  };

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter your email and password.'); return; }
    setLoading(true);
    try {
      const { user } = await signInWithEmail(email, password);
      if (user) {
        supportApi.logLogin(email, null, 'password');
        navigate(params.get('next') ?? '/profile', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message.includes('Invalid login') ? 'Wrong email or password.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Enter a valid email.'); return; }
    setLoading(true);
    try {
      await sendEmailOtp(email);
      toast.success('Code sent. Check your inbox.');
      setStep('email_otp');
    } catch (err: any) {
      toast.error(err.message ?? 'Could not send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const { user } = await verifyEmailOtp(email, code);
      if (user) {
        supportApi.logLogin(email, null, 'otp');
        navigate(params.get('next') ?? '/profile', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message.includes('expired') ? 'Code expired. Request a new one.' : 'Wrong code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Enter a valid phone number.'); return; }
    const formatted = digits.startsWith('0') ? `+234${digits.slice(1)}` : digits.startsWith('234') ? `+${digits}` : `+${digits}`;
    setLoading(true);
    try {
      await signInWithPhone(formatted);
      setPhone(formatted);
      toast.success('Code sent to ' + formatted);
      setStep('phone_otp');
    } catch (err: any) {
      toast.error(err.message ?? 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const { user } = await verifyPhoneOtp(phone, code);
      if (user) {
        supportApi.logLogin(user.phone ?? phone, null, 'phone_otp');
        navigate(params.get('next') ?? '/profile', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message.includes('expired') ? 'Code expired. Request a new one.' : 'Wrong code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Enter your email first.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setStep('reset_sent');
    } catch (err: any) {
      toast.error(err.message ?? 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const setOtpDigit = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) (document.getElementById(`otp-${idx + 1}`) as HTMLInputElement)?.focus();
  };

  const resend = () => {
    setOtp(['', '', '', '', '', '']);
    if (step === 'phone_otp') { handlePhoneSend({ preventDefault: () => {} } as any); }
    else { handleEmailOtpSend({ preventDefault: () => {} } as any); }
  };

  // ── Layout helpers ───────────────────────────────────────────────────────────

  const BackBtn = ({ to }: { to: Step }) => (
    <button onClick={() => setStep(to)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-6">
      <ChevronLeft className="w-5 h-5 text-gray-700" />
    </button>
  );

  const brand = (
    <div className="hidden lg:flex lg:w-[45%] bg-[#0A2540] flex-col p-14 justify-between relative overflow-hidden">
      <div className="absolute -top-32 -left-16 w-72 h-72 bg-[#00A651]/10 rounded-full blur-[80px]" />
      <div className="relative z-10">
        <Link to="/" className="flex items-center gap-2 mb-14">
          <LogoMark size={32} tone="light" />
          <span className="text-white font-bold text-2xl tracking-tight">Grind</span>
        </Link>
        <h1 className="text-5xl font-black text-white leading-tight mb-5 tracking-tight">
          Sign in to your<br />workspace.
        </h1>
        <p className="text-white/60 text-lg leading-relaxed max-w-sm">
          Nigeria's campus gig economy. Post gigs, earn money, and build your rep — all secured by escrow.
        </p>
      </div>
      <blockquote className="relative z-10 border-t border-white/10 pt-8">
        <p className="text-white/80 text-base italic mb-4">"I made ₦180,000 in my first month on Grind just from logo design."</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00A651] flex items-center justify-center text-white font-bold">A</div>
          <div><div className="text-white text-sm font-semibold">Amara S.</div><div className="text-white/40 text-xs">UI Designer · UNILAG</div></div>
        </div>
      </blockquote>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderRight = () => {
    // Welcome
    if (step === 'welcome') return (
      <div className="w-full max-w-[400px]">
        <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
          <LogoMark size={28} tone="dark" framed />
          <span className="text-black font-bold text-xl">Grind</span>
        </Link>
        <h2 className="text-3xl font-black text-black mb-1 tracking-tight">Log in</h2>
        <p className="text-gray-500 text-sm mb-8">Way for poor people. Welcome back.</p>
        <div className="space-y-3">
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 py-3.5 rounded-full text-sm font-semibold text-gray-700 transition-colors disabled:opacity-60">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
            Continue with Google
          </button>
          <button onClick={() => setStep('phone')}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 py-3.5 rounded-full text-sm font-semibold text-gray-700 transition-colors">
            <Phone className="w-4 h-4 text-[#00A651]" /> Continue with Phone
          </button>
          <button onClick={() => setStep('email')}
            className="w-full flex items-center justify-center gap-3 bg-[#0A2540] hover:bg-[#00A651] py-3.5 rounded-full text-sm font-bold text-white transition-colors shadow-lg">
            <Mail className="w-4 h-4" /> Continue with Email
          </button>
        </div>
        <div className="mt-5 flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-2xl p-4">
          <Shield className="w-4 h-4 text-[#00A651] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">Every payment is protected by escrow. Money only moves when you both agree the work is done.</p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          No account yet? <Link to="/signup" className="text-[#00A651] font-bold hover:underline">Sign up free</Link>
        </p>
      </div>
    );

    // Email + password
    if (step === 'email') return (
      <div className="w-full max-w-[400px]">
        <BackBtn to="welcome" />
        <h2 className="text-2xl font-black text-black mb-1 tracking-tight">Enter your email</h2>
        <p className="text-gray-500 text-sm mb-8">Use your school email for verified access.</p>
        <form onSubmit={handleEmailOtpSend} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="name@university.edu.ng" autoFocus required
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full px-4 py-3.5 pr-12 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <button type="button" onClick={() => setStep('email')} className="text-xs text-gray-400 hover:text-gray-600">
              Sign in with email code instead
            </button>
            <button type="button" onClick={handleResetPassword} disabled={loading}
              className="text-xs text-[#00A651] font-semibold hover:underline disabled:opacity-60">
              Forgot password?
            </button>
          </div>
          <button type="submit" onClick={handleEmailPassword} disabled={loading}
            className="w-full bg-[#0A2540] hover:bg-[#00A651] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? 'Logging in...' : <><span>Log in</span><ArrowRight className="w-4 h-4" /></>}
          </button>
          <button type="button" onClick={handleEmailOtpSend} disabled={loading}
            className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-full text-sm transition-colors hover:bg-gray-50 disabled:opacity-60">
            {loading ? 'Sending...' : 'Send me a login code instead'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          No account? <Link to="/signup" className="text-[#00A651] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    );

    // Email OTP verify
    if (step === 'email_otp') return (
      <div className="w-full max-w-[400px]">
        <BackBtn to="email" />
        <h2 className="text-2xl font-black text-black mb-1 tracking-tight">Check your inbox</h2>
        <p className="text-gray-500 text-sm mb-8">Enter the 6-digit code we sent to <span className="font-semibold text-gray-800">{email}</span></p>
        <OtpInput otp={otp} onChange={setOtpDigit} />
        <button onClick={handleEmailOtpVerify} disabled={loading}
          className="w-full mt-4 bg-[#0A2540] hover:bg-[#00A651] text-white font-bold py-3.5 rounded-full transition-colors disabled:opacity-60">
          {loading ? 'Verifying...' : 'Verify and log in'}
        </button>
        <button onClick={resend} className="w-full mt-3 text-center text-sm text-[#00A651] font-semibold py-2">
          Didn't get it? Resend code
        </button>
      </div>
    );

    // Phone
    if (step === 'phone') return (
      <div className="w-full max-w-[400px]">
        <BackBtn to="welcome" />
        <h2 className="text-2xl font-black text-black mb-1 tracking-tight">Enter your number</h2>
        <p className="text-gray-500 text-sm mb-8">We'll send a 6-digit code to verify it's you.</p>
        <form onSubmit={handlePhoneSend} className="space-y-4">
          <div className="flex gap-2">
            <div className="w-14 h-12 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-lg">🇳🇬</div>
            <input type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="0800 000 0000" autoFocus required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#0A2540] hover:bg-[#00A651] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? 'Sending...' : <><span>Send Code</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    );

    // Phone OTP verify
    if (step === 'phone_otp') return (
      <div className="w-full max-w-[400px]">
        <BackBtn to="phone" />
        <h2 className="text-2xl font-black text-black mb-1 tracking-tight">Verify your number</h2>
        <p className="text-gray-500 text-sm mb-8">Enter the code sent to <span className="font-semibold text-gray-800">{phone}</span></p>
        <OtpInput otp={otp} onChange={setOtpDigit} />
        <button onClick={handlePhoneOtpVerify} disabled={loading}
          className="w-full mt-4 bg-[#0A2540] hover:bg-[#00A651] text-white font-bold py-3.5 rounded-full transition-colors disabled:opacity-60">
          {loading ? 'Verifying...' : 'Verify and log in'}
        </button>
        <button onClick={resend} className="w-full mt-3 text-center text-sm text-[#00A651] font-semibold py-2">
          Didn't get it? Resend code
        </button>
      </div>
    );

    // Reset sent
    if (step === 'reset_sent') return (
      <div className="w-full max-w-[400px] text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-[#00A651]" />
        </div>
        <h2 className="text-2xl font-black text-black mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm mb-8">We sent a password reset link to <span className="font-semibold text-gray-800">{email}</span>. Click the link in the email to set a new password.</p>
        <button onClick={() => setStep('welcome')} className="text-[#00A651] font-bold text-sm hover:underline">
          Back to login
        </button>
      </div>
    );

    return null;
  };

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif] bg-white">
      {brand}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        {renderRight()}
      </div>
    </div>
  );
};

function OtpInput({ otp, onChange }: { otp: string[]; onChange: (v: string, i: number) => void }) {
  return (
    <div className="flex gap-2 justify-between">
      {otp.map((d, i) => (
        <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
          value={d}
          onChange={e => onChange(e.target.value, i)}
          onKeyDown={e => {
            if (e.key === 'Backspace' && !d && i > 0)
              (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus();
          }}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-2xl outline-none focus:border-[#00A651] transition-colors"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
