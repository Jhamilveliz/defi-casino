'use client';
import React, { useState } from 'react';
import { useCasinoMock } from '@/context/CasinoMockContext';
import { useWallet }     from '@/context/WalletContext';

export default function BalanceCard() {
  const { userBalanceETH, userBalanceCSNO, tokenPrice, approveTokens } = useCasinoMock();
  const { isConnected } = useWallet();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveTokens();
      alert('Tokens aprobados exitosamente!');
    } catch (error) {
      console.error(error);
      alert('Error al aprobar tokens');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 relative flex flex-col justify-center min-h-[160px]">
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Balance</p>
      </div>

      {!isConnected ? (
        <p className="text-base text-gray-500 italic">Conectá tu wallet para ver tu balance</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0">
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
            
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="cursor-pointer text-sm bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-red-500/20 active:scale-95 whitespace-nowrap"
            >
              {isApproving ? 'Aprobando...' : 'Aprobar CSNO'}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-4 pt-3 border-t border-gray-700">
            Precio token: 1 CSNO = {tokenPrice} ETH
          </p>
        </>
      )}
    </div>
  );
}
