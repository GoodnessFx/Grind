import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingCart, X, Star, Users } from 'lucide-react';
import { Navbar } from '../common/Navbar';
import { Button } from '../common/Button';
import { ListingCard } from './ListingCard';
import { PeopleCard } from './PeopleCard';
import { useCart } from '../../context/CartContext';
import { getListings, searchAll, LISTINGS, naira } from '../../data/listings';

interface Props {
  /** 'product' = Marketplace, 'service' = Services, 'all' = search results */
  defaultType: 'product' | 'service' | 'all';
  title: string;
  subtitle: string;
}

const SORTS = ['Relevance', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Highest Rated'];

export const ListingBrowser: React.FC<Props> = ({ defaultType, title, subtitle }) => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const searchingEarly = Boolean(q.trim());
  const cat = params.get('cat') ?? 'All Categories';
  const sort = params.get('sort') ?? 'Relevance';
  const typeParam = (params.get('type') as 'product' | 'service' | 'all' | null) ?? (searchingEarly ? 'all' : defaultType);

  const [searchInput, setSearchInput] = useState(q);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { items, addToCart, cartTotal, cartCount } = useCart();

  useEffect(() => setSearchInput(q), [q]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'All Categories' || value === 'Relevance') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (searchInput.trim()) next.set('q', searchInput.trim());
    else next.delete('q');
    setParams(next);
  };

  const searching = Boolean(q.trim());
  const { listings: searched, people } = searching ? searchAll(q) : { listings: LISTINGS, people: [] };

  let results = searching
    ? getListings({ sort, q })
    : getListings({ type: typeParam === 'all' ? undefined : typeParam, category: cat, sort });

  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || Infinity;
  results = results.filter(l => l.price >= min && l.price <= max);

  const categories = ['All Categories', ...Array.from(new Set(
    (searching ? searched : LISTINGS.filter(l => typeParam === 'all' || l.type === typeParam)).map(l => l.category)
  ))];

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--grind-primary)] tracking-tight font-display">{title}</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{subtitle}</p>

          {/* Search bar */}
          <form onSubmit={submitSearch} className="mt-5 flex bg-gray-50 border border-gray-200 rounded-full p-1.5 max-w-2xl focus-within:border-[var(--grind-nigeria)] transition-colors">
            <div className="flex-1 flex items-center px-4 min-w-0">
              <Search className="text-gray-400 mr-2 shrink-0" size={18} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search services, products or people..."
                className="w-full bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder:text-gray-400 min-w-0"
              />
            </div>
            {searching && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setParams(new URLSearchParams()); }}
                className="px-2 text-gray-400 hover:text-black"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="bg-black hover:bg-[var(--grind-nigeria)] text-white font-bold px-5 sm:px-7 py-2.5 rounded-full text-sm transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Type tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {([
              { key: 'product', label: 'Products', to: '/marketplace' },
              { key: 'service', label: 'Services', to: '/services' },
            ]).map(tab => {
              const active = !searching && typeParam === tab.key;
              return (
                <Link
                  key={tab.key}
                  to={searching ? `${tab.to}?q=${encodeURIComponent(q)}` : tab.to}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                    active ? 'bg-[var(--grind-nigeria)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            {searching && (
              <span className="px-4 py-2 rounded-full text-sm font-bold bg-black text-white whitespace-nowrap">
                All results
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-4 sm:right-6 z-40 w-14 h-14 bg-[var(--grind-nigeria)] hover:bg-[#004d00] text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
        aria-label="Open cart"
      >
        <ShoppingCart size={22} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full relative z-10 flex flex-col shadow-2xl">
            <div className="p-4 bg-black text-white flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><ShoppingCart size={20} /> Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:text-gray-300" aria-label="Close cart"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 font-medium">Your cart is empty.</div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h4 className="font-bold text-sm text-black">{item.title}</h4>
                    <p className="text-xs text-gray-500">by {item.sellerName}</p>
                    <p className="text-sm font-bold text-[var(--grind-nigeria)] mt-1">{naira(item.price)}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex justify-between font-bold mb-4">
                <span>Total</span>
                <span>{naira(cartTotal)}</span>
              </div>
              <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                <Button className="w-full bg-black hover:bg-[var(--grind-nigeria)] text-white">Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside className="lg:w-72 shrink-0">
          <button
            onClick={() => setIsFilterOpen(o => !o)}
            className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-full py-3 font-bold text-sm mb-4"
          >
            <SlidersHorizontal size={16} /> {isFilterOpen ? 'Hide filters' : 'Show filters'}
          </button>

          <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block bg-white rounded-2xl border border-gray-100 p-5 space-y-6 shadow-sm`}>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-[var(--grind-primary)] uppercase tracking-wider">Category</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={cat === c}
                      onChange={() => setParam('cat', c === 'All Categories' ? null : c)}
                      className="text-[var(--grind-nigeria)] focus:ring-[var(--grind-nigeria)]"
                    />
                    <span className="text-sm text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm text-[var(--grind-primary)] uppercase tracking-wider">Price Range (₦)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[var(--grind-nigeria)]"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[var(--grind-nigeria)]"
                />
              </div>
            </div>

            <Button
              className="w-full bg-black hover:bg-[var(--grind-nigeria)] text-white"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-black">
              {searching ? `Results for "${q}"` : title}
              <span className="text-gray-400 font-medium text-sm ml-2">({results.length})</span>
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                className="border border-gray-300 rounded-md py-1.5 px-2 bg-white outline-none focus:border-[var(--grind-nigeria)] text-sm"
              >
                {SORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* People results (connect with students) */}
          {searching && people.length > 0 && (
            <section className="mb-8">
              <h3 className="flex items-center gap-2 font-bold text-[var(--grind-primary)] mb-4">
                <Users size={17} className="text-[var(--grind-nigeria)]" /> People to connect with
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {people.map(p => <PeopleCard key={p.id} person={p} />)}
              </div>
            </section>
          )}

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
              <Star className="mx-auto text-gray-300 mb-3" size={36} />
              <h3 className="font-bold text-lg text-black mb-1">Nothing matched that search</h3>
              <p className="text-gray-500 text-sm">Try a different keyword, clear filters, or browse all categories.</p>
              <button
                onClick={() => { setParams(new URLSearchParams()); setMinPrice(''); setMaxPrice(''); setSearchInput(''); }}
                className="mt-4 bg-black hover:bg-[var(--grind-nigeria)] text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors"
              >
                Clear everything
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {results.map(listing => (
                <div key={listing.id} className="relative group">
                  <ListingCard
                    id={listing.id}
                    title={listing.title}
                    price={naira(listing.price)}
                    sellerName={listing.sellerName}
                    sellerBadge={listing.sellerBadge}
                    rating={listing.rating}
                    reviewCount={listing.reviewCount}
                    imageUrl={listing.imageUrl}
                  />
                  <button
                    onClick={() => {
                      addToCart({ id: listing.id, title: listing.title, price: listing.price, sellerName: listing.sellerName });
                      setIsCartOpen(true);
                    }}
                    className="absolute bottom-4 right-4 bg-[var(--grind-nigeria)] hover:bg-[#004d00] text-white p-2.5 rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    aria-label={`Add ${listing.title} to cart`}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};


