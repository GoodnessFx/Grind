import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getAllSessions, SupportSession, addAdminReply, resolveSession } from '../components/common/SupportChat';

export const Admin = () => {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [activeSession, setActiveSession] = useState<SupportSession | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Try to load mock user
  const storedUser = localStorage.getItem('grind_user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Admin User', email: 'admin@grind.com' };

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
    <div className="min-h-screen bg-[#f7f7f5] flex font-[Inter,sans-serif]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-black tracking-tight">Overview Dashboard</h1>
          <div className="flex items-center gap-4 bg-white border border-[#e6e6e6] rounded-[50px] px-4 py-2 shadow-sm">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs">
              {user.name ? user.name.charAt(0) : 'A'}
            </div>
            <div>
              <div className="text-sm font-bold text-black leading-none">{user.name || 'Admin User'}</div>
              <div className="text-xs text-[#666666]">{user.email}</div>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="!shadow-sm !rounded-[24px] border border-[#e6e6e6]">
            <Card.Body className="p-6">
              <h3 className="text-[#666666] text-sm font-semibold uppercase tracking-widest mb-2">Total Users</h3>
              <p className="text-4xl font-black text-black">1,234</p>
              <p className="text-sm text-[#1ea64a] font-medium mt-2">↑ 12% this month</p>
            </Card.Body>
          </Card>
          <Card className="!shadow-sm !rounded-[24px] border border-[#e6e6e6]">
            <Card.Body className="p-6">
              <h3 className="text-[#666666] text-sm font-semibold uppercase tracking-widest mb-2">Active Sellers</h3>
              <p className="text-4xl font-black text-black">567</p>
            </Card.Body>
          </Card>
          <Card className="!shadow-sm !rounded-[24px] border border-[#e6e6e6] bg-[#dceeb1]">
            <Card.Body className="p-6">
              <h3 className="text-black text-sm font-semibold uppercase tracking-widest mb-2">Revenue</h3>
              <p className="text-4xl font-black text-black">₦450k</p>
            </Card.Body>
          </Card>
          <Card className="!shadow-sm !rounded-[24px] border border-[#e6e6e6] bg-[#efd4d4]">
            <Card.Body className="p-6">
              <h3 className="text-black text-sm font-semibold uppercase tracking-widest mb-2">Disputes</h3>
              <p className="text-4xl font-black text-black">12</p>
            </Card.Body>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Verification Queue */}
          <Card className="!rounded-[24px] border border-[#e6e6e6] overflow-hidden">
            <Card.Header className="bg-white border-b border-[#e6e6e6] p-6">
              <h2 className="font-bold text-xl text-black">Pending Verifications (8)</h2>
            </Card.Header>
            <Card.Body className="p-0 bg-white">
              <div className="divide-y divide-[#e6e6e6]">
                {[1, 2].map(i => (
                  <div key={i} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-base text-black">John D. - Tutor</p>
                      <p className="text-sm text-[#666666]">Submitted 2 hours ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#1ea64a] text-white hover:bg-green-700 !rounded-[50px]">Approve</Button>
                      <Button size="sm" className="bg-[#efd4d4] text-black hover:bg-red-200 !rounded-[50px]">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Support Chat Queue */}
          <Card className="!rounded-[24px] border border-[#e6e6e6] overflow-hidden">
            <Card.Header className="bg-white border-b border-[#e6e6e6] p-6">
              <h2 className="font-bold text-xl text-black">Live Support Chats ({sessions.filter(s => s.status === 'open').length})</h2>
            </Card.Header>
            <Card.Body className="p-0 flex h-[500px]">
              {/* Session List */}
              <div className="w-1/3 border-r border-[#e6e6e6] overflow-y-auto divide-y divide-[#e6e6e6] bg-white">
                {sessions.map(s => (
                  <div key={s.id} onClick={() => setActiveSession(s)} className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${activeSession?.id === s.id ? 'bg-[#f4ecd6]' : ''}`}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm text-black">{s.userAlias}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.status === 'open' ? 'bg-[#c5b0f4] text-black' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                    </div>
                    <p className="text-xs text-[#666666] truncate">{s.messages[s.messages.length - 1]?.text}</p>
                  </div>
                ))}
              </div>
              
              {/* Chat View */}
              <div className="flex-1 flex flex-col bg-gray-50">
                {activeSession ? (
                  <>
                    <div className="p-4 border-b border-[#e6e6e6] bg-white flex justify-between items-center">
                      <span className="font-bold text-sm text-black">{activeSession.userAlias}</span>
                      {activeSession.status === 'open' && (
                        <Button size="sm" className="bg-black text-white hover:bg-gray-800 !rounded-[50px]" onClick={() => handleResolve(activeSession.id)}>Mark Resolved</Button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {activeSession.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-[24px] px-4 py-3 text-sm font-medium ${msg.from === 'admin' ? 'bg-black text-white rounded-tr-sm' : 'bg-white border border-[#e6e6e6] text-black rounded-tl-sm shadow-sm'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    {activeSession.status === 'open' && (
                      <div className="p-4 bg-white border-t border-[#e6e6e6] flex gap-2">
                        <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} placeholder="Type reply..." className="flex-1 px-4 py-3 text-sm border border-[#e6e6e6] rounded-[50px] outline-none focus:border-black transition-colors" />
                        <Button size="sm" className="bg-black text-white !rounded-[50px] px-6" onClick={handleReply}>Send</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#666666] font-medium text-sm">Select a session to reply</div>
                )}
              </div>
            </Card.Body>
          </Card>

        </div>
      </main>
    </div>
  );
};
