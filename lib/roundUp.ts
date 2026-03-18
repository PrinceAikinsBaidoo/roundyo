export type RoundUpRule = 1 | 5 | 10;

/**
 * Calculate round-up amount from a purchase.
 * e.g. $3.60 rounded to nearest $1 → save $0.40
 */
export function calculateRoundUp(amount: number, rule: RoundUpRule): number {
  if (amount <= 0) return 0;
  const remainder = amount % rule;
  if (remainder === 0) return 0;
  return parseFloat((rule - remainder).toFixed(2));
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

export const ROUND_UP_RULES: { label: string; value: RoundUpRule }[] = [
  { label: "Nearest $1", value: 1 },
  { label: "Nearest $5", value: 5 },
  { label: "Nearest $10", value: 10 },
];
