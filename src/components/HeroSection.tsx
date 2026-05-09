import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Live price ticker ─────────────────────────────────────── */
const TICKER_ITEMS = [
  { label: 'BTC/USD', val: '$103,842', delta: '+2.34%' },
  { label: 'ETH/USD', val: '$2,461',   delta: '-0.87%' },
  { label: 'SOL/USD', val: '$172.63',  delta: '+5.12%' },
  { label: 'MATCH POT', val: '0.098 SOL', delta: 'LIVE' },
  { label: 'PLAYERS',   val: '1v1',    delta: 'DEVNET' },
  { label: 'ORACLE',    val: 'PYTH',   delta: 'VERIFIED' },
];

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      borderTop: '2px solid #111', borderBottom: '2px solid #111',
      background: '#111', padding: '10px 0', overflow: 'hidden',
    }}>
      <div className="flex items-center gap-10 whitespace-nowrap animate-ticker">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs flex-shrink-0"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.label}</span>
            <span style={{ color: '#eee' }}>{t.val}</span>
            <span style={{ color: '#C8FF00', fontWeight: 700 }}>{t.delta}</span>
            <span style={{ color: '#333', margin: '0 4px' }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats strip ───────────────────────────────────────────── */
const STATS = [
  { val: '60s', label: 'MATCH' },
  { val: '3',   label: 'CARDS' },
  { val: 'PYTH', label: 'ORACLE' },
  { val: '2.5%', label: 'FEE' },
];

/* ── Hero Section ──────────────────────────────────────────── */
export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <>
      {/* Ticker strip */}
      <div className="pt-14">
        <Ticker />
      </div>

      {/* Main hero */}
      <section
        className="landing-bg"
        style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}
      >
        <div className="container mx-auto px-6 flex-1 flex flex-col justify-center py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── LEFT: Text content ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Section label */}
              <div className="section-label">PREDICT · DUEL · WIN</div>

              {/* Main heading */}
              <div>
                <h1
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 'clamp(2.8rem, 5.5vw, 4.2rem)',
                    fontWeight: 800,
                    color: '#111',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Two traders enter.{' '}
                  <span style={{ display: 'inline-block', position: 'relative' }}>
                    One leaves
                    <svg
                      style={{ position: 'absolute', left: 0, bottom: -6, width: '100%' }}
                      viewBox="0 0 200 8" preserveAspectRatio="none" height="8"
                    >
                      <path d="M0,6 Q50,0 100,5 Q150,10 200,4" stroke="#C8FF00" strokeWidth="3"
                        fill="none" strokeLinecap="round" />
                    </svg>
                  </span>{' '}
                  with the alpha.
                </h1>
              </div>

              {/* Description */}
              <p style={{
                color: '#555', fontSize: '1rem', lineHeight: 1.65,
                fontFamily: "'Space Grotesk', sans-serif", maxWidth: 480,
              }}>
                <strong style={{ color: '#111' }}>CYPHER</strong> is a 1v1 sealed-bid prediction game on Solana.
                You and an opponent each stake SOL, secretly pick{' '}
                <span style={{ color: '#111', fontWeight: 700 }}>3 prediction cards</span>,
                then watch a live 60-second price battle determine the winner — all on-chain.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/game')}
                  className="sketch-btn flex items-center gap-2 px-7 py-3.5 text-sm"
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"/>
                    <path d="M6.271 5.055A.5.5 0 016 5.5v5a.5.5 0 00.786.41l3.5-2.5a.5.5 0 000-.82l-3.5-2.5a.5.5 0 00-.515-.035z"/>
                  </svg>
                  ENTER THE ARENA
                </button>
                <button
                  onClick={() => navigate('/game?demo=true')}
                  className="sketch-btn-ghost flex items-center gap-2 px-7 py-3.5 text-sm"
                >
                  DEMO MATCH
                </button>
              </div>

              {/* Stats strip */}
              <div
                className="grid grid-cols-4 gap-0 mt-4"
                style={{ border: '2px solid #111', background: 'white' }}
              >
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      borderRight: i < 3 ? '2px solid #111' : undefined,
                      padding: '12px 0', textAlign: 'center',
                    }}
                  >
                    <p style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: '1.6rem', fontWeight: 800, color: '#111', lineHeight: 1,
                    }}>{s.val}</p>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem', color: '#888', marginTop: 2,
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                    }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── RIGHT: Hero VS image ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="hidden lg:flex items-center justify-center"
              style={{ position: 'relative', minHeight: 400 }}
            >
              {/*
                mix-blend-mode: screen makes the pure-black (#000) background
                of the image disappear against the cream (#F0EDDA) landing-bg,
                leaving only the white/lime character artwork visible.
              */}
              <img
                src="/hero-vs.png"
                alt="Two traders face off in Cypher arena"
                style={{
                  width: '100%',
                  maxWidth: 580,
                  objectFit: 'contain',
                  mixBlendMode: 'screen',
                  filter: 'contrast(1.05) brightness(1.02)',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          </div>
        </div>

      </section>
    </>
  );
}
