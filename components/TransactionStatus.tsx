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

export function TransactionStatus({
  step,
  hash,
  approveHash,
  isSuccess,
  error,
  onReset,
}: Props) {
  const chainId = useChainId();

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
            {STEP_LABELS[step] ?? step}
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
      {error && (
        <p className="mt-2 text-xs opacity-70">{error.message}</p>
      )}
    </div>
  );
}
