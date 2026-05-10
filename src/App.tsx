import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Game from './pages/Game';
import LeaderboardPage from './pages/Leaderboard';
import DocsPage from './pages/Docs';

import '@solana/wallet-adapter-react-ui/styles.css';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';

const App = () => {
  // Wallet Standard (v0.15+) auto-detects any installed wallet (Phantom, Backpack, OKX, etc.)
  // Solflare is listed explicitly for its mobile deeplink SDK which predates the Standard.
  const wallets = useMemo(
    () => [new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<Game />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
