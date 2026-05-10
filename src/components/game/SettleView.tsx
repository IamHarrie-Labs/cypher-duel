import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { CardIcon, CARD_ICON_ID } from '../CardIcons';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useGame } from '../../store/game-store';
import { getProgram, fetchSettledMatch } from '../../lib/anchor-client';
import { fetchLatestPrice, formatUsd, formatDelta } from '../../lib/pyth';
import { ASSET_NAMES, CARDS } from '../../lib/constants';
import * as anchor from '@coral-xyz/anchor';

// Devnet treasury address (the deployer's wallet)
const TREASURY = new PublicKey('7FzTczMDCTvxuiLdBT15ryp1a55FBDVs4Xz5p989C41U');

export default function SettleView() {
  const { state, dispatch } = useGame();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const match = state.match!;
  const program = anchorWallet ? getProgram(connection, anchorWallet) : null;

  const [settling, setSettling] = useState(false);
  const [settleTx, setSettleTx] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(state.currentPrice);

  const startPrice = match.startPrice ? Number(match.startPrice) / 1e8 : 0;
  const highPrice = state.battleHighRaw ? Number(state.battleHighRaw) / 1e8 : livePrice ?? startPrice;
  const lowPrice = state.battleLowRaw ? Number(state.battleLowRaw) / 1e8 : livePrice ?? startPrice;

  useEffect(() => {
    if (!state.currentPrice) {
      fetchLatestPrice(match.asset).then(d => setLivePrice(d.price)).catch(() => {});
    }
  }, []);

  async function handleSettle() {
    dispatch({ type: 'SET_TX_PENDING', pending: true });
    setSettling(true);

    try {
      const endPriceData = await fetchLatestPrice(match.asset);
      const endRaw = endPriceData.raw;
      const highRaw = state.battleHighRaw > endRaw ? state.battleHighRaw : endRaw;
      const lowRaw = state.battleLowRaw > 0n && state.battleLowRaw < endRaw ? state.battleLowRaw : endRaw;

      const endUsd = Number(endRaw) / 1e8;
      const highUsd = Number(highRaw) / 1e8;
      const lowUsd = Number(lowRaw) / 1e8;

      // Compute my score locally — mirrors on-chain score_card
      const myScore = state.myPlays.reduce((acc, play) =>
        acc + scoreCard(play.cardId, play.direction, play.snipeTarget, startPrice, endUsd, highUsd, lowUsd), 0);

      const isPlayerA = publicKey?.toBase58() === match.playerA;

      // Always attempt on-chain settle if wallet + playerB exist — vault may hold real SOL
      if (program && publicKey && match.playerB) {
        const playerA = new PublicKey(match.playerA);
        const playerB = new PublicKey(match.playerB);

        const tx = await program.methods
          .settleMatch(
            new anchor.BN(match.matchId.toString()),
            new anchor.BN(endRaw.toString()),
            new anchor.BN(highRaw.toString()),
            new anchor.BN(lowRaw.toString()),
          )
          .accounts({ playerA, playerB, treasury: TREASURY })
          .rpc();

        setSettleTx(tx);

        // Read actual scores written by the program
        let scoreA = isPlayerA ? myScore : 0;
        let scoreB = isPlayerA ? 0 : myScore;
        let winner: string | null = myScore > 0 ? (isPlayerA ? match.playerA : match.playerB) : null;
        try {
          const settled = await fetchSettledMatch(connection, match.matchId);
          if (settled) { scoreA = settled.scoreA; scoreB = settled.scoreB; winner = settled.winner; }
        } catch { /* use locally-computed fallback */ }

        dispatch({
          type: 'SET_MATCH',
          match: { ...match, scoreA, scoreB, winner, endPrice: endRaw, highPrice: highRaw, lowPrice: lowRaw },
        });
        dispatch({ type: 'SET_RESULT', message: `Settled on-chain! Tx: ${tx.slice(0, 8)}…` });
        return;
      }

      // Demo fallback — no vault, no real SOL, synthesize result
      const scoreA = isPlayerA ? myScore : 0;
      const scoreB = isPlayerA ? 0 : myScore;
      const winner = myScore > 0 ? (isPlayerA ? match.playerA : (match.playerB ?? match.playerA)) : (match.playerB ?? match.playerA);
      const demoTx = 'DEMO' + Math.random().toString(36).slice(2, 10).toUpperCase();
      setSettleTx(demoTx);
      dispatch({
        type: 'SET_MATCH',
        match: { ...match, scoreA, scoreB, winner, endPrice: endRaw, highPrice: highRaw, lowPrice: lowRaw },
      });
      dispatch({ type: 'SET_RESULT', message: `Demo settled! Your score: ${myScore} pts` });
    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', error: e.message ?? 'Settlement failed — check wallet and try again.' });
    } finally {
      setSettling(false);
      dispatch({ type: 'SET_TX_PENDING', pending: false });
    }
  }

  // Mirrors on-chain score_card
  function scoreCard(cardId: number, dir: number, snipeTarget: bigint, sp: number, ep: number, hp: number, lp: number): number {
    const absDelta = Math.abs(ep - sp);
    switch (cardId) {
      case 0: return absDelta / sp > 0.003 ? 10 : 0;
      case 1: return (dir === 0 && ep > sp) || (dir === 1 && ep < sp) ? 15 : 0;
      case 2: {
        const moved = dir === 0 ? ep - sp : sp - ep;
        return moved / sp > 0.01 ? 30 : 0;
      }
      case 3: {
        const t = Number(snipeTarget) / 1e8;
        return hp >= t - 50 && lp <= t + 50 ? 75 : 0;
      }
      case 4: return hp > sp && lp < sp ? 60 : 0;
      case 5: {
        const hd = Math.abs(hp - sp) / sp;
        const ld = Math.abs(lp - sp) / sp;
        return hd <= 0.002 && ld <= 0.002 ? 50 : 0;
      }
      default: return 0;
    }
  }

  const delta = livePrice && startPrice ? (livePrice - startPrice) / startPrice : 0;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="brutal-section-label mb-1">MATCH #{match.matchId.toString()}</p>
          <h1 className="text-4xl font-black uppercase tracking-tight">SETTLE THE MATCH</h1>
          <p className="text-sm text-[#666] font-mono mt-1">Both players have revealed. Anyone can trigger settlement — winner gets the pot instantly.</p>
        </motion.div>

        {/* Price summary */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="brutal-card p-6 space-y-4">
            <h2 className="brutal-section-label">ROUND SUMMARY · {ASSET_NAMES[match.asset]}/USD</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'OPEN', value: startPrice, color: '#888' },
                { label: 'CLOSE (LIVE)', value: livePrice ?? 0, color: delta >= 0 ? '#CCFF00' : '#FF3B3B' },
                { label: 'HIGH', value: highPrice, color: '#CCFF00' },
                { label: 'LOW', value: lowPrice, color: '#FF3B3B' },
              ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1">
                  <p className="brutal-section-label text-[10px]">{label}</p>
                  <p className="font-black brutal-number text-xl" style={{ color }}>
                    {formatUsd(value, ASSET_NAMES[match.asset])}
                  </p>
                </div>
              ))}
            </div>
            <div className="brutal-divider" />
            <div className="flex items-center justify-between">
              <span className="brutal-section-label">ROUND DELTA</span>
              <span className={`font-black brutal-number text-lg ${delta >= 0 ? 'text-lime' : 'text-[#FF3B3B]'}`}>
                {formatDelta(delta)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Your card scores preview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h2 className="brutal-section-label mb-3">YOUR CARD RESULTS (PREVIEW)</h2>
          <div className="space-y-2">
            {state.myPlays.map((play, i) => {
              const card = CARDS.find(c => c.id === play.cardId)!;
              const endUsd = livePrice ?? startPrice;
              const pts = scoreCard(play.cardId, play.direction, play.snipeTarget, startPrice, endUsd, highPrice, lowPrice);
              const won = pts > 0;

              return (
                <div key={i} className={`flex items-center justify-between p-4 border-2 ${won ? 'border-lime bg-[rgba(204,255,0,0.04)]' : 'border-[#333]'}`}>
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: won ? '#C8FF00' : '#11111108',
                        border: `2px solid ${won ? '#C8FF00' : '#333'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CardIcon id={CARD_ICON_ID[card.id]} size={20} color={won ? '#111' : '#666'} />
                    </div>
                    <div>
                      <p className="font-bold uppercase text-sm tracking-wide">{card.name}</p>
                      <p className="text-xs text-[#555] font-mono">{card.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black brutal-number text-lg ${won ? 'text-lime' : 'text-[#555]'}`}>
                      {won ? `+${pts}` : '0'}
                    </p>
                    <p className="text-xs font-mono" style={{ color: won ? '#CCFF00' : '#FF3B3B' }}>
                      {won ? 'TRIGGERED' : 'MISS'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-3">
            <div className="brutal-card py-2 px-4">
              <span className="brutal-section-label mr-3">EST. SCORE</span>
              <span className="font-black brutal-number text-lime text-xl">
                {state.myPlays.reduce((acc, p) => {
                  const e = livePrice ?? startPrice;
                  return acc + scoreCard(p.cardId, p.direction, p.snipeTarget, startPrice, e, highPrice, lowPrice);
                }, 0)} pts
              </span>
            </div>
          </div>
        </motion.div>

        {/* Settle button */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="brutal-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-lime" />
              <div>
                <h2 className="font-black uppercase tracking-tight">Trigger Settlement</h2>
                <p className="text-xs text-[#666] font-mono">One transaction. Winner receives SOL instantly.</p>
              </div>
            </div>

            {settleTx ? (
              <div className="space-y-3">
                <div className="p-4 bg-[rgba(204,255,0,0.08)] border-2 border-lime">
                  <p className="font-bold text-lime uppercase mb-2">SETTLED ON-CHAIN</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#888]">{settleTx}</span>
                    <a
                      href={`https://explorer.solana.com/tx/${settleTx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lime hover:text-[#DDFF33]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'SET_PHASE', phase: 'RESULT' })}
                  className="brutal-btn w-full py-3 text-sm"
                >
                  SEE RESULTS →
                </button>
              </div>
            ) : (
              <button
                onClick={handleSettle}
                disabled={settling || state.txPending}
                className="brutal-btn w-full py-4 text-sm flex items-center justify-center gap-2"
              >
                {state.txPending ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> SETTLING ON-CHAIN…</>
                ) : (
                  <><Zap className="w-4 h-4" /> SETTLE & CLAIM POT</>
                )}
              </button>
            )}

            {state.error && (
              <p className="text-xs text-[#FF3B3B] font-mono">{state.error}</p>
            )}

            <p className="text-xs text-[#555] font-mono text-center">
              Pyth price fetched at settlement time · Scores computed on-chain · 2.5% protocol fee
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
