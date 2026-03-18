"use client";

import { useState } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { VAULTS, getAssetAddress } from "@/lib/config";

// Minimal ERC-4626 deposit ABI
const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
] as const;

interface Props {
  ownerAddress: string;
  vaultId: string;
  goalName: string;
}

type Step = "idle" | "approving" | "depositing" | "success" | "error";

export function ContributeSection({ ownerAddress, vaultId, goalName }: Props) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const vault = VAULTS[vaultId as keyof typeof VAULTS] ?? VAULTS.yoUSD;
  const assetAddress = getAssetAddress(vault.id, chainId) ?? (vault.assetAddresses as Record<number, `0x${string}`>)[8453];

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContractAsync } = useWriteContract();

  // Watch for approve tx confirmation
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | undefined>();

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isSuccess: depositConfirmed } = useWaitForTransactionReceipt({ hash: depositTxHash });

  // Mark success once deposit confirmed
  if (depositConfirmed && step === "depositing") setStep("success");

  async function handleContribute() {
    if (!amount || parseFloat(amount) <= 0) return;
    setErrorMsg("");

    try {
      const units = parseUnits(amount, vault.decimals);

      // Step 1: Approve
      setStep("approving");
      const approveHash = await writeContractAsync({
        address: assetAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [vault.address, units],
      });
      setApproveTxHash(approveHash);

      // Wait for approval on-chain
      // (We poll via useWaitForTransactionReceipt above, but for sequencing we await inline)
      await waitForTx(approveHash);

      // Step 2: Deposit with owner as receiver
      setStep("depositing");
      const depositHash = await writeContractAsync({
        address: vault.address,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [units, ownerAddress as `0x${string}`],
      });
      setDepositTxHash(depositHash);
      await waitForTx(depositHash);
      setStep("success");
    } catch (e: unknown) {
      setStep("error");
      setErrorMsg(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  // Simple tx waiter using the public RPC
  async function waitForTx(hash: `0x${string}`) {
    const { createPublicClient, http } = await import("viem");
    const chains = await import("wagmi/chains");
    const chain =
      chainId === 1 ? chains.mainnet : chainId === 42161 ? chains.arbitrum : chains.base;
    const client = createPublicClient({ chain, transport: http() });
    await client.waitForTransactionReceipt({ hash });
  }

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-1 font-semibold text-white">Contribute to this goal</p>
        <p className="mb-4 text-sm text-gray-400">
          Connect your wallet to send {vault.asset} directly toward {goalName}.
        </p>
        <ConnectButton />
      </div>
    );
  }

  // Don't show contribute if viewer is the owner
  if (address?.toLowerCase() === ownerAddress.toLowerCase()) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-500">
        This is your goal. Deposit from the{" "}
        <a href="/save" className="text-indigo-400 underline">Save page</a>.
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-semibold text-green-300">Contribution sent!</p>
        <p className="mt-1 text-sm text-green-400/70">
          {amount} {vault.asset} deposited into {vault.name} on behalf of the goal owner.
        </p>
        <button
          onClick={() => { setStep("idle"); setAmount(""); setApproveTxHash(undefined); setDepositTxHash(undefined); }}
          className="mt-4 text-xs text-green-400/60 underline hover:text-green-400"
        >
          Contribute again
        </button>
      </div>
    );
  }

  const isLoading = step === "approving" || step === "depositing";

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
      <p className="mb-1 font-semibold text-white">Contribute to this goal</p>
      <p className="mb-4 text-sm text-gray-400">
        Send {vault.asset} directly to this goal. Shares go to the owner — your funds earn yield in their vault.
      </p>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-400">Amount ({vault.asset})</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            placeholder="5.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-8 pr-4 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      {step === "error" && (
        <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        onClick={handleContribute}
        disabled={!amount || parseFloat(amount) <= 0 || isLoading}
        className="w-full rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {step === "approving"
          ? "Approving..."
          : step === "depositing"
          ? "Depositing..."
          : `Contribute ${amount ? `$${parseFloat(amount).toFixed(2)}` : ""} ${vault.asset}`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-600">
        Vault shares are sent to the goal owner · You pay gas
      </p>
    </div>
  );
}
