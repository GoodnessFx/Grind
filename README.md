# Grind — The Trustless Campus Gig Economy

Grind is a decentralized task marketplace for Nigerian university students. Post tasks, earn money, and build a verifiable on-chain reputation. Every payment is protected by a smart contract — no WhatsApp drama, no scams, no middleman running with your money.

Built on **Base**. Powered by **cNGN**. Designed for students who grind.

---

## What Grind Does

A student needs their Business Law essay written. They post it for ₦3,500. Another student (the "Doer") accepts, does the work, and submits it. The ₦3,500 was locked in a smart contract the moment it was posted — not in someone's bank account, not with Grind, but in a secure contract.

The poster approves the work, and the contract releases the money. If the poster ghosts, the contract releases it automatically after 48 hours. If there's a dispute, five Diamond-tier community members vote and the contract executes the result.

**No human at Grind can touch that ₦3,500. That is the entire product.**

On top of that: every completed task, every on-time payment, and every clean dispute record gets minted as a **GrindScore** delta on-chain. Permanently. When that student graduates and wants to prove they completed 40 gigs without a single dispute, they generate a verifiable credential from their **OuiDID** and send a link. The employer clicks it and sees cryptographic proof. No fake CV. No forged transcript.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        STUDENT'S PHONE                          │
│   React 18 + TypeScript + Vite + Tailwind + shadcn/ui           │
│   Zustand (state) · Framer Motion (animations) · Sonner (toast) │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────────┐
│                        BACKEND (Node.js + Express)              │
│                                                                 │
│  Routes          Webhooks        Services                       │
│  /tasks          /paystack       blockchain.js  (ethers v6)     │
│  /credentials    /auth           paystack.js    (DVA + payout)  │
│  /wallet                         did.js         (credential)    │
│  /admin                          ipfs.js        (Pinata)        │
│                                  email.js       (Resend)        │
│                                  admin.js       (dashboard)     │
│                                                                 │
│  Middleware: HMAC-SHA512 webhook verify · JWT auth · rate limit │
│  DB: PostgreSQL (Supabase) · Redis (idempotency + sessions)     │
└──────┬───────────────────────────────────────┬──────────────────┘
       │                                       │
┌──────▼──────┐                    ┌───────────▼──────────────────┐
│   PAYSTACK  │                    │     BASE BLOCKCHAIN (L2)      │
│             │                    │                               │
│ DVA API     │                    │  OuiScore.sol                 │
│ Card inline │                    │  OuiDID.sol                   │
│ Transfers   │                    │  OuiEscrow.sol                │
│ Webhook     │                    │                               │
│ Payouts     │                    │  cNGN token (ERC-20)          │
└─────────────┘                    │  Biconomy Paymaster (gas)     │
                                   │  Privy (smart wallets)        │
                                   └──────────────────────────────┘
```

The student never sees the blockchain layer. They pay in Naira, receive Naira. The contracts run underneath.

---

## Smart Contracts

Three core contracts deployed on the Base network. Each depends on the previous to ensure a closed-loop trust system.

```text
OuiScore.sol  ──▶  OuiDID.sol(ouiScoreAddress)  ──▶  OuiEscrow.sol(cNGN, ouiScore, ouiDID, treasury)
                                                           │
                                          ouiScore.authorizeContract(ouiEscrowAddress)
```

### OuiScore.sol

Permanent on-chain reputation. A score from 0 to 1000. Written only by authorized contracts (like the Escrow). Read by anyone. No admin can modify a student's score. No student can inflate their own.

**Score formula — integer math only, multiply before divide:**

- `completionRate = completionScore * 100 / completionTotal` (Weight: 300)
- `paymentRate = paymentScore * 100 / paymentTotal` (Weight: 250)
- `avgRating = ratingTotal * 20 / ratingCount` (Weight: 200 — 1-5 stars × 20 = 20-100)
- `disputePenalty = (total - lost) * 100 / disputesTotal` (Weight: 150 — clean = 100)
- `referralScore = min(referrals, 50) * 2` (Weight: 100 — capped at 50 refs)

`totalScore = (cR*300 + pR*250 + aR*200 + dP*150 + rS*100) / 1000`

**Tiers:**

| Tier    | Score   | What it unlocks                                          |
|---------|---------|----------------------------------------------------------|
| STARTER | 0–399   | Browse tasks, post tasks (no escrow gating)              |
| BRONZE  | 400–599 | Accept escrow tasks up to ₦50,000                        |
| GOLD    | 600–799 | Priority placement, BNPL access, tasks up to ₦200,000    |
| DIAMOND | 800–1000| Employer visibility, dispute arbitration, zero fees      |

---

### OuiDID.sol

W3C-inspired Decentralised Identifier. Every student gets a unique ID: `did:oui:<bytes32Id>`.

Two identity layers:
- **On-chain:** wallet address + GrindScore + tier. Permanent. Unfakeable.
- **Off-chain:** real name, school, skills. Stored on IPFS (encrypted). Student-controlled.

**Privacy levels:**

| Level       | What shows on credential          | Can arbitrate disputes? |
|-------------|-----------------------------------|-------------------------|
| ANONYMOUS   | 0x address + score only           | No                      |
| PSEUDONYMOUS| Handle + school dept + score      | Yes                     |
| PUBLIC      | Real name + school + score + skills| Yes                    |

---

### OuiEscrow.sol

The heart of the product. Trustless escrow holding cNGN for task gigs. No backend or owner function can unilaterally release funds. Only the state machine logic moves money.

**Constants:**

- `PLATFORM_FEE_BPS = 800` (8% — goes to treasury)
- `ESCROW_FEE_BPS = 150` (1.5% — operational cost)
- `AUTO_RELEASE_WINDOW = 48 hours` (poster silence = auto-release)
- `DISPUTE_FEE = 500e18` (500 cNGN — "skin in the game")
- `ADMIN_DELAY = 96 hours` (admin cannot act before this)

**State Machine:**

```text
OPEN ──▶ LOCKED ──▶ SUBMITTED ──▶ APPROVED
                               ──▶ DISPUTED ──▶ RESOLVED
                                              ──▶ ADMIN_RESOLVED
          └──────────────────────────────────▶ REFUNDED
```

---

## Security Hardening

We have implemented rigorous security measures to protect student funds and data:

1.  **Reentrancy Protection**: Every fund-moving function uses `ReentrancyGuard` and follows the **Checks-Effects-Interactions (CEI)** pattern.
2.  **SafeERC20**: All token operations use OpenZeppelin's `SafeERC20` to handle non-standard ERC-20 behaviors.
3.  **Fee-on-Transfer Guard**: Balance checks before and after transfers prevent accounting errors from deflationary tokens.
4.  **Admin Delay**: A 96-hour delay is enforced for any admin resolution, giving students time to respond to potential disputes.
5.  **Gas Optimization**: Nested mappings and O(1) operations ensure the contract remains efficient even as the user base grows.
6.  **No Upgradeability**: To ensure maximum transparency, contracts are not upgradeable. Every logic change requires a new deployment and user migration.

---

## Payment System

Grind supports two primary payment rails for Nigerian students:

-   **Card Deposit (Instant)**: Integrated via Paystack. Funds are instantly converted to cNGN and locked in the escrow contract.
-   **Bank Transfer (USSD/Mobile App)**: Students can transfer Naira to a Dedicated Virtual Account (DVA). Paystack webhooks trigger the on-chain minting of cNGN.

---

## Tech Stack

-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
-   **Smart Contracts**: Solidity 0.8.24, OpenZeppelin v5.
-   **Network**: Base (L2).
-   **Backend**: Node.js, Express, PostgreSQL (Supabase), Redis.

---

Built with security and campus life in mind. **Grind on.**
