'use client';
import Navbar       from '@/components/Navbar';
import BalanceCard  from '@/components/BalanceCard';
import RouletteCard from '@/components/RouletteCard';
import TradePanel   from '@/components/TradePanel';

/**
 * Layout:
 * - w-full: ancho completo de pantalla
 * - min-h-screen: crece con el contenido (scroll natural del body)
 * - Desktop: 2 columnas (izquierda: ruleta | derecha: balance + trade)
 * - Mobile:  1 columna  (balance → ruleta → trade)
 */
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">

      {/* Navbar — no sticky, scrollea con la página */}
      <header className="w-full border-b border-gray-800 bg-gray-900 px-4 md:px-8 py-3">
        <Navbar />
      </header>

      {/* Contenido */}
      <main className="px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Columna izquierda: ruleta (orden 2° en mobile) */}
          <div className="order-2 lg:order-1">
            <RouletteCard />
          </div>

          {/* Columna derecha: balance + trade (orden 1° en mobile) */}
          <div className="order-1 lg:order-2 flex flex-col gap-6">
            <BalanceCard />
            <TradePanel />
          </div>

        </div>
      </main>

    </div>
  );
}
