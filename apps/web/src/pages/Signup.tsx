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
  const navigate = useNavigate();

  const handleSignup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('grind_user', JSON.stringify({ role: 'user' }));
    navigate('/admin');
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log(credentialResponse);
    localStorage.setItem('grind_user', JSON.stringify({ name: 'Google User', email: 'user@google.com', role: 'user' }));
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif] bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#f4ecd6] flex-col p-16 justify-between">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark size={32} tone="dark" framed />
          <span className="text-black font-bold text-xl">Grind</span>
        </Link>

        <div>
          <h1 className="text-5xl font-black text-black leading-tight mb-6 tracking-tight">
            Start earning in<br />
            less than 5 minutes.
          </h1>
          <p className="text-black/70 text-lg leading-relaxed max-w-sm mb-8">
            Create your account, set up your profile, and post your first listing today. It's completely free.
          </p>

          <ul className="space-y-4">
            {['Free escrow on every transaction', 'Build your Grind Score from day 1', 'Access 42,000+ buyers and clients', 'Withdraw to any Nigerian bank'].map(p => (
              <li key={p} className="flex items-center gap-3 text-black text-base font-medium">
                <CheckCircle2 size={20} className="text-[#1ea64a] shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { v: '₦2.1B+', l: 'Paid to sellers' },
            { v: '15,000+', l: 'Active listings' },
            { v: '42k+', l: 'Registered users' },
            { v: '4.9/5', l: 'Average rating' },
          ].map(s => (
            <div key={s.l} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
              <div className="text-2xl font-black text-black">{s.v}</div>
              <div className="text-sm text-black/60 font-medium mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-[400px] py-8">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-12">
            <LogoMark size={32} tone="dark" framed />
            <span className="text-black font-bold text-xl">Grind</span>
          </Link>

          <h2 className="text-3xl font-black text-black mb-2 tracking-tight">
            {step === 1 ? 'Create account' : 'Complete profile'}
          </h2>
          <p className="text-[#666666] text-base mb-8">
            {step === 1 ? 'Already have an account? ' : 'Almost there — just a few more details.'}
            {step === 1 && <Link to="/login" className="text-black font-bold hover:underline">Log in</Link>}
          </p>

          {step === 1 && (
            <>
              <div className="mb-6">
                <SafeGoogleSignup onSuccess={handleGoogleSuccess} />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#e6e6e6]" />
                <span className="text-xs text-[#666666] font-medium uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-[#e6e6e6]" />
              </div>

              <form className="space-y-5" onSubmit={e => { e.preventDefault(); setStep(2); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">First Name</label>
                    <input type="text" placeholder="Amara" className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Last Name</label>
                    <input type="text" placeholder="Smith" className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Email address</label>
                  <input type="email" placeholder="you@university.edu.ng" className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#666666] font-medium">+234</span>
                    <input type="tel" placeholder="0801 234 5678" className="w-full pl-16 pr-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" className="w-full px-4 py-3 pr-12 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-black">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3.5 rounded-[50px] transition-colors flex items-center justify-center gap-2 mt-4 text-lg">
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form className="space-y-5" onSubmit={handleSignup}>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">University / School</label>
                <input type="text" placeholder="e.g. University of Lagos" className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">State</label>
                <select className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black bg-white text-black" required>
                  <option value="">Select state...</option>
                  {['Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Delta', 'Anambra'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3.5 rounded-[50px] transition-colors flex items-center justify-center gap-2 mt-4 text-lg">
                Create My Account <ArrowRight size={18} />
              </button>

              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-[#666666] hover:text-black font-semibold mt-4">
                ← Go back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
