export function formatUSD(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatTxHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export function explorerTxUrl(hash: string, chainId?: number): string {
  const base = chainId === 1
    ? "https://etherscan.io/tx/"
    : chainId === 42161
    ? "https://arbiscan.io/tx/"
    : "https://basescan.org/tx/";
  return `${base}${hash}`;
}

export function formatTokenAmount(
  raw: bigint | string | number,
  decimals: number,
  digits = 4
): string {
  const n =
    typeof raw === "bigint"
      ? Number(raw) / 10 ** decimals
      : Number(raw) / 10 ** decimals;
  if (isNaN(n)) return "0";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function toTokenUnits(amount: number, decimals: number): bigint {
  return BigInt(Math.round(amount * 10 ** decimals));
}
