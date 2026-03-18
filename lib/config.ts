import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, mainnet, arbitrum } from "wagmi/chains";

export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "demo-project-id";

export const wagmiConfig = getDefaultConfig({
  appName: "RoundYO",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [base, mainnet, arbitrum],
  ssr: true,
});

export const PARTNER_ID = 9999;

/** YO-supported chain IDs */
export const SUPPORTED_CHAIN_IDS = [8453, 1, 42161] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export const CHAIN_NAMES: Record<SupportedChainId, string> = {
  8453: "Base",
  1: "Ethereum",
  42161: "Arbitrum",
};

export const VAULTS = {
  yoUSD: {
    id: "yoUSD" as const,
    address: "0x0000000f2eb9f69274678c76222b35eec7588a65" as `0x${string}`,
    name: "yoUSD",
    description: "USDC yield vault",
    asset: "USDC",
    decimals: 6,
    risk: "Low",
    chainIds: [8453, 1, 42161] as SupportedChainId[],
    // Asset (USDC) address per chain — from YO SDK
    assetAddresses: {
      8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    } as Partial<Record<SupportedChainId, `0x${string}`>>,
  },
  yoETH: {
    id: "yoETH" as const,
    address: "0x3a43aec53490cb9fa922847385d82fe25d0e9de7" as `0x${string}`,
    name: "yoETH",
    description: "WETH yield vault",
    asset: "WETH",
    decimals: 18,
    risk: "Medium",
    chainIds: [8453, 1] as SupportedChainId[],
    assetAddresses: {
      8453: "0x4200000000000000000000000000000000000006",
      1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    } as Partial<Record<SupportedChainId, `0x${string}`>>,
  },
  yoBTC: {
    id: "yoBTC" as const,
    address: "0xbcbc8cb4d1e8ed048a6276a5e94a3e952660bcbc" as `0x${string}`,
    name: "yoBTC",
    description: "cbBTC yield vault",
    asset: "cbBTC",
    decimals: 8,
    risk: "Medium",
    chainIds: [8453, 1] as SupportedChainId[],
    assetAddresses: {
      8453: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      1: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    } as Partial<Record<SupportedChainId, `0x${string}`>>,
  },
  yoEUR: {
    id: "yoEUR" as const,
    address: "0x50c749ae210d3977adc824ae11f3c7fd10c871e9" as `0x${string}`,
    name: "yoEUR",
    description: "EURC yield vault",
    asset: "EURC",
    decimals: 6,
    risk: "Low",
    chainIds: [8453, 1] as SupportedChainId[],
    assetAddresses: {
      8453: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
      1: "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c",
    } as Partial<Record<SupportedChainId, `0x${string}`>>,
  },
} as const;

export type VaultId = keyof typeof VAULTS;
export type VaultConfig = (typeof VAULTS)[VaultId];

export const DEFAULT_VAULT_ID: VaultId = "yoUSD";

/** Returns the asset token address for a vault on the given chain, or undefined if not supported. */
export function getAssetAddress(
  vaultId: VaultId,
  chainId: number
): `0x${string}` | undefined {
  const vault = VAULTS[vaultId];
  return (vault.assetAddresses as Record<number, `0x${string}`>)[chainId];
}

/** Returns true if the vault is available on the given chain. */
export function isVaultOnChain(vaultId: VaultId, chainId: number): boolean {
  return (VAULTS[vaultId].chainIds as readonly number[]).includes(chainId);
}
