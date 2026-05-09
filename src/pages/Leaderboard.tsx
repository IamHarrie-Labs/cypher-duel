import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Crown, Medal } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Entry {
  rank: number;
  player: string;
  wins: number;
  losses: number;
  winRate: string;
  pts: number;
  streak: number;
  tier: string;
  tierColor: string;
}

const DATA: Entry[] = [
  { rank: 1, player: 'cryptoKing.sol',  wins: 247, losses: 31, winRate: '88.8%', pts: 14820, streak: 12, tier: 'GRANDMASTER', tierColor: '#C8FF00' },
  { rank: 2, player: 'alphaMaster42',   wins: 231, losses: 44, winRate: '84.0%', pts: 13250, streak: 7,  tier: 'GRANDMASTER', tierColor: '#C8FF00' },
  { rank: 3, player: 'degenWhale.sol',  wins: 218, losses: 52, winRate: '80.7%', pts: 12100, streak: 4,  tier: 'DIAMOND',     tierColor: '#60C8FF' },
  { rank: 4, player: 'snipeQueen',      wins: 195, losses: 63, winRate: '75.6%', pts: 10890, streak: 2,  tier: 'DIAMOND',     tierColor: '#60C8FF' },
  { rank: 5, player: 'volatilityKid',   wins: 187, losses: 71, winRate: '72.5%', pts: 9740,  streak: 5,  tier: 'DIAMOND',     tierColor: '#60C8FF' },
  { rank: 6, player: 'bullerIsh.sol',   wins: 174, losses: 82, winRate: '68.0%', pts: 8920,  streak: 0,  tier: 'PLATINUM',    tierColor: '#FFE400' },
  { rank: 7, player: 'chartMaster99',   wins: 168, losses: 87, winRate: '65.9%', pts: 8450,  streak: 3,  tier: 'PLATINUM',    tierColor: '#FFE400' },
  { rank: 8, player: 'oracleReader',    wins: 156, losses: 94, winRate: '62.4%', pts: 7820,  streak: 1,  tier: 'PLATINUM',    tierColor: '#FFE400' },
  { rank: 9, player: 'calmDegen.sol',   wins: 143, losses: 98, winRate: '59.3%', pts: 6910,  streak: 0,  tier: 'GOLD',        tierColor: '#FFA500' },
  { rank: 10, player: 'sniperElite',    wins: 138, losses: 104, winRate: '57.0%',pts: 6200,  streak: 2,  tier: 'GOLD',        tierColor: '#FFA500' },
];

type Filter = 'daily' | 'weekly' | 'season';

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const SKETCH: React.CSSProperties = { fontFamily: "'Caveat', cursive" };

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div style={{ width: 28, height: 28, background: '#C8FF00', border: '2px solid #111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Crown style={{ width: 14, height: 14, color: '#111' }} />
    </div>
  );
  if (rank === 2) return (
    <div style={{ width: 28, height: 28, background: '#ccc', border: '2px solid #111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Medal style={{ width: 14, height: 14, color: '#111' }} />
    </div>
  );
  if (rank === 3) return (
    <div style={{ width: 28, height: 28, background: '#FFA500', border: '2px solid #111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Medal style={{ width: 14, height: 14, color: '#111' }} />
    </div>
  );
  return (
    <span style={{ ...MONO, fontSize: '0.82rem', fontWeight: 700, color: '#777', minWidth: 28, textAlign: 'center', display: 'block' }}>
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<Filter>('season');

  return (
    <div style={{ minHeight: '100vh', background: '#F0EDDA' }}>
      <Navbar />

      <div className="landing-bg" style={{ paddingTop: 100, paddingBottom: 96 }}>
        <div className="container mx-auto px-6 max-w-5xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 48 }}
          >
            <p className="section-label mb-3">TOP TRADERS</p>
            <h1 style={{ ...SKETCH, fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, color: '#111', lineHeight: 1.05 }}>
              Leaderboard
            </h1>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#666', fontSize: '0.95rem', marginTop: 8 }}>
              The sharpest predictors. Ranked by cumulative match points.
            </p>
          </motion.div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {(['daily', 'weekly', 'season'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...MONO,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '8px 20px',
                  border: '2px solid #111',
                  cursor: 'pointer',
                  background: filter === f ? '#111' : 'white',
                  color: filter === f ? '#C8FF00' : '#555',
                  boxShadow: filter === f ? '3px 3px 0 #C8FF00' : '2px 2px 0 #ccc',
                  transition: 'all 0.1s',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Top 3 podium */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}
          >
            {DATA.slice(0, 3).map((e, i) => {
              const order = [1, 0, 2]; // 2nd, 1st, 3rd visual order
              const entry = DATA[order[i]];
              const heights = ['120px', '148px', '104px'];
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  style={{
                    background: 'white',
                    border: '2.5px solid #111',
                    boxShadow: entry.rank === 1 ? '5px 5px 0 #C8FF00' : '4px 4px 0 #111',
                    padding: '20px 16px',
                    textAlign: 'center',
                    paddingTop: heights[i],
                    position: 'relative',
                    marginTop: i === 1 ? 0 : 24,
                  }}
                >
                  {entry.rank === 1 && (
                    <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)' }}>
                      <Crown style={{ width: 24, height: 24, color: '#C8FF00' }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)', ...MONO, fontSize: '1.6rem', fontWeight: 800, color: '#111' }}>
                    #{entry.rank}
                  </div>
                  <p style={{ ...SKETCH, fontSize: '1.1rem', fontWeight: 800, color: '#111', marginBottom: 4 }}>{entry.player}</p>
                  <p style={{ ...MONO, fontSize: '0.65rem', color: entry.tierColor, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>{entry.tier}</p>
                  <p style={{ ...MONO, fontSize: '1.2rem', fontWeight: 800, color: '#111' }}>{entry.pts.toLocaleString()}</p>
                  <p style={{ ...MONO, fontSize: '0.6rem', color: '#888' }}>pts</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Full table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ border: '2.5px solid #111', background: 'white', boxShadow: '5px 5px 0 #111' }}
          >
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 80px 80px 72px 72px 80px',
              padding: '12px 20px',
              background: '#111',
              ...MONO, fontSize: '0.62rem', color: '#888',
              fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              <span>#</span>
              <span>Player</span>
              <span className="hidden sm:block">Tier</span>
              <span className="hidden sm:block text-center">Record</span>
              <span style={{ textAlign: 'center' }}>Win%</span>
              <span className="hidden sm:block text-center">Streak</span>
              <span style={{ textAlign: 'right' }}>Points</span>
            </div>

            {DATA.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr 80px 80px 72px 72px 80px',
                  padding: '14px 20px',
                  borderBottom: i < DATA.length - 1 ? '1.5px solid #eee' : 'none',
                  alignItems: 'center',
                  background: entry.rank <= 3 ? '#fffef5' : 'white',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8f8f0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = entry.rank <= 3 ? '#fffef5' : 'white'; }}
              >
                {/* Rank */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RankBadge rank={entry.rank} />
                </div>

                {/* Player */}
                <div>
                  <p style={{ ...SKETCH, fontSize: '1.1rem', fontWeight: 700, color: '#111', lineHeight: 1.1 }}>{entry.player}</p>
                </div>

                {/* Tier */}
                <div className="hidden sm:block">
                  <span style={{ ...MONO, fontSize: '0.62rem', fontWeight: 700, color: entry.tierColor, letterSpacing: '0.08em' }}>
                    {entry.tier}
                  </span>
                </div>

                {/* Record */}
                <div className="hidden sm:block" style={{ textAlign: 'center' }}>
                  <span style={{ ...MONO, fontSize: '0.78rem', fontWeight: 700 }}>
                    <span style={{ color: '#6BBF00' }}>{entry.wins}</span>
                    <span style={{ color: '#bbb' }}>/</span>
                    <span style={{ color: '#FF3B3B' }}>{entry.losses}</span>
                  </span>
                </div>

                {/* Win rate */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ ...MONO, fontSize: '0.82rem', fontWeight: 800, color: '#111' }}>{entry.winRate}</span>
                </div>

                {/* Streak */}
                <div className="hidden sm:flex" style={{ alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {entry.streak > 0 ? (
                    <>
                      <Flame style={{ width: 12, height: 12, color: '#FFE400' }} />
                      <span style={{ ...MONO, fontSize: '0.78rem', fontWeight: 800, color: '#FFE400' }}>{entry.streak}W</span>
                    </>
                  ) : (
                    <span style={{ ...MONO, fontSize: '0.78rem', color: '#bbb' }}>—</span>
                  )}
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ ...SKETCH, fontSize: '1.15rem', fontWeight: 800, color: entry.rank <= 2 ? '#111' : '#333' }}>
                    {entry.pts.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Devnet note */}
          <p style={{ ...MONO, fontSize: '0.68rem', color: '#999', marginTop: 20, textAlign: 'center' }}>
            Season data is simulated · On-chain leaderboard syncs from Solana devnet program
          </p>

        </div>
      </div>

      <Footer />
    </div>
  );
}
