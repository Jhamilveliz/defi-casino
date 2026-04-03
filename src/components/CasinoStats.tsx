'use client';
import React, { useEffect, useState } from 'react';
import { useCasinoMock } from '@/context/CasinoMockContext';

const ETH_USD = 3000;

export default function CasinoStats() {
  const {
    activePlayers,
    totalBet,
    jackpot,
    tokenPrice,
    mockReset,
    mockTickPlayers,
  } = useCasinoMock();

  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Tick player count every 4 s to simulate live activity
  useEffect(() => {
    const id = setInterval(() => mockTickPlayers(), 4000);
    return () => clearInterval(id);
  }, [mockTickPlayers]);

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => {
      mockReset();
      setResetting(false);
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }, 700);
  };

  const csnoPriceUSD = parseFloat(tokenPrice) * ETH_USD;
  const jackpotNum   = parseFloat(jackpot);
  const totalBetNum  = parseFloat(totalBet);

  return (
    <div className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">

      {/* Background radial glow */}
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-900/8 rounded-full blur-2xl pointer-events-none" />

      {/* ── Header: badge + reset ── */}
      <div className="relative z-10 flex items-center justify-between mb-4">

        {/* "Casino activo" badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            {/* Outer pulse ring */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400 shadow-[0_0_8px_#4ade80]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
            Modo casino activo
          </span>
        </div>

        {/* Reset demo button */}
        <button
          id="reset-demo-btn"
          onClick={handleReset}
          disabled={resetting}
          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-200
            ${resetting
              ? 'text-yellow-500 border-yellow-700/40 bg-yellow-900/10 cursor-wait'
              : resetDone
                ? 'text-green-400 border-green-500/40 bg-green-900/10'
                : 'text-gray-500 border-[#2a2a2a] hover:text-yellow-400 hover:border-yellow-500/40 hover:bg-yellow-900/10 active:scale-95'
            }`}
        >
          <span className={resetting ? 'animate-spin inline-block' : 'inline-block'}>↺</span>
          {resetting ? 'Reiniciando…' : resetDone ? '✓ Reiniciado' : 'Reset Demo'}
        </button>
      </div>

      {/* ── Stats grid ── */}
      <div className="relative z-10 grid grid-cols-3 gap-2">

        {/* Active players — updates every 4 s */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-3 flex flex-col gap-1 group">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_#4ade80]" />
            <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Jugadores</span>
          </div>
          <span className="text-xl font-black text-white tabular-nums">
            {activePlayers.toLocaleString('es-AR')}
          </span>
          <span className="text-[9px] text-gray-700 font-bold">en línea ahora</span>
        </div>

        {/* Total bet */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Total Apostado</span>
          <span className="text-xl font-black text-red-400 tabular-nums">
            {totalBetNum >= 1000
              ? `${(totalBetNum / 1000).toFixed(1)}K`
              : totalBetNum.toFixed(0)}
          </span>
          <span className="text-[9px] text-gray-700 font-bold">
            CSNO · ≈${(totalBetNum * csnoPriceUSD).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Jackpot */}
        <div className="bg-[#111] border border-red-900/30 rounded-xl p-3 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/8 to-transparent pointer-events-none" />
          <span className="text-[9px] text-red-700 font-black uppercase tracking-widest relative z-10">🏆 Jackpot</span>
          <span className="text-xl font-black text-red-300 tabular-nums relative z-10">
            {jackpotNum.toFixed(3)} ETH
          </span>
          <span className="text-[9px] text-gray-700 font-bold relative z-10">
            ≈ ${(jackpotNum * ETH_USD).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
          </span>
        </div>
      </div>

      {/* ── LIVE ticker bar ── */}
      <div className="relative z-10 mt-3 pt-3 border-t border-[#1a1a1a] flex items-center gap-2 overflow-hidden">
        <span className="shrink-0 text-[9px] font-black text-gray-700 uppercase tracking-widest">Live</span>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-6 animate-[marquee_18s_linear_infinite] whitespace-nowrap">
            {[
              `🎡 Ruleta — ${activePlayers.toLocaleString('es-AR')} jugadores activos`,
              `💰 Jackpot — ${jackpotNum.toFixed(4)} ETH`,
              `📊 Total apostado — ${totalBetNum.toLocaleString('es-AR')} CSNO`,
              `💎 1 CSNO = ${tokenPrice} ETH · $${csnoPriceUSD.toFixed(4)} USD`,
            ].map((t, i) => (
              <span key={i} className="text-[9px] text-gray-600 font-bold">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
