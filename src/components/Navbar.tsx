'use client';
import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useCasinoMock } from '@/context/CasinoMockContext';
import WalletPickerModal from '@/components/WalletPickerModal';

export default function Navbar() {
  const { address, isConnecting, connectionError } = useWallet();
  const { isMuted, setIsMuted } = useCasinoMock();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <nav className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-sm">B</span>
        </div>
        <span className="font-black text-xl text-white tracking-wide">BitBet</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          )}
        </button>

        <button
          id="connect-wallet-btn"
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={isConnecting || address !== null}
          className={[
            'flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-colors',
            address
              ? 'bg-gray-800 text-red-400 border border-red-900/60 cursor-default'
              : isConnecting
                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-wait'
                : 'bg-red-700 hover:bg-red-600 text-white',
          ].join(' ')}
        >
          {isConnecting && (
            <span className="animate-spin h-3.5 w-3.5 border-2 border-white/60 rounded-full border-t-transparent" />
          )}
          <span className="truncate max-w-[180px]">
            {address
              ? `${address.slice(0, 6)}…${address.slice(-4)}`
              : isConnecting ? 'Conectando…' : 'Conectar Wallet'}
          </span>
        </button>
      </div>

      {connectionError && !address && (
        <p className="text-xs text-red-400 sm:max-w-md sm:text-right" role="alert">
          {connectionError}
        </p>
      )}

      <WalletPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </nav>
  );
}
