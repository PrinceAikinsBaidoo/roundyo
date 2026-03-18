"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { VaultHistoryItem } from "@/lib/yo";
import { DEMO_HISTORY } from "@/lib/demo";

const INITIAL_BALANCE = 47_230_000; // $47.23 in 6-decimal USDC

interface DemoContextValue {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  /** Current demo balance in base units (6 decimals) */
  demoBalance: number;
  /** Demo transaction history — newest first */
  demoHistory: VaultHistoryItem[];
  /** Record a deposit (amount in USD, e.g. 0.40) */
  addDemoDeposit: (amountUSD: number) => void;
  /** Record a withdrawal (amount in base units) */
  addDemoWithdraw: (baseUnits: number) => void;
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
  demoBalance: INITIAL_BALANCE,
  demoHistory: DEMO_HISTORY,
  addDemoDeposit: () => {},
  addDemoWithdraw: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [demoBalance, setDemoBalance] = useState(INITIAL_BALANCE);
  const [demoHistory, setDemoHistory] = useState<VaultHistoryItem[]>(DEMO_HISTORY);

  useEffect(() => {
    setIsDemo(localStorage.getItem("roundyo_demo") === "1");
  }, []);

  function enterDemo() {
    localStorage.setItem("roundyo_demo", "1");
    setIsDemo(true);
    // Reset to initial state
    setDemoBalance(INITIAL_BALANCE);
    setDemoHistory([...DEMO_HISTORY]);
  }

  function exitDemo() {
    localStorage.removeItem("roundyo_demo");
    setIsDemo(false);
  }

  const addDemoDeposit = useCallback((amountUSD: number) => {
    const baseUnits = Math.round(amountUSD * 1e6);
    setDemoBalance((prev) => prev + baseUnits);
    setDemoHistory((prev) => [
      {
        type: "deposit",
        assets: String(baseUnits),
        shares: String(Math.round(baseUnits * 0.998)),
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: `0xdemo_${Date.now().toString(16)}`,
      },
      ...prev,
    ]);
  }, []);

  const addDemoWithdraw = useCallback((baseUnits: number) => {
    setDemoBalance((prev) => Math.max(0, prev - baseUnits));
    setDemoHistory((prev) => [
      {
        type: "withdraw",
        assets: String(baseUnits),
        shares: String(Math.round(baseUnits * 0.998)),
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: `0xdemo_${Date.now().toString(16)}`,
      },
      ...prev,
    ]);
  }, []);

  return (
    <DemoContext.Provider
      value={{
        isDemo,
        enterDemo,
        exitDemo,
        demoBalance,
        demoHistory,
        addDemoDeposit,
        addDemoWithdraw,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);
