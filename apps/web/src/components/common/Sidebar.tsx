import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Briefcase, MessageSquare, Settings, Activity } from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';

export const Sidebar = () => {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin' },
    { icon: <Activity size={20} />, label: 'Campus Connect', path: '/admin/connect' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <Briefcase size={20} />, label: 'Brand Partnerships', path: '/admin/brands' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/admin/messages' },
    { icon: <AlertTriangle size={20} />, label: 'Disputes', path: '/admin/disputes' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-[#041e42] text-slate-300 min-h-screen hidden lg:block sticky top-0 border-r border-[#2563eb]/20 shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <LogoMark size={24} tone="light" />
          <h2 className="text-xl font-bold text-white tracking-tight">Grind</h2>
        </div>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            end={item.path === '/admin'}
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive 
                  ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20' 
                  : 'hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
