'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { ethers } from 'ethers';
import { tokencasinoAbi, tokencasinoAddress } from '@/lib/contracts';
import {
  getInjectedProvider,
  SEPOLIA_ADD_CHAIN_PARAMS,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
} from '@/lib/ethereum';
import type { Eip1193 } from '@/lib/walletDiscovery';

export type { Eip1193 };

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  signer: ethers.Signer | null;
  chainId: number | null;
  ethBalance: number;
  csnoBalance: number;
  isConnecting: boolean;
  connectionError: string | null;
  /** Conecta usando la billetera elegida (lista en modal). Devuelve true si quedó conectado. */
  connectWithProvider: (ethereum: Eip1193) => Promise<boolean>;
  /** Atajo: primera billetera detectada (compatibilidad). */
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

async function ensureSepolia(ethereum: Eip1193): Promise<void> {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (e: unknown) {
    const code = (e as { code?: number })?.code;
    if (code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [SEPOLIA_ADD_CHAIN_PARAMS],
      });
      return;
    }
    throw e;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [ethBalance, setEthBalance] = useState(0);
  const [csnoBalance, setCsnoBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  /** Proveedor con el que el usuario conectó (para eventos accountsChanged / chainChanged). */
  const [activeEip1193, setActiveEip1193] = useState<Eip1193 | null>(null);

  const fetchBalances = useCallback(async (provider: ethers.BrowserProvider, addr: string) => {
    const token = new ethers.Contract(tokencasinoAddress, tokencasinoAbi, provider);
    const [ethWei, csnoUnits, decimals] = await Promise.all([
      provider.getBalance(addr),
      token.balanceOf(addr),
      token.decimals(),
    ]);

    setEthBalance(Number(ethers.formatEther(ethWei)));
    setCsnoBalance(Number(ethers.formatUnits(csnoUnits, decimals)));
  }, []);

  const connectWithProvider = useCallback(
    async (ethereum: Eip1193): Promise<boolean> => {
      if (typeof window === 'undefined') return false;

      setConnectionError(null);
      setIsConnecting(true);

      try {
        await ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
        const net = await provider.getNetwork();
        if (Number(net.chainId) !== SEPOLIA_CHAIN_ID) {
          await ensureSepolia(ethereum);
        }

        const nextSigner = await provider.getSigner();
        const addr = await nextSigner.getAddress();
        const finalNet = await provider.getNetwork();

        setActiveEip1193(ethereum);
        setAddress(addr);
        setSigner(nextSigner);
        setChainId(Number(finalNet.chainId));

        await fetchBalances(provider, addr);
        return true;
      } catch (err) {
        console.error(err);
        const msg =
          err instanceof Error
            ? err.message
            : 'No se pudo conectar. Desbloqueá la extensión o probá otra billetera.';
        setConnectionError(msg);
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [fetchBalances],
  );

  const connect = useCallback(async () => {
    const raw = getInjectedProvider();
    if (!raw) {
      setConnectionError(
        'No hay wallet en el navegador. Usá Chrome/Edge/Firefox con una extensión instalada.',
      );
      return;
    }
    await connectWithProvider(raw as Eip1193);
  }, [connectWithProvider]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setChainId(null);
    setActiveEip1193(null);
    setEthBalance(0);
    setCsnoBalance(0);
    setConnectionError(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ethereum = activeEip1193;
    if (!ethereum?.on) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const list = accounts as string[];
      if (!list || list.length === 0) {
        disconnect();
        return;
      }
      const addr = list[0];
      setAddress(addr);
      try {
        const bp = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
        await fetchBalances(bp, addr);
      } catch {
        /* ignore */
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [activeEip1193, disconnect, fetchBalances]);

  const value = useMemo<WalletContextType>(
    () => ({
      address,
      isConnected: address !== null,
      signer,
      chainId,
      ethBalance,
      csnoBalance,
      isConnecting,
      connectionError,
      connectWithProvider,
      connect,
      disconnect,
    }),
    [
      address,
      chainId,
      connect,
      connectWithProvider,
      connectionError,
      csnoBalance,
      disconnect,
      ethBalance,
      isConnecting,
      signer,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
