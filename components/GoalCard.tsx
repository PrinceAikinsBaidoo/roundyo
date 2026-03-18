"use client";

import Link from "next/link";
import { Goal, getGoalProgress } from "@/lib/goals";
import { formatUSD } from "@/lib/format";

interface Props {
  goal: Goal;
  active?: boolean;
}

export function GoalCard({ goal, active }: Props) {
  const progress = getGoalProgress(goal);

  return (
    <Link
      href={`/goals/${goal.id}`}
      className={`block rounded-2xl border p-4 transition-all hover:border-white/20 ${
        active
          ? "border-indigo-500/50 bg-indigo-500/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{goal.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{goal.name}</p>
          <p className="text-sm text-gray-400">
            {formatUSD(goal.currentAmount)} / {formatUSD(goal.targetAmount)}
          </p>
        </div>
        {active && (
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            Active
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-gray-500">{progress}%</p>
      </div>
    </Link>
  );
}
