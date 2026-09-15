import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Briefcase, MessageSquare, Settings } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <AlertTriangle size={20} />, label: 'Disputes', path: '/admin/disputes' },
    { icon: <Briefcase size={20} />, label: 'Brand Partnerships', path: '/admin/brands' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/admin/messages' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen hidden lg:block sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Grind Admin</h2>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-slate-800 text-white font-medium' 
                  : 'hover:bg-slate-800 hover:text-white'
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
