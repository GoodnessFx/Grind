import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Profile = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden shrink-0">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="Profile" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">David O.</h1>
                <p className="text-[var(--color-text-secondary)]">@david_tutor</p>
                <p className="mt-2 text-sm max-w-lg">University student, passionate about teaching Mathematics and Physics. Helping JAMBites crush their goals since 2021.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Edit Profile</Button>
                <Button variant="secondary">Share</Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 items-center">
              <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-[var(--color-border)]">
                <span className="text-xs text-gray-500 block">Grind Score</span>
                <span className="font-bold text-lg">78<span className="text-xs text-gray-400 font-normal">/100</span></span>
              </div>
              <Badge variant="gold">Gold Badge ✓</Badge>
              <span className="text-xs text-gray-400">Joined 6 months ago</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--color-border)] mb-6 overflow-x-auto">
          <nav className="flex gap-6 min-w-max">
            {['Profile', 'My Listings (3)', 'Transactions', 'Reviews', 'Earnings'].map((tab, i) => (
              <button 
                key={tab} 
                className={`pb-3 font-medium text-sm transition-colors ${i === 1 ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">My Listings</h3>
              <Button variant="tertiary" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-3 border border-[var(--color-border)] rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded object-cover overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&q=80`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Listing Title {i}</h4>
                    <p className="text-[var(--color-primary)] font-medium text-sm mt-1">₦5,000</p>
                    <Badge variant="success" size="sm" className="mt-1">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Recent Transactions</h3>
              <Button variant="tertiary" size="sm">History</Button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-sm">JAMB Tutoring</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[var(--color-success)]">+₦6,000</p>
                  <span className="text-xs text-[var(--color-success)]">✓ Completed</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                <div>
                  <p className="font-medium text-sm">Graphics Design</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[var(--color-success)]">+₦15,000</p>
                  <span className="text-xs text-[var(--color-success)]">✓ Completed</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium text-sm">Laptop Repair</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-yellow-600">₦20,000</p>
                  <span className="text-xs text-yellow-600">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
