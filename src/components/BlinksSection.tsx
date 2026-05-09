import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Eye, Swords, ExternalLink } from 'lucide-react';

const BlinksSection: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 gradient-surface" />
      <div className="absolute inset-0 arena-grid-bg opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-arena-lime/20 bg-arena-lime/5 mb-6">
              <Share2 className="w-3 h-3 text-arena-lime" />
              <span className="text-xs font-semibold text-arena-lime uppercase tracking-wider">
                Solana Blinks
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6 text-foreground leading-[1.1]">
              EVERY MATCH IS A{' '}
              <span className="text-arena-lime">TWEET</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Challenge anyone directly from X. Spectators bet on outcomes. The game spreads through the
              timeline. No app downloads. No redirects. One tap to duel.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: <Swords className="w-4 h-4" />,
                  title: 'Challenge via Tweet',
                  desc: 'Post a Blink. Anyone can accept with one click. Match starts instantly.',
                },
                {
                  icon: <Eye className="w-4 h-4" />,
                  title: 'Spectate & Bet',
                  desc: 'Watch live matches from your timeline. Predict the winner. Earn rewards.',
                },
                {
                  icon: <ExternalLink className="w-4 h-4" />,
                  title: 'Viral Distribution',
                  desc: 'Every result is shareable. Every win is content. The game markets itself.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-9 h-9 rounded-lg border border-arena-lime/20 bg-arena-lime/5 flex items-center justify-center text-arena-lime shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mock Blink Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-2xl blur-3xl opacity-20" style={{ background: 'hsl(var(--arena-lime))' }} />
            
            <div className="relative rounded-2xl border border-border bg-card p-1 shadow-arena-glow">
              {/* Tweet context */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-arena-lime/10 border border-arena-lime/20 flex items-center justify-center">
                    <span className="text-arena-lime font-bold text-sm">CY</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Cypher</div>
                    <div className="text-xs text-muted-foreground">@cypher_sol</div>
                  </div>
                </div>
                <p className="text-sm text-foreground mt-3 leading-relaxed">
                  Just won 5 in a row on BTC/USD. Who wants the smoke?
                </p>
              </div>

              {/* Blink Action Card */}
              <div className="p-4">
                <div className="rounded-xl border border-arena-lime/20 bg-gradient-to-b from-arena-lime/5 to-transparent p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-arena-lime" />
                      <span className="font-bold text-foreground text-sm">Cypher Challenge</span>
                    </div>
                    <span className="text-xs font-mono text-arena-lime px-2 py-0.5 rounded border border-arena-lime/20 bg-arena-lime/10">
                      0.5 SOL
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Asset</div>
                      <div className="text-sm font-mono font-bold text-foreground">BTC/USD</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Duration</div>
                      <div className="text-sm font-mono font-bold text-foreground">60s</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Win Streak</div>
                      <div className="text-sm font-mono font-bold text-arena-amber">5W</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 rounded-lg bg-arena-lime text-background font-bold text-sm uppercase tracking-wider hover:shadow-arena-glow transition-all">
                      Accept Duel
                    </button>
                    <button className="py-2.5 rounded-lg border border-border bg-secondary/50 text-foreground font-semibold text-sm uppercase tracking-wider hover:border-arena-lime/30 transition-all">
                      Spectate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BlinksSection;
