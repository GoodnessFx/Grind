import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Star, Share2, Heart, Flag, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { LISTINGS, PEOPLE, naira } from '../data/listings';
import { useCart } from '../context/CartContext';

export const ListingDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const listing = LISTINGS.find(l => l.id === id);
  const relatedPerson = listing
    ? PEOPLE.find(p => p.uniShort === listing.university || p.name.split(' ')[0] === listing.sellerName.split(' ')[0])
    : undefined;

  if (!listing) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-black text-black mb-3">This listing is no longer available</h1>
          <p className="text-gray-500 mb-6">It may have been removed by the seller or the admin team.</p>
          <Link to="/marketplace" className="inline-flex items-center gap-2 bg-black hover:bg-[var(--grind-nigeria)] text-white font-bold px-6 py-3 rounded-full transition-colors">
            <ArrowLeft size={18} /> Back to Marketplace
          </Link>
        </main>
      </div>
    );
  }

  const platformFee = Math.round(listing.price * 0.05);
  const total = listing.price + platformFee;

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link to={listing.type === 'service' ? '/services' : '/marketplace'} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--grind-nigeria)] font-medium mb-6">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="w-full h-56 sm:h-80 lg:h-96 bg-gray-300 rounded-xl mb-8 overflow-hidden relative">
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          <span className="absolute top-4 right-4 bg-white/95 text-black text-xs font-bold px-3 py-1.5 rounded-full">{listing.category}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2 font-display">{listing.title}</h1>
                <p className="text-2xl font-bold text-[var(--grind-nigeria)]">{naira(listing.price)}</p>
              </div>
              <div className="flex gap-2 text-gray-500 shrink-0">
                <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Share"><Share2 size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Save"><Heart size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Report"><Flag size={20} /></button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
                <Star size={16} className="fill-current" /> {listing.rating} ({listing.reviewCount} reviews)
              </span>
              <Badge variant={listing.sellerBadge} size="sm">{listing.sellerBadge.charAt(0).toUpperCase() + listing.sellerBadge.slice(1)} Seller</Badge>
              <span className="text-xs text-gray-400">{listing.university}</span>
            </div>

            <div className="text-[var(--color-text-secondary)] mb-8 space-y-3">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Description</h3>
              <p>{listing.description}</p>
              <p>What you get:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Fast response from {listing.sellerName}</li>
                <li>Escrow protected payment</li>
                <li>Free revisions until you are happy</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[var(--color-border)] mb-8">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Category:</span> {listing.category}</div>
                <div><span className="text-gray-500">Type:</span> {listing.type === 'service' ? 'Service' : 'Product'}</div>
                <div><span className="text-gray-500">Availability:</span> ASAP</div>
                <div><span className="text-gray-500">Campus:</span> {listing.university}</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Reviews <span className="flex items-center text-yellow-500 text-sm"><Star size={16} className="fill-current" /> {listing.rating} ({listing.reviewCount})</span>
              </h3>
              <Card>
                <Card.Body>
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                  <p className="font-semibold text-sm">Exactly as described!</p>
                  <p className="text-sm text-gray-600 my-2">Smooth transaction, escrow made it stress free. Highly recommended.</p>
                  <p className="text-xs text-gray-400">By: Happy Buyer · 5 days ago</p>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="sticky top-24 space-y-6">
              <Card>
                <Card.Body>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      <img src={relatedPerson?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.sellerName)}&background=006400&color=fff`} alt={listing.sellerName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold">{listing.sellerName}</h3>
                      <div className="text-sm text-gray-500">{listing.university}</div>
                      <Badge variant={listing.sellerBadge} size="sm" className="mt-1">{listing.sellerBadge.charAt(0).toUpperCase() + listing.sellerBadge.slice(1)} Seller ✓</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Link to="/campus" className="flex-1"><Button variant="primary" className="w-full">Contact</Button></Link>
                    <Button variant="secondary" className="flex-1">Save</Button>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-4 mt-4">
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{listing.type === 'service' ? 'Service' : 'Item'}</span>
                      <span>{naira(listing.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span>Platform fee</span>
                      <span>{naira(platformFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-[var(--color-border)] pt-2 mb-4">
                      <span>Total</span>
                      <span>{naira(total)}</span>
                    </div>

                    <button
                      onClick={() => addToCart({ id: listing.id, title: listing.title, price: listing.price, sellerName: listing.sellerName })}
                      className="block w-full bg-black hover:bg-[var(--grind-nigeria)] text-white font-bold py-3 rounded-full transition-colors mb-3"
                    >
                      Add to Cart
                    </button>
                    <Link to="/checkout" className="block w-full">
                      <Button size="lg" className="w-full bg-[var(--grind-nigeria)] hover:bg-[#004d00]">Buy Now with Escrow</Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

