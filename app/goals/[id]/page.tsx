"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Goal, getGoals, deleteGoal, updateGoal, getGoalProgress } from "@/lib/goals";
import { formatUSD } from "@/lib/format";
import { VAULTS } from "@/lib/config";
import { ShareGoalModal } from "@/components/ShareGoalModal";

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const found = getGoals().find((g) => g.id === id) ?? null;
    setGoal(found);
  }, [id]);

  function handleDelete() {
    if (!goal) return;
    deleteGoal(goal.id);
    router.push("/goals");
  }

  function startEditing() {
    if (!goal) return;
    setEditName(goal.name);
    setEditing(true);
  }

  function saveEdit() {
    if (!goal || !editName.trim()) { setEditing(false); return; }
    const updated = updateGoal(goal.id, { name: editName.trim() });
    if (updated) setGoal(updated);
    setEditing(false);
  }

  if (!goal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div>
          <p className="text-gray-400">Goal not found.</p>
          <Link href="/goals" className="mt-4 text-sm text-indigo-400 underline">
            Back to goals
          </Link>
        </div>
      </div>
    );
  }

  const progress = getGoalProgress(goal);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const vault = VAULTS[goal.vaultId as keyof typeof VAULTS] ?? VAULTS.yoUSD;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {/* Back */}
      <Link
        href="/goals"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        ← All goals
      </Link>

      {/* Goal header */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-5xl">{goal.emoji}</span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
                className="w-full rounded-lg border border-indigo-500 bg-white/5 px-2 py-1 text-2xl font-bold text-white focus:outline-none"
              />
              <button onClick={saveEdit} className="shrink-0 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white">
                Save
              </button>
            </div>
          ) : (
            <button onClick={startEditing} className="group flex items-center gap-2 text-left">
              <h1 className="truncate text-2xl font-bold text-white">{goal.name}</h1>
              <svg className="h-4 w-4 shrink-0 text-gray-600 opacity-0 transition group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <p className="mt-0.5 text-sm text-gray-400">
            Created {new Date(goal.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Progress card */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progress</span>
          <span>{progress}%</span>
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
            <p className="text-lg font-bold text-white">
              {formatUSD(goal.currentAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-lg font-bold text-white">
              {formatUSD(goal.targetAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-lg font-bold text-indigo-300">
              {formatUSD(remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Vault */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-1 text-xs text-gray-500">Vault</p>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-white">{vault.name}</p>
          <span className="text-sm text-gray-400">{vault.asset}</span>
        </div>
        <p className="text-sm text-gray-400">{vault.description}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/save`}
          className="flex-1 rounded-2xl bg-indigo-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
        >
          ⚡ Deposit toward this goal
        </Link>
        <button
          onClick={() => setShowShare(true)}
          className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
        >
          Share
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
        >
          Delete
        </button>
      </div>

      {/* Completion message */}
      {progress >= 100 && (
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 font-semibold text-green-300">Goal reached!</p>
          <p className="mt-1 text-sm text-green-400/70">
            You can withdraw your savings from the{" "}
            <Link href="/redeem" className="underline">
              Redeem page
            </Link>
            .
          </p>
        </div>
      )}

      {showShare && (
        <ShareGoalModal goal={goal} onClose={() => setShowShare(false)} />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl border border-white/10 bg-[#111127] p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-2xl mb-3">⚠️</p>
            <h2 className="text-lg font-bold text-white mb-2">Delete this goal?</h2>

            {progress < 100 && goal.currentAmount > 0 ? (
              <p className="text-sm text-gray-400 mb-4">
                You&apos;ve saved <span className="text-white font-medium">{formatUSD(goal.currentAmount)}</span> toward this goal.
                Deleting it only removes the tracker —{" "}
                <span className="text-amber-300 font-medium">your funds remain safe in the YO vault</span>.
                You can withdraw them anytime from the{" "}
                <Link href="/redeem" className="text-indigo-400 underline">Redeem page</Link>.
              </p>
            ) : (
              <p className="text-sm text-gray-400 mb-4">
                This will permanently remove the goal tracker. This action cannot be undone.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-bold text-white transition hover:bg-red-400"
              >
                Yes, delete it
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
