import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ChevronRight, Flame } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  player: string;
  wins: number;
  losses: number;
  winRate: string;
  points: number;
  streak: number;
  tier: string;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, player: 'cryptoKing.sol', wins: 247, losses: 31, winRate: '88.8%', points: 14820, streak: 12, tier: 'Grandmaster' },
  { rank: 2, player: 'alphaMaster42', wins: 231, losses: 44, winRate: '84.0%', points: 13250, streak: 7, tier: 'Grandmaster' },
  { rank: 3, player: 'degenWhale.sol', wins: 218, losses: 52, winRate: '80.7%', points: 12100, streak: 4, tier: 'Diamond' },
  { rank: 4, player: 'snipeQueen', wins: 195, losses: 63, winRate: '75.6%', points: 10890, streak: 2, tier: 'Diamond' },
  { rank: 5, player: 'volatilityKid', wins: 187, losses: 71, winRate: '72.5%', points: 9740, streak: 5, tier: 'Diamond' },
  { rank: 6, player: 'bullerIsh.sol', wins: 174, losses: 82, winRate: '68.0%', points: 8920, streak: 0, tier: 'Platinum' },
  { rank: 7, player: 'chartMaster99', wins: 168, losses: 87, winRate: '65.9%', points: 8450, streak: 3, tier: 'Platinum' },
  { rank: 8, player: 'oracleReader', wins: 156, losses: 94, winRate: '62.4%', points: 7820, streak: 1, tier: 'Platinum' },
];

const tierColors: Record<string, string> = {
  Grandmaster: 'text-arena-lime',
  Diamond: 'text-arena-blue',
  Platinum: 'text-arena-amber',
  Gold: 'text-arena-amber',
};

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown className="w-5 h-5 text-arena-lime" />,
  2: <Medal className="w-5 h-5 text-muted-foreground" />,
  3: <Medal className="w-5 h-5 text-arena-amber" />,
};

type TimeFilter = 'daily' | 'weekly' | 'season';

const Leaderboard: React.FC = () => {
  const [filter, setFilter] = useState<TimeFilter>('season');

  return (
    <section id="leaderboard" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 arena-grid-bg opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-foreground">
            <Trophy className="w-10 h-10 inline-block text-arena-lime mr-2 -mt-1" />
            LEADERBOARD
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            The sharpest predictors. The highest win rates. The longest streaks.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['daily', 'weekly', 'season'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-arena-lime text-background'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-border overflow-hidden bg-card/60 backdrop-blur-sm">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Player</div>
              <div className="col-span-2 text-center hidden sm:block">Record</div>
              <div className="col-span-2 text-center">Win Rate</div>
              <div className="col-span-2 text-center hidden sm:block">Streak</div>
              <div className="col-span-2 text-right">Points</div>
            </div>

            {/* Rows */}
            {leaderboardData.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center transition-colors hover:bg-secondary/20 ${
                  i < leaderboardData.length - 1 ? 'border-b border-border/50' : ''
                } ${entry.rank <= 3 ? 'bg-arena-lime/[0.02]' : ''}`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  {rankIcons[entry.rank] || (
                    <span className="text-sm font-mono text-muted-foreground font-bold">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Player */}
                <div className="col-span-3">
                  <div className="text-sm font-semibold text-foreground truncate">{entry.player}</div>
                  <div className={`text-xs font-mono ${tierColors[entry.tier] || 'text-muted-foreground'}`}>
                    {entry.tier}
                  </div>
                </div>

                {/* Record */}
                <div className="col-span-2 text-center hidden sm:block">
                  <span className="text-sm font-mono">
                    <span className="text-arena-lime">{entry.wins}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-arena-red">{entry.losses}</span>
                  </span>
                </div>

                {/* Win Rate */}
                <div className="col-span-2 text-center">
                  <span className="text-sm font-mono font-bold text-foreground">{entry.winRate}</span>
                </div>

                {/* Streak */}
                <div className="col-span-2 text-center hidden sm:flex items-center justify-center gap-1">
                  {entry.streak > 0 && <Flame className="w-3.5 h-3.5 text-arena-amber" />}
                  <span className={`text-sm font-mono ${entry.streak > 0 ? 'text-arena-amber font-bold' : 'text-muted-foreground'}`}>
                    {entry.streak > 0 ? `${entry.streak}W` : '-'}
                  </span>
                </div>

                {/* Points */}
                <div className="col-span-2 text-right flex items-center justify-end gap-2">
                  <span className="text-sm font-mono font-bold text-arena-lime">
                    {entry.points.toLocaleString()}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
