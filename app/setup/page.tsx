"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { VaultInfoCard } from "@/components/VaultInfoCard";
import { VAULTS, VaultId } from "@/lib/config";
import { ROUND_UP_RULES, RoundUpRule } from "@/lib/roundUp";
import { createGoal, GOAL_EMOJIS } from "@/lib/goals";
import { savePrefs } from "@/lib/store";

type Step = "wallet" | "vault" | "rule" | "goal" | "done";

export default function SetupPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();

  const [step, setStep] = useState<Step>("wallet");
  const [vaultId, setVaultId] = useState<VaultId>("yoUSD");
  const [rule, setRule] = useState<RoundUpRule>(1);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalEmoji, setGoalEmoji] = useState("🎯");

  const steps: Step[] = ["wallet", "vault", "rule", "goal", "done"];
  const stepIdx = steps.indexOf(step);
  const progress = Math.round((stepIdx / (steps.length - 1)) * 100);

  function handleNext() {
    if (step === "wallet" && isConnected) setStep("vault");
    else if (step === "vault") setStep("rule");
    else if (step === "rule") setStep("goal");
    else if (step === "goal") {
      // Save prefs and create goal
      savePrefs({ selectedVaultId: vaultId, roundUpRule: rule, onboardingComplete: true });
      if (goalName && goalTarget) {
        const goal = createGoal(goalName, parseFloat(goalTarget), goalEmoji, vaultId, address);
        savePrefs({ activeGoalId: goal.id });
      }
      setStep("done");
    } else if (step === "done") {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] px-4 py-12">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Set up RoundYO</h1>
          <p className="mt-1 text-sm text-gray-400">Step {stepIdx + 1} of {steps.length}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          {step === "wallet" && (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <p className="text-4xl">👋</p>
              <h2 className="text-xl font-bold text-white">Connect your wallet</h2>
              <p className="text-sm text-gray-400">
                You stay in complete control. Your funds are always yours.
              </p>
              <ConnectButton />
              {isConnected && (
                <p className="text-sm text-green-400">✓ Wallet connected</p>
              )}
            </div>
          )}

          {step === "vault" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white">Choose a savings account</h2>
              <p className="text-sm text-gray-400">
                Your savings will earn interest in this account.
              </p>
              <div className="flex flex-col gap-3">
                {(Object.keys(VAULTS) as VaultId[]).map((id) => (
                  <VaultInfoCard
                    key={id}
                    vaultId={id}
                    selected={vaultId === id}
                    onSelect={() => setVaultId(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === "rule" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white">Set your round-up rule</h2>
              <p className="text-sm text-gray-400">
                Every time you save, we round your amount up to the nearest:
              </p>
              <div className="flex flex-col gap-3">
                {ROUND_UP_RULES.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setRule(value)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      rule === value
                        ? "border-indigo-500 bg-indigo-500/10 text-white"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm opacity-60">
                      e.g. $3.60 purchase → save $
                      {value === 1 ? "0.40" : value === 5 ? "1.40" : "6.40"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "goal" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white">Create your first goal</h2>
              <p className="text-sm text-gray-400">
                What are you saving for? (Optional — skip if you like)
              </p>

              {/* Emoji picker */}
              <div>
                <p className="mb-2 text-sm text-gray-400">Choose an emoji</p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setGoalEmoji(e)}
                      className={`rounded-lg p-2 text-xl transition-all ${
                        goalEmoji === e
                          ? "bg-indigo-500/20 ring-1 ring-indigo-500"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Goal name</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency fund"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Target amount (USD)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-5xl">🎉</p>
              <h2 className="text-xl font-bold text-white">You&apos;re all set!</h2>
              <p className="text-sm text-gray-400">
                Your account is configured. Head to your dashboard to start saving.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {stepIdx > 0 && step !== "done" ? (
            <button
              onClick={() => setStep(steps[stepIdx - 1])}
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={step === "wallet" && !isConnected}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === "done" ? "Go to Dashboard →" : step === "goal" ? "Finish Setup" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
