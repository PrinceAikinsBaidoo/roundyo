import { VaultHistoryItem } from "./yo";
import { Goal } from "./goals";

export const DEMO_ADDRESS = "0xDe0A7F3b8c2E1d9F4a6B5c8E3F2a1D9b4C7e6f5" as const;

export const DEMO_VAULT_SHARES = 47_230_000n; // $47.23 in 6-decimal USDC

export const DEMO_GOAL: Goal = {
  id: "demo-goal-1",
  name: "Emergency Fund",
  targetAmount: 500,
  currentAmount: 47.23,
  emoji: "🛟",
  createdAt: Date.now() - 7 * 86400_000,
  vaultId: "yoUSD",
};

export const DEMO_HISTORY: VaultHistoryItem[] = [
  { type: "deposit", assets: "12000000", shares: "11980000", blockTimestamp: Math.floor(Date.now() / 1000) - 86400,  transactionHash: "0xabc1" },
  { type: "deposit", assets: "3400000",  shares: "3395000",  blockTimestamp: Math.floor(Date.now() / 1000) - 172800, transactionHash: "0xabc2" },
  { type: "deposit", assets: "7800000",  shares: "7790000",  blockTimestamp: Math.floor(Date.now() / 1000) - 259200, transactionHash: "0xabc3" },
  { type: "deposit", assets: "9500000",  shares: "9488000",  blockTimestamp: Math.floor(Date.now() / 1000) - 345600, transactionHash: "0xabc4" },
  { type: "deposit", assets: "14530000", shares: "14510000", blockTimestamp: Math.floor(Date.now() / 1000) - 432000, transactionHash: "0xabc5" },
];
