'use client';
import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import WalletPickerModal from '@/components/WalletPickerModal';

/**
 * Overlay shown inside a card when the wallet is not connected.
 * Renders a semi-transparent lock screen — the parent layout stays visible beneath.
 */
export default function ConnectWall({ label = 'para continuar' }: { label?: string }) {
  const { isConnecting, connectionError } = useWallet();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#0d0d0d]/80 backdrop-blur-sm">
      {/* Lock icon */}
      <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-3 shadow-lg">
        <span className="text-2xl">🔒</span>
      </div>

      <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-4 px-6">
        Conectá tu wallet<br />
        <span className="text-gray-600 normal-case font-bold">{label}</span>
      </p>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        disabled={isConnecting}
        className={`px-5 py-2 rounded-xl text-sm font-black border transition-all duration-200 flex items-center gap-2
          ${isConnecting
            ? 'bg-[#1a1a1a] text-gray-500 border-gray-700 cursor-wait'
            : 'bg-red-600 text-white border-red-500 hover:bg-red-500 hover:shadow-[0_0_18px_rgba(255,26,26,0.5)] active:scale-95'
          }`}
      >
        {isConnecting && (
          <span className="animate-spin h-3.5 w-3.5 border-2 border-white rounded-full border-t-transparent" />
        )}
        {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
      </button>

      {connectionError && (
        <p className="mt-3 max-w-[260px] text-center text-[11px] font-bold leading-snug text-red-400" role="alert">
          {connectionError}
        </p>
      )}

      <WalletPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
