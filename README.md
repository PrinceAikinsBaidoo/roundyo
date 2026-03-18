# RoundYO — Turn spare change into onchain yield

> **Live demo:** https://roundyo.vercel.app

RoundYO is a micro-savings app built on [YO Protocol](https://yo.xyz). Every time you make a purchase, it rounds up the amount to the nearest $1, $5, or $10 and deposits the spare change directly into a live YO yield vault on Base — earning real DeFi APY while you spend.

---

## What it does

| Feature | Detail |
|---|---|
| **Round-up deposits** | Enter a purchase amount → RoundYO calculates the round-up → one-click deposit into a YO vault |
| **Multiple vaults** | yoUSD (USDC), yoETH (WETH), yoBTC (cbBTC), yoEUR (EURC) |
| **Goal tracking** | Create savings goals (emergency fund, travel, etc.) and watch deposits fill your progress bar |
| **Social goals** | Share a goal link — friends can contribute directly to your vault position |
| **Withdraw anytime** | Redeem vault shares back to the underlying asset — instantly or queued within 24h |
| **Live APY** | 30-day APY and TVL pulled live from the YO Protocol SDK |
| **Multi-chain** | Base, Ethereum, Arbitrum — correct asset address resolved per connected chain |
| **Try Demo** | Full walletless demo mode — no funds needed, judges can explore every flow |

---

## YO Protocol integration

RoundYO uses the YO SDK for all vault interactions:

```
@yo-protocol/core   — vault addresses, chain constants
@yo-protocol/react  — useDeposit, useRedeem, usePreviewDeposit,
                       usePreviewRedeem, useUserPosition, useVaults
```

Key integration points:
- `useDeposit()` — approve + deposit with `chainId` routing, step-by-step UI feedback
- `useRedeem()` — redeem shares back to assets with instant/queued detection
- `useVaults()` — live APY and TVL for all vaults
- `useUserPosition()` — user's current shares and asset value per vault
- `getVaultsForChain()` — resolve correct asset address per connected chain at runtime
- `fetchUserHistory()` — per-user deposit/redeem history via YO REST API

**Chains:** Base · Ethereum · Arbitrum

All transactions go directly to YO vault contracts — no custody, no proxy.

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
2. Explore the dashboard — $47.23 balance, active goal, 5 deposit history entries, live vault APY
3. Go to **Save** → enter a purchase amount → click Deposit → watch the transaction flow
4. Go to **Withdraw** → pick a percentage → simulate redemption
5. Click **"DEMO · Exit"** in the navbar to return to the real app

---

## Project structure

```
app/
  page.tsx          — Landing page + Try Demo CTA
  setup/            — 5-step onboarding wizard
  dashboard/        — Balance, active goal, vault stats, activity
  save/             — Round-up calculator + deposit flow
  redeem/           — Vault share redemption
  goals/            — Goal creation and tracking

lib/
  config.ts         — Wagmi config, vault registry, asset addresses
  yo.ts             — YO REST API wrappers
  goals.ts          — Goal CRUD (localStorage)
  store.ts          — User preferences (localStorage)
  demo.ts           — Demo mode mock data

components/
  VaultInfoCard     — Live APY, TVL, risk badge per vault
  SavingsSummary    — User balance, shares, APY summary strip
  TransactionStatus — Step-by-step tx progress with Basescan links
  NetworkGuard      — Auto-prompt to switch to Base
  GoalCard          — Goal progress bar card
```

---

## Built at the YO Hackathon · March 2026
