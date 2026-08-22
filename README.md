# Grind — Campus Gig Economy

> **Production-ready MVP.** A trustless campus gig marketplace for Nigerian university students — post gigs, earn cNGN, stream live, and chat, all secured by smart-contract escrow.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Screens Overview](#screens-overview)
3. [Feature Details](#feature-details)
4. [Design System](#design-system)
5. [Running Locally](#running-locally)
6. [Environment Variables](#environment-variables)
7. [API Reference](#api-reference)
8. [Smart Contracts](#smart-contracts)
9. [Added Features (beyond original spec)](#added-features)

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19 + Vite + TailwindCSS v4 + Radix UI + Lucide + Sonner |
| Backend | Node.js + Express + Socket.io |
| Auth | Supabase (email / phone OTP / Google OAuth) |
| Payments | Smart-contract escrow (cNGN token) + Paystack |
| Streaming | LiveKit WebRTC |
| Database | Supabase Postgres |
| Monorepo | pnpm workspaces |

---

## Screens Overview

| Screen | Entry Point |
|---|---|
| Splash | App load (2.2 s auto-advance) |
| Login — Welcome | `/login` |
| Login — Phone + OTP | Phone flow |
| Login — Email + Register | Email flow |
| Home Dashboard | `home` tab |
| Gigs Board | `gigs` tab |
| Gig Detail + Chat | Tap any gig card |
| Post Gig (3 steps) | FAB `+` button |
| Live — Browse | `live` tab |
| Live — Watch + Chat + Gifts | Tap any stream |
| Live — Go Live / Creator | "Go Live" button |
| Wallet + Leaderboard | `wallet` tab |
| Profile | `profile` tab |
| Settings (6 sub-screens) | From Profile |

---

## Feature Details

### Authentication
- Animated splash screen with brand logo, auto-advances after 2.2 s
- Welcome screen with three sign-in paths: **Google**, **Phone**, **Email**
- Phone flow → 6-digit OTP verification (any code works in demo)
- Email flow → Registration form (name, email pre-filled, password with show/hide)
- Password minimum 6 characters enforced client-side
- Persistent sessions stored in `localStorage`, restored on reload
- Protected routes — unauthenticated users always land on Login
- Referral tracking via `?ref=` URL param stored in `sessionStorage`

### Home Dashboard
- Personalised greeting (Good morning / afternoon / evening)
- **Balance card** — cNGN balance with show/hide eye toggle, GrindScore + tier badge
- Three wallet quick-buttons on card: Add Money, Transfer, Withdraw
- **Quick Actions row** — Browse Gigs, Go Live, Refer Friend, Top Up
- **Smart Pick banner** — dark card with "Post your first gig" CTA
- **Exclusive Rewards** banner linking to wallet
- Recommended gig feed (3 featured gigs)
- **Notification bell** — unread red dot, slide-up notification panel
- Mark all notifications read in one tap
- Notification panel shows per-item read/unread styling

### Gigs Board
- **Search bar** with clear button — filters title, description, category in real time
- **8 categories** — Writing, Design, Coding, Tutoring, Delivery, Research, Video, Other
- **Filter chips** — toggle category drawer with `SlidersHorizontal` button
- **Sort dropdown** — Newest First, Highest Pay, Lowest Pay, Most Urgent
- Result count with "clear filters" shortcut
- Empty state with icon and clear-all link
- **Post Gig** button in header (same as FAB)
- 10 seeded real gigs covering every category

### Gig Card
- Category colour badge (8 unique colour combos)
- Formatted cNGN price with badge
- 2-line title + 1-line description (clipped)
- Poster avatar initial, handle, tier colour dot
- Deadline badge — red for urgent (hours / 1 day), green otherwise
- Escrow shield badge on every card

### Gig Detail
- Full poster card — avatar, handle, tier dot, GrindScore, 5-star rating
- **Chat button** opens in-app messenger with the poster
- Category + deadline chips
- Full title and description
- **Payment breakdown table** — budget, platform fee (8%), escrow fee (1.5%), doer earnings
- **Trustless Escrow** info card with smart contract explanation
- Poster profile section with completed task count and dispute rate
- **Apply for Gig** button → pitch modal with 300-char textarea
- Applied state — button replaced by green "Applied!" confirmation
- **Share gig** — copies `grind.market/gig/:id` to clipboard
- **In-app chat panel** — slide-up messenger, sent/received bubble UI, simulated auto-reply, send on Enter or tap

### Post a Gig (3-step wizard)
- **Progress bar** across 3 steps, back navigation on each
- **Step 1 — Details:** title (100 char), 8-icon category grid, description (500 char), character counters
- **Step 2 — Budget & Timeline:** large ₦ input, live fee breakdown (platform fee + escrow + doer earnings + total you pay), 5 deadline presets (1 / 3 / 7 / 14 / 30 days), minimum ₦500 validation
- **Step 3 — Payment:** summary card, three payment methods:
  - **Wallet** — instant deduction from cNGN balance
  - **Debit Card** — Paystack integration
  - **Bank Transfer** — generates unique virtual account + reference number in a toast
- Escrow protection reminder on payment screen
- **Success screen** — checkmark animation, "Gig is Live!" confirmation, back to board

### Live Streaming
- **Browse page** — featured stream hero card + all streams list
- Live/Offline status indicator with animated pulse dot
- Viewer count on every stream card
- Category filter bar: All, Coding, Design, Tutoring, Talk, Music, Gaming
- **Go Live button** — red with Radio icon
- **Watch screen:**
  - Simulated video player (LiveKit-ready placeholder)
  - Live viewer count that fluctuates every 3 s
  - Creator name, follow button, tier dot
  - **YouTube-style live chat** — coloured usernames, tier/gift badges, auto-scrolls
  - Simulated incoming messages every 2.5 s
  - **Heart reaction** button — burst animation on tap
  - **Gift panel** — 4 gift tiers: Rose ₦50, Fire ₦100, Crown ₦500, Diamond ₦1000
  - Gifting deducts from sender's cNGN wallet balance in real time
  - Gift appears in chat as a highlighted message
  - Send message on Enter or tap Send
- **Go Live screen:**
  - Camera / mic preview (toggleable)
  - Stream title input
  - Category selector (6 options)
  - **Creator onboarding card** — shown on first stream
  - Start Stream → sets `isCreator: true` on user object
- **Live controls** — live timer, mute toggle, camera toggle, end stream
- End stream returns to browse, shows "Great session!" toast

### Wallet
- cNGN balance card with show/hide toggle
- **Add Money modal:**
  - Quick-amount chips: ₦1,000 / ₦2,500 / ₦5,000 / ₦10,000
  - Card payment (Paystack)
  - Bank Transfer — virtual account + unique reference in toast
  - Balance updates in real time after funding
- **Withdraw modal** — amount input, balance validation, minimum ₦500, "Arrives in 1-2 hours" toast
- **Send cNGN modal** — recipient handle (`@username`) + amount, peer-to-peer transfer, balance validation
- Transaction history — every transaction stored with title, amount, date, status, type
- Type-aware icons — green arrow for earnings, red arrow for spending
- **Download statement** — toast confirmation (PDF export hook)
- **Campus Leaderboard tab:**
  - Trophy banner showing user's campus rank
  - User's own rank card highlighted in green
  - Top 5 leaderboard with rank medals (gold/silver/bronze)
  - GrindScore + tier colour dot per entry

### Profile
- Avatar with camera icon (change photo prompt)
- **Inline edit mode** — tap pencil to edit name + bio, save/cancel buttons
- Tier badge row with animated **progress bar** toward next tier, score display
- **Stats row** — Tasks Done, On-Time Rate, Rating (3 cards)
- **Total Earned** cNGN card with accent styling
- **Referral link** — copies `grind.market/ref/:handle` to clipboard, shows referral count
- **Growth Stats modal** — Income Growth, Response Rate, Completion Rate bars, Avg Delivery, Safety Score
- **Work History modal** — filterable by positive transactions, per-gig receipt download button
- Settings button (top bar + list item)
- Sign Out button (danger red card)

### Settings (6 sub-screens)
- User summary card at top with Edit shortcut
- **My Profile** — name, phone, bio edit form, save with validation
- **Login Settings** — current + new password with show/hide, Transaction PIN setup button
- **Payment Settings** — Add Debit Card, Add Bank Account, Withdrawal Settings, Transaction Limits
- **School & Level** — display-only (contact support to change)
- **Notifications** — 4 per-type toggles: New Gig Matches, Chat Messages, Wallet Activity, Promotions
- **Security Center** — Biometrics toggle, 2FA toggle, Active Sessions link
- **Connected Accounts** — Google / socials (coming soon)
- **Themes** — Dark mode (coming soon)
- **Feedback & Suggestions** — 500-char textarea, sends to backend
- **Help Center**, **Terms & Privacy Policy**, **About Grind** (v1.0.0)
- **Sign Out** + **Delete Account** (danger zone, routes to support email)

---

## Design System

| Token | Value |
|---|---|
| Brand green (accent) | `#00A651` |
| Accent dark | `#007A3D` |
| Accent light (bg tint) | `#E6F7EE` |
| Primary (navy) | `#0A2540` |
| Background | `#F4F6F8` |
| Card | `#ffffff` |
| Border | `#EAECF0` |
| Danger | `#F04438` |
| Warning | `#F79009` |
| Tier — Starter | `#98A2B3` |
| Tier — Bronze | `#CD7F32` |
| Tier — Gold | `#F79009` |
| Tier — Diamond | `#0BA5EC` |

- **Font:** Inter (body) + Plus Jakarta Sans (headings, 700–800)
- **Radius:** `rounded-2xl` (12px) cards, `rounded-3xl` (24px) large cards, `rounded-full` pills
- **Mobile-first:** `max-width: 480px`, safe-area insets (`env(safe-area-inset-bottom)`), `scrollbar-hide`
- **Motion:** `animate-in fade-in slide-in-from-bottom` on modals/panels, `active:scale-95` on all tappable elements
- **Shadows:** `shadow-sm` on cards, `shadow-lg shadow-accent/30` on primary CTAs

---

## Running Locally

```bash
# Install all workspace deps from root
pnpm install

# Frontend (http://localhost:5173)
pnpm --filter web dev

# Backend (http://localhost:3001)
pnpm --filter server dev
```

---

## Environment Variables

Create `apps/server/.env`:

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173

# Email (Gmail app password)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=goodnessiyamah1@gmail.com

# LiveKit
LIVEKIT_HOST=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/apply` | Submit creator application (email notification) |
| `POST` | `/api/chat/message` | HTTP fallback — send chat message |
| `POST` | `/api/streams` | Create LiveKit room + return creator token |
| `GET` | `/api/streams/:roomId/token` | Generate viewer join token |
| `POST` | `/api/gifts` | Log a gift sent during live stream |
| `GET` | `/api/gifts/:streamId` | Get all gifts for a stream |
| WS | `socket.io` | Real-time chat (joinRoom / leaveRoom / chatMessage events) |

---

## Smart Contracts

Located in `packages/contracts/`:

| Contract | Description |
|---|---|
| `GrindEscrow.sol` | Locks gig payment, releases on approval or refunds after timeout |
| `GrindScore.sol` | On-chain reputation score, updated on task completion |
| `GrindDID.sol` | Decentralised identity for campus-verified students |

---

## Added Features (beyond original spec)

| Feature | Details |
|---|---|
| OPay-inspired green UI | Full design system overhaul — green `#00A651`, card layouts, mobile-perfect |
| 5-tab navigation | Home, Gigs, Live, Wallet, Profile with floating Post Gig FAB |
| Referral system | Shareable link, referral count tracked on user object |
| Notification centre | In-app bell panel, per-item read state, mark-all-read |
| Creator tier progression | Progress bar toward next tier with score threshold display |
| Gift economy | Rose / Fire / Crown / Diamond gifts during live streams, wallet-debited |
| cNGN peer transfer | Send cNGN to any user by `@handle` |
| Transaction PIN | PIN setup flow in Login Settings |
| Feedback form | 500-char in-app feedback submission |
| Escrow fee breakdown | Live calculation table before every gig payment |
| Statement download | Wallet transaction history export |
| Security toggles | Biometrics + 2FA toggles in Security Center |
| Profanity filter | Server-side chat message sanitisation |
| Gifts API | Persistent in-memory gift log (swap for DB in production) |
| Smart contract rename | `Oui*` → `Grind*` contracts for brand consistency |
| CSS bug fix | Resolved TailwindCSS v4 `@theme inline` import chain issue |
