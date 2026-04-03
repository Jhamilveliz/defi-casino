'use client';
import React, { useState } from 'react';
import { useCasinoMock } from '@/context/CasinoMockContext';
import { useWallet }     from '@/context/WalletContext';

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

export default function RouletteCard() {
  const {
    userBalanceCSNO, selectedNumber, betAmount,
    lastBetResult, lastWinAmount,
    setSelectedNumber, setBetAmount, mockPlaceBet,
  } = useCasinoMock();

  const { isConnected } = useWallet();
  const [spinning, setSpinning] = useState(false);
  const [angle,    setAngle]    = useState(0);

  const bet      = parseFloat(betAmount);
  const csno     = parseFloat(userBalanceCSNO);
  const validBet = !isNaN(bet) && bet > 0 && bet <= csno;
  const canBet   = isConnected && selectedNumber !== null && validBet && !spinning;

  const spin = () => {
    const run = async () => {
      if (!canBet) return;
      setSpinning(true);
      setAngle((a) => a + 360 * (5 + Math.floor(Math.random() * 5)));
      try {
        await mockPlaceBet();
      } finally {
        setSpinning(false);
      }
    };
    void run();
  };

  return (
    <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-6 flex flex-col gap-6">

      {/* Aviso wallet */}
      {!isConnected && (
        <p className="text-sm text-gray-500 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
          Conectá tu wallet para jugar
        </p>
      )}

      {/* ── Rueda + estado ── */}
      <div className="flex items-center gap-5">
        <div className="w-24 h-24 shrink-0 rounded-full border-4 border-red-900/50 bg-black flex items-center justify-center relative">
          <div
            className="absolute inset-2 border-2 border-dashed rounded-full"
            style={{
              transform:  `rotate(${angle}deg)`,
              transition: spinning ? 'transform 1.6s cubic-bezier(0.17,0.67,0.12,1)' : 'none',
              borderColor: spinning            ? '#b91c1c'
                : lastBetResult === 'win'  ? '#4ade80'
                : lastBetResult === 'lose' ? '#9f1239'
                : '#374151',
            }}
          />
          <span className={[
            'text-4xl font-black z-10',
            spinning            ? 'text-red-500'
            : lastBetResult === 'win'  ? 'text-green-400'
            : lastBetResult === 'lose' ? 'text-red-500'
            : selectedNumber           ? 'text-white'
            : 'text-gray-700',
          ].join(' ')}>
            {spinning ? '·' : (selectedNumber ?? '—')}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base text-gray-300 font-medium">
            {spinning         ? 'Girando...'
            : selectedNumber  ? `Número seleccionado: ${selectedNumber}`
            : 'Elegí un número del 1 al 36'}
          </p>
          {lastBetResult !== null && !spinning && (
            <p className={`text-sm font-bold ${lastBetResult === 'win' ? 'text-green-400' : 'text-red-400'}`}>
              {lastBetResult === 'win'
                ? `Ganaste +${lastWinAmount} CSNO`
                : `Perdiste ${betAmount} CSNO`}
            </p>
          )}
        </div>
      </div>

      {/* ── Grid de números ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">1 – 36</span>
          <button
            id="random-number-btn"
            onClick={() => setSelectedNumber(Math.floor(Math.random() * 36) + 1)}
            disabled={spinning}
            className="text-xs text-gray-500 border border-gray-700 rounded-lg px-3 py-1 hover:text-white hover:border-gray-500 disabled:opacity-30 transition-colors"
          >
            Número aleatorio
          </button>
        </div>

        {/*
          Botones grandes y circulares:
          w-12 h-12 mobile → w-14 h-14 sm → responsive
          grid-cols-4 → sm:5 → md:6 → lg:9
          gap-3
        */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
            const red = RED.has(num);
            const sel = selectedNumber === num;
            return (
              <button
                key={num}
                id={`num-btn-${num}`}
                onClick={() => setSelectedNumber(sel ? null : num)}
                disabled={spinning}
                className={[
                  'w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold text-base sm:text-lg',
                  'flex items-center justify-center mx-auto',
                  'transition-all duration-100 disabled:opacity-25',
                  sel ? 'ring-2 ring-yellow-500 scale-110' : '',
                  red
                    ? sel ? 'bg-red-700 text-white'
                          : 'bg-red-900 text-red-300 hover:bg-red-700 hover:text-white'
                    : sel ? 'bg-gray-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-600 hover:text-white',
                ].join(' ')}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Input apuesta ── */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex justify-between mb-2">
          <span>Monto a apostar (CSNO)</span>
          {betAmount && !validBet && (
            <span className="text-red-400 normal-case font-normal">
              {bet > csno ? 'Saldo insuficiente' : 'Monto inválido'}
            </span>
          )}
        </label>
        <div className={[
          'flex rounded-xl border-2 overflow-hidden',
          betAmount && !validBet ? 'border-red-600' : 'border-gray-700 focus-within:border-red-700',
        ].join(' ')}>
          <input
            id="bet-amount-input"
            type="number" min="0" step="1" placeholder="100"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            disabled={spinning}
            className="flex-1 px-4 py-3 text-base bg-black text-white outline-none placeholder:text-gray-700 disabled:opacity-50"
          />
          <span className="px-4 bg-gray-800 text-gray-400 text-sm font-bold flex items-center">CSNO</span>
        </div>
        <p className="text-xs text-gray-600 mt-1 text-right">
          Disponible: {csno.toFixed(2)} CSNO
        </p>
      </div>

      {/* ── Botón APOSTAR ── */}
      <button
        id="spin-btn"
        onClick={spin}
        disabled={!canBet}
        className={[
          'w-full py-3 rounded-xl font-black text-base uppercase tracking-widest',
          'flex items-center justify-center gap-3 transition-colors',
          canBet
            ? 'bg-red-700 hover:bg-red-600 text-white active:scale-[0.98]'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed',
        ].join(' ')}
      >
        {spinning ? (
          <>
            <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
            Girando...
          </>
        ) : 'Apostar'}
      </button>

      {/* Ayuda contextual */}
      {!canBet && !spinning && (
        <p className="text-center text-sm text-gray-600 -mt-3">
          {!isConnected ? 'Conectá tu wallet'
            : selectedNumber === null ? 'Elegí un número'
            : !validBet ? 'Ingresá un monto válido'
            : ''}
        </p>
      )}
    </div>
  );
}