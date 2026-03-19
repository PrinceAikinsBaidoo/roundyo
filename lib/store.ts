/**
 * Simple localStorage-backed store for user preferences.
 */

export interface UserPrefs {
  selectedVaultId: string;
  roundUpRule: number;
  activeGoalId: string | null;
  onboardingComplete: boolean;
}

const PREFS_KEY = "roundyo_prefs";

const DEFAULTS: UserPrefs = {
  selectedVaultId: "yoUSD",
  roundUpRule: 1,
  activeGoalId: null,
  onboardingComplete: false,
};

export function getPrefs(): UserPrefs {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePrefs(prefs: Partial<UserPrefs>): void {
  if (typeof window === "undefined") return;
  const current = getPrefs();
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
}
