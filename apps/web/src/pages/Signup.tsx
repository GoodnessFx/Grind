import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';
import { GOOGLE_CLIENT_ID } from './Login';

const SafeGoogleSignup = ({ onSuccess }: { onSuccess: (r: any) => void }) => {
  const [Comp, setComp] = React.useState<React.ComponentType<any> | null>(null);
  React.useEffect(() => {
    import('@react-oauth/google').then(m => setComp(() => m.GoogleLogin)).catch(() => {});
  }, []);
  if (!Comp) return (
    <button type="button" className="w-full flex items-center justify-center gap-3 border border-[#e6e6e6] hover:bg-gray-50 py-3 rounded-[50px] text-base font-medium text-gray-700 transition-colors">
      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
      Sign up with Google
    </button>
  );
  return <Comp onSuccess={onSuccess} onError={() => {}} shape="pill" size="large" width="400" logo_alignment="center" text="signup_with" />;
};

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('grind_user', JSON.stringify({ email, name: email.split('@')[0], role: 'user' }));
    navigate('/admin');
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('grind_user', JSON.stringify({
        name: payload.name || 'Google User',
        email: payload.email || 'user@google.com',
        avatar: payload.picture,
        role: 'user',
      }));
    } catch {
      localStorage.setItem('grind_user', JSON.stringify({ name: 'Google User', email: 'user@google.com', role: 'user' }));
    }
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif] bg-white">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-black flex-col p-16 justify-between relative overflow-hidden">
        
        {/* Background Subtle Gradient */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#006400]/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <LogoMark size={32} tone="light" />
            <span className="text-white font-bold text-2xl tracking-tight">Grind</span>
          </Link>

          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Start your journey<br />on Grind.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md font-medium mb-8">
              Create your account, set up your profile, and post your first listing today. It's completely free.
            </p>
            <ul className="space-y-4">
              {['Free escrow on every transaction', 'Build your Grind Score from day 1', 'Access 42,000+ buyers and clients', 'Withdraw to any Nigerian bank'].map(p => (
                <li key={p} className="flex items-center gap-3 text-white text-base font-medium">
                  <CheckCircle2 size={20} className="text-[#16a34a] shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <blockquote className="relative z-10 border-t border-white/10 pt-8 mt-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006400] flex items-center justify-center text-white font-bold">AS</div>
            <div>
              <div className="text-white text-sm font-semibold">Amara S.</div>
              <div className="text-white/60 text-sm">UI Designer · UNILAG</div>
            </div>
          </div>
          <p className="text-white/80 text-sm italic mt-3">"I closed 4 freelance gigs in my first week. The escrow system makes clients trust you instantly."</p>
        </blockquote>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-12">
            <LogoMark size={32} tone="dark" framed />
            <span className="text-black font-bold text-xl">Grind</span>
          </Link>

          <h2 className="text-3xl font-black text-black mb-2 tracking-tight">
            {step === 1 ? 'Create account' : 'Complete profile'}
          </h2>
          <p className="text-gray-500 text-base mb-8 font-medium">
            {step === 1 ? 'Join the leading campus gig economy.' : 'Tell us a bit about yourself.'}
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
          {step === 1 && (
            <>
              <div className="mb-6">
                <SafeGoogleSignup onSuccess={handleGoogleSuccess} />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#e6e6e6]" />
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-[#e6e6e6]" />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">School Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu.ng"
                  className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-[#006400] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 pr-12 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-[#006400] transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-black hover:bg-[#006400] text-white font-bold py-3.5 rounded-[50px] transition-colors flex items-center justify-center gap-2 mt-4 text-lg shadow-lg shadow-[#006400]/20"
              >
                Continue <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-[var(--grind-nigeria)] transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-[var(--grind-nigeria)] transition-colors" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">University</label>
                <select className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-[var(--grind-nigeria)] bg-white transition-colors">
                  <option value="">Select your institution</option>
                  <option value="unilag">University of Lagos</option>
                  <option value="oau">Obafemi Awolowo University</option>
                  <option value="ui">University of Ibadan</option>
                  <option value="unilorin">University of Ilorin</option>
                  <option value="unn">University of Nigeria, Nsukka</option>
                  <option value="abu">Ahmadu Bello University</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Phone Number</label>
                <input type="tel" placeholder="+234" className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-[var(--grind-nigeria)] transition-colors" required />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white hover:bg-gray-50 text-black font-bold py-3.5 rounded-[50px] transition-colors border border-[#e6e6e6]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-black hover:bg-[#006400] text-white font-bold py-3.5 rounded-[50px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#006400]/20"
                >
                  Create Account <CheckCircle2 size={18} />
                </button>
              </div>
            </>
          )}
          </form>

          <p className="text-center text-base text-gray-500 mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
