import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { LogoMark } from '../app/components/brand/LogoMark';
import { signUpWithEmail, signInWithGoogle, upsertProfile, supabase } from '../lib/auth';
import { supportApi } from '../lib/supportApi';

type Step = 1 | 2;

const UNIVERSITIES = [
  { v: 'unilag',    l: 'University of Lagos (UNILAG)' },
  { v: 'oau',       l: 'Obafemi Awolowo University (OAU)' },
  { v: 'ui',        l: 'University of Ibadan (UI)' },
  { v: 'unilorin',  l: 'University of Ilorin' },
  { v: 'unn',       l: 'University of Nigeria, Nsukka' },
  { v: 'abu',       l: 'Ahmadu Bello University' },
  { v: 'futa',      l: 'Federal University of Technology, Akure' },
  { v: 'oui',       l: 'Ouí University' },
  { v: 'covenant',  l: 'Covenant University' },
  { v: 'babcock',   l: 'Babcock University' },
  { v: 'lasu',      l: 'Lagos State University' },
  { v: 'other',     l: 'Other' },
];

export const Signup: React.FC = () => {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [campus, setCampus]       = useState('');
  const [phone, setPhone]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err.message ?? 'Google sign-up failed.');
      setLoading(false);
    }
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Enter a valid email.'); return; }
    if (password.length < 6)  { toast.error('Password must be at least 6 characters.'); return; }
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { toast.error('Enter your first name.'); return; }
    if (!campus)           { toast.error('Select your university.'); return; }
    setLoading(true);
    try {
      const { user } = await signUpWithEmail(email, password);
      if (!user) throw new Error('Sign-up failed. Please try again.');

      const baseHandle = `${firstName.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 9000) + 1000}`;

      // ── Referral capture: ?ref=handle or /ref/:handle landing (sessionStorage) ──
      let referredBy: string | null = null;
      try {
        const refCode = (params.get('ref') ?? sessionStorage.getItem('grind_ref') ?? '')
          .replace(/^@/, '').trim().toLowerCase();
        if (refCode) {
          const { data: referrer } = await supabase
            .from('users')
            .select('id')
            .eq('handle', refCode)
            .maybeSingle();
          if (referrer?.id && referrer.id !== user.id) referredBy = referrer.id;
        }
      } catch { /* referral is best-effort */ }

      await upsertProfile(user.id, {
        email,
        handle: baseHandle,
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        campus,
        phone: phone || undefined,
        onboarding_step: 1,
        ...(referredBy ? { referred_by: referredBy } : {}),
      } as any);
      if (referredBy) {
        try { sessionStorage.removeItem('grind_ref'); } catch { /* ignore */ }
      }

      supportApi.logLogin(email, `${firstName} ${lastName}`, 'signup');
      toast.success("Account created! Welcome to Grind 🎉");
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      // Demo fallback — create a local session when Supabase isn't configured
      if (err.message?.includes('fetch') || err.message?.includes('placeholder') || err.message?.includes('network')) {
        const demoUser = {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email,
          campus,
          role: 'user',
          demo: true,
        };
        localStorage.setItem('grind_user', JSON.stringify(demoUser));
        supportApi.logLogin(email, demoUser.name, 'signup');
        toast.success("Account created! Welcome to Grind 🎉");
        navigate('/onboarding', { replace: true });
      } else {
        toast.error(err.message?.includes('already registered')
          ? 'That email is already registered. Try logging in.'
          : err.message ?? 'Sign-up failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const brand = (
    <div className="hidden lg:flex lg:w-[45%] bg-[#0A2540] flex-col p-14 justify-between relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00A651]/10 rounded-full blur-[80px]" />
      <div className="relative z-10">
        <Link to="/" className="flex items-center gap-2 mb-14">
          <LogoMark size={32} tone="light" />
          <span className="text-white font-bold text-2xl tracking-tight">Grind</span>
        </Link>
        <h1 className="text-5xl font-black text-white leading-tight mb-5 tracking-tight">
          Start your journey<br />on Grind.
        </h1>
        <ul className="space-y-4 mt-8">
          {[
            'Free escrow on every gig',
            'Build your GrindScore from day one',
            'Withdraw to any Nigerian bank',
            'Verified students only',
          ].map(p => (
            <li key={p} className="flex items-center gap-3 text-white/80 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#00A651] shrink-0" /> {p}
            </li>
          ))}
        </ul>
      </div>
      <blockquote className="relative z-10 border-t border-white/10 pt-8">
        <p className="text-white/70 text-sm italic mb-3">"I closed 4 gigs in my first week. The escrow made clients trust me instantly."</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#00A651] flex items-center justify-center text-white font-bold text-sm">A</div>
          <div><div className="text-white text-sm font-semibold">Amara S.</div><div className="text-white/40 text-xs">UI Designer · UNILAG</div></div>
        </div>
      </blockquote>
    </div>
  );

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif] bg-white">
      {brand}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-[400px]">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
            <LogoMark size={28} tone="dark" framed />
            <span className="text-black font-bold text-xl">Grind</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {step > 1 && (
              <button onClick={() => setStep(1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <div className="flex gap-1.5">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#00A651] w-8' : 'bg-gray-100 w-4'}`} />
              ))}
            </div>
          </div>

          <h2 className="text-3xl font-black text-black mb-1 tracking-tight">
            {step === 1 ? 'Create account' : 'Your details'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {step === 1 ? 'Way for poor people. Join the campus hustle.' : 'Almost there. Fill these in and you\'re good.'}
          </p>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 py-3.5 rounded-full text-sm font-semibold text-gray-700 mb-5 transition-colors disabled:opacity-60">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Sign up with Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">School Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@university.edu.ng" required autoFocus
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required
                      className="w-full px-4 py-3.5 pr-12 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#0A2540] hover:bg-[#00A651] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
                  {loading ? 'Please wait...' : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? <Link to="/login" className="text-[#00A651] font-bold hover:underline">Log in</Link>
              </p>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Goodness" required autoFocus
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Iyamah"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">University</label>
                <select value={campus} onChange={e => setCampus(e.target.value)} required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] bg-white transition-colors">
                  <option value="">Select your school</option>
                  {UNIVERSITIES.map(u => <option key={u.v} value={u.l}>{u.l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#00A651] hover:bg-[#007A3D] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#00A651]/30 disabled:opacity-60">
                {loading ? 'Creating account...' : <><CheckCircle2 className="w-4 h-4" /><span>Create Account</span></>}
              </button>
              <p className="text-xs text-gray-400 text-center">
                By creating an account you agree to our{' '}
                <Link to="/legal/terms-of-service" className="text-[#00A651] hover:underline">Terms</Link>{' '}
                and{' '}
                <Link to="/legal/privacy-policy" className="text-[#00A651] hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
