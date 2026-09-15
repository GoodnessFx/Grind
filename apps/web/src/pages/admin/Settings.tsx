import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { User, Bell, Lock, CreditCard } from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[#041e42] tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and security.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {[
            { id: 'profile', icon: <User size={18} />, label: 'Profile' },
            { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
            { id: 'security', icon: <Lock size={18} />, label: 'Security' },
            { id: 'billing', icon: <CreditCard size={18} />, label: 'Billing & Payouts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#2563eb] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#041e42]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#041e42] border-b pb-4">Public Profile</h2>
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-2xl">
                  JD
                </div>
                <div>
                  <Button variant="secondary" className="mb-2">Change Avatar</Button>
                  <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#041e42] mb-2">First Name</label>
                  <input type="text" defaultValue="John" className="w-full p-3 border rounded-lg outline-none focus:border-[#2563eb]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#041e42] mb-2">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full p-3 border rounded-lg outline-none focus:border-[#2563eb]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#041e42] mb-2">Bio</label>
                <textarea rows={4} defaultValue="Computer Science student at UNILAG. Freelance web developer." className="w-full p-3 border rounded-lg outline-none focus:border-[#2563eb] resize-none" />
              </div>

              <Button className="bg-[#2563eb] hover:bg-blue-700 text-white !rounded-full px-8">Save Changes</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#041e42] border-b pb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {['Email when someone messages me', 'Email when an order is placed', 'SMS alerts for Escrow releases'].map(lbl => (
                  <label key={lbl} className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{lbl}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#2563eb]" />
                  </label>
                ))}
              </div>
              <Button className="bg-[#2563eb] hover:bg-blue-700 text-white !rounded-full px-8">Update Preferences</Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#041e42] border-b pb-4">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#041e42] mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 border rounded-lg outline-none focus:border-[#2563eb]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#041e42] mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 border rounded-lg outline-none focus:border-[#2563eb]" />
                </div>
              </div>
              <Button className="bg-[#2563eb] hover:bg-blue-700 text-white !rounded-full px-8">Change Password</Button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#041e42] border-b pb-4">Payout Accounts</h2>
              <p className="text-gray-600">Connect your bank account to receive withdrawals from your Grind Escrow wallet.</p>
              
              <div className="p-4 border rounded-xl bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-green-600">
                    GTB
                  </div>
                  <div>
                    <h4 className="font-bold text-[#041e42]">GTBank (Guaranty Trust Bank)</h4>
                    <p className="text-sm text-gray-500">**** 1234</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Primary</span>
              </div>
              
              <Button variant="secondary" className="w-full mt-4 border-dashed border-2">
                + Add Bank Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
