"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { YieldProvider } from "@yo-protocol/react";
import { wagmiConfig, PARTNER_ID } from "@/lib/config";
import { DemoProvider } from "@/context/DemoContext";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6366f1",
            accentColorForeground: "white",
            borderRadius: "large",
          })}
        >
          <YieldProvider
            partnerId={PARTNER_ID}
            defaultSlippageBps={50}
            onError={(err) => console.error("[YO SDK Error]", err)}
          >
            <DemoProvider>
              {children}
            </DemoProvider>
          </YieldProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
