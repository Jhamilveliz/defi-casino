'use client';
import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import WalletPickerModal from '@/components/WalletPickerModal';

export default function Navbar() {
  const { address, isConnecting, connectionError } = useWallet();
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

      {/* Conectar wallet */}
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

      {connectionError && !address && (
        <p className="text-xs text-red-400 sm:max-w-md sm:text-right" role="alert">
          {connectionError}
        </p>
      )}

      <WalletPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </nav>
  );
}
