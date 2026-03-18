"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Goal, getGoalProgress } from "@/lib/goals";
import { formatUSD } from "@/lib/format";
import { VAULTS } from "@/lib/config";
import { ContributeSection } from "@/components/ContributeSection";

function SharedGoalContent() {
  const params = useSearchParams();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const raw = params.get("g");
      if (!raw) { setError(true); return; }
      const decoded = JSON.parse(decodeURIComponent(atob(raw))) as Goal;
      setGoal(decoded);
    } catch {
      setError(true);
    }
  }, [params]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div>
          <p className="text-2xl mb-3">🔗</p>
          <p className="text-white font-semibold">Invalid share link</p>
          <Link href="/" className="mt-4 inline-block text-sm text-indigo-400 underline">
            Go to RoundYO
          </Link>
        </div>
      </div>
    );
  }

  if (!goal) return null;

  const progress = getGoalProgress(goal);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const vault = VAULTS[goal.vaultId as keyof typeof VAULTS] ?? VAULTS.yoUSD;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {/* Shared badge */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5 text-sm text-indigo-300">
        <span>🔗</span>
        <span>Someone shared their savings goal with you</span>
      </div>

      {/* Goal header */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-5xl">{goal.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">{goal.name}</h1>
          <p className="text-sm text-gray-400">Saving with {vault.name} · {vault.asset}</p>
        </div>
      </div>

      {/* Progress card */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progress</span>
          <span className="font-semibold text-white">{progress}%</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-white/10">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Saved</p>
            <p className="text-lg font-bold text-white">{formatUSD(goal.currentAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-lg font-bold text-white">{formatUSD(goal.targetAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-lg font-bold text-indigo-300">{formatUSD(remaining)}</p>
          </div>
        </div>
      </div>

      {progress >= 100 && (
        <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 font-semibold text-green-300">Goal reached!</p>
        </div>
      )}

      {/* Contribute — only if goal has an owner address */}
      {goal.ownerAddress ? (
        <div className="mb-6">
          <ContributeSection
            ownerAddress={goal.ownerAddress}
            vaultId={goal.vaultId}
            goalName={goal.name}
          />
        </div>
      ) : null}

      {/* CTA */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm text-gray-400 mb-4">
          Want to set your own savings goal and earn yield on Base?
        </p>
        <Link
          href="/setup"
          className="inline-block rounded-2xl bg-indigo-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
        >
          Start saving with RoundYO
        </Link>
      </div>
    </div>
  );
}

export default function SharedGoalPage() {
  return (
    <Suspense>
      <SharedGoalContent />
    </Suspense>
  );
}
