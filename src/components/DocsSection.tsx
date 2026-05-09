import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── FAQ accordion ────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '2px solid #111' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '16px 20px',
          background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.1rem', fontWeight: 700, color: '#111',
        }}>
          {q}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '1rem', color: '#C8FF00',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          flexShrink: 0, marginLeft: 12,
        }}>
          ▾
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.88rem', color: '#555', lineHeight: 1.65,
              padding: '0 20px 18px', background: 'white',
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Why it's fair row ────────────────────────────── */
function FairRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '18px 20px',
      borderBottom: '2px solid #111', background: 'white',
    }}>
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        background: '#C8FF00', border: '2px solid #111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem',
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: 4,
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.82rem', color: '#666', lineHeight: 1.55,
        }}>
          {body}
        </p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────── */
export default function DocsSection() {
  return (
    <section
      id="playbook"
      className="landing-bg"
      style={{ paddingTop: 80, paddingBottom: 96 }}
    >
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 56 }}
        >
          <p className="section-label mb-3">THE PLAYBOOK</p>
          <h2 style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 800, color: '#111', lineHeight: 1.1,
          }}>
            Everything, in plain English.
          </h2>
          <p style={{
            color: '#666', fontSize: '0.95rem', marginTop: 8,
            fontFamily: "'Space Grotesk', sans-serif", maxWidth: 480,
          }}>
            No crypto experience required. If you can predict price direction, you can play.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-8">

            {/* What is Cypher */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div style={{ border: '2.5px solid #111', background: 'white', boxShadow: '4px 4px 0 #111' }}>
                <div style={{
                  padding: '16px 20px', borderBottom: '2px solid #111',
                  background: '#C8FF00', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🎮</span>
                  <h3 style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '1.2rem', fontWeight: 800, color: '#111',
                  }}>
                    What is Cypher?
                  </h3>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <p style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.88rem', color: '#555', lineHeight: 1.65, marginBottom: 12,
                  }}>
                    Cypher is a <strong style={{ color: '#111' }}>1-on-1 prediction game</strong> where two players
                    each stake SOL and try to predict what a live crypto price — BTC, ETH, or SOL — will do
                    over the next 60 seconds.
                  </p>
                  <p style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.88rem', color: '#555', lineHeight: 1.65,
                  }}>
                    You pick <strong style={{ color: '#111' }}>3 prediction cards</strong> — secretly. Your picks
                    are locked as a cryptographic hash so your opponent cannot copy you.
                    After 60 seconds, both players reveal, cards are scored on-chain, and the winner takes the pot.
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    paddingTop: 14, borderTop: '1.5px solid #eee', marginTop: 14,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#C8FF00',
                      animation: 'ta-spark1 1.5s ease-in-out infinite',
                    }} />
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.72rem', color: '#111',
                    }}>
                      No server. No middleman. Fully on-chain on Solana.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Why it's fair */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="section-label mb-3">WHY IT'S FAIR</p>
              <div style={{ border: '2.5px solid #111', boxShadow: '4px 4px 0 #111' }}>
                <FairRow icon="🔒" title="Secret Commitment"
                  body="Your picks are locked as a SHA-256 hash before the match starts — like sealing your prediction in an envelope. Your opponent can't see inside until the match ends." />
                <FairRow icon="⚡" title="Oracle Prices"
                  body="Prices come from Pyth Network — a decentralized oracle used by billions in DeFi. Nobody controls what price it shows. It's just truth from the market." />
                <FairRow icon="🛡" title="Smart Contract Escrow"
                  body="Your SOL is held by a Solana smart contract — not a wallet we control. The program pays out the winner automatically in the same transaction as settlement." />
                <div style={{
                  display: 'flex', gap: 16, padding: '18px 20px', background: 'white',
                }}>
                  <div style={{
                    width: 36, height: 36, flexShrink: 0, background: '#C8FF00',
                    border: '2px solid #111', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1rem',
                  }}>
                    🏆
                  </div>
                  <div>
                    <p style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: 4,
                    }}>Instant Payout</p>
                    <p style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.82rem', color: '#666', lineHeight: 1.55,
                    }}>
                      Settlement takes ~400ms. Solana confirms, scores every card on-chain, and sends SOL to
                      the winner. No withdrawal request. No delay.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scoring quick-ref */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div style={{ border: '2.5px solid #111', background: 'white', boxShadow: '4px 4px 0 #111' }}>
                <div style={{ padding: '14px 20px', borderBottom: '2px solid #111', background: '#111' }}>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem', color: '#C8FF00', letterSpacing: '0.12em', fontWeight: 600,
                  }}>SCORING AT A GLANCE</p>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {[
                    ['Max possible score', '190 pts', '#C8FF00'],
                    ['Minimum stake', '0.01 SOL', '#111'],
                    ['Winner receives', '2× stake − 2.5% fee', '#111'],
                    ['Reveal window', '120 seconds', '#111'],
                    ['Tie-break', 'Player A wins', '#111'],
                  ].map(([label, val, color], i, arr) => (
                    <div
                      key={label as string}
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '10px 20px',
                        borderBottom: i < arr.length - 1 ? '1.5px solid #eee' : undefined,
                      }}
                    >
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.75rem', color: '#777',
                      }}>{label}</span>
                      <span style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '1.05rem', fontWeight: 700, color: color as string,
                      }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-8">

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="section-label mb-3">FAQ</p>
              <div style={{ border: '2.5px solid #111', boxShadow: '4px 4px 0 #111' }}>
                {[
                  {
                    q: 'Do I need crypto experience to play?',
                    a: 'Not really. You just need to predict: will the price go up, down, or sideways in the next 60 seconds? Anyone with a Phantom or Solflare wallet can play.',
                  },
                  {
                    q: 'How do I get devnet SOL to play?',
                    a: 'Run: `solana airdrop 2 <your-address> --url devnet` in your terminal, or visit faucet.solana.com. You get 2 SOL free — enough for dozens of matches.',
                  },
                  {
                    q: 'What if my opponent disappears and never reveals?',
                    a: 'After 120 seconds without a reveal, you can trigger a forfeit. The smart contract sends the pot to you automatically. Your opponent cannot run away with your funds.',
                  },
                  {
                    q: 'Can I play without real SOL?',
                    a: 'Yes. Click "DEMO MATCH" in the game lobby. It runs the full game flow with a simulated opponent and live Pyth prices, but no real SOL changes hands.',
                  },
                  {
                    q: 'How does the secret commitment work?',
                    a: "Your 3 card picks + directions + a random salt are hashed with SHA-256. Only the hash goes on-chain. At reveal time, the contract re-hashes your plaintext and panics if they don't match — so you literally cannot lie about your picks.",
                  },
                  {
                    q: 'What happens on a tie?',
                    a: 'Ties go to Player A (the one who created the match). This is enforced by the on-chain program. When joining someone else\'s match, you\'re Player B — ties go to them.',
                  },
                ].map(faq => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </motion.div>

            {/* Developer info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="section-label mb-3">FOR DEVELOPERS</p>
              <div style={{ border: '2.5px solid #111', background: 'white', boxShadow: '4px 4px 0 #111' }}>
                <div style={{ padding: '18px 20px' }}>
                  {[
                    { label: 'BLINKS ENDPOINT', code: 'GET /api/actions/challenge?asset=BTC&stake=0.05' },
                    { label: 'x402 SPECTATOR FEED', code: 'GET /api/x402/feed?matchId=0' },
                  ].map(({ label, code }, i) => (
                    <div key={label} style={{ marginBottom: i < 1 ? 16 : 0 }}>
                      <p style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.65rem', color: '#888', marginBottom: 4, letterSpacing: '0.1em',
                      }}>
                        {label}
                      </p>
                      <code style={{
                        display: 'block',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.75rem', color: '#C8FF00',
                        background: '#111', padding: '8px 12px',
                        borderRadius: 2,
                      }}>
                        {code}
                      </code>
                    </div>
                  ))}
                  <div style={{ marginTop: 16 }}>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.65rem', color: '#888', marginBottom: 4, letterSpacing: '0.1em',
                    }}>
                      PROGRAM ID
                    </p>
                    <a
                      href="https://explorer.solana.com/address/EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN?cluster=devnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.72rem', color: '#111',
                        background: '#f5f3ee', padding: '8px 12px',
                        border: '1.5px solid #ccc',
                        textDecoration: 'none', wordBreak: 'break-all',
                        transition: 'border-color 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#111')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#ccc')}
                    >
                      EegqHgDLzQsoumEdhK9PLFyLEfGoqpsUESKD8p1QKhXN
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
