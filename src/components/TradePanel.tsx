'use client';
import React, { useState, useEffect } from 'react';
import { useCasinoMock } from '@/context/CasinoMockContext';
import { useWallet }     from '@/context/WalletContext';

export default function TradePanel() {
  const {
    userBalanceETH, userBalanceCSNO, tokenPrice,
    buyAmount, sellAmount,
    setBuyAmount, setSellAmount,
    mockBuy, mockSell,
  } = useCasinoMock();

  const { isConnected } = useWallet();
  const [busyBuy,  setBusyBuy]  = useState(false);
  const [busySell, setBusySell] = useState(false);
  const [toast,    setToast]    = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const ethBal  = parseFloat(userBalanceETH);
  const csnoBal = parseFloat(userBalanceCSNO);
  const price   = parseFloat(tokenPrice);

  const buyN    = parseFloat(buyAmount);
  const buyOk   = !isNaN(buyN) && buyN > 0 && buyN <= ethBal;
  const buyPrev = buyOk ? (buyN / price).toFixed(2) : '—';

  const sellN    = parseFloat(sellAmount);
  const sellOk   = !isNaN(sellN) && sellN > 0 && sellN <= csnoBal;
  const sellPrev = sellOk ? (sellN * price).toFixed(6) : '—';

  const doBuy = () => {
    const run = async () => {
      if (!buyOk || busyBuy) return;
      setBusyBuy(true);
      try {
        const { tokensRecibidos } = await mockBuy();
        setToast(`Compraste ${tokensRecibidos} CSNO`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al comprar tokens';
        setToast(msg);
      } finally {
        setBusyBuy(false);
      }
    };
    void run();
  };

  const doSell = () => {
    const run = async () => {
      if (!sellOk || busySell) return;
      setBusySell(true);
      try {
        const { ethRecibido } = await mockSell();
        setToast(`Vendiste ${sellAmount} CSNO → ${ethRecibido} ETH`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al vender tokens';
        setToast(msg);
      } finally {
        setBusySell(false);
      }
    };
    void run();
  };

  const wrap = (inv: boolean) =>
    ['flex rounded-xl border-2 overflow-hidden',
     inv ? 'border-red-600' : 'border-gray-700 focus-within:border-red-700'].join(' ');

  const inputCls = 'flex-1 px-4 py-3 text-base bg-gray-900 text-white outline-none placeholder:text-gray-600 disabled:opacity-50';
  const tagCls   = 'px-4 bg-gray-800 text-gray-400 text-sm font-bold flex items-center';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col gap-6">

      {/* Toast */}
      {toast && (
        <p className="text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2">
          {toast}
        </p>
      )}

      {!isConnected ? (
        <p className="text-base text-gray-500 italic">Conectá tu wallet para operar tokens</p>
      ) : (
        <>
          {/* COMPRAR */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Comprar CSNO</p>
              <p className="text-xs text-gray-600">
                Disponible: <span className="text-gray-300">{ethBal.toFixed(4)} ETH</span>
              </p>
            </div>
            <div className={wrap(!!buyAmount && !buyOk)}>
              <input
                id="buy-eth-input"
                type="number" min="0" step="0.001" placeholder="0.00"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                disabled={busyBuy}
                className={inputCls}
              />
              <span className={tagCls}>ETH</span>
            </div>
            <p className="text-sm text-gray-500">
              Recibes: <span className="text-white font-semibold">{buyPrev} CSNO</span>
            </p>
            <button
              id="buy-tokens-btn"
              onClick={doBuy}
              disabled={!buyOk || busyBuy}
              className={[
                'w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors',
                buyOk && !busyBuy
                  ? 'bg-red-800 hover:bg-red-700 text-white active:scale-[0.98]'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed',
              ].join(' ')}
            >
              {busyBuy && <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />}
              {busyBuy ? 'Procesando…' : 'Comprar'}
            </button>
          </section>

          <div className="border-t border-gray-700" />

          {/* VENDER */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vender CSNO</p>
              <p className="text-xs text-gray-600">
                Disponible: <span className="text-red-400">{csnoBal.toFixed(2)} CSNO</span>
              </p>
            </div>
            <div className={wrap(!!sellAmount && !sellOk)}>
              <input
                id="sell-csno-input"
                type="number" min="0" step="1" placeholder="0"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                disabled={busySell}
                className={inputCls}
              />
              <span className={tagCls}>CSNO</span>
            </div>
            <p className="text-sm text-gray-500">
              Recibes: <span className="text-white font-semibold">{sellPrev} ETH</span>
            </p>
            <button
              id="sell-tokens-btn"
              onClick={doSell}
              disabled={!sellOk || busySell}
              className={[
                'w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors',
                sellOk && !busySell
                  ? 'bg-gray-600 hover:bg-gray-500 text-white active:scale-[0.98]'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed',
              ].join(' ')}
            >
              {busySell && <span className="animate-spin h-4 w-4 border-2 border-gray-300 rounded-full border-t-transparent" />}
              {busySell ? 'Procesando…' : 'Vender'}
            </button>
          </section>
        </>
      )}
    </div>
  );
}
