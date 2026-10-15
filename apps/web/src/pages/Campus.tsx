import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Radio, Search, X, Flag } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { ReportModal } from '../components/common/ReportModal';
import { PEOPLE } from '../data/listings';

interface Post {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  uni: string;
  time: string;
  content: string;
  likes: number;
  liked: boolean;
  comments: { name: string; text: string }[];
}

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

const now = () => new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const SEED_POSTS: Post[] = [
  {
    id: 'post1',
    name: 'Sarah J.',
    handle: '@sarah_designs',
    avatar: PEOPLE[1].avatar,
    uni: 'UNILAG',
    time: '2h ago',
    content: 'Just delivered my first logo design on Grind and the client loved it. Escrow payment cleared instantly. Campus hustle pays!',
    likes: 45,
    liked: false,
    comments: [{ name: 'Tobi A.', text: 'Big win! Which package did you use?' }],
  },
  {
    id: 'post2',
    name: 'Tobi A.',
    handle: '@tobi_codes',
    avatar: PEOPLE[2].avatar,
    uni: 'FUTA',
    time: '5h ago',
    content: 'Heading to New Hall for a stroll, anyone down to link up and talk tech and startups?',
    likes: 12,
    liked: false,
    comments: [],
  },
  {
    id: 'post3',
    name: 'Ify Glam',
    handle: '@ify.glam',
    avatar: PEOPLE[7].avatar,
    uni: 'OAU',
    time: '1d ago',
    content: 'Slots open for weekend glam and gele bookings. Home service across campus. Book early!',
    likes: 31,
    liked: false,
    comments: [{ name: 'Amara B.', text: 'Can you do a bridal trial on Friday?' }],
  },
];

const SEED_CHATS: Record<string, Message[]> = {
  p1: [
    { id: 'm1', from: 'them', text: 'Hi! Saw your post about content creation', time: '09:41' },
    { id: 'm2', from: 'me', text: 'Hey! Yes, I make reels for campus brands', time: '09:44' },
    { id: 'm3', from: 'them', text: 'Perfect, can you handle 4 videos this week?', time: '09:46' },
  ],
};
export const Campus = () => {
  const [posts, setPosts] = useState<Post[]>(() => load('grind_feed_posts', SEED_POSTS));
  const [draft, setDraft] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [activeChat, setActiveChat] = useState<string>('p1');
  const [chats, setChats] = useState<Record<string, Message[]>>(() => load('grind_chats', SEED_CHATS));
  const [msgDraft, setMsgDraft] = useState('');
  const [chatOpenMobile, setChatOpenMobile] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => localStorage.setItem('grind_feed_posts', JSON.stringify(posts)), [posts]);
  useEffect(() => localStorage.setItem('grind_chats', JSON.stringify(chats)), [chats]);

  const publish = () => {
    if (!draft.trim()) return;
    const user = JSON.parse(localStorage.getItem('grind_user') || '{"name":"You"}');
    setPosts([{
      id: `post-${Date.now()}`,
      name: user.name || 'You',
      handle: `@${String(user.name || 'you').toLowerCase().replace(/\s+/g, '_')}`,
      avatar: PEOPLE[0].avatar,
      uni: 'Your campus',
      time: 'Just now',
      content: draft.trim(),
      likes: 0,
      liked: false,
      comments: [],
    }, ...posts]);
    setDraft('');
  };

  const toggleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
      : p));
  };

  const addComment = (id: string) => {
    const text = (commentDrafts[id] || '').trim();
    if (!text) return;
    const user = JSON.parse(localStorage.getItem('grind_user') || '{"name":"You"}');
    setPosts(posts.map(p => p.id === id
      ? { ...p, comments: [...p.comments, { name: user.name || 'You', text }] }
      : p));
    setCommentDrafts({ ...commentDrafts, [id]: '' });
  };

  const sendMessage = () => {
    if (!msgDraft.trim()) return;
    setChats({
      ...chats,
      [activeChat]: [...(chats[activeChat] || []), { id: `m${Date.now()}`, from: 'me', text: msgDraft.trim(), time: now() }],
    });
    setMsgDraft('');
  };

  const chatPerson = PEOPLE.find(p => p.id === activeChat) ?? PEOPLE[0];


  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-display">Campus Connect</h1>
            <p className="text-gray-500 text-sm sm:text-base">The campus news feed, chat box and live streams are all here.</p>
          </div>
          <Link to="/live" className="hidden sm:inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
            <Radio size={16} /> Go Live
          </Link>
        </div>

        <div className="flex sm:hidden gap-2 mb-4">
          <button
            onClick={() => setChatOpenMobile(false)}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold ${!chatOpenMobile ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            News Feed
          </button>
          <button
            onClick={() => setChatOpenMobile(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold ${chatOpenMobile ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            Chat Box
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── News feed ── */}
          <main className={`flex-1 w-full space-y-4 ${chatOpenMobile ? 'hidden sm:block' : 'block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Share a win, ask a question, or invite people to link up..."
                className="w-full h-20 bg-transparent outline-none text-sm sm:text-base resize-none placeholder:text-gray-400"
              />
              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  onClick={publish}
                  className="bg-black hover:bg-[var(--grind-nigeria)] text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors flex items-center gap-2"
                >
                  <Send size={15} /> Post
                </button>
              </div>
            </div>

            {posts.map(post => (
              <article key={post.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                <div className="flex gap-3">
                  <img src={post.avatar} alt={post.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
                      <span className="font-bold text-sm text-black">{post.name}</span>
                      <span className="text-gray-400 text-xs">{post.handle} · {post.time}</span>
                      <span className="text-[11px] font-bold text-[var(--grind-nigeria)] bg-green-50 px-2 py-0.5 rounded-full">{post.uni}</span>
                    </div>
                    <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-3">{post.content}</p>
                    <div className="flex gap-6 text-gray-500 text-sm font-medium">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${post.liked ? 'text-red-500' : ''}`}
                      >
                        <Heart size={17} className={post.liked ? 'fill-current' : ''} /> {post.likes}
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle size={17} /> {post.comments.length}
                      </span>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {post.comments.map((c, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl px-3 py-2 text-sm">
                            <span className="font-bold text-black">{c.name} </span>
                            <span className="text-gray-700">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={commentDrafts[post.id] || ''}
                        onChange={e => setCommentDrafts({ ...commentDrafts, [post.id]: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') addComment(post.id); }}
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-[var(--grind-nigeria)] min-w-0"
                      />
                      <button
                        onClick={() => addComment(post.id)}
                        className="w-9 h-9 shrink-0 rounded-full bg-[var(--grind-nigeria)] hover:bg-[#004d00] text-white flex items-center justify-center transition-colors"
                        aria-label="Post comment"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </main>


          {/* ── Chat box ── */}
          <aside className={`w-full lg:w-[340px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${chatOpenMobile ? 'block' : 'hidden sm:block'}`}>
            <div className="p-4 bg-black text-white">
              <h2 className="font-bold text-sm">Chat Box</h2>
              <p className="text-white/60 text-xs">Direct messages with students</p>
            </div>
            <div className="flex border-b border-gray-100">
              <div className="w-2/5 max-h-[420px] overflow-y-auto border-r border-gray-100">
                {PEOPLE.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActiveChat(p.id)}
                    className={`w-full flex items-center gap-2 p-3 text-left transition-colors ${activeChat === p.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                  >
                    <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="min-w-0 hidden sm:block lg:block">
                      <div className="text-xs font-bold text-black truncate">{p.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{(chats[p.id] || []).slice(-1)[0]?.text || 'Start chatting'}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex-1 flex flex-col max-h-[420px]">
                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                  <img src={chatPerson.avatar} alt={chatPerson.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-black truncate">{chatPerson.name}</div>
                    <div className="text-[11px] text-green-600">Online</div>
                  </div>
                  <button
                    onClick={() => setShowReport(true)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg"
                    aria-label="Report this user"
                    title="Report this user"
                  >
                    <Flag size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {(chats[activeChat] || []).length === 0 && (
                    <p className="text-center text-xs text-gray-400 mt-6">Say hello to {chatPerson.name.split(' ')[0]}.</p>
                  )}
                  {(chats[activeChat] || []).map(m => (
                    <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        m.from === 'me'
                          ? 'bg-[var(--grind-nigeria)] text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {m.text}
                        <div className={`text-[10px] mt-0.5 ${m.from === 'me' ? 'text-white/70' : 'text-gray-400'}`}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 border-t border-gray-100 flex items-center gap-2">
                  <input
                    value={msgDraft}
                    onChange={e => setMsgDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                    placeholder="Message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 text-sm outline-none focus:border-[var(--grind-nigeria)] min-w-0"
                  />
                  <button
                    onClick={sendMessage}
                    className="w-9 h-9 shrink-0 rounded-full bg-black hover:bg-[var(--grind-nigeria)] text-white flex items-center justify-center transition-colors"
                    aria-label="Send message"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
            <Link to="/live" className="flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
              <Radio size={15} /> Watch the campus live stream
            </Link>
          </aside>
        </div>
      </div>

      {/* Report the chat partner */}
      {showReport && (
        <ReportModal targetType="user" targetId={activeChat} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};

