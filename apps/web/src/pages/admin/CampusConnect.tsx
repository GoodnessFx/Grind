import React, { useState } from 'react';
import { Send, Image as ImageIcon, MapPin, Smile } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const CampusConnect = () => {
  const [post, setPost] = useState('');
  
  // Dummy social feed
  const [feed, setFeed] = useState([
    {
      id: 1,
      name: 'Tobi A.',
      handle: '@tobi_codes',
      avatar: 'T',
      time: '2h',
      content: 'Heading to New Hall for a stroll, anyone down to link up and discuss tech? 🚀',
      likes: 12,
      replies: 4
    },
    {
      id: 2,
      name: 'Sarah J.',
      handle: '@sarah_designs',
      avatar: 'S',
      time: '5h',
      content: 'Just delivered my first logo design on Grind and the client loved it! Escrow payment cleared instantly. #Win',
      likes: 45,
      replies: 12
    }
  ]);

  const handlePost = () => {
    if (!post.trim()) return;
    setFeed([{
      id: Date.now(),
      name: 'You',
      handle: '@current_user',
      avatar: 'Y',
      time: 'Just now',
      content: post,
      likes: 0,
      replies: 0
    }, ...feed]);
    setPost('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[#041e42] tracking-tight">Campus Connect</h1>
        <p className="text-gray-500">Network, vibe, and link up with other hustlers.</p>
      </header>

      {/* Post Composer */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-lg shrink-0">
            Y
          </div>
          <div className="flex-1">
            <textarea 
              value={post}
              onChange={e => setPost(e.target.value)}
              placeholder="What's happening on campus? Looking to link up?"
              className="w-full h-24 bg-transparent outline-none text-lg resize-none placeholder:text-gray-400"
            />
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
              <div className="flex gap-4 text-[#2563eb]">
                <button className="hover:bg-blue-50 p-2 rounded-full transition-colors"><ImageIcon size={20} /></button>
                <button className="hover:bg-blue-50 p-2 rounded-full transition-colors"><MapPin size={20} /></button>
                <button className="hover:bg-blue-50 p-2 rounded-full transition-colors"><Smile size={20} /></button>
              </div>
              <Button onClick={handlePost} className="bg-[#2563eb] hover:bg-blue-700 text-white !rounded-full px-6 flex items-center gap-2">
                Post <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {feed.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold shrink-0">
                {item.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#041e42]">{item.name}</span>
                  <span className="text-gray-500 text-sm">{item.handle}</span>
                  <span className="text-gray-300 text-sm">•</span>
                  <span className="text-gray-500 text-sm">{item.time}</span>
                </div>
                <p className="text-gray-800 text-lg mb-4">{item.content}</p>
                <div className="flex gap-8 text-gray-500 text-sm font-medium">
                  <button className="flex items-center gap-2 hover:text-[#2563eb] transition-colors"><MessageSquareIcon /> {item.replies}</button>
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors"><HeartIcon /> {item.likes}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline icons for the feed
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
