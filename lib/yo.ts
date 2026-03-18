/**
 * YO SDK integration helpers.
 * Most vault interactions use @yo-protocol/react hooks directly in components.
 * This file centralises constants and utility wrappers.
 */

export const YO_API_BASE = "https://api.yo.xyz";

export interface VaultSnapshot {
  address: string;
  name: string;
  apy: number;
  tvl: number;
  asset: string;
}

/**
 * Fetch vault snapshot from YO REST API (no wallet needed).
 */
export async function fetchVaultSnapshot(
  network: "base" | "ethereum" | "arbitrum",
  vaultAddress: string
): Promise<VaultSnapshot | null> {
  try {
    const res = await fetch(
      `${YO_API_BASE}/api/v1/vault/${network}/${vaultAddress}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data as VaultSnapshot;
  } catch {
    return null;
  }
}

/**
 * Fetch APY timeseries for sparklines.
 */
export async function fetchApyTimeseries(
  network: "base" | "ethereum" | "arbitrum",
  vaultAddress: string
): Promise<{ timestamp: number; apy: number }[]> {
  try {
    const res = await fetch(
      `${YO_API_BASE}/api/v1/vault/yield/timeseries/${network}/${vaultAddress}`
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Fetch user transaction history.
 */
export async function fetchUserHistory(
  network: "base" | "ethereum" | "arbitrum",
  vaultAddress: string,
  userAddress: string
): Promise<VaultHistoryItem[]> {
  try {
    const res = await fetch(
      `${YO_API_BASE}/api/v1/history/user/${network}/${vaultAddress}/${userAddress}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    // API returns { items: [...] } or a plain array
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch {
    return [];
  }
}

export interface VaultHistoryItem {
  type: string;
  assets: string;
  shares: string;
  blockTimestamp: number;
  transactionHash: string;
}
