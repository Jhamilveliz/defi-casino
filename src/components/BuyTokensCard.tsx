'use client';
import React, { useState, useEffect } from 'react';
import { useCasinoMock } from '@/context/CasinoMockContext';
import { useWallet } from '@/context/WalletContext';
import ConnectWall from '@/components/ConnectWall';

export default function BuyTokensCard() {
  const {
    userBalanceETH,
    userBalanceCSNO,
    tokenPrice,
    buyAmount,
    setBuyAmount,
    mockBuy,
  } = useCasinoMock();

  const { isConnected } = useWallet();
  const [isBuying, setIsBuying] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const parsedBuy   = parseFloat(buyAmount);
  const parsedETH   = parseFloat(userBalanceETH);
  const parsedPrice = parseFloat(tokenPrice);

  const isValid = !isNaN(parsedBuy) && parsedBuy > 0 && parsedBuy <= parsedETH;

  const csnoPreview =
    !isNaN(parsedBuy) && parsedBuy > 0 && parsedPrice > 0
      ? (parsedBuy / parsedPrice).toFixed(2)
      : '0.00';

  const handleBuy = () => {
    if (!isValid || isBuying) return;
    setIsBuying(true);
    setTimeout(() => {
      mockBuy();
      setIsBuying(false);
      setToast({ msg: `✓ Compraste ${csnoPreview} CSNO`, type: 'success' });
    }, 1200);
  };

  return (
    <div className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">

      {/* Wallet guard */}
      {!isConnected && <ConnectWall label="para comprar tokens" />}

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/5 blur-3xl rounded-full group-hover:bg-red-600/15 transition-all duration-500 pointer-events-none" />

      {/* Toast */}
      <div
        className={`absolute top-3 left-3 right-3 z-50 transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className={`px-3 py-2 rounded-xl text-[11px] font-black tracking-wide border flex items-center gap-2 ${
          toast?.type === 'success'
            ? 'bg-red-600/20 text-red-300 border-red-500/40 shadow-[0_0_16px_rgba(255,26,26,0.25)]'
            : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a]'
        }`}>
          {toast?.msg}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-3 relative z-10">

        {/* Header */}
        <h2 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2 group-hover:text-red-400 transition-colors duration-300">
          <span className="text-red-500 text-base">↓</span>
          Comprar Token
        </h2>

        {/* Balances row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2">
            <p className="text-[9px] text-gray-700 uppercase tracking-widest font-black mb-0.5">Balance ETH</p>
            <p className="text-sm font-black text-white truncate">{parseFloat(userBalanceETH).toFixed(4)}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2">
            <p className="text-[9px] text-gray-700 uppercase tracking-widest font-black mb-0.5">Balance CSNO</p>
            <p className="text-sm font-black text-red-400 truncate">{parseFloat(userBalanceCSNO).toFixed(2)}</p>
          </div>
        </div>

        {/* ETH input — min-h for touch */}
        <div className={`flex bg-[#0a0a0a] rounded-xl border transition-colors duration-200 ${
          buyAmount && !isValid ? 'border-red-700/70' : 'border-[#1f1f1f] focus-within:border-red-500/50'
        }`}>
          <input
            id="buy-eth-input"
            type="number"
            min="0"
            step="0.001"
            placeholder="Monto ETH"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            disabled={isBuying}
            className="w-full bg-transparent text-white outline-none pl-3 py-3 text-sm disabled:opacity-40 placeholder:text-gray-700"
          />
          <div className="text-[10px] bg-[#1f1f1f] text-gray-400 font-black px-3 rounded-r-xl flex items-center border-l border-[#1a1a1a] shrink-0">
            ETH
          </div>
        </div>

        {/* Inline error */}
        {buyAmount && !isValid && (
          <span className="text-[10px] text-red-500 font-bold -mt-1">
            {parseFloat(buyAmount) > parsedETH ? 'Saldo ETH insuficiente' : 'Monto inválido'}
          </span>
        )}

        {/* CSNO preview */}
        <div className="text-[10px] text-gray-600 flex justify-between bg-[#0a0a0a] px-3 py-2 rounded-lg border border-[#1f1f1f]">
          <span>Recibes</span>
          <strong className="text-red-400 font-black truncate ml-2">{csnoPreview} CSNO</strong>
        </div>

        {/* Price info */}
        <p className="text-[9px] text-gray-700 text-right font-black uppercase tracking-widest">
          1 CSNO = {tokenPrice} ETH
        </p>
      </div>

      {/* Buy button — min-h [44px] for touch */}
      <button
        id="buy-tokens-btn"
        onClick={handleBuy}
        disabled={!isValid || !isConnected || isBuying}
        className={`w-full min-h-[44px] text-sm font-black rounded-xl transition-all relative z-10 flex justify-center items-center gap-2 border ${
          isValid && !isBuying
            ? 'bg-red-600 text-white border-red-500 hover:bg-red-500 hover:shadow-[0_0_18px_rgba(255,26,26,0.5)] active:scale-[0.98]'
            : isBuying
            ? 'bg-red-700/40 text-red-400 border-red-700/30 cursor-wait'
            : 'bg-[#1a1a1a] text-gray-600 border-[#1f1f1f] cursor-not-allowed'
        }`}
      >
        {isBuying && <span className="animate-spin h-3.5 w-3.5 border-2 border-white rounded-full border-t-transparent" />}
        {isBuying ? 'Procesando...' : 'Comprar CSNO'}
      </button>
    </div>
  );
}
