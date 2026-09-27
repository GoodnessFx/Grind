import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';

const CONTENT: Record<string, { title: string; updated: string; body: string[] }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    updated: 'Last updated September 2026',
    body: [
      'Grind collects only the information needed to run the campus marketplace safely: your name, email, university, listings you post, and escrow transaction records.',
      'We never sell your data. Your information is used to verify student status, process escrow payments, and keep the community safe.',
      'You can request a copy or deletion of your personal data at any time by reaching out to support from the Help Center.',
      'We use cookies to keep you signed in and to remember your preferences. You can reopen cookie choices at any time from the Cookie Preferences link in the footer.',
    ],
  },
  'terms-of-service': {
    title: 'Terms of Service',
    updated: 'Last updated September 2026',
    body: [
      'By using Grind you agree to deal honestly, deliver what you promise, and pay for what you order.',
      'All payments flow through Grind escrow. Funds are released to the seller only when the buyer confirms the work or product.',
      'Listings must be legal and campus appropriate. Prohibited items include drugs, weapons, exam impersonation, and stolen goods.',
      'We may remove accounts that scam, harass, or repeatedly break delivery promises.',
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    updated: 'Last updated September 2026',
    body: [
      'Grind uses essential cookies to keep you signed in and remember your cart.',
      'We also use preference cookies, like the theme and your cookie choice itself.',
      'No advertising trackers are set by Grind. You can clear stored choices from the Cookie Preferences link in the footer at any time.',
    ],
  },
  'escrow-agreement': {
    title: 'Escrow Agreement',
    updated: 'Last updated September 2026',
    body: [
      'When a buyer pays on Grind, the money is locked in escrow, not given to the seller.',
      'The seller is notified and delivers the product or service.',
      'The buyer confirms, or the countdown expires without a dispute, and the escrow releases automatically.',
      'If there is a dispute, Grind support reviews the chat and delivery evidence before deciding.',
    ],
  },
  'safety-center': {
    title: 'Safety Center',
    updated: 'Always apply',
    body: [
      'Meet in public places on campus for physical handovers, and never pay outside Grind escrow.',
      'Verify the seller badge, Grind Score and reviews before you order.',
      'Never share OTPs, bank passwords or your school portal login with anyone.',
      'Report suspicious accounts from any listing, and our team will review within 24 hours.',
    ],
  },
  'selling-on-grind': {
    title: 'Selling on Grind',
    updated: 'Seller guide',
    body: [
      'Create a free account, verify your student status, and post your first listing in minutes.',
      'Great photos, honest delivery times and fast replies are what move sellers to the top rated list.',
      'You get paid automatically when the buyer confirms, or when the countdown expires with no dispute.',
      'Withdraw to your bank anytime. Payouts are processed in business hours.',
    ],
  },
  'buyer-protection': {
    title: 'Buyer Protection',
    updated: 'Every order covered',
    body: [
      'Every naira you pay on Grind sits in escrow until you confirm the delivery.',
      'If the seller does not deliver, you can open a dispute from your profile and get a refund.',
      'Sellers with repeated disputes lose their verified badge and can be removed.',
      'For help at any point, open Campus Support from the icon at the bottom of every page.',
    ],
  },
};

export const Legal = () => {
  const { slug } = useParams();
  const page = CONTENT[slug ?? ''] ?? CONTENT['privacy-policy'];

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--grind-nigeria)] font-medium mb-6">
          <ArrowLeft size={16} /> Back home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight font-display mb-2">{page.title}</h1>
        <p className="text-sm text-gray-400 mb-8">{page.updated}</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-4 shadow-sm">
          {page.body.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed text-sm sm:text-base">{p}</p>
          ))}
        </div>
      </main>
    </div>
  );
};
