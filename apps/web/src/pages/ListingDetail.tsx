import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Star, Share2, Heart, Flag } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

export const ListingDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Carousel Mock */}
        <div className="w-full h-64 md:h-96 bg-gray-300 rounded-xl mb-8 overflow-hidden relative">
          <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80" alt="Listing hero" className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">JAMB Mathematics Tuition</h1>
                <p className="text-2xl font-bold text-[var(--color-primary)]">₦5,000<span className="text-sm text-gray-500 font-normal">/hour</span></p>
              </div>
              <div className="flex gap-2 text-gray-500">
                <button className="p-2 hover:bg-gray-100 rounded-full"><Share2 size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full"><Heart size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full"><Flag size={20} /></button>
              </div>
            </div>

            <div className="prose max-w-none text-[var(--color-text-secondary)] mb-8">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Description</h3>
              <p>Expert JAMB prep tutor with 5 years experience. I have helped over 50 students score above 280 in their JAMB examinations. My teaching methodology focuses on understanding core principles rather than cramming formulas.</p>
              <p>What you get:</p>
              <ul>
                <li>Past questions review</li>
                <li>Tricks for fast calculation</li>
                <li>Topic by topic breakdown</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[var(--color-border)] mb-8">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Category:</span> Tutoring</div>
                <div><span className="text-gray-500">Duration:</span> Hourly</div>
                <div><span className="text-gray-500">Availability:</span> ASAP</div>
                <div><span className="text-gray-500">Location:</span> Remote (Zoom)</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Reviews <span className="flex items-center text-yellow-500 text-sm"><Star size={16} className="fill-current"/> 4.8 (23)</span>
              </h3>
              
              <div className="space-y-4">
                <Card>
                  <Card.Body>
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      <Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/>
                    </div>
                    <p className="font-semibold text-sm">Amazing tutor!</p>
                    <p className="text-sm text-gray-600 my-2">Very patient, explains well. I finally understand Integration.</p>
                    <p className="text-xs text-gray-400">By: John D. - 5 days ago</p>
                  </Card.Body>
                </Card>
              </div>
              <Button variant="tertiary" className="mt-4">Load More Reviews</Button>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="w-full lg:w-[350px]">
            <div className="sticky top-24 space-y-6">
              
              <Card>
                <Card.Body>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" alt="Seller" />
                    </div>
                    <div>
                      <h3 className="font-bold">David O.</h3>
                      <div className="text-sm text-gray-500">Grind Score: 78</div>
                      <Badge variant="gold" size="sm" className="mt-1">Gold Seller ✓</Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Button variant="primary" className="flex-1">Contact</Button>
                    <Button variant="secondary" className="flex-1">Save</Button>
                  </div>
                  
                  <div className="border-t border-[var(--color-border)] pt-4 mt-4">
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="flex justify-between text-sm mb-1">
                      <span>₦5,000 � 1 hour</span>
                      <span>₦5,000</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span>Platform fee</span>
                      <span>₦1,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-[var(--color-border)] pt-2 mb-4">
                      <span>Total</span>
                      <span>₦6,000</span>
                    </div>
                    
                    <Link to="/checkout" className="block w-full">
                      <Button size="lg" className="w-full">Schedule & Pay</Button>
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
