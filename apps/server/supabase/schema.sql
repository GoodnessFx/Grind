-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  school_email TEXT UNIQUE,
  school_email_verified BOOLEAN DEFAULT FALSE,
  wallet_balance BIGINT DEFAULT 0, -- Stored in smallest unit (kobo/cents)
  grind_score INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks (Gigs)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id UUID REFERENCES users(id),
  doer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward BIGINT NOT NULL,
  status TEXT DEFAULT 'open', -- open, accepted, submitted, disputed, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (Ledger)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount BIGINT NOT NULL, -- positive for credit, negative for debit
  reference TEXT UNIQUE NOT NULL, -- Paystack reference or internal event ID
  type TEXT NOT NULL, -- fund, withdrawal, escrow_lock, escrow_release, gift
  status TEXT DEFAULT 'pending', -- pending, success, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streams (Phase 5 - Lock In)
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcaster_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  livekit_room_name TEXT UNIQUE NOT NULL,
  is_live BOOLEAN DEFAULT TRUE,
  viewer_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Chat Messages (Streams & Tasks)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  stream_id UUID REFERENCES streams(id),
  task_id UUID REFERENCES tasks(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B2B Social Dashboard: Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B2B Social Accounts
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  platform TEXT NOT NULL, -- twitter, linkedin, facebook
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B2B Social Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  content TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft', -- draft, scheduled, published, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
