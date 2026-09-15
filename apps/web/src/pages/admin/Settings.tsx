import React, { useState } from 'react';
import { User, Bell, Lock, CreditCard, Share2, Camera, X, ZoomIn } from 'lucide-react';

// ── Avatar Cropper Modal ─────────────────────────────────────────────────────
const AvatarCropperModal = ({ onClose, onSave }: { onClose: () => void; onSave: (url: string) => void }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-white font-black text-xl">Update Profile Photo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Preview Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-[var(--grind-nigeria)] overflow-hidden bg-gray-800 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform"
                  style={{ transform: `scale(${scale})` }}
                />
              ) : (
                <Camera size={40} className="text-gray-600" />
              )}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <label className="block mb-6 cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <div className="w-full text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition-colors border border-white/20">
            Choose Photo
          </div>
        </label>

        {/* Zoom Slider */}
        {previewUrl && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <ZoomIn size={16} className="text-gray-400 shrink-0" />
              <input
                type="range"
                min={1}
                max={2}
                step={0.05}
                value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--grind-nigeria)]"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-bold text-gray-400 border border-white/10 hover:border-white/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (previewUrl) {
                onSave(previewUrl);
              }
              onClose();
            }}
            disabled={!previewUrl}
            className="flex-[2] py-3 rounded-full font-black bg-[var(--grind-nigeria)] hover:bg-blue-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Settings Component ──────────────────────────────────────────────────
export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const storedUser = localStorage.getItem('grind_user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'User', email: 'user@grind.com' };

  const handleAvatarSave = (url: string) => {
    setAvatarUrl(url);
    const updatedUser = { ...user, avatar: url };
    localStorage.setItem('grind_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {showAvatarModal && (
        <AvatarCropperModal onClose={() => setShowAvatarModal(false)} onSave={handleAvatarSave} />
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-black text-[var(--grind-primary)] tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences, security, and connected profiles.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-56 space-y-1 shrink-0">
          {[
            { id: 'profile', icon: <User size={17} />, label: 'Profile' },
            { id: 'social', icon: <Share2 size={17} />, label: 'Social Connect' },
            { id: 'notifications', icon: <Bell size={17} />, label: 'Notifications' },
            { id: 'security', icon: <Lock size={17} />, label: 'Security' },
            { id: 'billing', icon: <CreditCard size={17} />, label: 'Billing & Payouts' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--grind-nigeria)] text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[var(--grind-primary)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[var(--grind-primary)] border-b pb-4">Public Profile</h2>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                  onClick={() => setShowAvatarModal(true)}
                >
                  {avatarUrl || user.avatar ? (
                    <img src={avatarUrl || user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--grind-nigeria)] flex items-center justify-center text-white font-black text-3xl">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="bg-[var(--grind-primary)] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[var(--grind-nigeria)] transition-colors text-sm"
                  >
                    Change Photo
                  </button>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">First Name</label>
                  <input type="text" defaultValue={user.name?.split(' ')[0] || ''} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--grind-nigeria)] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">Last Name</label>
                  <input type="text" defaultValue={user.name?.split(' ')[1] || ''} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--grind-nigeria)] transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">Bio / Tagline</label>
                <textarea rows={3} defaultValue="Computer Science student at UNILAG. Freelance web developer." className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--grind-nigeria)] transition-colors resize-none" />
              </div>

              <div>
                <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">University</label>
                <select className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--grind-nigeria)] bg-white transition-colors">
                  <option>University of Lagos</option>
                  <option>Obafemi Awolowo University</option>
                  <option>University of Ibadan</option>
                  <option>FUTA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">Grind Roles</label>
                <div className="flex gap-3">
                  {['Buyer', 'Seller', 'Both'].map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="role" defaultChecked={role === 'Both'} className="accent-[var(--grind-nigeria)]" />
                      <span className="text-sm font-bold text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">You can be both a buyer and a seller on Grind.</p>
              </div>

              <button className="bg-[var(--grind-nigeria)] hover:bg-blue-700 text-white font-black px-8 py-3 rounded-full transition-colors shadow-lg shadow-blue-500/20">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[var(--grind-primary)] border-b pb-4">Social Connect</h2>
              <p className="text-gray-600">Connect your social profiles to let others find you and to share your Grind listings.</p>

              <div className="space-y-4">
                {[
                  { platform: 'X (Twitter)', handle: '@yourhandle', color: '#000', initial: 'X' },
                  { platform: 'Instagram', handle: '@yourinsta', color: '#c13584', initial: 'IG' },
                  { platform: 'LinkedIn', handle: 'linkedin.com/in/you', color: '#0077b5', initial: 'LI' },
                  { platform: 'WhatsApp Business', handle: '+234...', color: '#25d366', initial: 'WA' },
                ].map(s => (
                  <div key={s.platform} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[var(--grind-nigeria)] transition-colors group">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.initial}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[var(--grind-primary)] text-sm">{s.platform}</p>
                      <input
                        type="text"
                        defaultValue={s.handle}
                        className="text-gray-500 text-sm outline-none bg-transparent w-full focus:text-[var(--grind-primary)] transition-colors"
                      />
                    </div>
                    <button className="text-xs font-bold text-[var(--grind-nigeria)] border border-[var(--grind-nigeria)] px-4 py-1.5 rounded-full hover:bg-[var(--grind-nigeria)] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      Connect
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium">
                  <strong>Tip:</strong> Connecting your socials increases your Grind Score visibility and helps potential buyers verify your identity.
                </p>
              </div>

              <button className="bg-[var(--grind-nigeria)] hover:bg-blue-700 text-white font-black px-8 py-3 rounded-full transition-colors">
                Save Social Links
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[var(--grind-primary)] border-b pb-4">Notification Preferences</h2>
              <div className="space-y-5">
                {[
                  { label: 'Email when someone messages me', checked: true },
                  { label: 'Email when an order is placed or received', checked: true },
                  { label: 'SMS alerts for Escrow releases', checked: false },
                  { label: 'Weekly earnings summary email', checked: true },
                  { label: 'New listing alerts in my categories', checked: false },
                ].map(item => (
                  <label key={item.label} className="flex items-center justify-between py-2 cursor-pointer">
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 accent-[var(--grind-nigeria)] rounded" />
                  </label>
                ))}
              </div>
              <button className="bg-[var(--grind-nigeria)] hover:bg-blue-700 text-white font-black px-8 py-3 rounded-full transition-colors">Update Preferences</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[var(--grind-primary)] border-b pb-4">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--grind-nigeria)] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--grind-nigeria)] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-black text-[var(--grind-primary)] mb-2">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--grind-nigeria)] transition-colors" />
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm font-medium">For maximum security, use a password that is at least 12 characters and includes symbols.</p>
              </div>
              <button className="bg-[var(--grind-nigeria)] hover:bg-blue-700 text-white font-black px-8 py-3 rounded-full transition-colors">Update Password</button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[var(--grind-primary)] border-b pb-4">Payout Accounts</h2>
              <p className="text-gray-600">Connect your bank account to receive withdrawals from your Grind Escrow wallet.</p>

              <div className="p-5 border border-gray-200 rounded-xl flex justify-between items-center hover:border-[var(--grind-nigeria)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center font-black text-green-700 text-sm border border-gray-100">GTB</div>
                  <div>
                    <p className="font-black text-[var(--grind-primary)]">GTBank (Guaranty Trust Bank)</p>
                    <p className="text-sm text-gray-500 font-medium">**** **** **** 1234</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1.5 rounded-full">Primary</span>
              </div>

              <button className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-[var(--grind-nigeria)] text-gray-500 hover:text-[var(--grind-nigeria)] font-bold py-4 rounded-xl transition-all">
                + Add Bank Account
              </button>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-[#f8fafc] p-4 rounded-xl text-center border border-gray-100">
                  <p className="text-2xl font-black text-[var(--grind-primary)]">₦0</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">Available Balance</p>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl text-center border border-gray-100">
                  <p className="text-2xl font-black text-[var(--grind-primary)]">₦0</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">In Escrow</p>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl text-center border border-gray-100">
                  <p className="text-2xl font-black text-[var(--grind-primary)]">₦0</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">Total Earned</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
