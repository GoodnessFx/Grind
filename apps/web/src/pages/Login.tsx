import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { LogoMark } from '../app/components/brand/LogoMark';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Mock login success
    localStorage.setItem('grind_user', JSON.stringify({ email, role: 'user' }));
    navigate('/admin');
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log(credentialResponse);
    // Parse JWT or handle token (mocking successful login)
    localStorage.setItem('grind_user', JSON.stringify({ name: 'Google User', email: 'user@google.com', role: 'user' }));
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif] bg-white">
      {/* Left — Branding panel (Figma Color Block Style) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1f1d3d] flex-col p-16 justify-between">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark size={32} tone="dark" framed />
          <span className="text-white font-bold text-xl">Grind</span>
        </Link>

        <div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            Your hustle,<br />
            your platform.
          </h1>
          <p className="text-[#98A2B3] text-lg leading-relaxed max-w-md">
            Join Nigeria's leading campus marketplace. Post services, find gigs, sell products — all protected by escrow.
          </p>
        </div>

        <blockquote className="border-t border-white/10 pt-8 mt-8">
          <p className="text-white text-lg font-medium mb-4">"I made ₦180,000 in my first month on Grind just doing logo design from my dorm room."</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#dceeb1] flex items-center justify-center text-[#1f1d3d] font-bold">AS</div>
            <div>
              <div className="text-white text-sm font-semibold">Amara S.</div>
              <div className="text-[#98A2B3] text-sm">UI Designer · UNILAG</div>
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
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              shape="pill"
              size="large"
              width="400"
              logo_alignment="center"
            />
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
                <Link to="/forgot-password" className="text-sm text-black hover:underline font-medium">Forgot?</Link>
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
              className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3.5 rounded-[50px] transition-colors flex items-center justify-center gap-2 mt-4 text-lg"
            >
              Log in <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-base text-[#666666] mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
