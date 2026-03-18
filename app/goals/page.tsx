"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoalCard } from "@/components/GoalCard";
import { Goal, getGoals, createGoal, GOAL_EMOJIS } from "@/lib/goals";
import { getPrefs, savePrefs } from "@/lib/store";
import { useAccount } from "wagmi";

export default function GoalsPage() {
  const { address } = useAccount();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [prefs, setPrefs] = useState(getPrefs());
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  useEffect(() => {
    setGoals(getGoals());
    setPrefs(getPrefs());
  }, []);

  function handleCreate() {
    if (!name || !target) return;
    const goal = createGoal(name, parseFloat(target), emoji, prefs.selectedVaultId ?? "yoUSD", address);
    const updated = getGoals();
    setGoals(updated);
    if (updated.length === 1) {
      savePrefs({ activeGoalId: goal.id });
      setPrefs(getPrefs());
    }
    setCreating(false);
    setName("");
    setTarget("");
    setEmoji("🎯");
  }

  function setActive(id: string) {
    savePrefs({ activeGoalId: id });
    setPrefs(getPrefs());
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Goals</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-400"
        >
          + New Goal
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="mb-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5">
          <h2 className="mb-4 font-semibold text-white">New goal</h2>

          {/* Emoji picker */}
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-400">Choose an emoji</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`rounded-lg p-2 text-xl transition-all ${
                    emoji === e
                      ? "bg-indigo-500/20 ring-1 ring-indigo-500"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-sm text-gray-400">Name</label>
            <input
              type="text"
              placeholder="e.g. Emergency fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-400">
              Target (USD)
            </label>
            <input
              type="number"
              placeholder="500"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={!name || !target}
              className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:opacity-40"
            >
              Create Goal
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goal list */}
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-12 text-center">
          <p className="text-4xl">🎯</p>
          <p className="mt-3 font-semibold text-white">No goals yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create a goal to track your savings progress.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((goal) => (
            <div key={goal.id} className="group relative">
              <GoalCard goal={goal} active={prefs.activeGoalId === goal.id} />
              {prefs.activeGoalId !== goal.id && (
                <button
                  onClick={() => setActive(goal.id)}
                  className="absolute right-4 top-4 hidden rounded-lg bg-white/10 px-2 py-1 text-xs text-gray-400 transition hover:bg-white/20 group-hover:block"
                >
                  Set active
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {goals.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href="/save"
            className="inline-block rounded-2xl bg-indigo-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
          >
            ⚡ Make a deposit
          </Link>
        </div>
      )}
    </div>
  );
}
