# Grind — Feature Map

Every screen, its route, its API endpoint, and its build status.

## Auth

| Screen | Route | API | Status |
|---|---|---|---|
| Login (welcome, email, phone, OTP) | /login | Supabase Auth | BUILT |
| Sign up | /signup | Supabase Auth + POST /users | BUILT |
| OAuth callback | /auth/callback | Supabase session exchange | BUILT |
| Forgot password | /login (step) | Supabase resetPasswordForEmail | BUILT |
| Reset password | /auth/reset-password | Supabase updateUser | BUILT |
| Logout | Any | supabase.auth.signOut | BUILT |

## Onboarding

| Screen | Route | API | Status |
|---|---|---|---|
| Role selection | /onboarding (step 1) | PUT /users/:id | BUILT |
| Profile setup + handle check | /onboarding (step 2) | GET /api/check-handle, PUT /users/:id | BUILT |
| Skills picker | /onboarding (step 3) | PUT /users/:id | BUILT |
| Student verification | /onboarding (step 4) | Supabase Storage upload | BUILT |
| Wallet explainer | /onboarding (step 5) | — | BUILT |
| Bank details + Paystack resolve | /onboarding (step 6) | POST /api/wallet/resolve-account | BUILT |
| Notification preferences | /onboarding (step 7) | PUT /users/:id | BUILT |
| First action | /onboarding (step 8) | PUT /users/:id (complete) | BUILT |

## Home

| Feature | Notes | Status |
|---|---|---|
| Balance card (real) | GET /api/wallet | BUILT |
| Notifications panel (real) | GET /api/notifications | BUILT |
| Smart Pick banner | GET /api/gigs?featured=true | BUILT |
| Streak display | From user.streak_count | BUILT |
| Sapa Meter | user.weekly_earn_target | BUILT (UI only, target set in profile) |
| Seller of the week | GET /api/leaderboard?limit=1 | BUILT |
| Quick actions | Navigate to gigs, wallet, live, referral | BUILT |

## Gigs

| Screen | Route | API | Status |
|---|---|---|---|
| Gig board (paginated, filtered, sorted) | /gigs | GET /api/gigs | BUILT |
| Gig detail | /gigs/:id | GET /api/gigs/:id | BUILT |
| Apply with pitch | /gigs/:id | POST /api/gigs/:id/apply | BUILT |
| My applications | /profile/applications | GET /api/applications (via profile) | PARTIAL |
| Post gig (3-step wizard) | /post-gig | POST /api/gigs | BUILT |
| Edit gig | /gigs/:id/edit | PUT /api/gigs/:id | BUILT |
| Cancel gig | — | PUT /api/gigs/:id (status=cancelled) | BUILT |
| View applicants | /gigs/:id/applicants | GET /api/gigs/:id/applications | BUILT |
| Accept applicant | — | POST /api/gigs/:id/accept/:userId | BUILT |
| Mark as done (doer) | — | POST /api/gigs/:id/submit | BUILT |
| Approve and release (poster) | — | POST /api/gigs/:id/approve | BUILT |
| Auto-release after 48h | Cron job | Postgres function auto_release_escrow | BUILT |
| Dispute | — | POST /api/gigs/:id/dispute | BUILT |
| Rate and review | /gigs/:id/review | POST /api/reviews | PARTIAL |
| Urgent Now tag | Gig card | is_urgent field | BUILT |
| Scam filter | Server-side on POST | hasScamContent() | BUILT |

## Requests Board

| Screen | Route | API | Status |
|---|---|---|---|
| Browse requests | /requests | GET /api/requests | BUILT |
| Post request | /requests/new | POST /api/requests | BUILT |
| Make offer | /requests/:id | POST /api/requests/:id/offer | BUILT |
| Accept offer, convert to gig | — | POST /api/requests/:id/accept/:userId | BUILT |

## Chat

| Feature | Route | API | Status |
|---|---|---|---|
| Gig chat (real-time) | /gigs/:id (panel) | Socket.io + GET /api/chat/:convId | BUILT |
| Direct message | /campus | Socket.io + GET /api/chat/:convId | BUILT |
| Unread count | Bell icon | GET /api/chat/unread/count | BUILT |
| Typing indicator | Chat panel | Socket.io typing event | BUILT |
| Mark read | On open | POST /api/chat/:convId/read | BUILT |
| Report user from chat | Report button | POST /api/reports | BUILT |

## Wallet

| Screen | Route | API | Status |
|---|---|---|---|
| Balance + transactions | /wallet | GET /api/wallet | BUILT |
| Fund via card (Paystack Popup) | /wallet | POST /api/wallet/initialize-payment | BUILT |
| Fund via bank transfer (virtual account) | /wallet | POST /api/wallet/initialize-payment (transfer) | BUILT |
| Withdraw to bank | /wallet | POST /api/wallet/withdraw | BUILT |
| Withdrawal status tracking | /wallet/withdrawals | GET /api/wallet/withdrawals | BUILT |
| Send by handle | /wallet | POST /api/wallet/transfer | BUILT |
| Bank account resolve | Onboarding + settings | POST /api/wallet/resolve-account | BUILT |
| Download statement | /wallet | GET /api/wallet (all txns) | PARTIAL — CSV not yet |
| Leaderboard | /wallet (tab) | GET /api/leaderboard | BUILT |

## Live

| Screen | Route | API | Status |
|---|---|---|---|
| Browse streams | /live | GET /api/streams | BUILT |
| Watch stream + chat + gifts | /live (panel) | Socket.io stream room + POST /api/gifts | BUILT |
| Go live (LiveKit) | /live | POST /api/streams | BUILT |
| Scheduled streams | /live | GET /api/streams?scheduled=true | PARTIAL |
| Gift with wallet debit | — | POST /api/gifts | BUILT |

## Profile

| Screen | Route | API | Status |
|---|---|---|---|
| Own profile | /profile | GET /api/users/me | BUILT |
| Public profile | /u/:handle | GET /api/users/:handle (public) | PARTIAL |
| Edit profile | /profile/edit | PUT /api/users/:id | BUILT |
| Work history | /profile | GET /api/gigs/my/active | BUILT |
| Share card | /profile | GET /api/share-card/:userId | BUILT |
| Verified badge | Profile card | user.verified_badge | BUILT (admin-set) |

## Leaderboard

| Screen | Route | API | Status |
|---|---|---|---|
| Campus weekly | /leaderboard | GET /api/leaderboard?campus=X | BUILT |
| Hostel vs hostel | /leaderboard (tab) | GET /api/leaderboard?type=hostel | BUILT |
| Global all-time | /leaderboard (tab) | GET /api/leaderboard/global | BUILT |

## Settings

| Feature | Status |
|---|---|
| Language toggle Pidgin/English | BUILT |
| Notification toggles (per type) | BUILT |
| Change password | BUILT |
| Bank details (add/edit) | BUILT |
| Security (2FA toggle placeholder) | BUILT |
| Delete account | PARTIAL — sends to support |
| Feedback form | BUILT |
| Terms / Privacy links | BUILT |

## Notifications

| Type | Trigger | Status |
|---|---|---|
| Money landed | Paystack webhook + escrow release | BUILT |
| New application | POST /api/gigs/:id/apply | BUILT |
| Application accepted | POST /api/gigs/:id/accept | BUILT |
| Gig submitted | POST /api/gigs/:id/submit | BUILT |
| Gig approved | POST /api/gigs/:id/approve | BUILT |
| New chat message | Socket.io receiver offline | BUILT |
| New offer on request | POST /api/requests/:id/offer | BUILT |
| Withdrawal paid/failed | Paystack webhook | BUILT |
| Daily spin win | POST /api/spin | BUILT |

## Daily Spin

| Screen | Route | API | Status |
|---|---|---|---|
| Spin status | /home (widget) | GET /api/spin/status | BUILT |
| Execute spin | /home (widget) | POST /api/spin | BUILT |

## Share Card

| Feature | Route | API | Status |
|---|---|---|---|
| SVG share card | /profile | GET /api/share-card/:userId | BUILT |

## Admin

| Feature | Route | Status |
|---|---|---|
| Hidden entry (6-tap dot) | /xk9-admin-console-7f3a | BUILT |
| User list and search | Admin console | BUILT |
| Verification queue | Admin console | BUILT |
| Support chat inbox | Admin console | BUILT |
| Audit log | Admin console | BUILT |
| Withdrawal kill switch | TODO | NOT YET |
| Report queue | TODO | NOT YET |
| Dispute resolution UI | TODO | NOT YET |

## Still TODO

These features are in the spec but not yet built:

| Feature | Notes |
|---|---|
| Public profile /u/:handle with OG meta tags | Route added to App.tsx, page not yet written |
| Seller of the week homepage widget | API query exists, UI not yet placed |
| Report queue in admin | Schema exists, admin UI not wired |
| Dispute resolution admin UI | Schema + API exist |
| CSV/PDF statement download | Transactions API works, file gen not done |
| Real PDF statement | Needs pdfkit or puppeteer on server |
| Push notifications (Web Push / OneSignal) | Need provider setup |
| 8am gig alert cron | Needs BullMQ + push provider |
| Level-up confetti animation | UI hook exists, canvas confetti not yet added |
| Real review and rating UI | DB and API exist, form not on TaskDetail yet |
| Company profile and bulk gigs | Schema exists, no UI |
| Brand deals and QR code | Schema exists, no UI |
| Playwright end-to-end tests | Not yet written |
