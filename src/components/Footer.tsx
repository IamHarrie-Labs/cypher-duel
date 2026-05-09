import React from 'react';

const LINKS_COL1 = [
  { label: 'how-it-works', href: '#how-it-works' },
  { label: 'leaderboard',  href: '/leaderboard' },
  { label: 'blinks api',   href: '#' },
  { label: 'twitter',      href: 'https://twitter.com' },
];
const LINKS_COL2 = [
  { label: 'deck',    href: '#cards' },
  { label: 'docs',    href: '/docs' },
  { label: 'github',  href: 'https://github.com' },
  { label: 'discord', href: 'https://discord.com' },
];

const TECH_TAGS = ['pyth', 'switch', 'metaplex', 'helius'];

const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
};

export default function Footer() {
  return (
    <footer
      className="landing-bg"
      style={{
        borderTop: '2px solid #111',
      }}
    >
      {/* Main footer grid */}
      <div
        className="container mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '2px solid #111',
        }}
      >
        {/* ── COL 1: whoami ── */}
        <div style={{ padding: '48px 40px', borderRight: '2px solid #111' }}>
          <p style={{ ...MONO, fontSize: '0.78rem', color: '#888', marginBottom: 16 }}>
            $ whoami
          </p>
          <h2 style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '2.8rem', fontWeight: 800, color: '#111',
            lineHeight: 1, marginBottom: 16,
          }}>
            CYPHER_
          </h2>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.88rem', color: '#666', lineHeight: 1.6, maxWidth: 240,
          }}>
            Two traders enter. One leaves with the alpha.
          </p>
        </div>

        {/* ── COL 2: links ── */}
        <div style={{ padding: '48px 40px', borderRight: '2px solid #111' }}>
          <p style={{ ...MONO, fontSize: '0.78rem', color: '#888', marginBottom: 20 }}>
            $ ls -la /links
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div className="space-y-3">
              {LINKS_COL1.map(l => (
                <div key={l.label}>
                  <a
                    href={l.href}
                    style={{
                      ...MONO, fontSize: '0.82rem', color: '#444',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'color 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                  >
                    <span style={{ color: '#999' }}>→</span> {l.label}
                  </a>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {LINKS_COL2.map(l => (
                <div key={l.label}>
                  <a
                    href={l.href}
                    style={{
                      ...MONO, fontSize: '0.82rem', color: '#444',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'color 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                  >
                    <span style={{ color: '#999' }}>→</span> {l.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── COL 3: CTA + version ── */}
        <div style={{
          padding: '48px 40px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <button
              onClick={() => window.location.pathname !== '/game' && (window.location.href = '/game')}
              className="sketch-btn flex items-center gap-2 px-5 py-3 text-xs w-full justify-center"
            >
              <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
                <polygon points="1,1 11,6 1,11" />
              </svg>
              ENTER ARENA
            </button>
          </div>

          <div style={{ marginTop: 32 }}>
            <p style={{ ...MONO, fontSize: '0.72rem', color: '#888', marginBottom: 10 }}>
              v0.4.2 · solana devnet
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TECH_TAGS.map(tag => (
                <span
                  key={tag}
                  style={{
                    ...MONO, fontSize: '0.65rem', color: '#555',
                    border: '1.5px solid #bbb', padding: '2px 8px',
                    background: 'white',
                    letterSpacing: '0.06em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar: terminal prompt ── */}
      <div
        style={{
          background: '#111',
          padding: '14px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...MONO, fontSize: '0.75rem', color: '#555' }}>
            cypher@solana:~$
          </span>
          <span style={{
            display: 'inline-block', width: 10, height: 16,
            background: '#C8FF00',
            animation: 'ta-spark1 1s step-end infinite',
          }} />
        </div>
        <span style={{ ...MONO, fontSize: '0.65rem', color: '#555' }}>
          Built on Solana · Powered by Pyth
        </span>
      </div>
    </footer>
  );
}
