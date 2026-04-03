/**
 * Devuelve el proveedor inyectado (prioriza MetaMask si hay varios).
 */
export function getInjectedProvider(): unknown | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & { ethereum?: unknown };
  const eth = w.ethereum as
    | {
        isMetaMask?: boolean;
        providers?: Array<{ isMetaMask?: boolean; request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }>;
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      }
    | undefined;
  if (!eth) return null;
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const mm = eth.providers.find((p) => p.isMetaMask);
    if (mm) return mm;
  }
  return eth;
}

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const SEPOLIA_ADD_CHAIN_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Sepolia',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
} as const;
