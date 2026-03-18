# RoundYO — Turn spare change into real savings

> **Live demo:** https://roundyo.vercel.app

RoundYO is a micro-savings app built on [YO Protocol](https://yo.xyz). Every time you make a purchase, it rounds up the amount to the nearest $1, $5, or $10 and saves the difference — your money earns interest automatically while you spend.

---

## What it does

| Feature | Detail |
|---|---|
| **Round-up savings** | Enter a purchase amount → RoundYO calculates the round-up → one-click deposit |
| **Multiple accounts** | yoUSD (USDC), yoETH (WETH), yoBTC (cbBTC), yoEUR (EURC) |
| **Goal tracking** | Create savings goals (emergency fund, travel, etc.) and watch deposits fill your progress bar |
| **Social goals** | Share a goal link — friends can chip in with any asset they have |
| **Withdraw anytime** | Get your money back instantly or within 24 hours |
| **Live rates** | Real-time annual returns and total deposits from YO Protocol |
| **Multi-chain** | Base, Ethereum, Arbitrum — we handle the rest |
| **Try Demo** | Full walletless demo mode — no funds needed, explore every flow |

---

## YO Protocol integration

RoundYO uses the YO SDK for all savings interactions:

```
@yo-protocol/core   — vault addresses, chain constants
@yo-protocol/react  — useDeposit, useRedeem, usePreviewDeposit,
                       usePreviewRedeem, useUserPosition, useVaults
```

Key integration points:
- `useDeposit()` — approve + deposit with `chainId` routing, step-by-step UI feedback
- `useRedeem()` — withdraw savings with instant/queued detection
- `useVaults()` — live rates and total deposits for all accounts
- `useUserPosition()` — user's current balance per account
- `getAssetAddress()` — resolve correct asset address per connected chain at runtime
- `fetchUserHistory()` — per-user deposit/withdrawal history via YO REST API
- **ERC-4626 `deposit(amount, receiver)`** — enables friend contributions to goal owner's account

**Chains:** Base · Ethereum · Arbitrum

All transactions go directly to YO Protocol contracts — no custody, no proxy.

---

## Tech stack

- **Next.js 15** (App Router, Turbopack)
- **wagmi v2** + **RainbowKit** — wallet connection
- **YO Protocol SDK** (`@yo-protocol/core`, `@yo-protocol/react`)
- **TanStack Query** — data fetching / caching
- **Tailwind CSS** — styling
- **Vercel** — deployment

---

## Quick start

```bash
git clone <repo>
cd roundyo
npm install --legacy-peer-deps

cp .env.example .env.local
# Add your WalletConnect project ID (free at cloud.walletconnect.com)
# NEXT_PUBLIC_WC_PROJECT_ID=your_id_here

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Try the demo

No wallet or funds needed:

1. Click **"Try Demo"** on the homepage
2. Explore the dashboard — $47.23 balance, active goal, deposit history, live rates
3. Go to **Save** → enter a purchase amount → click Deposit → watch the flow
4. Go to **Withdraw** → pick a percentage → simulate withdrawal
5. Click **"DEMO · Exit"** in the navbar to return

---

## Project structure

```
app/
  page.tsx          — Landing page + Try Demo CTA
  setup/            — 5-step onboarding wizard
  dashboard/        — Balance, active goal, rates, activity
  save/             — Round-up calculator + deposit flow
  redeem/           — Withdrawal page
  goals/            — Goal creation, tracking, sharing
  goals/shared/     — Public shared goal page + contribute

lib/
  config.ts         — Wagmi config, account registry, per-chain asset addresses
  yo.ts             — YO REST API wrappers
  goals.ts          — Goal CRUD + migration (localStorage)
  store.ts          — User preferences (localStorage)
  demo.ts           — Demo mode mock data

components/
  ContributeSection — Multi-asset contribution with chain switching
  ShareGoalModal    — Share via X, Telegram, WhatsApp, Warpcast + copy link
  VaultInfoCard     — Live rates, total deposits, risk badge
  SavingsSummary    — User balance + annual return strip
  TransactionStatus — Step-by-step progress with block explorer links
  NetworkGuard      — Auto-prompt to switch to supported chain
  GoalCard          — Goal progress bar card
```

---

## Built at the YO Hackathon · March 2026
