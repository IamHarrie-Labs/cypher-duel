import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield } from 'lucide-react';
import { CardIcon, CARD_ICON_ID } from '../CardIcons';
import { sounds } from '../../lib/sounds';
import { useToast } from '../../hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useGame, useBattleTimer } from '../../store/game-store';
import { getProgram } from '../../lib/anchor-client';
import { streamPrice, formatUsd, formatDelta } from '../../lib/pyth';
import { CARDS, ASSET_NAMES } from '../../lib/constants';
import * as anchor from '@coral-xyz/anchor';

export default function BattleView() {
  const { state, dispatch } = useGame();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const match = state.match!;
  const myPlays = state.myPlays;
  const startPriceUsd = match.startPrice ? Number(match.startPrice) / 1e8 : null;
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [cardResults, setCardResults] = useState<Record<number, boolean | null>>({});
  const stopStream = useRef<(() => void) | null>(null);

  const program = anchorWallet ? getProgram(connection, anchorWallet) : null;
  const { toast } = useToast();
  const prevTimeLeft = React.useRef(60);

  // Start price stream
  useEffect(() => {
    const stop = streamPrice(
      match.asset,
      2000,
      (data) => {
        dispatch({ type: 'TICK_PRICE', price: data.price, raw: data.raw });
        // Evaluate cards in real time
        if (startPriceUsd !== null) {
          const newResults: Record<number, boolean | null> = {};
          myPlays.forEach(play => {
            newResults[play.cardId] = evaluateCardLive(
              play.cardId,
              play.direction,
              play.snipeTarget,
              startPriceUsd,
              data.price,
              state.battleHighRaw ? Number(state.battleHighRaw) / 1e8 : data.price,
              state.battleLowRaw ? Number(state.battleLowRaw) / 1e8 : data.price,
            );
          });
          setCardResults(newResults);
        }
      },
    );
    stopStream.current = stop;
    return () => { stop(); };
  }, [match.asset, match.matchId]);

  // Battle timer
  const timeLeft = useBattleTimer(true, handleTimerExpire);

  // Tick sound + 10s warning toast
  useEffect(() => {
    if (timeLeft === prevTimeLeft.current) return;
    prevTimeLeft.current = timeLeft;
    if (timeLeft > 0 && timeLeft <= 10) {
      sounds.urgentTick();
    } else if (timeLeft > 10) {
      sounds.tick();
    }
    if (timeLeft === 10) {
      toast({ title: '⏱ 10 seconds left!', description: 'Reveal your plays now or forfeit.' });
    }
  }, [timeLeft]);

  function handleTimerExpire() {
    stopStream.current?.();
    dispatch({ type: 'SET_PHASE', phase: 'SETTLE' });
  }

  // Evaluate card live (simplified — mirrors on-chain score_card)
  function evaluateCardLive(
    cardId: number,
    direction: number,
    snipeTarget: bigint,
    sp: number,
    ep: number,
    hp: number,
    lp: number,
  ): boolean | null {
    const absDelta = Math.abs(ep - sp);
    const pct = absDelta / sp;
    switch (cardId) {
      case 0: return pct > 0.003;
      case 1: return direction === 0 ? ep > sp : ep < sp;
      case 2: {
        const moved = direction === 0 ? (ep - sp) / sp : (sp - ep) / sp;
        return moved > 0.01;
      }
      case 3: {
        const target = Number(snipeTarget) / 1e8;
        const band = 50;
        return hp >= target - band && lp <= target + band;
      }
      case 4: return hp > sp && lp < sp;
      case 5: {
        const hd = Math.abs(hp - sp) / sp;
        const ld = Math.abs(lp - sp) / sp;
        return hd <= 0.002 && ld <= 0.002;
      }
      default: return null;
    }
  }

  async function handleReveal() {
    if (state.demoMode || !program || !state.salt) {
      sounds.commit();
      setRevealed(true);
      toast({ title: 'Plays revealed!', description: 'Settling match…' });
      setTimeout(() => dispatch({ type: 'SET_PHASE', phase: 'SETTLE' }), 800);
      return;
    }

    dispatch({ type: 'SET_TX_PENDING', pending: true });
    setRevealing(true);
    let onChainOk = false;
    try {
      const snipeTarget = myPlays.find(p => p.cardId === 3)?.snipeTarget ?? BigInt(0);
      await program.methods
        .revealPlays(
          new anchor.BN(match.matchId.toString()),
          myPlays.map(p => p.cardId),
          myPlays.map(p => p.direction),
          new anchor.BN(snipeTarget.toString()),
          Array.from(state.salt),
        )
        .rpc();
      onChainOk = true;
    } catch (e: any) {
      console.warn('[BattleView] reveal_plays failed, falling back to demo:', e?.message ?? e);
    } finally {
      setRevealing(false);
      dispatch({ type: 'SET_TX_PENDING', pending: false });
    }

    if (!onChainOk) dispatch({ type: 'SET_DEMO_MODE', on: true });
    sounds.commit();
    setRevealed(true);
    toast({
      title: 'Plays revealed!',
      description: onChainOk ? 'Verified on-chain — proceeding to settle…' : 'Revealed locally — proceeding to settle…',
    });
    setTimeout(() => dispatch({ type: 'SET_PHASE', phase: 'SETTLE' }), 800);
  }

  const currentPrice = state.currentPrice;
  const delta = currentPrice && startPriceUsd ? (currentPrice - startPriceUsd) / startPriceUsd : 0;
  const priceUp = delta >= 0;

  // Timer ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / 60;

  return (
    <div className="min-h-screen pt-16 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top bar: timer + price */}
        <div className="grid grid-cols-3 gap-4 pt-4 battle-top-bar">
          {/* Timer */}
          <div className="brutal-card p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg width="64" height="64" className="-rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#222" strokeWidth="4" fill="none" />
                <circle
                  cx="32" cy="32" r="28"
                  stroke={timeLeft <= 10 ? '#FF3B3B' : '#CCFF00'}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-black brutal-number text-lg"
                  style={{ color: timeLeft <= 10 ? '#FF3B3B' : '#CCFF00' }}
                >
                  {timeLeft}
                </span>
              </div>
            </div>
            <div>
              <p className="brutal-section-label text-[10px]">TIME LEFT</p>
              <p className="font-black text-sm uppercase">{timeLeft <= 10 ? 'ALMOST DONE!' : 'BATTLE'}</p>
            </div>
          </div>

          {/* Live price */}
          <div className="brutal-card p-4 text-center flex flex-col justify-center">
            <p className="brutal-section-label text-[10px] mb-1">{ASSET_NAMES[match.asset]}/USD · LIVE</p>
            <p className={`font-black text-3xl brutal-number ${priceUp ? 'text-lime' : 'text-[#FF3B3B]'}`}>
              {currentPrice ? formatUsd(currentPrice, ASSET_NAMES[match.asset]) : '—'}
            </p>
            {startPriceUsd && (
              <p className={`text-xs font-mono mt-1 ${priceUp ? 'text-lime' : 'text-[#FF3B3B]'}`}>
                {priceUp ? '▲' : '▼'} {formatDelta(delta)} vs. start
              </p>
            )}
          </div>

          {/* Stake */}
          <div className="brutal-card p-4 flex flex-col justify-center">
            <p className="brutal-section-label text-[10px] mb-1">POT</p>
            <p className="font-black text-2xl brutal-number text-lime">{(match.stakeSOL * 2 * 0.975).toFixed(3)} SOL</p>
            <p className="text-xs text-[#666] font-mono">WINNER TAKES ALL</p>
          </div>
        </div>

        {/* Price chart */}
        <div className="brutal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black uppercase tracking-tight">Live Price Chart</h2>
            <div className="flex items-center gap-4 text-xs font-mono">
              {startPriceUsd && (
                <>
                  <span className="text-[#555]">OPEN: <span className="text-[#888]">{formatUsd(startPriceUsd, ASSET_NAMES[match.asset])}</span></span>
                  {state.battleHighRaw > 0n && (
                    <span className="text-lime">HIGH: {formatUsd(Number(state.battleHighRaw) / 1e8, ASSET_NAMES[match.asset])}</span>
                  )}
                  {state.battleLowRaw > 0n && (
                    <span className="text-[#FF3B3B]">LOW: {formatUsd(Number(state.battleLowRaw) / 1e8, ASSET_NAMES[match.asset])}</span>
                  )}
                </>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={state.priceHistory} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  return (
                    <div className="brutal-card-white px-3 py-2 text-xs font-mono">
                      {formatUsd(payload[0].value as number, ASSET_NAMES[match.asset])}
                    </div>
                  );
                }}
              />
              {startPriceUsd && (
                <ReferenceLine y={startPriceUsd} stroke="#444" strokeDasharray="4 4" />
              )}
              <Line
                type="monotone"
                dataKey="price"
                stroke={priceUp ? '#CCFF00' : '#FF3B3B'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* My cards + results */}
        <div>
          <h2 className="brutal-section-label mb-3">YOUR CARDS</h2>
          <div className="grid grid-cols-3 gap-3 battle-cards-grid">
            {myPlays.map((play, i) => {
              const card = CARDS.find(c => c.id === play.cardId)!;
              const result = cardResults[play.cardId];
              const isTriggerred = result === true;
              const isFailed = result === false;

              return (
                <motion.div
                  key={i}
                  animate={isTriggerred ? { borderColor: '#CCFF00' } : isFailed ? { borderColor: '#FF3B3B' } : {}}
                  className={`game-card p-4 space-y-2 cursor-default ${
                    isTriggerred ? 'selected' : isFailed ? '!border-[#FF3B3B] !shadow-[4px_4px_0_#FF3B3B]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: isTriggerred ? '#C8FF00' : isFailed ? '#FF3B3B22' : '#11111108',
                        border: `2px solid ${isTriggerred ? '#C8FF00' : isFailed ? '#FF3B3B' : '#333'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s',
                        flexShrink: 0,
                      }}
                    >
                      <CardIcon
                        id={CARD_ICON_ID[card.id]}
                        size={20}
                        color={isTriggerred ? '#111' : isFailed ? '#FF3B3B' : '#888'}
                      />
                    </div>
                    <AnimatePresence>
                      {isTriggerred && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-black text-lime text-sm">
                          LIVE ✓
                        </motion.span>
                      )}
                      {isFailed && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-black text-[#FF3B3B] text-sm">
                          MISS ✗
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="font-black text-sm">{card.name}</p>
                  {card.requiresDirection && (
                    <div
                      className="brutal-tag text-[10px]"
                      style={{ color: play.direction === 0 ? '#CCFF00' : '#FF3B3B', borderColor: play.direction === 0 ? '#CCFF00' : '#FF3B3B' }}
                    >
                      {play.direction === 0 ? '↑ UP' : '↓ DOWN'}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#555] font-mono" style={{ color: card.riskColor }}>{card.risk}</span>
                    <span className={`font-black brutal-number text-sm ${isTriggerred ? 'text-lime' : 'text-[#888]'}`}>+{card.reward}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Reveal button */}
        <div className="brutal-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-lime" />
            <div>
              <h2 className="font-black uppercase tracking-tight">Reveal Your Plays</h2>
              <p className="text-xs text-[#666] font-mono">Submit before timer expires or forfeit</p>
            </div>
          </div>

          {revealed ? (
            <div className="flex items-center gap-2 p-3 bg-[rgba(204,255,0,0.08)] border-2 border-lime">
              <Zap className="w-4 h-4 text-lime" />
              <p className="font-bold text-lime text-sm uppercase">Plays revealed — waiting for settlement…</p>
            </div>
          ) : (
            <button
              onClick={handleReveal}
              disabled={revealing || state.txPending || !state.salt}
              className="brutal-btn w-full py-4 text-sm"
            >
              {state.txPending ? 'SUBMITTING…' : 'REVEAL MY PLAYS ON-CHAIN'}
            </button>
          )}

          {state.error && (
            <p className="text-xs text-[#FF3B3B] font-mono">{state.error}</p>
          )}
        </div>

      </div>
    </div>
  );
}
