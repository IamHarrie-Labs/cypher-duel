import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useGame, type CardPlay } from '../../store/game-store';
import { getProgram } from '../../lib/anchor-client';
import { computeCommitHash, randomSalt } from '../../lib/crypto';
import { CARDS, ASSET_NAMES } from '../../lib/constants';
import { CardIcon, CARD_ICON_ID } from '../CardIcons';
import { sounds } from '../../lib/sounds';
import { useToast } from '../../hooks/use-toast';
import { formatUsd } from '../../lib/pyth';
import * as anchor from '@coral-xyz/anchor';


interface SlotState {
  cardId: number | null;
  direction: number;
  snipeTarget: string;
}

export default function CardHand() {
  const { state, dispatch } = useGame();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const [slots, setSlots] = useState<SlotState[]>([
    { cardId: null, direction: 0, snipeTarget: '' },
    { cardId: null, direction: 0, snipeTarget: '' },
    { cardId: null, direction: 0, snipeTarget: '' },
  ]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);
  const { toast } = useToast();

  const program = anchorWallet ? getProgram(connection, anchorWallet) : null;
  const match = state.match!;

  const usedCardIds = slots.map(s => s.cardId).filter(id => id !== null) as number[];
  const allFilled = slots.every(s => s.cardId !== null);
  const currentPrice = state.currentPrice;

  function assignCard(slotIdx: number, cardId: number) {
    sounds.cardPick();
    setSlots(prev => {
      const next = [...prev];
      // If card already used in another slot, remove it there
      next.forEach((slot, i) => {
        if (i !== slotIdx && slot.cardId === cardId) {
          next[i] = { ...slot, cardId: null };
        }
      });
      next[slotIdx] = { ...next[slotIdx], cardId };
      return next;
    });
    setActiveSlot(null);
  }

  function setDirection(slotIdx: number, dir: number) {
    setSlots(prev => {
      const next = [...prev];
      next[slotIdx] = { ...next[slotIdx], direction: dir };
      return next;
    });
  }

  function setSnipeTarget(slotIdx: number, val: string) {
    setSlots(prev => {
      const next = [...prev];
      next[slotIdx] = { ...next[slotIdx], snipeTarget: val };
      return next;
    });
  }

  async function handleCommit() {
    if (!allFilled) return;

    const cards = slots.map(s => s.cardId!);
    const directions = slots.map(s => {
      const card = CARDS.find(c => c.id === s.cardId);
      return card?.requiresDirection ? s.direction : 2;
    });

    const snipeSlotIdx = slots.findIndex(s => s.cardId === 3);
    let snipeTarget = BigInt(0);
    if (snipeSlotIdx >= 0 && slots[snipeSlotIdx].snipeTarget) {
      const targetUsd = parseFloat(slots[snipeSlotIdx].snipeTarget);
      snipeTarget = BigInt(Math.round(targetUsd * 1e8));
    }

    const salt = randomSalt();
    const hash = await computeCommitHash(cards, directions, snipeTarget, salt);

    const plays: CardPlay[] = slots.map((s, i) => ({
      cardId: cards[i],
      direction: directions[i],
      snipeTarget,
    }));

    dispatch({ type: 'SET_PLAYS', plays, salt });
    dispatch({ type: 'SET_COMMIT', hash: Array.from(hash) });

    // Demo mode — no wallet needed, skip on-chain
    if (state.demoMode) {
      sounds.commit();
      setCommitted(true);
      toast({ title: 'Plays sealed!', description: 'Demo — your picks are locked. Battle begins now.' });
      setTimeout(() => dispatch({ type: 'SET_PHASE', phase: 'BATTLE' }), 1000);
      return;
    }

    if (!program || !publicKey) {
      sounds.error();
      toast({ title: 'Wallet required', description: 'Connect your wallet to seal plays on-chain.', variant: 'destructive' });
      return;
    }

    dispatch({ type: 'SET_TX_PENDING', pending: true });
    setCommitting(true);
    try {
      await program.methods
        .commitPlays(new anchor.BN(match.matchId.toString()), Array.from(hash))
        .rpc();
      sounds.commit();
      setCommitted(true);
      toast({ title: 'Plays sealed on-chain!', description: 'Hash committed — battle starts now.' });
      setTimeout(() => dispatch({ type: 'SET_PHASE', phase: 'BATTLE' }), 1000);
    } catch (e: any) {
      sounds.error();
      toast({
        title: 'Commit failed',
        description: e?.message?.slice(0, 120) ?? 'Transaction rejected — check wallet and try again.',
        variant: 'destructive',
      });
    } finally {
      setCommitting(false);
      dispatch({ type: 'SET_TX_PENDING', pending: false });
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="brutal-section-label mb-1">MATCH #{match.matchId.toString()} · {ASSET_NAMES[match.asset]}/USD</p>
          <h1 className="text-4xl font-black uppercase tracking-tight">Pick Your Cards</h1>
          <p className="text-sm text-[#666] font-mono mt-1">Select 3 cards and set directions. Your plays are sealed — opponent can't see them until both reveal.</p>
        </div>

        {/* Price ticker */}
        {currentPrice !== null && (
          <div className="brutal-card py-3 px-5 inline-flex items-center gap-4">
            <span className="brutal-section-label">LIVE PRICE</span>
            <span className="font-black text-2xl brutal-number text-lime">
              {formatUsd(currentPrice, ASSET_NAMES[match.asset])}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 card-hand-grid">

          {/* Slot assignments */}
          <div className="space-y-4">
            <h2 className="brutal-section-label">YOUR 3 PLAYS</h2>
            {slots.map((slot, idx) => {
              const card = slot.cardId !== null ? CARDS.find(c => c.id === slot.cardId) : null;
              const isActive = activeSlot === idx;

              return (
                <motion.div
                  key={idx}
                  layout
                  className={`relative border-2 p-4 transition-all duration-150 cursor-pointer ${
                    card
                      ? 'border-lime shadow-[4px_4px_0px_#CCFF00] bg-[rgba(204,255,0,0.04)]'
                      : isActive
                      ? 'border-lime border-dashed bg-[rgba(204,255,0,0.02)]'
                      : 'border-[#333] hover:border-[#555]'
                  }`}
                  onClick={() => !card && setActiveSlot(isActive ? null : idx)}
                >
                  {/* Slot number */}
                  <div className="absolute top-3 left-3">
                    <span className="brutal-section-label text-[10px]">PLAY {idx + 1}</span>
                  </div>

                  {card ? (
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: 40, height: 40, borderRadius: '50%',
                              background: '#111',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <CardIcon id={CARD_ICON_ID[card.id]} size={22} color="#C8FF00" />
                          </div>
                          <div>
                            <p className="font-black text-lg">{card.name}</p>
                            <p className="text-xs text-[#666] font-mono">{card.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-lime brutal-number">+{card.reward}</p>
                          <p className="text-xs font-mono" style={{ color: card.riskColor }}>{card.risk}</p>
                        </div>
                      </div>

                      {/* Direction selector */}
                      {card.requiresDirection && (
                        <div className="flex gap-2">
                          {['UP ↑', 'DOWN ↓'].map((label, dir) => (
                            <button
                              key={dir}
                              onClick={(e) => { e.stopPropagation(); setDirection(idx, dir); }}
                              className={`flex-1 py-2 text-xs font-bold border-2 transition-all duration-100 ${
                                slot.direction === dir
                                  ? dir === 0 ? 'bg-lime text-[#0A0A0A] border-[#0A0A0A]' : 'bg-[#FF3B3B] text-white border-white'
                                  : 'bg-transparent text-[#666] border-[#333] hover:border-[#555]'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Snipe target input */}
                      {card.requiresTarget && (
                        <div className="space-y-1">
                          <p className="brutal-section-label text-[10px]">TARGET PRICE (USD)</p>
                          <input
                            type="number"
                            placeholder={currentPrice ? currentPrice.toFixed(0) : 'e.g. 65000'}
                            value={slot.snipeTarget}
                            onChange={e => setSnipeTarget(idx, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="brutal-input w-full text-sm"
                          />
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSlots(prev => { const n = [...prev]; n[idx] = { cardId: null, direction: 0, snipeTarget: '' }; return n; }); }}
                        className="text-xs text-[#555] hover:text-[#FF3B3B] font-mono transition-colors"
                      >
                        ✕ remove card
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 flex items-center justify-center py-6">
                      <p className="text-[#555] font-mono text-sm uppercase">
                        {isActive ? '← pick a card from the right' : `CLICK TO SELECT PLAY ${idx + 1}`}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Card picker */}
          <div className="space-y-4">
            <h2 className="brutal-section-label">
              {activeSlot !== null ? `SELECTING FOR PLAY ${activeSlot + 1}` : 'CARD DECK'}
            </h2>
            <div className="space-y-2">
              {CARDS.map(card => {
                const inUse = usedCardIds.includes(card.id);
                const isSelectable = activeSlot !== null && !inUse;

                return (
                  <motion.div
                    key={card.id}
                    whileHover={isSelectable ? { x: -2, y: -2 } : {}}
                    className={`game-card p-4 ${inUse ? 'disabled' : ''} ${!isSelectable && activeSlot !== null ? 'opacity-40' : ''}`}
                    onClick={() => isSelectable && activeSlot !== null && assignCard(activeSlot, card.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center flex-shrink-0 border-2"
                        style={{ borderColor: card.riskColor, background: `${card.riskColor}18`, borderRadius: 6 }}
                      >
                        <CardIcon id={CARD_ICON_ID[card.id]} size={20} color={card.riskColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm tracking-wide">{card.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="brutal-tag text-[10px]" style={{ color: card.riskColor, borderColor: card.riskColor, background: `${card.riskColor}10` }}>
                              {card.risk}
                            </span>
                            <span className="font-black text-lime brutal-number">+{card.reward}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#666] font-mono mt-0.5 truncate">{card.description}</p>
                      </div>
                    </div>
                    {inUse && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-lime" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Commit */}
        <div className="brutal-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-lime" />
            <h2 className="font-black uppercase tracking-tight">Seal Your Plays</h2>
          </div>
          <p className="text-sm text-[#666] font-mono">
            Your plays are hashed and committed on-chain before your opponent sees them. Once sealed, you must reveal within 120 seconds or forfeit.
          </p>

          <AnimatePresence>
            {committed ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-[rgba(204,255,0,0.08)] border-2 border-lime">
                <CheckCircle2 className="w-5 h-5 text-lime" />
                <p className="font-bold text-lime uppercase tracking-wide">Plays sealed on-chain — waiting to reveal…</p>
              </motion.div>
            ) : (
              <button
                onClick={handleCommit}
                disabled={!allFilled || committing || state.txPending}
                className="brutal-btn w-full py-4 text-sm flex items-center justify-center gap-2"
              >
                {!allFilled ? (
                  `SELECT ${3 - slots.filter(s => s.cardId !== null).length} MORE CARD(S)`
                ) : state.txPending ? (
                  <><Lock className="w-4 h-4 animate-pulse" /> SEALING ON-CHAIN…</>
                ) : (
                  <><Lock className="w-4 h-4" /> SEAL MY PLAYS</>
                )}
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
