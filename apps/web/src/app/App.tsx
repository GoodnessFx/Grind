import React, { useState } from 'react';
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
import { SupportChat } from '../components/common/SupportChat';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "24300395823-trbfqd7mjiho0tgl9jpaek4qtemuf5cd.apps.googleusercontent.com";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SupportChat />
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
