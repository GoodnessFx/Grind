# Grind Codebase Audit

Every mock, fake, hardcoded value, setTimeout simulating a request, coming soon button, and dead UI element found in the codebase. Status shows what was done.

---

## Authentication (apps/web/src/pages/Login.tsx + Signup.tsx)

| Item | Location | Status |
|---|---|---|
| `localStorage.setItem` used as auth — no real Supabase session | Login.tsx handleLogin | FIXED — replaced with Supabase signInWithPassword |
| `localStorage.setItem` on Google OAuth — no server-side session | Login.tsx handleGoogleSuccess | FIXED — Supabase signInWithIdToken |
| Password not validated before submit | Login.tsx | FIXED — min 6 chars enforced |
| Signup step 2 fields (firstName, lastName, university, phone) collected but never saved | Signup.tsx | FIXED — saved to Supabase profiles table |
| `navigate('/profile')` after login with no session check | Login.tsx, Signup.tsx | FIXED — auth hook checks real session |

## app/components Auth (apps/web/src/app/components/Login.tsx)

| Item | Location | Status |
|---|---|---|
| `setTimeout(() => onLogin(makeUser()), 1200)` — fake Google login | Login.tsx:75 | FIXED — Supabase OAuth |
| `setTimeout(() => setStep("otp"), 800)` — fake phone submit | Login.tsx:89 | FIXED — Supabase OTP |
| `setTimeout(() => setStep("register"), 800)` — fake email submit | Login.tsx:102 | FIXED — real validation |
| `setTimeout(() => onLogin(makeUser(...)), 1000)` — any OTP code works | Login.tsx:126 | FIXED — Supabase verifyOtp |
| `setTimeout(() => onLogin(makeUser(...)), 1200)` — fake register | Login.tsx:139 | FIXED — Supabase signUp |

## Wallet (apps/web/src/app/components/Wallet.tsx)

| Item | Location | Status |
|---|---|---|
| `setTimeout(() => onUpdateUser(...), 2000)` — fake card fund | Wallet.tsx:64 | FIXED — real Paystack Popup |
| `setTimeout(() => onUpdateUser(...), 1500)` — fake transfer fund | Wallet.tsx:42 | FIXED — Paystack virtual account via API |
| `setTimeout(() => onUpdateUser(...), 2000)` — fake withdraw | Wallet.tsx:88 | FIXED — real /api/wallet/withdraw route |
| `setTimeout(() => onUpdateUser(...), 1800)` — fake send | Wallet.tsx:108 | FIXED — real /api/wallet/transfer route |
| `mockLeaderboard` hardcoded 5 users | Wallet.tsx:16 | FIXED — fetched from /api/leaderboard |
| `toast.info("Generating...")` then `setTimeout(() => toast.success("Downloaded!"), 1500)` | Wallet.tsx handleDownload | FIXED — real PDF from server |
| Account number `0123456789` hardcoded | Wallet.tsx | FIXED — Paystack DVA per user |

## PostTask (apps/web/src/app/components/PostTask.tsx)

| Item | Location | Status |
|---|---|---|
| `setTimeout(() => setDone(true), 2000)` — fake card payment | PostTask.tsx | FIXED — Paystack Popup |
| `setTimeout(() => setDone(true), 1500)` after "I've made the transfer" click | PostTask.tsx | FIXED — Paystack transfer confirmation webhook |
| Account `0123456789` hardcoded | PostTask.tsx | FIXED — Paystack DVA |

## TaskDetail (apps/web/src/app/components/TaskDetail.tsx)

| Item | Location | Status |
|---|---|---|
| `setTimeout(() => setMessages([...prev, autoReply]), 1500)` — fake auto-reply | TaskDetail.tsx:57 | FIXED — real Socket.io chat via /api/chat |
| `navigator.clipboard.writeText(...)` shows success but never confirms | TaskDetail.tsx handleShare | KEPT — clipboard API is correct, added try/catch |
| Apply pitch saved to state only, never sent to server | TaskDetail.tsx handleApply | FIXED — POST /api/gigs/:id/apply |

## Home (apps/web/src/app/components/Home.tsx)

| Item | Location | Status |
|---|---|---|
| `FEATURED_GIGS` hardcoded array of 3 gigs | Home.tsx:20 | FIXED — fetched from /api/gigs?featured=true |
| `REAL_WORLD_OPPS` hardcoded array | Home.tsx:26 | FIXED — fetched from /api/opportunities |
| `toast.info("More opportunities coming soon!")` dead button | Home.tsx:262 | FIXED — navigates to /gigs |
| Notifications only from user object in localStorage | Home.tsx | FIXED — fetched from /api/notifications |

## TaskBoard (apps/web/src/app/components/TaskBoard.tsx)

| Item | Location | Status |
|---|---|---|
| `ALL_TASKS` hardcoded array of 10 gigs | TaskBoard.tsx | FIXED — fetched from /api/gigs with pagination |

## LiveStream (apps/web/src/app/components/LiveStream.tsx)

| Item | Location | Status |
|---|---|---|
| `MOCK_STREAMS` hardcoded 5 streams | LiveStream.tsx:36 | FIXED — fetched from /api/streams |
| `SEED_CHAT` hardcoded 4 messages | LiveStream.tsx:46 | FIXED — fetched from Socket.io room |
| `setInterval` generating fake viewer count fluctuation | LiveStream.tsx:200 | FIXED — viewer count from Socket.io server |
| `setInterval` generating fake incoming chat messages every 2.5s | LiveStream.tsx:211 | FIXED — real Socket.io messages |
| `setIsStreaming(true)` + `toast.success("You're live!")` — no LiveKit call | LiveStream.tsx handleBecomeCreator | FIXED — calls /api/streams to create LiveKit room |
| `toast.success("Gift sent!")` without crediting receiver | LiveStream.tsx handleGift | FIXED — POST /api/gifts with real wallet debit |

## Settings (apps/web/src/app/components/Settings.tsx)

| Item | Location | Status |
|---|---|---|
| `toast.info("Dark mode coming soon!")` | Settings.tsx:103 | FIXED — dark mode toggle via CSS class |
| `toast.info("Sessions feature coming soon!")` | Settings.tsx:386 | FIXED — real sessions list from Supabase |
| `toast.info("Add Debit Card — coming soon!")` etc | Settings.tsx:417 | FIXED — navigates to Wallet payment settings |
| `toast.info("Connected Accounts — coming soon!")` | Settings.tsx | FIXED — Google OAuth connect flow |
| `toast.info("PIN setup coming soon!")` | Settings.tsx | FIXED — real 4-digit PIN screen |

## Campus.tsx (apps/web/src/pages/Campus.tsx)

| Item | Location | Status |
|---|---|---|
| Posts stored in `localStorage` only | Campus.tsx | FIXED — POST /api/posts, GET /api/posts |
| Chat messages stored in `localStorage` only | Campus.tsx | FIXED — real Socket.io + Supabase |
| `SEED_POSTS` and `SEED_CHATS` hardcoded | Campus.tsx | FIXED — data from API on mount |
| No pagination on posts feed | Campus.tsx | FIXED — infinite scroll, 20 per page |

## Admin.tsx (apps/web/src/pages/Admin.tsx)

| Item | Location | Status |
|---|---|---|
| Stats hardcoded: Total Users 1234, Revenue ₦450k, Disputes 12 | Admin.tsx | FIXED — fetched from /api/xk9-admin-console-7f3a/stats |
| Verification queue shows hardcoded 2 items | Admin.tsx | FIXED — real queue from Supabase |
| `setInterval` polling getAllSessions every 3s with localStorage | Admin.tsx:18 | FIXED — SSE from server |
| Approve/Reject buttons do nothing | Admin.tsx | FIXED — POST to admin API |

## Server routes

| Item | Location | Status |
|---|---|---|
| `giftLog` in-memory array — data lost on restart | gifts.ts:15 | FIXED — persisted to Supabase gifts table |
| `BLOCKED_WORDS = ['badword', 'offensive']` placeholder list | chat.ts:10 | FIXED — real keyword list + regex |
| `demo-creator-token-...` fallback when LiveKit not configured | livekit.ts:26 | KEPT as dev fallback, logged clearly |
| ADMIN_PASSWORD default hardcoded | admin.ts:8 | FIXED — must be set via env, server exits if not |
| `socket.io-client` installed on server — only `socket.io` needed | package.json | FIXED — removed client dep from server |

## Schema gaps (apps/server/supabase/schema.sql)

| Item | Status |
|---|---|
| No `messages` table with conversation threading | FIXED — added |
| No `notifications` table | FIXED — added |
| No `withdrawals` table with status tracking | FIXED — added |
| No `applications` table | FIXED — added |
| No `streaks` column on users | FIXED — added |
| No `onboarding_step` column | FIXED — added |
| No `campus`, `hostel`, `department`, `level` columns | FIXED — added |
| No `tier` column (stored only in code) | FIXED — added derived + stored |
| No `requests_board` table | FIXED — added |
| No `collabs` tables | FIXED — added schema-only |
| No `reports` table | FIXED — added |
| No `daily_spin` table | FIXED — added |
| No RLS policies defined | FIXED — added per-table |
| No indexes on gigs, messages, notifications | FIXED — added |

## Other

| Item | Location | Status |
|---|---|---|
| `wakePing()` on every app mount — hits server every page load | App.tsx | KEPT — intentional server warm ping, rate-limited |
| `STATS` on Home.tsx: ₦50k+ paid, 48+ listings, 3+ students — clearly placeholder | pages/Home.tsx | FIXED — fetched from /api/stats |
| Hero images reference `/hero/*.jpg` files that may not exist | pages/Home.tsx | NOTE — images must be added to public/hero/ manually |
| `window.open("/terms", "_blank")` and `"/privacy"` — pages may not exist | Settings.tsx | FIXED — routes added to Legal page |
