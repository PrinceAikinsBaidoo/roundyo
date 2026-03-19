"use client";

import { explorerTxUrl, formatTxHash } from "@/lib/format";
import { useChainId } from "wagmi";

interface Props {
  step: string;
  hash?: string;
  approveHash?: string;
  isSuccess?: boolean;
  error?: Error | null;
  onReset?: () => void;
}

const STEP_LABELS: Record<string, string> = {
  idle: "",
  "switching-chain": "Switching network...",
  approving: "Authorizing transfer...",
  depositing: "Sending your deposit...",
  redeeming: "Processing withdrawal...",
  waiting: "Waiting for confirmation...",
  success: "Done!",
  error: "Something went wrong",
};

function friendlyError(error: Error): { title: string; detail?: string } {
  const msg = error.message?.toLowerCase() ?? "";

  if (msg.includes("user rejected") || msg.includes("user denied") || msg.includes("rejected the request")) {
    return { title: "You cancelled the transaction", detail: "No worries — nothing was sent. Try again when you're ready." };
  }
  if (msg.includes("insufficient funds") || msg.includes("exceeds balance")) {
    return { title: "Not enough funds", detail: "Your wallet doesn't have enough to complete this transaction. Try a smaller amount." };
  }
  if (msg.includes("insufficient allowance")) {
    return { title: "Authorization needed", detail: "You need to authorize the transfer first. Please try again." };
  }
  if (msg.includes("network") || msg.includes("disconnected") || msg.includes("timeout")) {
    return { title: "Connection issue", detail: "Check your internet connection and try again." };
  }
  if (msg.includes("nonce") || msg.includes("replacement")) {
    return { title: "Transaction conflict", detail: "You have a pending transaction. Wait for it to finish or speed it up in your wallet." };
  }
  if (msg.includes("gas") || msg.includes("fee")) {
    return { title: "Gas fee issue", detail: "You may not have enough ETH to cover the network fee. Add a small amount of ETH and try again." };
  }
  if (msg.includes("reverted") || msg.includes("execution reverted")) {
    return { title: "Transaction failed", detail: "The transaction was rejected by the network. The amount or settings may be invalid." };
  }

  return { title: "Something went wrong", detail: "Please try again. If the issue continues, refresh the page." };
}

export function TransactionStatus({
  step,
  hash,
  approveHash,
  isSuccess,
  error,
  onReset,
}: Props) {
  const chainId = useChainId();
  const friendly = error ? friendlyError(error) : null;

  if (step === "idle") return null;

  return (
    <div
      className={`rounded-xl border p-4 text-sm ${
        isSuccess
          ? "border-green-500/30 bg-green-500/10 text-green-300"
          : error
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isSuccess && !error && (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          )}
          {isSuccess && <span>✓</span>}
          {error && <span>✗</span>}
          <span className="font-medium">
            {friendly ? friendly.title : STEP_LABELS[step] ?? step}
          </span>
        </div>
        {onReset && (isSuccess || error) && (
          <button
            onClick={onReset}
            className="text-xs underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        )}
      </div>

      {approveHash && (
        <a
          href={explorerTxUrl(approveHash, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs underline opacity-70"
        >
          Authorization: {formatTxHash(approveHash)}
        </a>
      )}
      {hash && (
        <a
          href={explorerTxUrl(hash, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-xs underline opacity-70"
        >
          Receipt: {formatTxHash(hash)}
        </a>
      )}
      {friendly?.detail && (
        <p className="mt-2 text-xs opacity-80">{friendly.detail}</p>
      )}
    </div>
  );
}
