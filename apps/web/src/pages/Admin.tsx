import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getAllSessions, SupportSession, addAdminReply, resolveSession } from '../components/common/SupportChat';
import { CampusConnect } from './admin/CampusConnect';
import { Settings } from './admin/Settings';

const Overview = () => {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [activeSession, setActiveSession] = useState<SupportSession | null>(null);
  const [replyText, setReplyText] = useState('');
  
  useEffect(() => {
    const load = () => setSessions(getAllSessions());
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const handleReply = () => {
    if (!activeSession || !replyText.trim()) return;
    const updated = addAdminReply(activeSession.id, replyText.trim());
    if (updated) {
      setActiveSession({ ...updated });
      setSessions(getAllSessions());
    }
    setReplyText('');
  };

  const handleResolve = (id: string) => {
    resolveSession(id);
    setSessions(getAllSessions());
    if (activeSession?.id === id) setActiveSession(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-[var(--grind-primary)] tracking-tight">Overview Dashboard</h1>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="!shadow-sm !rounded-[24px] border border-gray-200">
          <Card.Body className="p-6">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-2">Total Users</h3>
            <p className="text-4xl font-black text-[var(--grind-primary)]">1,234</p>
            <p className="text-sm text-green-600 font-medium mt-2">↑ 12% this month</p>
          </Card.Body>
        </Card>
        <Card className="!shadow-sm !rounded-[24px] border border-gray-200">
          <Card.Body className="p-6">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-2">Active Sellers</h3>
            <p className="text-4xl font-black text-[var(--grind-primary)]">567</p>
          </Card.Body>
        </Card>
        <Card className="!shadow-sm !rounded-[24px] border border-transparent bg-green-50">
          <Card.Body className="p-6">
            <h3 className="text-green-800 text-sm font-semibold uppercase tracking-widest mb-2">Revenue</h3>
            <p className="text-4xl font-black text-green-900">₦450k</p>
          </Card.Body>
        </Card>
        <Card className="!shadow-sm !rounded-[24px] border border-transparent bg-red-50">
          <Card.Body className="p-6">
            <h3 className="text-red-800 text-sm font-semibold uppercase tracking-widest mb-2">Disputes</h3>
            <p className="text-4xl font-black text-red-900">12</p>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Verification Queue */}
        <Card className="!rounded-[24px] border border-gray-200 overflow-hidden">
          <Card.Header className="bg-white border-b border-gray-100 p-6">
            <h2 className="font-bold text-xl text-[var(--grind-primary)]">Pending Verifications (8)</h2>
          </Card.Header>
          <Card.Body className="p-0 bg-white">
            <div className="divide-y divide-gray-100">
              {[1, 2].map(i => (
                <div key={i} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-base text-[var(--grind-primary)]">John D. - Tutor</p>
                    <p className="text-sm text-gray-500">Submitted 2 hours ago</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 text-white hover:bg-green-700 !rounded-full">Approve</Button>
                    <Button size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 !rounded-full">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Support Chat Queue */}
        <Card className="!rounded-[24px] border border-gray-200 overflow-hidden">
          <Card.Header className="bg-white border-b border-gray-100 p-6">
            <h2 className="font-bold text-xl text-[var(--grind-primary)]">Live Support Chats ({sessions.filter(s => s.status === 'open').length})</h2>
          </Card.Header>
          <Card.Body className="p-0 flex h-[400px]">
            {/* Session List */}
            <div className="w-1/3 border-r border-gray-100 overflow-y-auto divide-y divide-gray-50 bg-white">
              {sessions.map(s => (
                <div key={s.id} onClick={() => setActiveSession(s)} className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${activeSession?.id === s.id ? 'bg-blue-50' : ''}`}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-sm text-[var(--grind-primary)]">{s.userAlias}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'open' ? 'bg-[var(--grind-nigeria)] text-white' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{s.messages[s.messages.length - 1]?.text}</p>
                </div>
              ))}
            </div>
            
            {/* Chat View */}
            <div className="flex-1 flex flex-col bg-gray-50/50">
              {activeSession ? (
                <>
                  <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
                    <span className="font-bold text-sm text-[var(--grind-primary)]">{activeSession.userAlias}</span>
                    {activeSession.status === 'open' && (
                      <Button size="sm" className="bg-gray-800 text-white hover:bg-black !rounded-full" onClick={() => handleResolve(activeSession.id)}>Resolve</Button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeSession.messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[16px] px-4 py-2.5 text-sm font-medium ${msg.from === 'admin' ? 'bg-[var(--grind-nigeria)] text-white rounded-tr-sm shadow-sm' : 'bg-white border border-gray-200 text-[var(--grind-primary)] rounded-tl-sm shadow-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  {activeSession.status === 'open' && (
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} placeholder="Type reply..." className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full outline-none focus:border-[var(--grind-nigeria)] transition-colors" />
                      <Button size="sm" className="bg-[var(--grind-nigeria)] text-white !rounded-full px-5 hover:bg-blue-700" onClick={handleReply}>Send</Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-medium text-sm">Select a chat</div>
              )}
            </div>
          </Card.Body>
        </Card>

      </div>
    </div>
  );
};

export const Admin = () => {
  const storedUser = localStorage.getItem('grind_user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Admin User', email: 'admin@grind.com' };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-[Inter,sans-serif]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-[var(--grind-nigeria)] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-[var(--grind-primary)] leading-tight">{user.name || 'Admin User'}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 flex-1">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/connect" element={<CampusConnect />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};
