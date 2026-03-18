"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { usePathname } from "next/navigation";
import { base } from "wagmi/chains";
import { SUPPORTED_CHAIN_IDS } from "@/lib/config";

export function NetworkGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const pathname = usePathname();

  if (pathname.startsWith("/goals/shared")) return null;
  if (!isConnected || SUPPORTED_CHAIN_IDS.includes(chainId as typeof SUPPORTED_CHAIN_IDS[number])) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-500/10 px-4 py-2.5 text-sm border-b border-amber-500/20">
      <p className="text-amber-300">
        ⚠️ RoundYO works on <strong>Base</strong>, <strong>Ethereum</strong>, and <strong>Arbitrum</strong>. Your wallet is on a different network.
      </p>
      <button
        onClick={() => switchChain({ chainId: base.id })}
        disabled={isPending}
        className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
      >
        {isPending ? "Switching..." : "Switch to Base"}
      </button>
    </div>
  );
}
