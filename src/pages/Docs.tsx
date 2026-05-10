import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, Scale } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CardIcon } from '../components/CardIcons';

// ── Sidebar nav ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',      label: 'Overview' },
  { id: 'how-to-play',   label: 'How to Play' },
  { id: 'cards',         label: 'The 6 Cards' },
  { id: 'scoring',       label: 'Scoring System' },
  { id: 'commit-reveal', label: 'Commit-Reveal' },
  { id: 'blinks',        label: 'Blinks & Sharing' },
  { id: 'faq',           label: 'FAQ' },
];

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const CAVEAT: React.CSSProperties = { fontFamily: "'Caveat', cursive" };
const GROTESK: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

const CARD_DEFS = [
  {
    id: 'pulse',    name: 'PULSE',    pts: 10,  risk: 'LOW',  fill: '#8FC600',
    condition: 'Price moves more than 0.3% in either direction by match end.',
    strategy: 'Best in volatile markets. Safe pick when you expect any movement at all. Great opener card.',
    example: 'BTC opens at $100,000. If it closes above $100,300 or below $99,700 — PULSE scores.',
  },
  {
    id: 'tilt',     name: 'TILT',     pts: 15,  risk: 'LOW',  fill: '#8FC600',
    condition: 'Price closes in your predicted direction (up or down) from open.',
    strategy: 'You pick a direction. Low risk, low reward. Good anchor card to guarantee base points.',
    example: 'You predict UP. BTC opens at $100,000. Closes at $100,100 — any gain triggers TILT.',
  },
  {
    id: 'surge',    name: 'SURGE',    pts: 30,  risk: 'MED',  fill: '#111',
    condition: 'Price moves more than 1% in your predicted direction.',
    strategy: 'High-conviction directional bet. Only play when you expect a real move, not noise.',
    example: 'You predict UP. BTC must close above $101,000 (from $100k open) for SURGE to score.',
  },
  {
    id: 'snipe',    name: 'SNIPE',    pts: 75,  risk: 'HIGH', fill: '#D91A6E',
    condition: 'Price touches your exact target price ±$50 at any point during the match.',
    strategy: 'Highest single-card reward. Watch support/resistance levels. High risk — miss by $51 and you get nothing.',
    example: 'You set target $101,500. If BTC touches anywhere from $101,450–$101,550 — SNIPE scores 75 pts.',
  },
  {
    id: 'whiplash', name: 'WHIPLASH', pts: 60,  risk: 'HIGH', fill: '#D91A6E',
    condition: 'Price goes both above AND below the opening price at any point in the 60 seconds.',
    strategy: 'Pure volatility play. Best in choppy, sideways markets. No direction needed — just chaos.',
    example: 'BTC opens $100k. Spikes to $100,200 then dips to $99,800 in the same match — WHIPLASH scores.',
  },
  {
    id: 'calm',     name: 'CALM',     pts: 50,  risk: 'HIGH', fill: '#111',
    condition: 'Price never moves more than 0.2% from open at any point during the match.',
    strategy: 'Contrarian play. Scores in dead markets. Risky because one news event kills it.',
    example: 'BTC opens $100k. Must stay between $99,800 and $100,200 for the full 60 seconds.',
  },
];

// ── Section components ───────────────────────────────────────────────────────
function SectionOverview() {
  return (
    <div className="space-y-8">
      <div>
        <p style={{ ...MONO, fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>$ cat overview.md</p>
        <h2 style={{ ...CAVEAT, fontSize: '2.8rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>
          What is Cypher?
        </h2>
      </div>

      <p style={{ ...GROTESK, fontSize: '1rem', color: '#444', lineHeight: 1.75, maxWidth: 680 }}>
        <strong style={{ color: '#111' }}>CYPHER</strong> is a 1v1 sealed-bid price-prediction combat game on Solana.
        Two players stake SOL into an escrow vault, secretly choose 3 prediction cards, then battle
        60 seconds of live <strong style={{ color: '#111' }}>Pyth Network oracle</strong> price data.
        The program scores both hands on-chain — no server, no trust, no admin key.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '2.5px solid #111', background: 'white' }}>
        {[
          { Icon: Lock,  fill: '#111',    label: 'Sealed Bid',          desc: 'SHA-256 hash commits your picks before battle starts. No peeking.' },
          { Icon: Zap,   fill: '#C8FF00', label: 'Live Oracle',          desc: 'Pyth streams real BTC/ETH/SOL prices every 2 seconds during the match.' },
          { Icon: Scale, fill: '#D91A6E', label: 'On-Chain Settlement',  desc: 'Rust scoring function runs on-chain. Winner gets the pot minus 2.5% fee.' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '24px 20px',
            borderRight: i < 2 ? '2px solid #111' : undefined,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: item.fill,
              border: item.fill === '#111' ? '2px solid #333' : '2px solid rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <item.Icon size={18} color={item.fill === '#C8FF00' ? '#111' : 'white'} strokeWidth={2.5} />
            </div>
            <p style={{ ...MONO, fontSize: '0.75rem', fontWeight: 700, color: '#111', marginBottom: 6, textTransform: 'uppercase' }}>
              {item.label}
            </p>
            <p style={{ ...GROTESK, fontSize: '0.82rem', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#111', padding: '20px 24px', borderRadius: 4 }}>
        <p style={{ ...MONO, fontSize: '0.72rem', color: '#888', marginBottom: 8 }}>// match lifecycle</p>
        <p style={{ ...MONO, fontSize: '0.85rem', color: '#C8FF00', lineHeight: 2 }}>
          CREATE_MATCH → JOIN_MATCH → COMMIT_PLAYS → [60s Pyth battle] → REVEAL_PLAYS → SETTLE_MATCH
        </p>
      </div>
    </div>
  );
}

function SectionHowToPlay() {
  const steps = [
    {
      n: '01', title: 'Connect & Fund',
      body: 'Connect a Phantom or Solflare wallet. You need devnet SOL — get some free from the Solana faucet (`solana airdrop 2 <address> --url devnet`). Minimum stake is 0.01 SOL.',
    },
    {
      n: '02', title: 'Create or Join a Match',
      body: 'Pick your asset (BTC, ETH, or SOL), set a stake amount, and create a match. Share the Blink URL from the waiting room — paste it on X and anyone can accept in one click. Or join an existing open match from the lobby list.',
    },
    {
      n: '03', title: 'Draft 3 Prediction Cards',
      body: 'You have 6 cards in your hand. Pick exactly 3 to play. For directional cards (TILT, SURGE) you choose UP or DOWN. For SNIPE, you set a specific price target. Your opponent picks at the same time — neither can see the other\'s hand.',
    },
    {
      n: '04', title: 'Commit Your Hand',
      body: 'Your 3 cards are hashed with a SHA-256 function and a random 32-byte salt — only the hash goes on-chain. This locks your picks without revealing them. The Anchor program stores your commit hash and won\'t let you change it.',
    },
    {
      n: '05', title: 'Watch the Battle',
      body: 'The 60-second Pyth oracle window starts. Live BTC/ETH/SOL price streams to your screen every 2 seconds via Hermes. You can see in real time which of your cards are trending toward a score.',
    },
    {
      n: '06', title: 'Reveal & Settle',
      body: 'After 60 seconds, both players reveal their plaintext picks. The program re-derives your commit hash from the revealed cards + salt — if they don\'t match, the transaction panics. Once both reveals are verified, `settle_match` scores both hands and transfers the pot to the winner.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p style={{ ...MONO, fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>$ cat how-to-play.md</p>
        <h2 style={{ ...CAVEAT, fontSize: '2.8rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>How to Play</h2>
      </div>

      <div className="space-y-0" style={{ border: '2.5px solid #111' }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{
            display: 'flex', gap: 20, padding: '24px 24px',
            borderBottom: i < steps.length - 1 ? '2px solid #111' : undefined,
            background: 'white',
          }}>
            <div style={{
              ...CAVEAT, fontSize: '2rem', fontWeight: 800, color: '#C8FF00',
              flexShrink: 0, lineHeight: 1, minWidth: 40,
              WebkitTextStroke: '1.5px #111',
            }}>
              {s.n}
            </div>
            <div>
              <p style={{ ...MONO, fontSize: '0.8rem', fontWeight: 700, color: '#111', marginBottom: 6, textTransform: 'uppercase' }}>
                {s.title}
              </p>
              <p style={{ ...GROTESK, fontSize: '0.88rem', color: '#555', lineHeight: 1.7 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(143,198,0,0.08)', border: '2px solid #8FC600', padding: '16px 20px' }}>
        <p style={{ ...MONO, fontSize: '0.72rem', color: '#6a9600', fontWeight: 700, marginBottom: 4 }}>PRO TIP</p>
        <p style={{ ...GROTESK, fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>
          If your opponent misses the reveal window (120 seconds), you can call <code style={{ ...MONO, background: '#eee', padding: '1px 4px' }}>claim_forfeit</code> to claim the pot minus a grace fee. Don't wait — the clock is on-chain.
        </p>
      </div>
    </div>
  );
}

function SectionCards() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <p style={{ ...MONO, fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>$ cat cards.md</p>
        <h2 style={{ ...CAVEAT, fontSize: '2.8rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>The 6 Cards</h2>
        <p style={{ ...GROTESK, fontSize: '0.9rem', color: '#666', marginTop: 8, lineHeight: 1.6 }}>
          Click any card to see the full condition, strategy, and an example. You pick 3 — strategy is everything.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARD_DEFS.map(card => (
          <div
            key={card.id}
            onClick={() => setActive(active === card.id ? null : card.id)}
            style={{
              border: active === card.id ? `2.5px solid ${card.fill === '#111' ? '#111' : card.fill}` : '2.5px solid #111',
              background: active === card.id ? (card.fill === '#111' ? '#111' : `${card.fill}18`) : 'white',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: active === card.id ? `4px 4px 0 ${card.fill === '#111' ? '#333' : card.fill}` : '4px 4px 0 #111',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: active === card.id ? 16 : 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: card.fill,
                border: card.fill === '#111' ? '2px solid #333' : '2px solid rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <CardIcon
                  id={card.id}
                  size={24}
                  color={card.fill === '#8FC600' ? '#111' : 'white'}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    ...CAVEAT, fontSize: '1.3rem', fontWeight: 800,
                    color: active === card.id && card.fill === '#111' ? 'white' : '#111',
                  }}>
                    {card.name}
                  </span>
                  <span style={{
                    ...MONO, fontSize: '0.6rem', padding: '2px 6px',
                    border: `1.5px solid ${card.fill === '#111' ? '#555' : card.fill}`,
                    color: active === card.id && card.fill === '#111' ? '#aaa' : '#666',
                  }}>
                    {card.risk}
                  </span>
                </div>
                <p style={{
                  ...MONO, fontSize: '0.72rem', fontWeight: 700,
                  color: card.fill === '#D91A6E' ? '#D91A6E' : '#8FC600',
                  marginTop: 2,
                }}>
                  +{card.pts} pts
                </p>
              </div>
              <span style={{
                ...MONO, fontSize: '0.65rem',
                color: active === card.id && card.fill === '#111' ? '#888' : '#aaa',
              }}>
                {active === card.id ? '▲' : '▼'}
              </span>
            </div>

            {active === card.id && (
              <div className="space-y-3" style={{ paddingLeft: 62 }}>
                <div>
                  <p style={{ ...MONO, fontSize: '0.65rem', color: card.fill === '#111' ? '#888' : '#666', textTransform: 'uppercase', marginBottom: 4 }}>
                    Trigger Condition
                  </p>
                  <p style={{ ...GROTESK, fontSize: '0.85rem', color: card.fill === '#111' ? '#ddd' : '#333', lineHeight: 1.6 }}>
                    {card.condition}
                  </p>
                </div>
                <div>
                  <p style={{ ...MONO, fontSize: '0.65rem', color: card.fill === '#111' ? '#888' : '#666', textTransform: 'uppercase', marginBottom: 4 }}>
                    Strategy
                  </p>
                  <p style={{ ...GROTESK, fontSize: '0.85rem', color: card.fill === '#111' ? '#ddd' : '#333', lineHeight: 1.6 }}>
                    {card.strategy}
                  </p>
                </div>
                <div style={{ background: card.fill === '#111' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', padding: '10px 14px' }}>
                  <p style={{ ...MONO, fontSize: '0.65rem', color: card.fill === '#111' ? '#888' : '#888', textTransform: 'uppercase', marginBottom: 4 }}>
                    Example
                  </p>
                  <p style={{ ...GROTESK, fontSize: '0.82rem', color: card.fill === '#111' ? '#bbb' : '#555', lineHeight: 1.6 }}>
                    {card.example}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionScoring() {
  return (
    <div className="space-y-8">
      <div>
        <p style={{ ...MONO, fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>$ cat scoring.md</p>
        <h2 style={{ ...CAVEAT, fontSize: '2.8rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>Scoring System</h2>
      </div>

      <p style={{ ...GROTESK, fontSize: '0.95rem', color: '#444', lineHeight: 1.7, maxWidth: 660 }}>
        Scoring is fully deterministic and runs inside the Anchor program at <code style={{ ...MONO, background: '#f0f0f0', padding: '1px 5px', fontSize: '0.8rem' }}>settle_match</code>. The function receives start price, end price, high price, and low price from the Pyth feed — all written on-chain before the battle window starts.
      </p>

      <div style={{ background: '#111', padding: '24px', borderRadius: 4, overflowX: 'auto' }}>
        <p style={{ ...MONO, fontSize: '0.72rem', color: '#555', marginBottom: 12 }}>// contracts/programs/cypher/src/lib.rs</p>
        <pre style={{ ...MONO, fontSize: '0.78rem', color: '#eee', lineHeight: 1.9, margin: 0 }}>{`fn score_card(card, dir, snipe, start, end, high, low) -> u32 {
  match card {
    PULSE    => if |end - start| / start > 0.003  { 10 } else { 0 }
    TILT     => if direction_matches(dir, start, end)  { 15 } else { 0 }
    SURGE    => if move_in_dir(dir,start,end) > 0.01   { 30 } else { 0 }
    SNIPE    => if high >= target-$50 && low <= target+$50  { 75 } else { 0 }
    WHIPLASH => if high > start && low < start  { 60 } else { 0 }
    CALM     => if max_deviation <= 0.002  { 50 } else { 0 }
  }
}`}</pre>
      </div>

      <div style={{ border: '2.5px solid #111', background: 'white' }}>
        <div style={{ padding: '14px 20px', borderBottom: '2px solid #111', background: '#f5f5f0' }}>
          <p style={{ ...MONO, fontSize: '0.72rem', fontWeight: 700, color: '#111' }}>
            MAX POSSIBLE SCORE: 190 pts (TILT + SURGE + SNIPE)
          </p>
        </div>
        {[
          { card: 'PULSE',    pts: 10, pct: '5%',  color: '#8FC600' },
          { card: 'TILT',     pts: 15, pct: '8%',  color: '#8FC600' },
          { card: 'SURGE',    pts: 30, pct: '16%', color: '#555' },
          { card: 'CALM',     pts: 50, pct: '26%', color: '#555' },
          { card: 'WHIPLASH', pts: 60, pct: '32%', color: '#D91A6E' },
          { card: 'SNIPE',    pts: 75, pct: '39%', color: '#D91A6E' },
        ].map(row => (
          <div key={row.card} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px',
            borderBottom: '1.5px solid #f0f0f0',
          }}>
            <span style={{ ...CAVEAT, fontSize: '1.1rem', fontWeight: 800, color: '#111', minWidth: 90 }}>{row.card}</span>
            <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: row.pct, background: row.color, borderRadius: 2 }} />
            </div>
            <span style={{ ...MONO, fontSize: '0.85rem', fontWeight: 700, color: '#111', minWidth: 50, textAlign: 'right' }}>
              +{row.pts} pts
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(217,26,110,0.06)', border: '2px solid #D91A6E', padding: '16px 20px' }}>
        <p style={{ ...MONO, fontSize: '0.72rem', color: '#D91A6E', fontWeight: 700, marginBottom: 4 }}>TIEBREAKER</p>
        <p style={{ ...GROTESK, fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>
          On equal scores, Player A (the match creator) wins. This is deterministic and known before the match starts.
        </p>
      </div>
    </div>
  );
}

function SectionCommitReveal() {
  return (
    <div className="space-y-8">
      <div>
        <p style={{ ...MONO, fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>$ cat commit-reveal.md</p>
        <h2 style={{ ...CAVEAT, fontSize: '2.8rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>Commit-Reveal</h2>
      </div>

      <p style={{ ...GROTESK, fontSize: '0.95rem', color: '#444', lineHeight: 1.75, maxWidth: 680 }}>
        The commit-reveal scheme prevents either player from seeing the other's cards before committing. Without it, Player B could always counter Player A's picks after seeing them.
      </p>

      <div className="space-y-4">
        <div style={{ border: '2.5px solid #111', background: 'white' }}>
          {[
            {
              step: '1. PICK',
              color: '#8FC600',
              desc: 'Choose your 3 cards, directions, and optional SNIPE target. Nothing goes on-chain yet.',
            },
            {
              step: '2. HASH',
              color: '#111',
              desc: 'SHA-256 hash = SHA256(cards[3] + directions[3] + snipe_target_le8 + salt[32]). The 32-byte salt is generated client-side with crypto.getRandomValues(). This hash is what goes on-chain.',
            },
            {
              step: '3. COMMIT',
              color: '#111',
              desc: 'Call commit_plays(match_id, hash). The Anchor program stores your 32-byte hash. Both players commit before either can reveal.',
            },
            {
              step: '4. REVEAL',
              color: '#D91A6E',
              desc: 'Call reveal_plays(match_id, cards, directions, snipe_target, salt). Program re-derives the hash from plaintext — if it doesn\'t match your commit, the transaction panics and is rejected.',
            },
            {
              step: '5. SETTLE',
              color: '#D91A6E',
              desc: 'With both reveals verified, settle_match scores the hands, transfers SOL to the winner, takes 2.5% fee to treasury.',
            },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, padding: '18px 20px',
              borderBottom: i < 4 ? '2px solid #eee' : undefined,
            }}>
              <span style={{
                ...MONO, fontSize: '0.7rem', fontWeight: 700,
                color: row.color, minWidth: 80, flexShrink: 0, paddingTop: 2,
              }}>
                {row.step}
              </span>
              <p style={{ ...GROTESK, fontSize: '0.88rem', color: '#555', lineHeight: 1.65 }}>{row.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#111', padding: '20px 24px' }}>
        <p style={{ ...MONO, fontSize: '0.72rem', color: '#888', marginBottom: 10 }}>// commit hash structure (TypeScript mirror of on-chain verification)</p>
        <pre style={{ ...MONO, fontSize: '0.78rem', color: '#C8FF00', lineHeight: 1.8, margin: 0 }}>{`const commit_hash = SHA256(
  cards[3]           // 3 bytes  — card IDs  0–5
  directions[3]      // 3 bytes  — 0=up 1=down 2=neutral
  snipe_target_le8   // 8 bytes  — i64 little-endian (Pyth raw units)
  salt[32]           // 32 bytes — crypto.getRandomValues()
)`}</pre>
      </div>
    </div>
  );
}

function SectionBlinks() {
  return (
    <div className="space-y-8">
      <div>
        <p style={{ ...MONO, fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>$ cat blinks.md</p>
        <h2 style={{ ...CAVEAT, fontSize: '2.8rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>Blinks & Sharing</h2>
      </div>

      <p style={{ ...GROTESK, fontSize: '0.95rem', color: '#444', lineHeight: 1.75, maxWidth: 680 }}>
        Every Cypher challenge generates a <strong style={{ color: '#111' }}>Solana Blink</strong> — a URL that renders as an interactive card on X (Twitter) and in any Blinks-aware wallet. Anyone can accept your duel with one click, no app installation required.
      </p>

      <div style={{ border: '2.5px solid #111', background: '#111', padding: '20px 24px' }}>
        <p style={{ ...MONO, fontSize: '0.72rem', color: '#555', marginBottom: 8 }}>// GET — renders as an action card</p>
        <p style={{ ...MONO, fontSize: '0.82rem', color: '#C8FF00' }}>
          GET /api/actions/challenge?matchId=42&asset=BTC&stake=0.05
        </p>
        <div style={{ borderTop: '1px solid #333', marginTop: 16, paddingTop: 16 }}>
          <p style={{ ...MONO, fontSize: '0.72rem', color: '#555', marginBottom: 8 }}>// POST — returns real unsigned join_match transaction</p>
          <p style={{ ...MONO, fontSize: '0.82rem', color: '#eee' }}>
            {'→ { "transaction": "<base64>", "message": "BTC/USD at $97,482..." }'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 style={{ ...MONO, fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase' }}>
          How to share your challenge
        </h3>
        <div style={{ border: '2.5px solid #111', background: 'white' }}>
          {[
            { n: '1', text: 'Create a match in the arena lobby' },
            { n: '2', text: 'Copy the Blink URL from the "Waiting" screen' },
            { n: '3', text: 'Paste it on X — the Dialect Blinks renderer turns it into a card automatically' },
            { n: '4', text: 'Your opponent clicks Accept, signs with their wallet, and the match starts' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 20px',
              borderBottom: i < 3 ? '1.5px solid #f0f0f0' : undefined,
            }}>
              <span style={{
                ...CAVEAT, fontSize: '1.4rem', fontWeight: 800, color: '#C8FF00',
                WebkitTextStroke: '1px #111', flexShrink: 0, lineHeight: 1, marginTop: 2,
              }}>{row.n}</span>
              <p style={{ ...GROTESK, fontSize: '0.88rem', color: '#555', lineHeight: 1.65 }}>{row.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(143,198,0,0.08)', border: '2px solid #8FC600', padding: '16px 20px' }}>
        <p style={{ ...MONO, fontSize: '0.72rem', color: '#6a9600', fontWeight: 700, marginBottom: 4 }}>x402 SPECTATOR FEED</p>
        <p style={{ ...GROTESK, fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>
          Power users and bots can access live match data at{' '}
          <code style={{ ...MONO, background: '#e8f5c8', padding: '1px 4px', fontSize: '0.8rem' }}>
            /api/x402/feed?matchId=N
          </code>.
          Without a payment header the endpoint returns <code style={{ ...MONO }}>402 Payment Required</code> with x402 scheme headers.
          Send a valid payment proof for live JSON data — 1000 lamports per request.
        </p>
      </div>
    </div>
  );
}

function SectionFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const items = [
    {
      q: 'Is the program audited?',
      a: 'Cypher is deployed on Solana devnet for the hackathon — not audited for mainnet use. The commit-reveal mechanism and scoring logic have been manually reviewed, but production deployments should go through a formal audit.',
    },
    {
      q: 'What happens if my opponent doesn\'t reveal?',
      a: 'After the reveal window (120 seconds), you can call claim_forfeit to claim the pot. The protocol deducts a small grace fee, and you receive the remainder. The match state transitions to Forfeited on-chain.',
    },
    {
      q: 'Can I cancel a match after creating it?',
      a: 'Yes — if no opponent has joined yet, you can call cancel_match to withdraw your full stake. Once an opponent joins, cancellation is no longer possible.',
    },
    {
      q: 'How does the price oracle work?',
      a: 'Pyth Network\'s Hermes API streams price updates for BTC, ETH, and SOL. The start price is written on-chain when the second player joins. The end, high, and low prices are submitted when settle_match is called after the 60-second window.',
    },
    {
      q: 'What is the protocol fee?',
      a: '2.5% (250 basis points) of the total pot. On a 0.1 SOL vs 0.1 SOL match, the winner receives 0.195 SOL and 0.005 SOL goes to the treasury.',
    },
    {
      q: 'Can I watch a match I\'m not playing in?',
      a: 'Live match data is available via the x402 spectator feed at /api/x402/feed?matchId=N. This endpoint requires a micropayment of 1000 lamports (0.000001 SOL) per request using the x402 payment protocol.',
    },
    {
      q: 'What does "demo mode" mean?',
      a: 'Demo mode lets you play a full Cypher match without a wallet or real SOL. Navigate to /game?demo=true to start. Picks and battle are real — only the on-chain settlement is simulated.',
    },
    {
      q: 'How do I win consistently?',
      a: 'Study market conditions before picking. PULSE + TILT are safe anchors in trending markets. SURGE is high conviction directional. SNIPE at known support/resistance is high risk, high reward. Avoid CALM unless the market is completely flat. Never stack WHIPLASH + CALM — they\'re mutually exclusive conditions.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p style={{ ...MONO, fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>$ cat faq.md</p>
        <h2 style={{ ...CAVEAT, fontSize: '2.8rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>FAQ</h2>
      </div>

      <div style={{ border: '2.5px solid #111', background: 'white' }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: i < items.length - 1 ? '2px solid #eee' : undefined }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '18px 20px', background: 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12,
              }}
            >
              <span style={{ ...MONO, fontSize: '0.82rem', fontWeight: 700, color: '#111', lineHeight: 1.5 }}>
                {item.q}
              </span>
              <span style={{ ...MONO, fontSize: '0.8rem', color: '#888', flexShrink: 0 }}>
                {open === i ? '▲' : '▼'}
              </span>
            </button>
            {open === i && (
              <div style={{ padding: '0 20px 18px', borderTop: '1.5px solid #f5f5f0' }}>
                <p style={{ ...GROTESK, fontSize: '0.88rem', color: '#555', lineHeight: 1.7, paddingTop: 12 }}>
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Docs page ───────────────────────────────────────────────────────────
export default function DocsPage() {
  const [active, setActive] = useState('overview');
  const navigate = useNavigate();

  const content: Record<string, React.ReactNode> = {
    'overview':      <SectionOverview />,
    'how-to-play':   <SectionHowToPlay />,
    'cards':         <SectionCards />,
    'scoring':       <SectionScoring />,
    'commit-reveal': <SectionCommitReveal />,
    'blinks':        <SectionBlinks />,
    'faq':           <SectionFAQ />,
  };

  return (
    <div className="min-h-screen landing-bg">
      <Navbar />

      {/* Page header */}
      <div style={{
        borderBottom: '2px solid #111',
        background: '#111',
        paddingTop: 56,
      }}>
        <div className="container mx-auto px-6 py-10">
          <p style={{ ...MONO, fontSize: '0.72rem', color: '#555', marginBottom: 8 }}>
            cypher@solana:~$ cat docs/
          </p>
          <h1 style={{ ...CAVEAT, fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, color: '#C8FF00', lineHeight: 1 }}>
            PLAYBOOK
          </h1>
          <p style={{ ...GROTESK, fontSize: '0.9rem', color: '#888', marginTop: 8 }}>
            Everything you need to know to read the market and win.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* ── Sidebar ── */}
          <nav style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
            <p style={{ ...MONO, fontSize: '0.65rem', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Contents
            </p>
            <div style={{ border: '2px solid #111', background: 'white' }}>
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  style={{
                    display: 'block', width: '100%', padding: '12px 16px',
                    textAlign: 'left', background: active === s.id ? '#111' : 'white',
                    border: 'none', borderBottom: i < SECTIONS.length - 1 ? '1.5px solid #eee' : undefined,
                    cursor: 'pointer', transition: 'background 0.12s',
                  }}
                >
                  <span style={{
                    ...MONO, fontSize: '0.75rem', fontWeight: active === s.id ? 700 : 400,
                    color: active === s.id ? '#C8FF00' : '#444',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {active === s.id ? '→ ' : ''}{s.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate('/game')}
              className="sketch-btn w-full py-3 text-xs mt-6"
            >
              ENTER THE ARENA →
            </button>
            <button
              onClick={() => navigate('/game?demo=true')}
              style={{
                width: '100%', marginTop: 8, padding: '10px 0',
                ...MONO, fontSize: '0.7rem', color: '#888',
                background: 'none', border: '1.5px solid #ccc', cursor: 'pointer',
              }}
            >
              Try Demo Match
            </button>
          </nav>

          {/* ── Main content ── */}
          <main className="lg:col-span-3">
            {content[active]}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
