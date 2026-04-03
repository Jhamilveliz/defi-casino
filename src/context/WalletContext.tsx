'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  ethBalance: number;
  csnoBalance: number;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  buyTokens: (eth: number) => void;
  sellTokens: (csno: number) => void;
  placeBet: (csno: number) => void;
  winBet: (csno: number) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState(1.5);
  const [csnoBalance, setCsnoBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setAddress('0x71C...976F');
      setIsConnecting(false);
    }, 1000);
  };

  const disconnect = () => {
    setAddress(null);
  };

  const buyTokens = (eth: number) => {
    if (eth > ethBalance) return;
    setEthBalance(prev => prev - eth);
    setCsnoBalance(prev => prev + eth * 1000);
  };

  const sellTokens = (csno: number) => {
    if (csno > csnoBalance) return;
    setCsnoBalance(prev => prev - csno);
    setEthBalance(prev => prev + csno / 1000);
  };

  const placeBet = (csno: number) => {
    if (csno > csnoBalance) return;
    setCsnoBalance(prev => prev - csno);
  };

  const winBet = (csno: number) => {
    setCsnoBalance(prev => prev + csno);
  };

  return (
    <WalletContext.Provider value={{
      address, isConnected: address !== null, ethBalance, csnoBalance, isConnecting,
      connect, disconnect, buyTokens, sellTokens, placeBet, winBet
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
