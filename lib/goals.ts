export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  createdAt: number;
  vaultId: string;
  ownerAddress?: string; // wallet that created this goal — enables friend contributions
}

const STORAGE_KEY = "roundyo_goals";

export function getGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGoals(goals: Goal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function createGoal(
  name: string,
  targetAmount: number,
  emoji: string,
  vaultId: string,
  ownerAddress?: string
): Goal {
  const goal: Goal = {
    id: crypto.randomUUID(),
    name,
    targetAmount,
    currentAmount: 0,
    emoji,
    createdAt: Date.now(),
    vaultId,
    ownerAddress,
  };
  const goals = getGoals();
  goals.push(goal);
  saveGoals(goals);
  return goal;
}

export function updateGoal(id: string, updates: Partial<Pick<Goal, "name" | "emoji" | "targetAmount">>): Goal | null {
  const goals = getGoals();
  const idx = goals.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  Object.assign(goals[idx], updates);
  saveGoals(goals);
  return goals[idx];
}

export function updateGoalProgress(id: string, amount: number): void {
  const goals = getGoals();
  const idx = goals.findIndex((g) => g.id === id);
  if (idx === -1) return;
  goals[idx].currentAmount = parseFloat(
    (goals[idx].currentAmount + amount).toFixed(6)
  );
  saveGoals(goals);
}

export function deleteGoal(id: string): void {
  const goals = getGoals().filter((g) => g.id !== id);
  saveGoals(goals);
}

export function getGoalProgress(goal: Goal): number {
  if (goal.targetAmount === 0) return 0;
  return Math.min(
    100,
    parseFloat(((goal.currentAmount / goal.targetAmount) * 100).toFixed(1))
  );
}

/** Backfill ownerAddress on goals that were created before this field existed. */
export function migrateGoalsOwner(address: string): void {
  const goals = getGoals();
  let changed = false;
  for (const g of goals) {
    if (!g.ownerAddress) {
      g.ownerAddress = address;
      changed = true;
    }
  }
  if (changed) saveGoals(goals);
}

export const GOAL_EMOJIS = ["🏠", "✈️", "🎓", "🚗", "💍", "🌴", "💻", "🎯", "🛟", "🐣"];
