"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRedeem, usePreviewRedeem, useUserPosition } from "@yo-protocol/react";
import { TransactionStatus } from "@/components/TransactionStatus";
import { RiskNotice } from "@/components/RiskNotice";
import { VaultInfoCard } from "@/components/VaultInfoCard";
import { VAULTS, VaultId } from "@/lib/config";
import { getPrefs } from "@/lib/store";
import { formatTokenAmount, toTokenUnits } from "@/lib/format";
import { useDemo } from "@/context/DemoContext";
import { useMockRedeem } from "@/hooks/useMockDeposit";
import { DEMO_VAULT_SHARES } from "@/lib/demo";

export default function RedeemPage() {
  const { isConnected } = useAccount();
  const { isDemo } = useDemo();
  const effectiveConnected = isDemo || isConnected;

  const prefs = getPrefs();
  const vaultId = (prefs.selectedVaultId as VaultId) ?? "yoUSD";
  const vault = VAULTS[vaultId];

  const [redeemPct, setRedeemPct] = useState(25);
  const [customShares, setCustomShares] = useState("");
  const [mode, setMode] = useState<"percent" | "custom">("percent");

  const { position } = useUserPosition(vault.id);
  const realTotalShares = position?.shares ?? 0n;
  const totalShares = isDemo ? DEMO_VAULT_SHARES : realTotalShares;

  const sharesToRedeem =
    mode === "percent"
      ? BigInt(Math.floor((Number(totalShares) * redeemPct) / 100))
      : toTokenUnits(parseFloat(customShares || "0"), vault.decimals);

  const { assets: previewAssets } = usePreviewRedeem(
    vault.id,
    !isDemo && sharesToRedeem > 0n ? sharesToRedeem : undefined
  );

  const realRedeem = useRedeem({ vault: vault.id });
  const mockRedeem = useMockRedeem();
  const { step, isLoading, isSuccess, hash, instant } = isDemo
    ? mockRedeem
    : realRedeem;

  async function handleRedeem() {
    if (sharesToRedeem <= 0n) return;
    if (isDemo) {
      await mockRedeem.redeem();
    } else {
      await realRedeem.redeem(sharesToRedeem);
    }
  }

  if (!effectiveConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-4xl">💰</p>
        <h2 className="text-xl font-bold text-white">Connect to withdraw</h2>
        <ConnectButton />
      </div>
    );
  }

  const totalSharesFormatted = formatTokenAmount(totalShares, vault.decimals);
  const sharesToRedeemFormatted = formatTokenAmount(sharesToRedeem, vault.decimals);
  const previewFormatted = isDemo
    ? (Number(sharesToRedeem) / 10 ** vault.decimals).toFixed(4)
    : previewAssets
    ? formatTokenAmount(previewAssets, vault.decimals)
    : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-white">Withdraw</h1>
      <p className="mb-8 text-sm text-gray-400">
        Redeem your vault shares back to {vault.asset}. Redemptions may take up
        to 24h if vault liquidity is limited.
      </p>

      {/* Balance */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-gray-500">Your vault balance</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {totalSharesFormatted}
        </p>
        <p className="text-sm text-gray-400">{vault.name} shares</p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-xl bg-white/5 p-1">
        {(["percent", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === m
                ? "bg-indigo-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m === "percent" ? "By Percentage" : "Custom Amount"}
          </button>
        ))}
      </div>

      {/* Percent mode */}
      {mode === "percent" && (
        <div className="mb-6">
          <div className="mb-4 flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setRedeemPct(pct)}
                className={`flex-1 rounded-xl border px-2 py-2 text-sm font-medium transition-all ${
                  redeemPct === pct
                    ? "border-indigo-500 bg-indigo-500/10 text-white"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={redeemPct}
            onChange={(e) => setRedeemPct(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <p className="mt-2 text-right text-sm text-gray-400">
            {redeemPct}% selected
          </p>
        </div>
      )}

      {/* Custom mode */}
      {mode === "custom" && (
        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-400">
            Shares to redeem
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={customShares}
            onChange={(e) => setCustomShares(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      )}

      {/* Redeem summary */}
      {sharesToRedeem > 0n && (
        <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Shares to redeem</p>
            <p className="font-semibold text-white">
              {sharesToRedeemFormatted} {vault.name}
            </p>
          </div>
          {previewFormatted && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">Est. assets received</p>
              <p className="text-xs text-gray-300">
                {previewFormatted} {vault.asset}
              </p>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Instant if liquidity available; otherwise up to 24h.
          </p>
        </div>
      )}

      {/* Vault info */}
      <div className="mb-6">
        <VaultInfoCard vaultId={vaultId} selected />
      </div>

      {/* Transaction status */}
      {step !== "idle" && (
        <div className="mb-4">
          <TransactionStatus step={step} hash={isDemo ? undefined : hash} isSuccess={isSuccess} />
          {isSuccess && !isDemo && instant !== undefined && (
            <p className="mt-2 text-sm text-gray-400">
              {instant
                ? "✓ Instantly settled to your wallet."
                : "⏳ Redemption queued — funds arrive within 24h."}
            </p>
          )}
          {isDemo && isSuccess && (
            <p className="mt-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              ✓ Demo redemption successful! In production this settles instantly on Base.
            </p>
          )}
        </div>
      )}

      {/* Redeem button */}
      <button
        onClick={handleRedeem}
        disabled={sharesToRedeem <= 0n || isLoading}
        className="w-full rounded-2xl bg-purple-500 py-3.5 text-base font-bold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading
          ? step === "approving"
            ? "Submitting..."
            : "Confirming..."
          : `Redeem ${sharesToRedeemFormatted} ${vault.name}`}
      </button>

      <div className="mt-6">
        <RiskNotice />
      </div>
    </div>
  );
}
