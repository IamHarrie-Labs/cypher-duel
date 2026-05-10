import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    phase: '01', time: '5s', title: 'MATCH',
    desc: 'Stake SOL. Queue or accept a Blink.',
    color: '#C8FF00',
  },
  {
    phase: '02', time: '15s', title: 'DRAFT',
    desc: '5 cards via VRF. Pick 3.',
    color: '#C8FF00',
  },
  {
    phase: '03', time: '5s', title: 'LOCK',
    desc: 'Commit-reveal. No copying.',
    color: '#D91A6E',
  },
  {
    phase: '04', time: '60s', title: 'BATTLE',
    desc: 'Pyth ticks. Cards resolve live.',
    color: '#D91A6E',
  },
  {
    phase: '05', time: '5s', title: 'SETTLE',
    desc: 'Winner takes pot + cNFT trophy.',
    color: '#D91A6E',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="landing-bg"
      style={{ paddingTop: 80, paddingBottom: 96 }}
    >
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
          style={{ maxWidth: 560 }}
        >
          <p className="section-label mb-3">HOW IT WORKS</p>
          <h2 style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 800, color: '#111', lineHeight: 1.1,
          }}>
            A match in 90 seconds.
          </h2>
          <p style={{
            color: '#666', fontSize: '0.95rem', marginTop: 10,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Five phases. All on-chain. All settled by oracles.
          </p>
          {/* Underline squiggle */}
          <svg viewBox="0 0 200 10" width="180" height="10" style={{ marginTop: 8 }}>
            <path d="M0,7 Q25,2 50,7 Q75,12 100,7 Q125,2 150,7 Q175,12 200,7"
              stroke="#C8FF00" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Steps grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-0"
          style={{ border: '2.5px solid #111' }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'white',
                borderRight: i < STEPS.length - 1 ? '2.5px solid #111' : undefined,
                padding: '28px 20px 24px',
                position: 'relative',
              }}
            >
              {/* Phase number badge */}
              <div style={{
                position: 'absolute', top: -14, right: 16,
                width: 28, height: 28, borderRadius: '50%',
                background: step.color, border: '2px solid #111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', fontWeight: 700, color: '#111',
              }}>
                {i + 1}
              </div>

              {/* Phase label */}
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', color: '#999', marginBottom: 6, letterSpacing: '0.08em',
              }}>
                {step.phase}
              </p>

              {/* Title */}
              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '1.55rem', fontWeight: 800, color: '#111',
                lineHeight: 1.1, marginBottom: 4,
              }}>
                {step.title}
              </p>

              {/* Time */}
              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '1.15rem', fontWeight: 700, color: step.color,
                marginBottom: 10,
                textShadow: step.color === '#D91A6E' ? 'none' : 'none',
              }}>
                {step.time}
              </p>

              {/* Description */}
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.8rem', color: '#666', lineHeight: 1.5,
              }}>
                {step.desc}
              </p>

              {/* Arrow connector (hidden on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block" style={{
                  position: 'absolute', right: -18, top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.1rem', color: '#111', fontWeight: 700,
                }}>
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
