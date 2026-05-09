import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Users, Loader2, Wallet } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGame, GameProvider } from '../store/game-store';
import { streamPrice, fetchLatestPrice } from '../lib/pyth';
import { ASSET_NAMES } from '../lib/constants';
import MatchLobby from '../components/game/MatchLobby';
import CardHand from '../components/game/CardHand';
import BattleView from '../components/game/BattleView';
import SettleView from '../components/game/SettleView';
import ResultView from '../components/game/ResultView';
import Navbar from '../components/Navbar';

function WaitingForOpponent() {
  const { state, dispatch } = useGame();
  const match = state.match!;
  const { publicKey } = useWallet();

  function shortAddr(addr: string) { return addr.slice(0, 4) + '…' + addr.slice(-4); }

  // Poll until opponent joins
  useEffect(() => {
    const interval = setInterval(() => {
      // In a full implementation this polls the match account
      // For the demo, the creator clicks "Check for opponent"
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const blinksUrl = match
    ? `https://cypher.sol/api/actions/challenge?matchId=${match.matchId}&stake=${match.stakeSOL}&asset=${ASSET_NAMES[match.asset]}`
    : '';

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="brutal-section-label mb-1">MATCH #{match.matchId.toString()} · {ASSET_NAMES[match.asset]}/USD</p>
          <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '2.4rem', fontWeight: 800, color: '#111' }}>
            Waiting for Opponent
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="brutal-card p-8 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-2 border-[#C8FF00] animate-ping opacity-30" />
              <div className="absolute inset-0 border-2 border-[#111] flex items-center justify-center bg-[#C8FF00]">
                <Users className="w-8 h-8 text-[#111]" />
              </div>
            </div>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', fontWeight: 800, color: '#111' }}>
              Seeking Challenger…
            </p>
            <p className="text-sm text-[#555] font-mono">
              Stake: <span className="font-bold text-[#111]">{match.stakeSOL} SOL</span> · Asset: <span className="font-bold text-[#111]">{ASSET_NAMES[match.asset]}/USD</span>
            </p>
          </div>
        </motion.div>

        {/* Share link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="brutal-card p-5 space-y-3">
            <p className="brutal-section-label">SHARE YOUR CHALLENGE BLINK</p>
            <div className="flex gap-2">
              <input readOnly value={blinksUrl} className="brutal-input flex-1 text-xs truncate" />
              <button onClick={() => { navigator.clipboard.writeText(blinksUrl); }} className="brutal-btn px-4 py-2 text-xs">
                COPY
              </button>
            </div>
            <p className="text-xs text-[#666] font-mono">Paste on X to get a Blink card. Anyone can accept with one click.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => dispatch({ type: 'SET_PHASE', phase: 'DRAFT' })} className="brutal-btn py-3 text-xs">
            SIMULATE OPPONENT JOINED
          </button>
          <button onClick={() => dispatch({ type: 'RESET' })} className="brutal-btn-ghost py-3 text-xs">
            CANCEL MATCH
          </button>
        </div>
      </div>
    </div>
  );
}

function WaitingForReveal() {
  const { state, dispatch } = useGame();
  const match = state.match!;

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="brutal-card p-10 text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#111] mx-auto animate-spin" />
          <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 800, color: '#111' }}>
            Waiting for Opponent's Reveal
          </h1>
          <p className="text-sm text-[#666] font-mono">Both players must reveal before settlement. Opponent has 120 seconds.</p>
          <button onClick={() => dispatch({ type: 'SET_PHASE', phase: 'SETTLE' })} className="brutal-btn px-8 py-3 text-xs">
            PROCEED TO SETTLE (DEMO)
          </button>
        </div>
      </div>
    </div>
  );
}

function GameInner() {
  const { state, dispatch } = useGame();
  const { publicKey } = useWallet();

  // Auto-start demo match when ?demo=true is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') !== 'true') return;
    if (state.phase !== 'LOBBY') return; // don't re-trigger if already running

    async function startDemo() {
      let startRaw = BigInt(8000000_00000000); // fallback: $80,000
      try {
        const priceData = await fetchLatestPrice(0);
        startRaw = priceData.raw;
      } catch {
        // use fallback
      }
      dispatch({ type: 'SET_DEMO_MODE', on: true });
      dispatch({
        type: 'SET_MATCH',
        match: {
          matchId: BigInt(999),
          playerA: publicKey?.toBase58() ?? 'DEMO1111111111111111111111111111111111111111',
          playerB: 'DEMO2222222222222222222222222222222222222222',
          asset: 0 as import('../lib/constants').AssetId,
          stakeSOL: 0.05,
          state: 1,
          startPrice: startRaw,
          endPrice: BigInt(0),
          highPrice: BigInt(0),
          lowPrice: BigInt(0),
          scoreA: 0,
          scoreB: 0,
          winner: null,
          createdAt: Date.now(),
        },
      });
      dispatch({ type: 'SET_PHASE', phase: 'DRAFT' });
    }

    startDemo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start price stream when in draft/battle phases
  useEffect(() => {
    if (!state.match || !['DRAFT', 'BATTLE', 'SETTLE'].includes(state.phase)) return;
    const stop = streamPrice(
      state.match.asset,
      3000,
      (data) => dispatch({ type: 'TICK_PRICE', price: data.price, raw: data.raw }),
    );
    return stop;
  }, [state.phase, state.match?.asset]);

  const phase = state.phase;
  const isDemoMode = state.demoMode;
  const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';

  return (
    <div className="relative min-h-screen landing-bg">
      <Navbar gameMode demoMode={state.demoMode} />

      {/* Wallet guard — only for non-demo lobby */}
      {phase === 'LOBBY' && !publicKey && !isDemoMode && !isDemo && (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}
          >
            <div style={{ background: 'white', border: '2.5px solid #111', boxShadow: '6px 6px 0 #111', padding: '48px 40px' }}>
              <div style={{ width: 64, height: 64, background: '#C8FF00', border: '2.5px solid #111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Wallet style={{ width: 28, height: 28, color: '#111' }} />
              </div>
              <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: 12 }}>
                Connect to play
              </h2>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.88rem', color: '#666', lineHeight: 1.6, marginBottom: 28 }}>
                You need a Phantom or Solflare wallet with some devnet SOL to enter the arena.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <WalletMultiButton />
                <button
                  onClick={() => window.location.href = '/game?demo=true'}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.8rem', color: '#555', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Or try the free demo match →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {phase === 'LOBBY' && (publicKey || isDemoMode || isDemo) && <MatchLobby />}
          {phase === 'WAITING' && <WaitingForOpponent />}
          {phase === 'DRAFT' && <CardHand />}
          {phase === 'COMMIT' && <CardHand />}
          {phase === 'WAITING_REVEAL' && <WaitingForReveal />}
          {phase === 'BATTLE' && <BattleView />}
          {phase === 'SETTLE' && <SettleView />}
          {phase === 'RESULT' && <ResultView />}
        </motion.div>
      </AnimatePresence>

      {/* Phase breadcrumb */}
      {phase !== 'LOBBY' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-2"
          style={{ background: 'white', border: '2px solid #111', boxShadow: '3px 3px 0 #111' }}>
          {(['WAITING', 'DRAFT', 'BATTLE', 'SETTLE', 'RESULT'] as const).map((p, i) => (
            <React.Fragment key={p}>
              {i > 0 && <span style={{ color: '#bbb', margin: '0 4px', fontSize: '0.75rem' }}>›</span>}
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                  fontWeight: phase === p ? 800 : 400,
                  color: phase === p ? '#111' :
                    ['WAITING', 'DRAFT', 'BATTLE', 'SETTLE', 'RESULT'].indexOf(phase) > i ? '#C8FF00' : '#bbb',
                }}
              >
                {p === 'DRAFT' ? 'PICK' : p}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Game() {
  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  );
}
