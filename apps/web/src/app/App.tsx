import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Splash } from './components/Splash';
import { Home } from '../pages/Home';
import { Marketplace } from '../pages/Marketplace';
import { ListingDetail } from '../pages/ListingDetail';
import { Checkout } from '../pages/Checkout';
import { Profile } from '../pages/Profile';
import { Admin } from '../pages/Admin';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { GrindFlex } from '../pages/GrindFlex';
import { Explorer } from '../pages/Explorer';
import { Leaderboard } from '../pages/Leaderboard';
import AdminConsole from '../pages/AdminConsole';
import { Support } from '../pages/Support';
import { ChatWidget } from '../components/common/ChatWidget';
import { CartProvider } from '../context/CartContext';
import { wakePing } from '../lib/adminApi';

export const GOOGLE_CLIENT_ID = "24300395823-trbfqd7mjiho0tgl9jpaek4qtemuf5cd.apps.googleusercontent.com";

// Lazy-load Google OAuth to prevent crashes if package resolution fails
const GoogleWrapper = React.lazy(() =>
  import('@react-oauth/google')
    .then(mod => ({
      default: ({ children }: { children: React.ReactNode }) =>
        React.createElement(mod.GoogleOAuthProvider, { clientId: GOOGLE_CLIENT_ID }, children),
    }))
    .catch(() => ({
      default: ({ children }: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children),
    }))
);

function AppRoutes() {
  return (
    <CartProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/grindflex" element={<GrindFlex />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/xk9-admin-console-7f3a" element={<AdminConsole />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Support widget backed by the shared store. Guests get a guest thread,
          signed-in students get their account thread — no login required. */}
      <ChatWidget />
    </BrowserRouter>
    </CartProvider>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Wake ping — warm the server on app mount
  React.useEffect(() => {
    wakePing();
  }, []);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Suspense fallback={<AppRoutes />}>
      <GoogleWrapper>
        <AppRoutes />
      </GoogleWrapper>
    </Suspense>
  );
}
