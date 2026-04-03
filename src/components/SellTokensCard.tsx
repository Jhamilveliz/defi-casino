'use client';
import React, { useState, useEffect } from 'react';
import { useCasinoMock } from '@/context/CasinoMockContext';
import { useWallet } from '@/context/WalletContext';
import ConnectWall from '@/components/ConnectWall';

export default function SellTokensCard() {
  const {
    userBalanceETH,
    userBalanceCSNO,
    tokenPrice,
    sellAmount,
    setSellAmount,
    mockSell,
  } = useCasinoMock();

  const { isConnected } = useWallet();
  const [isSelling, setIsSelling] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const parsedSell  = parseFloat(sellAmount);
  const parsedCSNO  = parseFloat(userBalanceCSNO);
  const parsedPrice = parseFloat(tokenPrice);

  const isValid = !isNaN(parsedSell) && parsedSell > 0 && parsedSell <= parsedCSNO;

  const ethPreview =
    !isNaN(parsedSell) && parsedSell > 0 && parsedPrice > 0
      ? (parsedSell * parsedPrice).toFixed(6)
      : '0.000000';

  const handleSell = () => {
    if (!isValid || isSelling) return;
    const csnoSold = parsedSell.toFixed(2);
    setIsSelling(true);
    setTimeout(() => {
      mockSell();
      setIsSelling(false);
      setToast({ msg: `✓ Vendiste ${csnoSold} CSNO → ${ethPreview} ETH`, type: 'success' });
    }, 1200);
  };

  return (
    <div className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:border-red-500/20 transition-all duration-500">

      {/* Wallet guard */}
      {!isConnected && <ConnectWall label="para vender tokens" />}

      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-28 h-28 bg-red-900/5 blur-3xl rounded-full group-hover:bg-red-900/15 transition-all duration-500 pointer-events-none" />

      {/* Toast */}
      <div className={`absolute top-3 left-3 right-3 z-50 transition-all duration-300 ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        <div className={`px-3 py-2 rounded-xl text-[11px] font-black tracking-wide border flex items-center gap-2 ${
          toast?.type === 'success'
            ? 'bg-red-900/20 text-red-300 border-red-500/30 shadow-[0_0_16px_rgba(255,26,26,0.2)]'
            : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a]'
        }`}>
          {toast?.msg}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-3 relative z-10">

        {/* Header */}
        <h2 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2 group-hover:text-red-300 transition-colors duration-300">
          <span className="text-red-400 text-base">↑</span>
          Vender Token
        </h2>

        {/* Balances row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2">
            <p className="text-[9px] text-gray-700 uppercase tracking-widest font-black mb-0.5">Balance CSNO</p>
            <p className="text-sm font-black text-red-400 truncate">{parsedCSNO.toFixed(2)}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2">
            <p className="text-[9px] text-gray-700 uppercase tracking-widest font-black mb-0.5">Balance ETH</p>
            <p className="text-sm font-black text-white truncate">{parseFloat(userBalanceETH).toFixed(4)}</p>
          </div>
        </div>

        {/* CSNO input — touch-friendly py-3 */}
        <div className={`flex bg-[#0a0a0a] rounded-xl border transition-colors duration-200 ${
          sellAmount && !isValid ? 'border-red-700/70' : 'border-[#1f1f1f] focus-within:border-red-400/40'
        }`}>
          <input
            id="sell-csno-input"
            type="number"
            min="0"
            step="1"
            placeholder="Monto CSNO"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            disabled={isSelling}
            className="w-full bg-transparent text-white outline-none pl-3 py-3 text-sm disabled:opacity-40 placeholder:text-gray-700"
          />
          <div className="text-[10px] bg-[#1f1f1f] text-gray-400 font-black px-3 rounded-r-xl flex items-center border-l border-[#1a1a1a] shrink-0">
            CSNO
          </div>
        </div>

        {/* Inline error */}
        {sellAmount && !isValid && (
          <span className="text-[10px] text-red-500 font-bold -mt-1">
            {parsedSell > parsedCSNO ? 'Saldo CSNO insuficiente' : 'Monto inválido'}
          </span>
        )}

        {/* ETH preview */}
        <div className="text-[10px] text-gray-600 flex justify-between bg-[#0a0a0a] px-3 py-2 rounded-lg border border-[#1f1f1f]">
          <span>Recibes</span>
          <strong className="text-red-300 font-black truncate ml-2">{ethPreview} ETH</strong>
        </div>

        {/* Price info */}
        <p className="text-[9px] text-gray-700 text-right font-black uppercase tracking-widest">
          1 CSNO = {tokenPrice} ETH
        </p>
      </div>

      {/* Sell button — min-h [44px] for touch */}
      <button
        id="sell-tokens-btn"
        onClick={handleSell}
        disabled={!isValid || !isConnected || isSelling}
        className={`w-full min-h-[44px] text-sm font-black rounded-xl transition-all relative z-10 flex justify-center items-center gap-2 border ${
          isValid && !isSelling
            ? 'bg-[#1f1f1f] text-red-400 border-red-500/40 hover:bg-red-900/30 hover:border-red-500/70 hover:shadow-[0_0_14px_rgba(255,26,26,0.3)] active:scale-[0.98]'
            : isSelling
            ? 'bg-[#1a1a1a] text-red-600 border-red-900/30 cursor-wait'
            : 'bg-[#1a1a1a] text-gray-600 border-[#1f1f1f] cursor-not-allowed'
        }`}
      >
        {isSelling && <span className="animate-spin h-3.5 w-3.5 border-2 border-red-400 rounded-full border-t-transparent" />}
        {isSelling ? 'Procesando...' : 'Vender CSNO'}
      </button>
    </div>
  );
}
