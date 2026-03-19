export type RoundUpRule = number;

/**
 * Calculate round-up amount from a purchase.
 * e.g. $3.60 rounded to nearest $1 → save $0.40
 *      $3.60 rounded to nearest $5 → save $1.40
 */
export function calculateRoundUp(
  amount: number,
  rule: RoundUpRule,
  multiplier: number = 1
): number {
  if (amount <= 0 || rule <= 0) return 0;
  const remainder = amount % rule;
  if (remainder === 0) return 0;
  const base = parseFloat((rule - remainder).toFixed(2));
  return parseFloat((base * multiplier).toFixed(2));
}

/**
 * Given a round-up amount, return the total that would be saved
 * after N transactions.
 */
export function projectSavings(
  avgRoundUp: number,
  transactionsPerMonth: number,
  months: number
): number {
  return parseFloat((avgRoundUp * transactionsPerMonth * months).toFixed(2));
}

export const ROUND_UP_PRESETS: { label: string; value: number }[] = [
  { label: "$1", value: 1 },
  { label: "$2", value: 2 },
  { label: "$5", value: 5 },
  { label: "$10", value: 10 },
  { label: "$20", value: 20 },
  { label: "$50", value: 50 },
];

export const MULTIPLIER_OPTIONS: { label: string; value: number }[] = [
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
  { label: "5×", value: 5 },
];

// Keep backwards compat
export const ROUND_UP_RULES = ROUND_UP_PRESETS.slice(0, 3).map((p) => ({
  label: `Nearest $${p.value}`,
  value: p.value,
}));
