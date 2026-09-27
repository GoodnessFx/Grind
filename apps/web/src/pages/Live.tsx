import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Eye, Radio, X, Users, ChevronLeft, Send } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';

interface StreamComment {
  id: string;
  name: string;
  text: string;
}

interface SchoolStream {
  id: string;
  school: string;
  title: string;
  host: string;
  avatar: string;
  backdrop: string;
  views: number;
  likes: number;
  liked: boolean;
  comments: StreamComment[];
}

const SCHOOLS: SchoolStream[] = [
  { id: 'unilag', school: 'University of Lagos', title: 'Night shoot study grind with the Akokites', host: '@amara.b', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80', backdrop: '/hero/hero4_library.jpg', views: 342, likes: 1291, liked: false, comments: [
    { id: 'c1', name: 'Tobi', text: 'This library setup is elite' },
    { id: 'c2', name: 'Ada', text: 'Which course are you reading?' },
  ] },
  { id: 'oau', school: 'Obafemi Awolowo University', title: 'Gown meets town: OAU talent showcase', host: '@zainab.glam', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', backdrop: '/hero/hero3_creative.jpg', views: 518, likes: 2404, liked: false, comments: [
    { id: 'c1', name: 'Femi', text: 'Great Ife no dey carry last!' },
    { id: 'c2', name: 'Ngozi', text: 'That beat is fire' },
  ] },
  { id: 'ui', school: 'University of Ibadan', title: 'UI hustle diaries: from hall to market', host: '@ngozi_data', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80', backdrop: '/hero/hero5_hustle.jpg', views: 289, likes: 986, liked: false, comments: [
    { id: 'c1', name: 'Seun', text: 'First class mindset!' },
  ] },
  { id: 'futa', school: 'FUTA', title: 'Code, caffeine and campus delivery runs', host: '@emeka_dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', backdrop: '/hero/hero2_tech.jpg', views: 176, likes: 742, liked: false, comments: [
    { id: 'c1', name: 'Kunle', text: 'React or nothing' },
    { id: 'c2', name: 'Bola', text: 'Show the delivery setup pls' },
  ] },
  { id: 'abu', school: 'Ahmadu Bello University', title: 'Samaru nights: open mic and chill', host: '@fatimah.writes', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80', backdrop: '/hero/hero1_oau.jpg', views: 231, likes: 1105, liked: false, comments: [
    { id: 'c1', name: 'Musa', text: 'Samaru to the world!' },
  ] },
];
function loadStreams(): SchoolStream[] {
  try {
    const raw = localStorage.getItem('grind_live_streams');
    if (raw) {
      const saved = JSON.parse(raw) as SchoolStream[];
      return SCHOOLS.map(base => {
        const s = saved.find(x => x.id === base.id);
        return s ? { ...base, views: s.views, likes: s.likes, liked: s.liked, comments: s.comments } : base;
      });
    }
  } catch { /* ignore */ }
  return SCHOOLS;
}

export const Live = () => {
  const [streams, setStreams] = useState<SchoolStream[]>(loadStreams);
  const [activeId, setActiveId] = useState('unilag');
  const [comment, setComment] = useState('');
  const [burst, setBurst] = useState(false);
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('grind_live_streams', JSON.stringify(streams));
  }, [streams]);

  useEffect(() => {
    commentsRef.current?.scrollTo({ top: commentsRef.current.scrollHeight });
  }, [activeId, streams]);

  const stream = streams.find(s => s.id === activeId) ?? streams[0];

  const update = (id: string, patch: Partial<SchoolStream>) => {
    setStreams(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const toggleLike = () => {
    setBurst(true);
    update(stream.id, { liked: !stream.liked, likes: stream.likes + (stream.liked ? -1 : 1) });
    setTimeout(() => setBurst(false), 500);
  };

  const postComment = () => {
    if (!comment.trim()) return;
    const user = JSON.parse(localStorage.getItem('grind_user') || '{"name":"Guest"}');
    update(stream.id, {
      comments: [...stream.comments, { id: `c-${Date.now()}`, name: user.name || 'Guest', text: comment.trim() }].slice(-50),
    });
    setComment('');
  };

  const startHosting = () => {
    if (!liveTitle.trim()) return;
    setGoLiveOpen(false);
    update(stream.id, { title: liveTitle.trim() });
  };


  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-white text-black">
        <Navbar />
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link to="/campus" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4">
          <ChevronLeft size={16} /> Back to Campus Connect
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">Campus Live</h1>
            <p className="text-white/60 text-sm sm:text-base">One central live stream for every school. Tap to like, drop a comment.</p>
          </div>
          <button
            onClick={() => setGoLiveOpen(true)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            <Radio size={16} /> Go Live
          </button>
        </div>

        {/* School selector: one central stream each */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-5">
          {streams.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-left transition-colors border ${
                activeId === s.id
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold">{s.school.replace('University of ', '').replace('Federal University of Technology Akure', 'FUTA')}</span>
              </div>
              <div className={`text-xs mt-0.5 flex items-center gap-1 ${activeId === s.id ? 'text-black/60' : 'text-white/50'}`}>
                <Eye size={11} /> {s.views} watching
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Stream stage (TikTok style) ── */}
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10 min-h-[420px] sm:min-h-[540px] flex">
            <img src={stream.backdrop} alt={stream.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </span>
              <span className="bg-black/60 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Eye size={12} /> {stream.views}
              </span>
            </div>

            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full">
              Host: {stream.host}
            </div>

            <div className="absolute bottom-6 left-4 right-20">
              <div className="flex items-center gap-3 mb-2">
                <img src={stream.avatar} alt={stream.host} className="w-10 h-10 rounded-full object-cover border-2 border-white/40" />
                <div>
                  <div className="font-bold text-sm">{stream.host}</div>
                  <div className="text-white/70 text-xs">{stream.school}</div>
                </div>
              </div>
              <h2 className="font-bold text-base sm:text-lg leading-snug">{stream.title}</h2>
            </div>

            {/* Right action rail */}
            <div className="absolute right-3 bottom-6 flex flex-col items-center gap-4">
              <button onClick={toggleLike} className="flex flex-col items-center gap-1 group" aria-label="Like the stream">
                <span className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur transition-all ${burst || stream.liked ? 'bg-red-600 scale-110' : 'bg-white/15 group-hover:bg-white/25'}`}>
                  <Heart size={22} className={stream.liked || burst ? 'fill-current' : ''} />
                </span>
                <span className="text-xs font-bold">{stream.likes.toLocaleString()}</span>
              </button>
              <div className="flex flex-col items-center gap-1">
                <span className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                  <MessageCircle size={22} />
                </span>
                <span className="text-xs font-bold">{stream.comments.length}</span>
              </div>
              <button className="flex flex-col items-center gap-1 group" aria-label="Share">
                <span className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <Share2 size={20} />
                </span>
                <span className="text-xs font-bold">Share</span>
              </button>
            </div>
          </div>


          {/* ── Live chat ── */}
          <div className="w-full lg:w-[360px] shrink-0 bg-[#0f0f12] border border-white/10 rounded-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-bold text-sm">Live Chat</h2>
              <p className="text-white/50 text-xs">{stream.school} central stream</p>
            </div>
            <div ref={commentsRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[380px]">
              {stream.comments.map(c => (
                <div key={c.id} className="text-sm">
                  <span className="font-bold text-green-400">{c.name} </span>
                  <span className="text-white/85">{c.text}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/10 flex items-center gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') postComment(); }}
                placeholder="Say something nice..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm outline-none focus:border-green-500 placeholder:text-white/40 min-w-0"
              />
              <button
                onClick={postComment}
                className="w-10 h-10 shrink-0 rounded-full bg-[var(--grind-nigeria)] hover:bg-green-700 text-white flex items-center justify-center transition-colors"
                aria-label="Send comment"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs mt-6 flex items-center gap-1.5">
          <Users size={13} /> Every school gets one central stream so the whole campus vibes together.
        </p>
      </div>

      {/* Go Live modal */}
      {goLiveOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-black/70" onClick={() => setGoLiveOpen(false)} />
          <div className="relative bg-[#141417] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Go Live
              </h2>
              <button onClick={() => setGoLiveOpen(false)} className="text-white/50 hover:text-white" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Stream title</label>
            <input
              value={liveTitle}
              onChange={e => setLiveTitle(e.target.value)}
              placeholder="e.g. Night shoot with the hostel crew"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 placeholder:text-white/30 mb-5"
            />
            <button
              onClick={startHosting}
              disabled={!liveTitle.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <Radio size={17} /> Start Streaming Now
            </button>
            <p className="text-white/40 text-xs mt-3 text-center">Your stream becomes the central stream for this school.</p>
          </div>
        </div>
      )}
    </div>
  );
};

