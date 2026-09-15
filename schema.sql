-- Grind Platform Database Schema

-- Enums
CREATE TYPE user_role AS ENUM ('individual', 'seller', 'company', 'admin');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'bronze', 'silver', 'gold', 'platinum');
CREATE TYPE order_status AS ENUM ('pending', 'escrow', 'completed', 'disputed', 'cancelled');
CREATE TYPE listing_category AS ENUM ('jobs', 'products', 'services', 'rentals', 'events', 'other');

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  role user_role DEFAULT 'individual',
  grind_score INTEGER DEFAULT 0 CHECK (grind_score >= 0 AND grind_score <= 100),
  verified_badge verification_status DEFAULT 'unverified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sellers / Companies Details
CREATE TABLE seller_details (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  business_name TEXT,
  business_type TEXT,
  cac_number TEXT,
  bank_account_info JSONB,
  kyc_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings Table
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category listing_category NOT NULL,
  location TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders / Transactions
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) UNIQUE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  order_id UUID REFERENCES orders(id), -- Optional, if tied to a transaction
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Row Level Security) - Basic Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active listings and profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Active listings are viewable by everyone." ON listings FOR SELECT USING (is_active = true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
