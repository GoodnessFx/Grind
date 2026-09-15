import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Button } from '../components/common/Button';
import { ListingCard } from '../components/marketplace/ListingCard';
import { Filter, ChevronDown } from 'lucide-react';

const mockListings = Array(12).fill(null).map((_, i) => ({
  id: `list-${i}`,
  title: `Professional Service ${i + 1} - High Quality Guaranteed`,
  price: `₦${(Math.random() * 50 + 5).toFixed(0)},000`,
  sellerName: `Seller ${i + 1}`,
  sellerBadge: ['gold', 'silver', 'bronze', 'platinum'][Math.floor(Math.random() * 4)] as any,
  rating: 4 + Math.random(),
  reviewCount: Math.floor(Math.random() * 200),
  imageUrl: `https://images.unsplash.com/photo-155${i}15522-835626a574f1?w=800&q=80`
}));

export const Marketplace = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden">
          <Button 
            variant="secondary" 
            className="w-full flex justify-between items-center bg-white"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <span className="flex items-center gap-2"><Filter size={18}/> Filters</span>
            <ChevronDown size={18} className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`md:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-5 rounded-lg border border-[var(--color-border)] shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
              Filters
              <button className="text-sm font-normal text-[var(--color-primary)] hover:underline">Clear all</button>
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm text-gray-700 uppercase tracking-wider">Category</h4>
                <div className="space-y-2">
                  {['All Categories', 'Tutoring', 'Design & Creative', 'Programming', 'Writing', 'Digital Marketing'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="category" className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]" defaultChecked={cat === 'All Categories'} />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm text-gray-700 uppercase tracking-wider">Price Range (₦)</h4>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                  <span className="text-gray-500">-</span>
                  <input type="number" placeholder="Max" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm text-gray-700 uppercase tracking-wider">Seller Level</h4>
                <div className="space-y-2">
                  {['Platinum', 'Gold', 'Silver', 'Bronze'].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Explore Marketplace</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <select className="border border-gray-300 rounded-md py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                <option>Relevance</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map(listing => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white">Load More Results</Button>
          </div>
        </main>

      </div>
    </div>
  );
};
