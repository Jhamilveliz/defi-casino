'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { discoverWallets, type WalletOption } from '@/lib/walletDiscovery';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function WalletPickerModal({ open, onClose }: Props) {
  const { connectWithProvider, isConnecting, connectionError } = useWallet();
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setWallets([]);
    void discoverWallets().then((list) => {
      if (!cancelled) {
        setWallets(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const handlePick = async (w: WalletOption) => {
    const ok = await connectWithProvider(w.provider);
    if (ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-picker-title"
      onClick={(e) => e.target === e.currentTarget && !isConnecting && onClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => !isConnecting && onClose()}
          className="absolute right-4 top-4 text-2xl leading-none text-gray-500 hover:text-white"
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2 id="wallet-picker-title" className="mb-1 text-lg font-black text-white">
          Elegí una billetera
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          Se abrirá la extensión que elijas. Después confirmá la red Sepolia si te lo pide.
        </p>

        {connectionError && (
          <p className="mb-4 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300" role="alert">
            {connectionError}
          </p>
        )}

        {loading && (
          <p className="py-8 text-center text-sm text-gray-400">Buscando billeteras…</p>
        )}

        {!loading && wallets.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            No se detectó ninguna billetera. Instalá MetaMask, Rabby, Coinbase Wallet, etc., y recargá la página.
          </p>
        )}

        <ul className="flex max-h-[min(60vh,420px)] flex-col gap-2 overflow-y-auto">
          {wallets.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                disabled={isConnecting}
                onClick={() => void handlePick(w)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-3 text-left transition hover:border-red-600/50 hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
              >
                {w.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.icon} alt="" className="h-10 w-10 shrink-0 rounded-xl bg-white/5 object-contain" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-700 text-lg font-black text-red-400">
                    {w.name.slice(0, 1)}
                  </div>
                )}
                <span className="font-bold text-white">{w.name}</span>
                {isConnecting && (
                  <span className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
