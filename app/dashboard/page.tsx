"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserPosition, useVaults } from "@yo-protocol/react";
import { GoalCard } from "@/components/GoalCard";
import { RiskNotice } from "@/components/RiskNotice";
import { VAULTS, VaultId } from "@/lib/config";
import { getGoals, Goal } from "@/lib/goals";
import { getPrefs } from "@/lib/store";
import { formatAddress, formatTokenAmount } from "@/lib/format";
import { fetchUserHistory, VaultHistoryItem } from "@/lib/yo";
import { useDemo } from "@/context/DemoContext";
import { DEMO_ADDRESS, DEMO_GOAL } from "@/lib/demo";
import { SavingsChart } from "@/components/SavingsChart";
import { RoundUpChart } from "@/components/RoundUpChart";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isDemo, demoBalance: demoBal, demoHistory } = useDemo();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [prefs, setPrefs] = useState(getPrefs());
  const [history, setHistory] = useState<VaultHistoryItem[]>([]);

  const vaultId = (prefs.selectedVaultId as VaultId) ?? "yoUSD";
  const vault = VAULTS[vaultId];

  const effectiveAddress = isDemo ? DEMO_ADDRESS : address;
  const effectiveConnected = isDemo || isConnected;

  // Live vault data
  const { position } = useUserPosition(vault.id);
  const { vaults: allVaults } = useVaults();
  const vaultStats = allVaults.find((v) => v.id.toLowerCase() === vaultId.toLowerCase());
  const apyRaw = vaultStats?.yield?.["30d"] ?? vaultStats?.yield?.["7d"] ?? null;
  const apy = apyRaw !== null ? `${(parseFloat(apyRaw) * 100).toFixed(2)}%` : "—";

  // Balance
  const realBalance = position?.assets ? formatTokenAmount(position.assets, vault.decimals) : "0.00";
  const realShares = position?.shares ? formatTokenAmount(position.shares, vault.decimals) : "0.00";

  const balance = isDemo ? (demoBal / 1e6).toFixed(2) : realBalance;
  const shares = isDemo ? (demoBal / 1e6).toFixed(4) : realShares;

  useEffect(() => {
    setGoals(getGoals());
    setPrefs(getPrefs());
  }, []);

  useEffect(() => {
    if (isDemo) {
      setHistory(demoHistory);
      return;
    }
    if (!address) return;
    const network =
      chainId === 1 ? "ethereum" : chainId === 42161 ? "arbitrum" : "base";
    fetchUserHistory(network, vault.address, address).then((items) => {
      const arr = Array.isArray(items) ? items : [];
      setHistory(arr.slice(0, 5));
    });
  }, [address, chainId, vault.address, isDemo, demoHistory]);

  const activeGoal = isDemo
    ? DEMO_GOAL
    : goals.find((g) => g.id === prefs.activeGoalId) ?? goals[0];

  if (!effectiveConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-4xl">🔐</p>
        <h2 className="text-xl font-bold text-white">Connect your wallet</h2>
        <p className="text-sm text-gray-400">
          Connect to see your savings dashboard.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      {/* Balance hero */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {isDemo ? "Demo Balance" : "Total Savings"}
            </p>
            <p className="mt-1 text-4xl font-black tabular-nums text-white sm:text-5xl">
              ${balance}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {shares} in {vault.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Annual return</p>
            <p className="text-2xl font-bold text-green-400">{apy}</p>
            <p className="mt-0.5 text-xs text-gray-500">{vault.asset} · {vault.name}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-600">{formatAddress(effectiveAddress!)}</p>
      </div>

      {/* Quick actions — always visible, right after balance */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          href="/save"
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 active:scale-[0.98]"
        >
          <span>⚡</span> Deposit
        </Link>
        <Link
          href="/redeem"
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-bold text-white transition hover:border-white/20 active:scale-[0.98]"
        >
          <span>💰</span> Withdraw
        </Link>
      </div>

      {/* Active goal */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Active Goal
          </h2>
          <Link href="/goals" className="text-xs text-indigo-400 hover:text-indigo-300">
            All goals →
          </Link>
        </div>
        {activeGoal ? (
          <GoalCard goal={activeGoal} active />
        ) : (
          <Link
            href="/goals"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 transition hover:border-indigo-500/40 hover:bg-indigo-500/5"
          >
            <span className="text-xl">🎯</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Create a savings goal</p>
              <p className="text-xs text-gray-500">Track what you&apos;re saving for</p>
            </div>
            <span className="ml-auto text-gray-600">→</span>
          </Link>
        )}
      </section>

      {/* Charts */}
      {history.length > 0 && (
        <section className="mb-5 grid gap-3 sm:grid-cols-2">
          <SavingsChart history={history} decimals={vault.decimals} />
          <RoundUpChart history={history} decimals={vault.decimals} />
        </section>
      )}

      {/* Recent activity */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Recent Activity
        </h2>
        {history.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/5">
            {history.map((tx, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize text-white">
                    {tx.type ?? "Transaction"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.blockTimestamp
                      ? new Date(tx.blockTimestamp * 1000).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <p className={`shrink-0 text-sm font-semibold tabular-nums ${tx.type === "withdraw" ? "text-red-400" : "text-indigo-300"}`}>
                  {tx.assets
                    ? `${tx.type === "withdraw" ? "−" : "+"}$${(Number(tx.assets) / 10 ** vault.decimals).toFixed(2)}`
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-gray-500">
            No transactions yet.{" "}
            <Link href="/save" className="text-indigo-400 underline">
              Make your first deposit
            </Link>
          </div>
        )}
      </section>

      <RiskNotice />
    </div>
  );
}
