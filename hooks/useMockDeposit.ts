"use client";

import { useState } from "react";

type Step = "idle" | "approving" | "confirming" | "success";

export function useMockDeposit() {
  const [step, setStep] = useState<Step>("idle");
  const isLoading = step === "approving" || step === "confirming";
  const isSuccess = step === "success";

  async function deposit() {
    setStep("approving");
    await delay(1200);
    setStep("confirming");
    await delay(1800);
    setStep("success");
  }

  function reset() {
    setStep("idle");
  }

  return {
    deposit,
    step,
    isLoading,
    isSuccess,
    hash: isSuccess ? "0xdemo_tx_hash_deposit_abc123" : undefined,
    approveHash: undefined,
    error: null,
    reset,
  };
}

export function useMockRedeem() {
  const [step, setStep] = useState<Step>("idle");
  const isLoading = step === "approving" || step === "confirming";
  const isSuccess = step === "success";

  async function redeem() {
    setStep("approving");
    await delay(1000);
    setStep("confirming");
    await delay(2000);
    setStep("success");
  }

  function reset() {
    setStep("idle");
  }

  return {
    redeem,
    step,
    isLoading,
    isSuccess,
    hash: isSuccess ? "0xdemo_tx_hash_redeem_def456" : undefined,
    instant: true,
    reset,
  };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
