import React, { useState } from 'react';
import { Search, Bell, MessageSquare, Menu, X, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

const NAV_LINKS = [
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Gigs', to: '/gigs' },
  { label: 'Requests', to: '/requests' },
  { label: 'Services', to: '/services' },
  { label: 'Campus', to: '/campus' },
  { label: 'Live', to: '/live' },
  { label: 'Leaderboard', to: '/leaderboard' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/marketplace?q=${encodeURIComponent(query.trim())}` : '/marketplace');
    setMenuOpen(false);
  };

  const isActive = (to: string) => location.pathname === to;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 h-14">
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="lg:hidden text-[var(--color-text-primary)] p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-black text-black tracking-tight font-display">
            <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-[var(--grind-nigeria)] font-black text-lg leading-none">G</span>
            </span>
            Grind
          </Link>
        </div>

        {/* Center search (desktop) */}
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xl mx-6 relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search services, products or people..."
            className="w-full bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-full py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:border-[var(--grind-nigeria)] focus:ring-1 focus:ring-[var(--grind-nigeria)] transition-colors"
            aria-label="Search"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--grind-nigeria)] text-white hover:bg-[#004d00] transition-colors"
            aria-label="Submit search"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1 mr-2">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive(l.to) ? 'bg-gray-100 text-black' : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <button className="relative p-2 text-gray-600 hover:text-[var(--grind-nigeria)] rounded-full hover:bg-[var(--color-bg-light)] transition-colors hidden sm:block" aria-label="Notifications">
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Link
            to="/campus"
            className="relative p-2 text-gray-600 hover:text-[var(--grind-nigeria)] rounded-full hover:bg-[var(--color-bg-light)] transition-colors hidden sm:block"
            aria-label="Messages"
          >
            <MessageSquare size={19} />
          </Link>

          <div className="h-7 w-px bg-[var(--color-border)] hidden sm:block mx-1"></div>

          {/* Auth buttons: always visible on mobile, compact sizing */}
          {session && (
            <Link to="/settings" className="shrink-0 hidden sm:flex" aria-label="Settings">
              <button className={`p-2.5 rounded-full transition-colors ${isActive('/settings') ? 'bg-gray-100 text-black' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>
                <Settings size={18} />
              </button>
            </Link>
          )}
          <Link to="/login" className="shrink-0">
            <button className="px-3 sm:px-5 py-2 rounded-full text-sm font-bold text-black border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors">
              Log in
            </button>
          </Link>
          <Link to="/signup" className="shrink-0">
            <button className="px-3 sm:px-5 py-2 rounded-full text-sm font-bold text-white bg-black hover:bg-[var(--grind-nigeria)] transition-colors whitespace-nowrap">
              Sign up free
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile search bar */}
      <form onSubmit={submitSearch} className="md:hidden mt-2.5 relative flex">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search services, products or people..."
          className="w-full bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-full py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:border-[var(--grind-nigeria)] transition-colors"
          aria-label="Search"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--grind-nigeria)] text-white"
          aria-label="Submit search"
        >
          <Search size={16} />
        </button>
      </form>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden mt-3 pb-1 border-t border-gray-100 pt-3 flex flex-col gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                isActive(l.to) ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {session && (
            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                isActive('/settings') ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Settings
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
