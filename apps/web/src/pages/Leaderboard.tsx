import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Medal, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { LogoMark } from '../app/components/brand/LogoMark';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  grindScore: number;
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  jobsCompleted: number;
  trend: 'up' | 'down' | 'same';
  university: string;
}

const mockData: LeaderboardEntry[] = [
  { id: '1', rank: 1, username: 'Amara Studio', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80', grindScore: 9850, tier: 'Diamond', jobsCompleted: 412, trend: 'up', university: 'UNILAG' },
  { id: '2', rank: 2, username: 'Tunde K.', avatar: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&q=80', grindScore: 9420, tier: 'Diamond', jobsCompleted: 389, trend: 'same', university: 'OAU' },
  { id: '3', rank: 3, username: 'PhoneDoc NG', avatar: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100&q=80', grindScore: 8900, tier: 'Diamond', jobsCompleted: 854, trend: 'up', university: 'UNIBEN' },
  { id: '4', rank: 4, username: 'David O.', avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&q=80', grindScore: 7850, tier: 'Platinum', jobsCompleted: 210, trend: 'up', university: 'UNN' },
  { id: '5', rank: 5, username: 'Chisom A.', avatar: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&q=80', grindScore: 7100, tier: 'Platinum', jobsCompleted: 156, trend: 'down', university: 'UNILAG' },
  { id: '6', rank: 6, username: 'Lens & Light', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', grindScore: 6500, tier: 'Platinum', jobsCompleted: 94, trend: 'up', university: 'LASU' },
  { id: '7', rank: 7, username: 'CodeNinja', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', grindScore: 5800, tier: 'Gold', jobsCompleted: 67, trend: 'up', university: 'UNILORIN' },
  { id: '8', rank: 8, username: 'Ngozi Bakes', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', grindScore: 4950, tier: 'Gold', jobsCompleted: 142, trend: 'down', university: 'UI' },
];

const TIER_COLORS = {
  Diamond: 'bg-sky-100 text-sky-700 border-sky-200',
  Platinum: 'bg-purple-100 text-purple-700 border-purple-200',
  Gold: 'bg-amber-100 text-amber-700 border-amber-200',
  Silver: 'bg-gray-100 text-gray-700 border-gray-200',
  Bronze: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const Leaderboard = () => {
  const [search, setSearch] = useState('');
  
  const filtered = mockData.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-[Inter,sans-serif]">
      {/* Nav */}
      <header className="bg-[#0A0F1E] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <LogoMark size={24} tone="light" />
              <span className="text-white font-bold">Grind</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold text-sm">GrindScore Leaderboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-4">
            <Trophy size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">GrindScore Leaderboard</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            The most reputable freelancers and sellers on Grind. Build your GrindScore through successful transactions, fast delivery, and 5-star reviews.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={18} /> Top Sellers Nationwide
            </h2>
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search user or university..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1E56CC]"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">GrindScore</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-black w-8 text-center ${user.rank <= 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                          #{user.rank}
                        </span>
                        {user.trend === 'up' && <ArrowUp size={16} className="text-green-500" />}
                        {user.trend === 'down' && <ArrowDown size={16} className="text-red-500" />}
                        {user.trend === 'same' && <div className="w-4" />}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                          {user.rank === 1 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              <Medal size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#1E56CC] transition-colors cursor-pointer">{user.username}</div>
                          <div className="text-xs text-gray-500">{user.university}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900">{user.grindScore.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_COLORS[user.tier]}`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-gray-700">{user.jobsCompleted}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
