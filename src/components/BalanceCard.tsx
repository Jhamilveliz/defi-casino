'use client';
import React from 'react';
import { useCasinoMock } from '@/context/CasinoMockContext';
import { useWallet }     from '@/context/WalletContext';

export default function BalanceCard() {
  const { userBalanceETH, userBalanceCSNO, tokenPrice } = useCasinoMock();
  const { isConnected } = useWallet();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Balance</p>

      {!isConnected ? (
        <p className="text-base text-gray-500 italic">Conectá tu wallet para ver tu balance</p>
      ) : (
        <>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">ETH</p>
              <p className="text-3xl font-black text-white tabular-nums leading-none">
                {parseFloat(userBalanceETH).toFixed(4)}
              </p>
            </div>
            <div className="w-px h-12 bg-gray-700" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">CSNO</p>
              <p className="text-3xl font-black text-red-400 tabular-nums leading-none">
                {parseFloat(userBalanceCSNO).toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4 pt-3 border-t border-gray-700">
            Precio token: 1 CSNO = {tokenPrice} ETH
          </p>
        </>
      )}
    </div>
  );
}
