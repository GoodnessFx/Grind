import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Button } from '../components/common/Button';
import { ListingCard } from '../components/marketplace/ListingCard';
import { Filter, ChevronDown, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const mockListings = Array(12).fill(null).map((_, i) => ({
  id: `list-${i}`,
  title: i % 2 === 0 ? `Premium Logo Design` : `Web Development (React/Node)`,
  price: (Math.floor(Math.random() * 50) + 5) * 1000,
  sellerName: `Seller ${i + 1}`,
  sellerBadge: ['gold', 'silver', 'bronze', 'platinum'][Math.floor(Math.random() * 4)] as any,
  rating: 4 + Math.random(),
  reviewCount: Math.floor(Math.random() * 200),
  imageUrl: `https://images.unsplash.com/photo-155${i}15522-835626a574f1?w=800&q=80`
}));

export const Marketplace = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, addToCart, removeFromCart, cartTotal, cartCount } = useCart();

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />
      
      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
      >
        <ShoppingCart size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#041e42] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full relative z-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 bg-[#041e42] text-white flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><ShoppingCart size={20} /> Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:text-gray-300"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 font-medium">Your cart is empty.</div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="font-bold text-sm text-[#041e42]">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.sellerName} (Qty: {item.quantity})</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2563eb]">₦{item.price.toLocaleString()}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between font-bold text-lg text-[#041e42] mb-4">
                <span>Total:</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <Link to="/checkout" className="block w-full text-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50">
                Proceed to Secure Escrow
              </Link>
            </div>
          </div>
        </div>
      )}
      
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
              <button className="text-sm font-normal text-[#2563eb] hover:underline">Clear all</button>
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm text-[#041e42] uppercase tracking-wider">Category</h4>
                <div className="space-y-2">
                  {['All Categories', 'Tutoring', 'Design & Creative', 'Programming', 'Writing', 'Digital Marketing'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="category" className="text-[#2563eb] focus:ring-[#2563eb]" defaultChecked={cat === 'All Categories'} />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm text-[#041e42] uppercase tracking-wider">Price Range (₦)</h4>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#2563eb]" />
                  <span className="text-gray-500">-</span>
                  <input type="number" placeholder="Max" className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#2563eb]" />
                </div>
              </div>

              <Button className="w-full bg-[#041e42] hover:bg-[#03142d] text-white">Apply Filters</Button>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#041e42]">Explore Marketplace</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <select className="border border-gray-300 rounded-md py-1 px-2 bg-white outline-none focus:border-[#2563eb]">
                <option>Relevance</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map(listing => (
              <div key={listing.id} className="relative group">
                <ListingCard 
                  id={listing.id}
                  title={listing.title}
                  price={`₦${listing.price.toLocaleString()}`}
                  sellerName={listing.sellerName}
                  sellerBadge={listing.sellerBadge}
                  rating={listing.rating}
                  reviewCount={listing.reviewCount}
                  imageUrl={listing.imageUrl}
                />
                <button 
                  onClick={() => {
                    addToCart({
                      id: listing.id,
                      title: listing.title,
                      price: listing.price,
                      sellerName: listing.sellerName
                    });
                    setIsCartOpen(true);
                  }}
                  className="absolute bottom-4 right-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white border border-gray-300 text-[#041e42] hover:bg-gray-50">
              Load More Results
            </Button>
          </div>
        </main>

      </div>
    </div>
  );
};
