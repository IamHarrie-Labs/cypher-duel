import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardIcon } from './CardIcons';

const CARDS = [
  { id: 'pulse',    name: 'PULSE',    risk: 'L', pts: 10,  fill: '#8FC600', desc: 'BTC moves >0.3% either way' },
  { id: 'tilt',    name: 'TILT',     risk: 'L', pts: 15,  fill: '#8FC600', desc: 'Closes higher / lower than open' },
  { id: 'surge',   name: 'SURGE',    risk: 'M', pts: 30,  fill: '#111',    desc: 'BTC moves >1% your way' },
  { id: 'snipe',   name: 'SNIPE',    risk: 'H', pts: 75,  fill: '#FF2D78', desc: 'Hits exact band ±$50' },
  { id: 'whiplash',name: 'WHIPLASH', risk: 'H', pts: 60,  fill: '#FF2D78', desc: 'Reverses direction ≥2 times' },
  { id: 'calm',    name: 'CALM',     risk: 'H', pts: 50,  fill: '#111',    desc: 'Stays within ±0.2%' },
];

/* SVG fan card — simplified playing card */
function FanCard({
  idx, total, fill, label, pts, id
}: { idx: number; total: number; fill: string; label: string; pts: number; id: string }) {
  const mid = (total - 1) / 2;
  const angle = (idx - mid) * 13;
  const yOff  = Math.abs(idx - mid) * 14;

  // pick icon color: white on dark fills, black on lime
  const iconColor = fill === '#8FC600' ? '#111' : 'white';

  return (
    <motion.div
      whileHover={{ y: -28, transition: { duration: 0.18 } }}
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        marginLeft: -65,
        width: 130,
        height: 182,
        transform: `rotate(${angle}deg) translateY(${yOff}px)`,
        transformOrigin: 'bottom center',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '100%', height: '100%',
        background: 'white',
        border: '2.5px solid #111',
        boxShadow: '4px 4px 0 #111',
        borderRadius: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 12px 12px',
        position: 'relative',
      }}>
        {/* Corner ◆ */}
        <span style={{
          position: 'absolute', top: 7, right: 9,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.6rem', color: '#ccc',
        }}>◆</span>

        {/* Icon circle */}
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          background: fill, marginTop: 10,
          border: fill === '#111' ? 'none' : '2px solid rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CardIcon id={id} size={32} color={iconColor} />
        </div>

        {/* Label */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.05rem', fontWeight: 800, color: '#111',
            lineHeight: 1.1,
          }}>
            {label}
          </p>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem', color: '#FF2D78', fontWeight: 700,
            marginTop: 2,
          }}>
            +{pts} pts
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CardShowcase() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      id="cards"
      className="landing-bg"
      style={{ paddingTop: 80, paddingBottom: 96 }}
    >
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="section-label mb-3">THE DECK</p>
          <h2 style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 800, color: '#111', lineHeight: 1.05,
          }}>
            Cards. Not forms.
          </h2>
          <p style={{
            color: '#666', fontSize: '0.95rem', marginTop: 8,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Six prediction primitives. Risk vs reward. Drafting becomes the game.
          </p>
          <svg viewBox="0 0 180 10" width="160" height="10" style={{ marginTop: 8 }}>
            <path d="M0,7 Q30,1 60,7 Q90,13 120,7 Q150,1 180,7"
              stroke="#C8FF00" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT: Card fan ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              position: 'relative',
              height: 480,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {CARDS.map((c, i) => (
              <FanCard
                key={c.id}
                idx={i}
                total={CARDS.length}
                fill={c.fill}
                label={c.name}
                pts={c.pts}
                id={c.id}
              />
            ))}

            {/* Subtitle */}
            <div style={{
              position: 'absolute', bottom: -32, left: 0,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.78rem', color: '#888',
            }}>
              A hand of 6 — you pick 3 to play
            </div>
          </motion.div>

          {/* ── RIGHT: Card list ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-0"
            style={{ border: '2.5px solid #111' }}
          >
            {CARDS.map((c, i) => (
              <div
                key={c.id}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 18px',
                  borderBottom: i < CARDS.length - 1 ? '2px solid #111' : undefined,
                  background: hovered === c.id ? '#fafaf5' : 'white',
                  cursor: 'default',
                  transition: 'background 0.12s',
                }}
              >
                {/* Card name */}
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '1.15rem', fontWeight: 800, color: '#111',
                  minWidth: 100,
                }}>
                  {c.name}
                </span>

                {/* Risk badge */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: c.fill === '#111' ? '#111' : c.fill,
                  border: '2px solid #111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem', fontWeight: 700,
                    color: c.fill === '#111' || c.fill === '#FF2D78' ? 'white' : '#111',
                  }}>
                    {c.risk}
                  </span>
                </div>

                {/* Description */}
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.82rem', color: '#555', flex: 1,
                }}>
                  {c.desc}
                </span>

                {/* Points */}
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '1.2rem', fontWeight: 800, color: '#111',
                  flexShrink: 0,
                }}>
                  +{c.pts}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
