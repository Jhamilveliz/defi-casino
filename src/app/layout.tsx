import type { Metadata } from 'next';
import { WalletProvider }     from '@/context/WalletContext';
import { CasinoMockProvider } from '@/context/CasinoMockContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'BitBet — Casino DeFi',
  description: 'Casino descentralizado con ruleta europea. Conecta tu wallet, compra tokens CSNO y apuesta.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Sin overflow-hidden, sin h-screen — el body crece con el contenido */}
      <body style={{ margin: 0, padding: 0, backgroundColor: '#111827' }}>
        <WalletProvider>
          <CasinoMockProvider>
            {children}
          </CasinoMockProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
