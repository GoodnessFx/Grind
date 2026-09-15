import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Checkout = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Secure Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <Card>
              <Card.Header>
                <h2 className="font-semibold flex items-center gap-2"><CheckCircle2 className="text-[var(--color-success)]" size={20}/> 1. Delivery Details</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Method:</span>
                    <span className="font-medium">Online (Zoom)</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">Saturday 2:00 PM - 3:00 PM</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Meeting Link:</span>
                    <span className="font-medium text-[var(--color-primary)]">Will be sent in chat</span>
                  </div>
                </div>
                <Button variant="tertiary" className="mt-4 -ml-4">Edit Details</Button>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h2 className="font-semibold flex items-center gap-2"><div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">2</div> Payment Method</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-[var(--color-primary)] bg-blue-50 rounded-lg cursor-pointer">
                    <input type="radio" name="payment" className="mr-3 text-[var(--color-primary)]" defaultChecked />
                    <span className="font-medium">Paystack</span>
                  </label>
                  <label className="flex items-center p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="mr-3" />
                    <span className="font-medium">Flutterwave</span>
                  </label>
                  <label className="flex items-center p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="mr-3" />
                    <span className="font-medium">Bank Transfer (3-5 days)</span>
                  </label>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="w-full lg:w-80">
            <div className="sticky top-24">
              <Card>
                <Card.Header>
                  <h3 className="font-bold text-lg">Order Summary</h3>
                </Card.Header>
                <Card.Body className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-[var(--color-text-primary)] mb-1">JAMB Math Tutoring</h4>
                    <p className="text-xs text-gray-500">By David O.</p>
                  </div>
                  
                  <div className="border-t border-b border-[var(--color-border)] py-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>₦5,000 × 1 hour</span>
                      <span>₦5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform fee</span>
                      <span>₦1,000</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦6,000</span>
                  </div>

                  <Button size="lg" className="w-full mt-4">Pay Now (₦6,000)</Button>
                  
                  <div className="text-center">
                    <Button variant="tertiary" className="text-sm text-gray-500">Cancel</Button>
                  </div>
                </Card.Body>
              </Card>
              <p className="text-xs text-center text-gray-400 mt-4 px-4">
                By clicking "Pay Now", you agree to our Terms of Service and Escrow Agreement.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
