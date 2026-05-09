import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Zap, Users, TrendingUp, Search } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface LiveMatch {
  id: string;
  playerA: string;
  playerB: string;
  asset: string;
  stake: string;
  timeLeft: number;
  scoreA: number;
  scoreB: number;
}

interface OpenChallenge {
  id: string;
  player: string;
  asset: string;
  stake: string;
  rank: string;
}

const mockLiveMatches: LiveMatch[] = [
  { id: '1', playerA: '7Fk3..a2Bb', playerB: '3Dm9..fC1x', asset: 'BTC/USD', stake: '0.5 SOL', timeLeft: 34, scoreA: 45, scoreB: 30 },
  { id: '2', playerA: '9Pj8..5Qr2', playerB: 'Bk4e..7hNz', asset: 'ETH/USD', stake: '1.0 SOL', timeLeft: 12, scoreA: 60, scoreB: 75 },
  { id: '3', playerA: '2Lx5..dR8m', playerB: 'Fn7w..4tKp', asset: 'SOL/USD', stake: '0.25 SOL', timeLeft: 51, scoreA: 10, scoreB: 15 },
];

const mockChallenges: OpenChallenge[] = [
  { id: '1', player: '4Hw2..kL9s', asset: 'BTC/USD', stake: '0.1 SOL', rank: 'Gold II' },
  { id: '2', player: 'Ax3f..8mPq', asset: 'ETH/USD', stake: '0.5 SOL', rank: 'Diamond' },
  { id: '3', player: '6Ry1..bN4t', asset: 'SOL/USD', stake: '1.0 SOL', rank: 'Platinum' },
  { id: '4', player: 'Jk7z..2wVe', asset: 'BTC/USD', stake: '0.25 SOL', rank: 'Silver I' },
];

const CountdownTimer: React.FC<{ seconds: number }> = ({ seconds }) => {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`font-mono text-sm font-bold ${time < 10 ? 'text-arena-red' : 'text-arena-lime'}`}>
      {time}s
    </span>
  );
};

const ArenaLobby: React.FC = () => {
  const { connected } = useWallet();

  return (
    <section id="arena" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 gradient-surface" />
      <div className="absolute inset-0 arena-grid-bg opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-foreground">
            THE <span className="text-arena-lime">ARENA</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Live matches. Open challenges. Your next duel awaits.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-arena-lime animate-pulse" />
                <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Live Matches
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {mockLiveMatches.length} active
              </span>
            </div>

            <div className="space-y-3">
              {mockLiveMatches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl border border-border bg-card/80 backdrop-blur-sm hover:border-arena-lime/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Swords className="w-4 h-4 text-arena-lime" />
                      <span className="text-xs font-mono text-muted-foreground">{match.asset}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <CountdownTimer seconds={match.timeLeft} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center flex-1">
                        <div className="font-mono text-xs text-muted-foreground mb-1">{match.playerA}</div>
                        <div className="text-2xl font-black text-foreground">{match.scoreA}</div>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground">VS</div>
                      <div className="text-center flex-1">
                        <div className="font-mono text-xs text-muted-foreground mb-1">{match.playerB}</div>
                        <div className="text-2xl font-black text-foreground">{match.scoreB}</div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button className="px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs font-semibold text-muted-foreground hover:text-arena-lime hover:border-arena-lime/30 transition-all">
                        Spectate
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-arena-amber" />
                    <span className="text-xs text-muted-foreground">
                      Stake: <span className="text-foreground font-mono">{match.stake}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Open Challenges + Quick Actions */}
          <div className="space-y-6">
            {/* Quick Play */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border border-arena-lime/20 bg-arena-lime/5"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-arena-lime mb-4">
                Quick Match
              </h3>
              {connected ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Asset</label>
                    <select className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:border-arena-lime/40 outline-none transition-colors">
                      <option>BTC/USD</option>
                      <option>ETH/USD</option>
                      <option>SOL/USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Stake</label>
                    <select className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:border-arena-lime/40 outline-none transition-colors">
                      <option>0.1 SOL</option>
                      <option>0.25 SOL</option>
                      <option>0.5 SOL</option>
                      <option>1.0 SOL</option>
                    </select>
                  </div>
                  <button className="w-full py-3 rounded-lg bg-arena-lime text-background font-bold text-sm uppercase tracking-wider shadow-arena-glow hover:shadow-arena-strong transition-all flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" />
                    Find Opponent
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3">Connect wallet to enter the arena</p>
                  <WalletMultiButton />
                </div>
              )}
            </motion.div>

            {/* Open Challenges */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Open Challenges
                </span>
              </div>

              <div className="space-y-2">
                {mockChallenges.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="p-3 rounded-lg border border-border bg-card/60 hover:border-arena-lime/20 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-xs text-foreground">{challenge.player}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{challenge.asset}</span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs font-mono text-arena-lime">{challenge.stake}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-arena-amber font-mono">{challenge.rank}</span>
                      <button className="p-1.5 rounded-md border border-arena-lime/20 bg-arena-lime/5 text-arena-lime hover:bg-arena-lime/10 transition-colors">
                        <Swords className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 rounded-xl border border-border bg-card/40">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-arena-lime font-mono">2,847</div>
                  <div className="text-xs text-muted-foreground">Matches Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-foreground font-mono">147</div>
                  <div className="text-xs text-muted-foreground">Active Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-arena-amber font-mono">
                    <TrendingUp className="w-5 h-5 inline-block mr-1" />
                    342
                  </div>
                  <div className="text-xs text-muted-foreground">SOL Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-foreground font-mono">12.4K</div>
                  <div className="text-xs text-muted-foreground">NFT Trophies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArenaLobby;
