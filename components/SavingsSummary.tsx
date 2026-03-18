"use client";

import { useUserPosition, useVaults } from "@yo-protocol/react";
import { useAccount } from "wagmi";
import { VAULTS, VaultId } from "@/lib/config";
import { formatTokenAmount } from "@/lib/format";

interface Props {
  vaultId: VaultId;
}

export function SavingsSummary({ vaultId }: Props) {
  const { address } = useAccount();
  const vault = VAULTS[vaultId];
  const { position } = useUserPosition(vault.id);
  const { vaults } = useVaults();

  const stats = vaults.find(
    (v) => v.id.toLowerCase() === vaultId.toLowerCase()
  );

  const balance = position?.assets
    ? formatTokenAmount(position.assets, vault.decimals)
    : "0";
  const shares = position?.shares
    ? formatTokenAmount(position.shares, vault.decimals)
    : "0";

  const apyRaw = stats?.yield?.["30d"] ?? stats?.yield?.["7d"] ?? null;
  const apy =
    apyRaw !== null ? `${(parseFloat(apyRaw) * 100).toFixed(2)}%` : "—";

  if (!address) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-gray-500">Total Saved</p>
        <p className="mt-1 text-xl font-bold text-white">{balance}</p>
        <p className="text-xs text-gray-500">{vault.asset}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-gray-500">Balance</p>
        <p className="mt-1 text-xl font-bold text-white">{shares}</p>
        <p className="text-xs text-gray-500">{vault.name}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-gray-500">Annual return</p>
        <p className="mt-1 text-xl font-bold text-green-400">{apy}</p>
        <p className="text-xs text-gray-500">Changes over time</p>
      </div>
    </div>
  );
}
