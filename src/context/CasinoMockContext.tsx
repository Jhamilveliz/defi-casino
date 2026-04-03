'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useReducer,
  ReactNode,
} from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import {
  tokencasinoAbi,
  tokencasinoAddress,
  casinointegradorAbi,
  casinointegradorAddress,
} from '@/lib/contracts';

// ─── State shape ────────────────────────────────────────────────────────────

interface CasinoMockState {
  userBalanceETH: string;
  userBalanceCSNO: string;
  tokenPrice: string;       // ETH per 1 CSNO
  totalBet: string;         // cumulative CSNO bet
  jackpot: string;          // ETH jackpot pool
  activePlayers: number;
  selectedNumber: number | null;
  betAmount: string;
  buyAmount: string;
  sellAmount: string;
  lastBetResult: null | 'win' | 'lose';
  lastWinAmount: string;
}

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SELECTED_NUMBER'; payload: number | null }
  | { type: 'SET_BET_AMOUNT'; payload: string }
  | { type: 'SET_BUY_AMOUNT'; payload: string }
  | { type: 'SET_SELL_AMOUNT'; payload: string }
  | {
    type: 'SET_BALANCES';
    payload: { userBalanceETH: string; userBalanceCSNO: string; tokenPrice: string };
  }
  | {
    type: 'SET_LAST_BET_RESULT';
    payload: { lastBetResult: 'win' | 'lose'; lastWinAmount: string };
  }
  | { type: 'BUY'; }
  | { type: 'SELL'; }
  | { type: 'PLACE_BET'; }
  | { type: 'RESET'; }
  | { type: 'TICK_PLAYERS'; };

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: CasinoMockState = {
  userBalanceETH: '1.25',
  userBalanceCSNO: '500.0',
  tokenPrice: '0.0005',     // 1 CSNO = 0.0005 ETH  →  1 ETH = 2000 CSNO
  totalBet: '125000',
  jackpot: '4.8',
  activePlayers: 2847,
  selectedNumber: null,
  betAmount: '',
  buyAmount: '',
  sellAmount: '',
  lastBetResult: null,
  lastWinAmount: '',
};

// ─── Reducer ────────────────────────────────────────────────────────────────

function casinoReducer(state: CasinoMockState, action: Action): CasinoMockState {
  switch (action.type) {

    case 'SET_SELECTED_NUMBER':
      return { ...state, selectedNumber: action.payload };

    case 'SET_BET_AMOUNT':
      return { ...state, betAmount: action.payload };

    case 'SET_BUY_AMOUNT':
      return { ...state, buyAmount: action.payload };

    case 'SET_SELL_AMOUNT':
      return { ...state, sellAmount: action.payload };

    case 'SET_BALANCES':
      return {
        ...state,
        userBalanceETH: action.payload.userBalanceETH,
        userBalanceCSNO: action.payload.userBalanceCSNO,
        tokenPrice: action.payload.tokenPrice,
      };

    case 'SET_LAST_BET_RESULT':
      return {
        ...state,
        lastBetResult: action.payload.lastBetResult,
        lastWinAmount: action.payload.lastWinAmount,
      };

    // ── Buy CSNO with ETH ──────────────────────────────────────────────────
    case 'BUY': {
      const ethSpend = parseFloat(state.buyAmount);
      const currentETH = parseFloat(state.userBalanceETH);
      const price = parseFloat(state.tokenPrice);

      if (isNaN(ethSpend) || ethSpend <= 0) return state;
      if (ethSpend > currentETH) return state; // insufficient ETH

      const csnoReceived = ethSpend / price;
      const newETH = currentETH - ethSpend;
      const newCSNO = parseFloat(state.userBalanceCSNO) + csnoReceived;

      return {
        ...state,
        userBalanceETH: newETH.toFixed(6),
        userBalanceCSNO: newCSNO.toFixed(2),
        buyAmount: '',
      };
    }

    // ── Sell CSNO for ETH ──────────────────────────────────────────────────
    case 'SELL': {
      const csnoSell = parseFloat(state.sellAmount);
      const currentCSNO = parseFloat(state.userBalanceCSNO);
      const price = parseFloat(state.tokenPrice);

      if (isNaN(csnoSell) || csnoSell <= 0) return state;
      if (csnoSell > currentCSNO) return state; // insufficient CSNO

      const ethReceived = csnoSell * price;
      const newCSNO = currentCSNO - csnoSell;
      const newETH = parseFloat(state.userBalanceETH) + ethReceived;

      return {
        ...state,
        userBalanceCSNO: newCSNO.toFixed(2),
        userBalanceETH: newETH.toFixed(6),
        sellAmount: '',
      };
    }

    // ── Place roulette bet ─────────────────────────────────────────────────
    case 'PLACE_BET': {
      const bet = parseFloat(state.betAmount);
      const currentCSNO = parseFloat(state.userBalanceCSNO);

      if (isNaN(bet) || bet <= 0) return state;
      if (bet > currentCSNO) return state;           // insufficient CSNO
      if (state.selectedNumber === null) return state; // no number chosen

      // Biased draw: 40 % → number 6, 60 % → uniform 1-36
      // P(6)   = 0.40 + 0.60*(1/36) ≈ 41.67 %
      // P(n≠6) = 0.60*(1/36)        ≈  1.67 %
      const winningNumber =
        Math.random() < 0.40
          ? 6
          : Math.floor(Math.random() * 36) + 1;

      const won = winningNumber === state.selectedNumber;

      const balanceAfterBet = currentCSNO - bet;
      const winAmount = won ? bet * 2 : 0;            // double the bet on win
      const newCSNO = balanceAfterBet + winAmount;

      const newTotalBet = parseFloat(state.totalBet) + bet;
      // Jackpot grows by half the bet amount (simulation)
      const newJackpot = parseFloat(state.jackpot) + bet * parseFloat(state.tokenPrice) * 0.5;

      return {
        ...state,
        userBalanceCSNO: newCSNO.toFixed(2),
        lastBetResult: won ? 'win' : 'lose',
        lastWinAmount: won ? winAmount.toFixed(2) : '0',
        totalBet: newTotalBet.toFixed(0),
        jackpot: newJackpot.toFixed(4),
        betAmount: '',
      };
    }

    case 'RESET':
      // Preserve on-chain user balances/price so the "demo reset" does not blank them.
      return {
        ...initialState,
        userBalanceETH: state.userBalanceETH,
        userBalanceCSNO: state.userBalanceCSNO,
        tokenPrice: state.tokenPrice,
      };

    // Simulate player count oscillation (±1 to ±5)
    case 'TICK_PLAYERS': {
      const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
      const next = Math.max(100, state.activePlayers + delta);
      return { ...state, activePlayers: next };
    }

    default:
      return state;
  }
}

// ─── Context type ────────────────────────────────────────────────────────────

interface CasinoMockContextType extends CasinoMockState {
  setSelectedNumber: (num: number | null) => void;
  setBetAmount: (amount: string) => void;
  setBuyAmount: (amount: string) => void;
  setSellAmount: (amount: string) => void;
  mockBuy: () => Promise<{ tokensRecibidos: string }>;
  mockSell: () => Promise<{ ethRecibido: string }>;
  mockPlaceBet: () => Promise<{ gano: boolean; premio: string }>;
  mockReset: () => void;
  mockTickPlayers: () => void;
  approveTokens: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CasinoMockContext = createContext<CasinoMockContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CasinoMockProvider({ children }: { children: ReactNode }) {
  const { isConnected, address, signer } = useWallet();
  const [state, dispatch] = useReducer(casinoReducer, initialState);

  const setSelectedNumber = (num: number | null) =>
    dispatch({ type: 'SET_SELECTED_NUMBER', payload: num });

  const setBetAmount = (amount: string) =>
    dispatch({ type: 'SET_BET_AMOUNT', payload: amount });

  const setBuyAmount = (amount: string) =>
    dispatch({ type: 'SET_BUY_AMOUNT', payload: amount });

  const setSellAmount = (amount: string) =>
    dispatch({ type: 'SET_SELL_AMOUNT', payload: amount });

  const refreshFromChain = useCallback(async () => {
    if (!isConnected || !address || !signer) return;
    const provider = signer.provider;
    if (!provider) return;

    const token = new ethers.Contract(tokencasinoAddress, tokencasinoAbi, provider);
    const integrador = new ethers.Contract(casinointegradorAddress, casinointegradorAbi, provider);

    const decimals: number = await token.decimals();
    const [ethWei, csnoUnits] = await Promise.all([provider.getBalance(address), token.balanceOf(address)]);

    // ETH per 1 CSNO, derived from cotizarVenta(1 token)
    const oneTokenUnits = ethers.parseUnits('1', decimals);
    const priceWei: bigint = await integrador.cotizarVenta(oneTokenUnits);

    dispatch({
      type: 'SET_BALANCES',
      payload: {
        userBalanceETH: ethers.formatEther(ethWei),
        userBalanceCSNO: ethers.formatUnits(csnoUnits, decimals),
        tokenPrice: ethers.formatEther(priceWei),
      },
    });
  }, [isConnected, address, signer]);

  useEffect(() => {
    if (!isConnected) return;
    void refreshFromChain();
  }, [isConnected, refreshFromChain]);

  const mockBuy = async () => {
    if (!isConnected || !address || !signer) throw new Error('Wallet no conectada');

    const ethSpend = parseFloat(state.buyAmount);
    if (Number.isNaN(ethSpend) || ethSpend <= 0) throw new Error('Monto ETH inválido');

    const token = new ethers.Contract(tokencasinoAddress, tokencasinoAbi, signer);
    const integrador = new ethers.Contract(casinointegradorAddress, casinointegradorAbi, signer);

    const decimals: number = await token.decimals();
    const value = ethers.parseEther(ethSpend.toString());

    const tx = await integrador.comprarTokens({ value });
    const receipt = await tx.wait();

    const iface = new ethers.Interface(casinointegradorAbi);
    let tokensRecibidosUnits: bigint | null = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== casinointegradorAddress.toLowerCase()) continue;
      try {
        const parsed = iface.parseLog(log);
        if (!parsed) continue;
        if (parsed.name === 'TokensComprados') {
          tokensRecibidosUnits = parsed.args.tokensRecibidos as bigint;
          break;
        }
      } catch {
        // ignore non-matching logs
      }
    }

    dispatch({ type: 'SET_BUY_AMOUNT', payload: '' });
    await refreshFromChain();

    return {
      tokensRecibidos: tokensRecibidosUnits === null ? '0' : ethers.formatUnits(tokensRecibidosUnits, decimals),
    };
  };

  const mockSell = async () => {
    if (!isConnected || !address || !signer) throw new Error('Wallet no conectada');

    const csnoSell = parseFloat(state.sellAmount);
    if (Number.isNaN(csnoSell) || csnoSell <= 0) throw new Error('Monto CSNO inválido');

    const token = new ethers.Contract(tokencasinoAddress, tokencasinoAbi, signer);
    const integrador = new ethers.Contract(casinointegradorAddress, casinointegradorAbi, signer);

    const decimals: number = await token.decimals();
    const amountUnits = ethers.parseUnits(csnoSell.toString(), decimals);

    const allowance: bigint = await token.allowance(address, casinointegradorAddress);
    if (allowance < amountUnits) {
      const approveTx = await token.approve(casinointegradorAddress, amountUnits);
      await approveTx.wait();
    }

    const tx = await integrador.venderTokens(amountUnits);
    const receipt = await tx.wait();

    const iface = new ethers.Interface(casinointegradorAbi);
    let ethRecibidoWei: bigint | null = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== casinointegradorAddress.toLowerCase()) continue;
      try {
        const parsed = iface.parseLog(log);
        if (!parsed) continue;
        if (parsed.name === 'TokensVendidos') {
          ethRecibidoWei = parsed.args.ethRecibido as bigint;
          break;
        }
      } catch {
        // ignore non-matching logs
      }
    }

    dispatch({ type: 'SET_SELL_AMOUNT', payload: '' });
    await refreshFromChain();

    return { ethRecibido: ethRecibidoWei === null ? '0' : ethers.formatEther(ethRecibidoWei) };
  };

  const mockPlaceBet = async () => {
    if (!isConnected || !address || !signer) throw new Error('Wallet no conectada');
    if (state.selectedNumber === null) throw new Error('Elegí un número');

    const bet = parseFloat(state.betAmount);
    if (Number.isNaN(bet) || bet <= 0) throw new Error('Monto CSNO inválido');

    const token = new ethers.Contract(tokencasinoAddress, tokencasinoAbi, signer);
    const integrador = new ethers.Contract(casinointegradorAddress, casinointegradorAbi, signer);

    const decimals: number = await token.decimals();
    const amountUnits = ethers.parseUnits(bet.toString(), decimals);

    const tx = await integrador.apostar(state.selectedNumber, amountUnits);
    const receipt = await tx.wait();

    const iface = new ethers.Interface(casinointegradorAbi);
    let gano = false;
    let premioUnits: bigint | null = null;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== casinointegradorAddress.toLowerCase()) continue;
      try {
        const parsed = iface.parseLog(log);
        if (!parsed) continue;
        if (parsed.name === 'ApuestaRealizada') {
          gano = parsed.args.gano as boolean;
          premioUnits = parsed.args.premio as bigint;
          break;
        }
      } catch {
        // ignore non-matching logs
      }
    }

    const premio = premioUnits === null ? '0' : ethers.formatUnits(premioUnits, decimals);

    dispatch({
      type: 'SET_LAST_BET_RESULT',
      payload: { lastBetResult: gano ? 'win' : 'lose', lastWinAmount: premio },
    });
    dispatch({ type: 'SET_BET_AMOUNT', payload: '' });
    await refreshFromChain();

    return { gano, premio };
  };

  const mockReset = () => dispatch({ type: 'RESET' });
  const mockTickPlayers = () => dispatch({ type: 'TICK_PLAYERS' });

  const approveTokens = async () => {
    if (!isConnected || !address || !signer) throw new Error('Wallet no conectada');
    const token = new ethers.Contract(tokencasinoAddress, tokencasinoAbi, signer);
    const tx = await token.approve(casinointegradorAddress, ethers.MaxUint256);
    await tx.wait();
  };

  return (
    <CasinoMockContext.Provider
      value={{
        ...state,
        setSelectedNumber,
        setBetAmount,
        setBuyAmount,
        setSellAmount,
        mockBuy,
        mockSell,
        mockPlaceBet,
        mockReset,
        mockTickPlayers,
        approveTokens,
      }}
    >
      {children}
    </CasinoMockContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCasinoMock(): CasinoMockContextType {
  const ctx = useContext(CasinoMockContext);
  if (!ctx) {
    throw new Error('useCasinoMock must be used inside a <CasinoMockProvider>');
  }
  return ctx;
}
