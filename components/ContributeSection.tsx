"use client";

import { useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { VAULTS, VaultId, getAssetAddress, isVaultOnChain, CHAIN_NAMES, SupportedChainId } from "@/lib/config";

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

const VAULT_IDS = Object.keys(VAULTS) as VaultId[];

export function ContributeSection({ ownerAddress, vaultId: defaultVaultId, goalName }: Props) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // Let contributor pick a different vault/asset
  const [selectedVaultId, setSelectedVaultId] = useState<VaultId>(defaultVaultId as VaultId);
  const vault = VAULTS[selectedVaultId] ?? VAULTS.yoUSD;

  const vaultOnChain = isVaultOnChain(selectedVaultId, chainId);
  const assetAddress = getAssetAddress(selectedVaultId, chainId);
  const chainName = CHAIN_NAMES[chainId as SupportedChainId] ?? "Unknown";

  // Find a chain where this vault IS available (for the switch button)
  const bestChainId = vault.chainIds[0] as SupportedChainId;
  const bestChainName = CHAIN_NAMES[bestChainId];

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContractAsync } = useWriteContract();

  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | undefined>();

  useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isSuccess: depositConfirmed } = useWaitForTransactionReceipt({ hash: depositTxHash });

  if (depositConfirmed && step === "depositing") setStep("success");

  async function handleContribute() {
    if (!amount || parseFloat(amount) <= 0 || !assetAddress) return;
    setErrorMsg("");

    try {
      const units = parseUnits(amount, vault.decimals);

      setStep("approving");
      const approveHash = await writeContractAsync({
        address: assetAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [vault.address, units],
      });
      setApproveTxHash(approveHash);
      await waitForTx(approveHash);

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
          Connect your wallet to help fund {goalName}.
        </p>
        <ConnectButton />
      </div>
    );
  }

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
          {amount} {vault.asset} deposited into {vault.name} on <strong>{chainName}</strong> for the goal owner.
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
        Pick the currency you have — your contribution goes directly to the goal owner.
      </p>

      {/* Vault / asset picker */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-gray-400">Pay with</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VAULT_IDS.map((id) => {
            const v = VAULTS[id];
            const available = isVaultOnChain(id, chainId);
            return (
              <button
                key={id}
                onClick={() => setSelectedVaultId(id)}
                disabled={isLoading}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  selectedVaultId === id
                    ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                } ${!available ? "opacity-50" : ""}`}
              >
                <p className="text-sm font-bold text-white">{v.asset}</p>
                <p className="text-xs text-gray-500">{v.name}</p>
                {!available && (
                  <p className="mt-0.5 text-[10px] text-amber-400">Not on {chainName}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chain status */}
      {vaultOnChain ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-gray-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
          Sending {vault.asset} on <span className="font-medium text-white">{chainName}</span>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <p className="text-sm text-amber-300">
            <strong>{vault.asset}</strong> needs {bestChainName}
          </p>
          <button
            onClick={() => switchChain({ chainId: bestChainId })}
            disabled={isSwitching}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {isSwitching ? "Switching..." : `Switch to ${bestChainName}`}
          </button>
        </div>
      )}

      {/* Amount */}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-400">Amount ({vault.asset})</label>
        <input
          type="number"
          placeholder="5.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading || !vaultOnChain}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
        />
      </div>

      {step === "error" && (
        <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        onClick={handleContribute}
        disabled={!amount || parseFloat(amount) <= 0 || isLoading || !vaultOnChain}
        className="w-full rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {step === "approving"
          ? "Approving..."
          : step === "depositing"
          ? "Depositing..."
          : `Contribute ${amount ? `${parseFloat(amount).toFixed(2)}` : ""} ${vault.asset}`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-600">
        Goes directly to the goal owner · Network fees apply
      </p>
    </div>
  );
}
