import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, ExternalLink, Share2 } from 'lucide-react';
import { CardIcon, CARD_ICON_ID } from '../CardIcons';
import { sounds } from '../../lib/sounds';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../../store/game-store';
import { ASSET_NAMES, CARDS, PROGRAM_ID } from '../../lib/constants';
import { PublicKey } from '@solana/web3.js';

export default function ResultView() {
  const { state, dispatch } = useGame();
  const { publicKey } = useWallet();
  const match = state.match!;

  // In demo mode (no wallet) always treat ourselves as playerA
  const isPlayerA = state.demoMode ? true : publicKey?.toBase58() === match.playerA;

  const myScore  = isPlayerA ? match.scoreA : match.scoreB;
  const oppScore = isPlayerA ? match.scoreB : match.scoreA;
  const won  = myScore > oppScore;

  // Play win/lose sound on mount (after won is derived)
  React.useEffect(() => {
    if (won) sounds.win();
    else sounds.lose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function shortAddr(addr: string) {
    return addr.slice(0, 4) + '…' + addr.slice(-4);
  }

  const blinksUrl = `https://cypher-duel.vercel.app/api/actions/challenge?matchId=${match.matchId}&stake=${match.stakeSOL}&asset=${ASSET_NAMES[match.asset]}`;
  const tweetText = encodeURIComponent(
    won
      ? `Just won a Cypher duel on Solana — ${myScore} vs ${oppScore} pts on ${ASSET_NAMES[match.asset]}/USD.\n\nThink you can beat me? One-click accept:\n${blinksUrl}`
      : `Took an L on Cypher — ${myScore} vs ${oppScore} pts on ${ASSET_NAMES[match.asset]}/USD. Rematch:\n${blinksUrl}`
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">

        {/* Result banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <div className={won ? 'brutal-card' : 'brutal-card-red'} style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="mb-4 flex justify-center">
              {won ? (
                <div style={{ width: 72, height: 72, background: '#C8FF00', border: '3px solid #111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy className="w-9 h-9 text-[#111]" />
                </div>
              ) : (
                <div style={{ width: 72, height: 72, background: '#FF3B3B', border: '3px solid #111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Swords className="w-9 h-9 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tight mb-2">
              {won ? 'WINNER' : 'DEFEATED'}
            </h1>
            <p className="font-mono text-[#888] text-sm">
              {won
                ? `You out-read the market. ${myScore} vs ${oppScore} pts.`
                : `Sharp plays, sharper opponent. ${myScore} vs ${oppScore} pts.`
              }
            </p>
          </div>
        </motion.div>

        {/* Score breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="brutal-card-white p-6 space-y-4">
            <h2 className="brutal-section-label">ROUND BREAKDOWN</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="brutal-section-label text-[10px] mb-2">YOU</p>
                <p className={`font-black text-5xl brutal-number ${won ? 'text-lime' : 'text-[#888]'}`}>{myScore}</p>
                <p className="text-xs text-[#555] font-mono mt-1">pts</p>
              </div>
              <div className="text-center">
                <p className="brutal-section-label text-[10px] mb-2">OPPONENT</p>
                <p className={`font-black text-5xl brutal-number ${!won ? 'text-[#FF3B3B]' : 'text-[#888]'}`}>{oppScore}</p>
                <p className="text-xs text-[#555] font-mono mt-1">pts</p>
              </div>
            </div>

            <div className="brutal-divider" />

            <div className="space-y-2">
              {state.myPlays.map((play, i) => {
                const card = CARDS.find(c => c.id === play.cardId)!;
                return (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: '#111',
                          border: '2px solid #111',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CardIcon id={CARD_ICON_ID[card.id]} size={16} color="#C8FF00" />
                      </div>
                      <span className="font-bold uppercase tracking-wide">{card.name}</span>
                    </div>
                    <span className="font-mono text-[#666] text-xs">{card.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Trophy + share */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          {won && (
            <div className="brutal-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-lime" />
                <h2 className="font-black uppercase tracking-tight">Trophy NFT</h2>
                <span className="brutal-tag-yellow brutal-tag text-[10px]">COMING SOON</span>
              </div>
              <p className="text-xs text-[#666] font-mono">
                Compressed NFT trophies with on-chain match metadata are in active development. Winners of early matches will receive retroactive trophy drops.
              </p>
            </div>
          )}

          {/* Share Blink */}
          <div className="brutal-card-white p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-lime" />
              <h2 className="font-black uppercase tracking-tight">Challenge via Blink</h2>
            </div>
            <p className="text-xs text-[#666] font-mono">Post a Blink on X. Anyone scrolling can accept your rematch in one click.</p>
            <a
              href={`https://twitter.com/intent/tweet?text=${tweetText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn-ghost flex items-center justify-center gap-2 w-full py-3 text-sm"
            >
              <Share2 className="w-4 h-4" />
              POST CHALLENGE BLINK ON X
            </a>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="brutal-btn py-3 text-sm flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" /> REMATCH
            </button>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="brutal-btn-ghost py-3 text-sm"
            >
              BACK TO LOBBY
            </button>
          </div>

          {/* Explorer links */}
          {!state.demoMode && (() => {
            const matchIdBuf = Buffer.alloc(8);
            matchIdBuf.writeBigUInt64LE(match.matchId);
            const [matchPDA] = PublicKey.findProgramAddressSync(
              [Buffer.from('match'), matchIdBuf],
              PROGRAM_ID,
            );
            return (
              <div className="flex flex-col items-center gap-1">
                <a
                  href={`https://explorer.solana.com/address/${matchPDA.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#555] hover:text-[#111] font-mono flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Match account on Solana Explorer
                </a>
                <a
                  href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#999] hover:text-[#555] font-mono flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Program: {PROGRAM_ID.toBase58().slice(0, 8)}…
                </a>
              </div>
            );
          })()}
        </motion.div>

      </div>
    </div>
  );
}
