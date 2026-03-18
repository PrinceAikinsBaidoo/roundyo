"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDeposit, usePreviewDeposit } from "@yo-protocol/react";
import { TransactionStatus } from "@/components/TransactionStatus";
import { RiskNotice } from "@/components/RiskNotice";
import { VaultInfoCard } from "@/components/VaultInfoCard";
import { VAULTS, VaultId, getAssetAddress, isVaultOnChain, CHAIN_NAMES, SupportedChainId } from "@/lib/config";
import { ROUND_UP_RULES, RoundUpRule, calculateRoundUp } from "@/lib/roundUp";
import { getPrefs, savePrefs } from "@/lib/store";
import { getGoals, updateGoalProgress, Goal } from "@/lib/goals";
import { formatTokenAmount, toTokenUnits } from "@/lib/format";
import { useDemo } from "@/context/DemoContext";
import { useMockDeposit } from "@/hooks/useMockDeposit";

export default function SavePage() {
  const { isConnected } = useAccount();
  const connectedChainId = useChainId();
  const { isDemo } = useDemo();
  const effectiveConnected = isDemo || isConnected;

  const [prefs] = useState(getPrefs());
  const [goals, setGoals] = useState<Goal[]>([]);

  const vaultId = (prefs.selectedVaultId as VaultId) ?? "yoUSD";
  const vault = VAULTS[vaultId];

  // Resolve the correct asset address for the connected chain
  const activeChainId = isDemo ? 8453 : connectedChainId;
  const assetAddress = getAssetAddress(vaultId, activeChainId) ?? vault.assetAddresses[8453];
  const vaultOnChain = isDemo || isVaultOnChain(vaultId, activeChainId);
  const chainName = CHAIN_NAMES[activeChainId as SupportedChainId] ?? "Unknown";

  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [rule, setRule] = useState<RoundUpRule>(prefs.roundUpRule ?? 1);
  const [customAmount, setCustomAmount] = useState("");
  const [mode, setMode] = useState<"roundup" | "custom">("roundup");
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    prefs.activeGoalId ?? ""
  );

  const roundUpAmount =
    mode === "roundup"
      ? calculateRoundUp(parseFloat(purchaseAmount || "0"), rule)
      : parseFloat(customAmount || "0");

  const depositAmount = isNaN(roundUpAmount) ? 0 : roundUpAmount;
  const depositUnits = toTokenUnits(depositAmount, vault.decimals);

  // Real hooks
  const { shares: previewShares } = usePreviewDeposit(
    vault.id,
    !isDemo && depositUnits > 0n ? depositUnits : undefined
  );

  const realDeposit = useDeposit({ vault: vault.id });
  const mockDeposit = useMockDeposit();
  const {
    deposit: _deposit,
    step,
    isLoading,
    isSuccess,
    hash,
    approveHash,
    error,
    reset,
  } = isDemo ? mockDeposit : realDeposit;

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const { addDemoDeposit } = useDemo();

  async function handleDeposit() {
    if (depositAmount <= 0) return;
    if (isDemo) {
      await mockDeposit.deposit();
    } else {
      if (!assetAddress) return;
      await realDeposit.deposit({ token: assetAddress, amount: depositUnits, chainId: activeChainId });
    }
  }

  useEffect(() => {
    if (isSuccess) {
      if (selectedGoalId) updateGoalProgress(selectedGoalId, depositAmount);
      if (isDemo) addDemoDeposit(depositAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  function handleRuleChange(r: RoundUpRule) {
    setRule(r);
    savePrefs({ roundUpRule: r });
  }

  if (!effectiveConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-4xl">⚡</p>
        <h2 className="text-xl font-bold text-white">Connect to save</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-white">Save</h1>
      <p className="mb-8 text-sm text-gray-400">
        Round up a purchase or enter a custom amount to save.
      </p>

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-xl bg-white/5 p-1">
        {(["roundup", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === m
                ? "bg-indigo-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m === "roundup" ? "Round-Up" : "Custom Amount"}
          </button>
        ))}
      </div>

      {/* Round-up mode */}
      {mode === "roundup" && (
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Purchase amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                placeholder="3.60"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-8 pr-4 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Round-up rule
            </label>
            <div className="flex gap-2">
              {ROUND_UP_RULES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleRuleChange(value)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-all ${
                    rule === value
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom amount mode */}
      {mode === "custom" && (
        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-400">
            Amount to deposit
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              placeholder="5.00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-8 pr-4 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Deposit summary */}
      {depositAmount > 0 && (
        <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Amount to deposit</p>
            <p className="text-lg font-bold text-white">
              ${depositAmount.toFixed(2)} {vault.asset}
            </p>
          </div>
          {!isDemo && previewShares !== undefined && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">You&apos;ll receive</p>
              <p className="text-xs text-gray-300">
                {formatTokenAmount(previewShares, vault.decimals)} {vault.name}
              </p>
            </div>
          )}
          {isDemo && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">You&apos;ll receive</p>
              <p className="text-xs text-gray-300">
                ~{depositAmount.toFixed(4)} {vault.name}
              </p>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">Vault</p>
            <p className="text-xs text-gray-300">
              {vault.name} · {vault.asset}
            </p>
          </div>
        </div>
      )}

      {/* Goal selection */}
      {goals.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm text-gray-400">
            Assign to a savings goal (optional)
          </label>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">No goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.emoji} {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Vault info */}
      <div className="mb-6">
        <VaultInfoCard vaultId={vaultId} selected />
      </div>

      {/* Chain badge + vault compatibility warning */}
      {!isDemo && (
        <div className="mb-4">
          {vaultOnChain ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
              Depositing {vault.asset} on <span className="text-gray-300">{chainName}</span>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              ⚠️ <strong>{vault.name}</strong> is not available on {chainName}. Switch to{" "}
              {vault.chainIds.map(id => CHAIN_NAMES[id as SupportedChainId]).join(" or ")}.
            </div>
          )}
        </div>
      )}

      {/* Transaction status */}
      <div className="mb-4">
        <TransactionStatus
          step={step}
          hash={isDemo ? undefined : hash}
          approveHash={isDemo ? undefined : approveHash}
          isSuccess={isSuccess}
          error={error ?? null}
          onReset={reset}
        />
        {isDemo && isSuccess && (
          <div className="mt-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            ✓ Demo deposit successful! In production this saves to the blockchain.
          </div>
        )}
      </div>

      {/* Deposit button */}
      <button
        onClick={handleDeposit}
        disabled={depositAmount <= 0 || isLoading || (!isDemo && !vaultOnChain)}
        className="w-full rounded-2xl bg-indigo-500 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading
          ? step === "approving"
            ? "Approving..."
            : "Confirming..."
          : depositAmount > 0
          ? `Deposit $${depositAmount.toFixed(2)} ${vault.asset}`
          : "Enter an amount"}
      </button>

      <div className="mt-6">
        <RiskNotice />
      </div>
    </div>
  );
}
