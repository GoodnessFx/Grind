import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';

export const GOOGLE_CLIENT_ID = "24300395823-trbfqd7mjiho0tgl9jpaek4qtemuf5cd.apps.googleusercontent.com";

// Safe Google Login button that dynamically loads the package to avoid startup crashes
const SafeGoogleLogin = ({ onSuccess }: { onSuccess: (r: any) => void }) => {
  const [Comp, setComp] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    import('@react-oauth/google')
      .then(m => setComp(() => m.GoogleLogin))
      .catch(() => {}); // silently fail — fallback button still works
  }, []);

  if (!Comp) {
    return (
      <button
        type="button"
        onClick={() => {
          const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: window.location.origin + '/login',
            response_type: 'token',
            scope: 'email profile',
          });
          window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
        }}
        className="w-full flex items-center justify-center gap-3 border border-[#e6e6e6] hover:bg-gray-50 py-3 rounded-[50px] text-base font-medium text-gray-700 transition-colors"
      >
        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
        Continue with Google
      </button>
    );
  }

  return (
    <Comp
      onSuccess={onSuccess}
      onError={() => {}}
      shape="pill"
      size="large"
      width="400"
      logo_alignment="center"
    />
  );
};

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('grind_user', JSON.stringify({ email, name: email.split('@')[0], role: 'user' }));
    navigate('/admin');
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    // Decode the JWT from Google to get user info
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
      <div className="hidden lg:flex lg:w-[45%] bg-[#041e42] flex-col p-16 justify-between relative overflow-hidden">
        
        {/* Background Subtle Gradient */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff6b00]/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <LogoMark size={32} tone="light" />
            <span className="text-white font-bold text-2xl tracking-tight">Grind</span>
          </Link>

          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Sign in to your<br />Workspace.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md font-medium">
              Join Nigeria's leading campus marketplace. Post services, find gigs, sell products — all protected by escrow.
            </p>
          </div>
        </div>

        <blockquote className="relative z-10 border-t border-white/10 pt-8 mt-12">
          <p className="text-white text-lg font-medium mb-4">"I made ₦180,000 in my first month on Grind just doing logo design from my dorm room."</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff6b00] flex items-center justify-center text-white font-bold">AS</div>
            <div>
              <div className="text-white text-sm font-semibold">Amara S.</div>
              <div className="text-white/60 text-sm">UI Designer · UNILAG</div>
            </div>
          </div>
        </blockquote>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-12">
            <LogoMark size={32} tone="dark" framed />
            <span className="text-black font-bold text-xl">Grind</span>
          </Link>

          <h2 className="text-3xl font-black text-black mb-2 tracking-tight">Log in</h2>
          <p className="text-[#666666] text-base mb-8">Enter your details to access your account.</p>

          <div className="mb-6">
            <SafeGoogleLogin onSuccess={handleGoogleSuccess} />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#e6e6e6]" />
            <span className="text-xs text-[#666666] font-medium uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-[#e6e6e6]" />
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu.ng"
                className="w-full px-4 py-3 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-black">Password</label>
                <a href="#" className="text-sm text-black hover:underline font-medium">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 text-base border border-[#e6e6e6] rounded-md outline-none focus:border-black transition-colors"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-black">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#ff6b00] hover:bg-[#e66000] text-white font-bold py-3.5 rounded-[50px] transition-colors flex items-center justify-center gap-2 mt-4 text-lg shadow-lg shadow-[#ff6b00]/20"
            >
              Log in <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-base text-gray-500 mt-8 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#041e42] font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
