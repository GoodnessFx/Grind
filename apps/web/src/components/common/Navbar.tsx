import React from 'react';
import { Search, Bell, MessageSquare, User, Menu } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)] px-4 md:px-8 py-3 flex items-center justify-between h-16 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-[var(--color-text-primary)]">
          <Menu size={24} />
        </button>
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[var(--color-primary)]">
          <span>Grind</span>
        </Link>
      </div>
      
      <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
        <input 
          type="text" 
          placeholder="Search for jobs, services, products..." 
          className="w-full bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--color-primary)]">
          <Search size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative p-2 text-gray-600 hover:text-[var(--color-primary)] rounded-full hover:bg-[var(--color-bg-light)] transition-colors hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="relative p-2 text-gray-600 hover:text-[var(--color-primary)] rounded-full hover:bg-[var(--color-bg-light)] transition-colors hidden sm:block">
          <MessageSquare size={20} />
        </button>
        <div className="h-8 w-px bg-[var(--color-border)] hidden sm:block mx-2"></div>
        <Link to="/login" className="hidden md:block">
          <Button variant="tertiary">Log in</Button>
        </Link>
        <Link to="/signup" className="hidden md:block">
          <Button variant="primary">Sign up</Button>
        </Link>
        <button className="p-1 border-2 border-transparent hover:border-[var(--color-primary)] rounded-full overflow-hidden transition-all md:hidden">
          <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-500">
            <User size={16} />
          </div>
        </button>
      </div>
    </nav>
  );
};
