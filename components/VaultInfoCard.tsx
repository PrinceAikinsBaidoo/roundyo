"use client";

import { useVaults } from "@yo-protocol/react";
import { VAULTS, VaultId, CHAIN_NAMES, SupportedChainId } from "@/lib/config";

interface Props {
  vaultId: VaultId;
  selected?: boolean;
  onSelect?: () => void;
}

export function VaultInfoCard({ vaultId, selected, onSelect }: Props) {
  const vaultMeta = VAULTS[vaultId];
  const { vaults } = useVaults();

  // Match by vault name (id field in VaultStatsItem)
  const stats = vaults.find(
    (v) => v.id.toLowerCase() === vaultId.toLowerCase()
  );

  const apy = stats?.yield?.["30d"] ?? stats?.yield?.["7d"] ?? null;
  const tvl = stats?.tvl?.formatted ?? null;

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-white">{vaultMeta.name}</p>
          <p className="text-sm text-gray-400">{vaultMeta.description}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            vaultMeta.risk === "Low"
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {vaultMeta.risk} risk
        </span>
      </div>

      <div className="mt-3 flex gap-4">
        <div>
          <p className="text-xs text-gray-500">Annual return</p>
          <p className="text-lg font-bold text-green-400">
            {apy !== null ? `${(parseFloat(apy) * 100).toFixed(2)}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total saved</p>
          <p className="text-lg font-bold text-white">{tvl ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Asset</p>
          <p className="text-lg font-bold text-white">{vaultMeta.asset}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {vaultMeta.chainIds.map((id) => (
          <span
            key={id}
            className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-400"
          >
            {CHAIN_NAMES[id as SupportedChainId]}
          </span>
        ))}
      </div>
    </button>
  );
}
